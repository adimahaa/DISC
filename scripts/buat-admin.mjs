import pg from "pg";
import { randomBytes, scryptSync } from "node:crypto";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

const { Client } = pg;

async function main() {
  const wajib = ["PGHOST", "PGPORT", "PGDATABASE", "PGUSER", "PGPASSWORD"];

  for (const variabel of wajib) {
    if (!process.env[variabel]) {
      throw new Error(`Variabel ${variabel} belum diisi di .env.local.`);
    }
  }

  const terminal = createInterface({
    input: stdin,
    output: stdout,
  });

  let nama;
  let email;

  try {
    nama = (await terminal.question("Nama admin: ")).trim();
    email = (await terminal.question("Email admin: ")).trim().toLowerCase();
  } finally {
    terminal.close();
  }

  if (!nama || nama.length > 100) {
    throw new Error("Nama wajib diisi, maksimal 100 karakter.");
  }

  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Format email tidak valid.");
  }

  // Password acak. Password asli tidak disimpan ke database.
  const password = randomBytes(18).toString("base64url");
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");

  // Format ini akan digunakan juga saat memeriksa password login.
  const passwordHash = `scrypt:${salt}:${hash}`;

  const client = new Client({
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT),
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    connectionTimeoutMillis: 5000,
  });

  try {
    await client.connect();

    const hasil = await client.query(
      `
        INSERT INTO public.pengguna (
          nama,
          email,
          password_hash,
          peran
        )
        VALUES ($1, $2, $3, 'admin')
        RETURNING id, nama, email, peran
      `,
      [nama, email, passwordHash],
    );

    console.log("\nAkun admin berhasil dibuat.");
    console.log("Nama:", hasil.rows[0].nama);
    console.log("Email:", hasil.rows[0].email);
    console.log("Password:", password);
    console.log("\nSimpan password ini di pengelola password.");
    console.log("Jangan kirim password atau screenshot-nya ke chat.");
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  if (error.code === "23505") {
    console.error("Email tersebut sudah terdaftar. Akun lama tidak diubah.");
  } else {
    console.error("Gagal membuat admin:", error.message);
  }

  process.exitCode = 1;
});
