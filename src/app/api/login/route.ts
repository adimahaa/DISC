import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashToken, NAMA_COOKIE } from "@/lib/auth";
import { originDiizinkan } from "@/lib/origin";

export const runtime = "nodejs";

const scryptAsync = promisify(scrypt);

type Akun = {
  id: string;
  password_hash: string;
  peran: "mahasiswa" | "admin";
  aktif: boolean;
};

export async function POST(request: Request) {
  // Login sementara hanya diaktifkan untuk pengembangan lokal.
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { pesan: "Login produksi belum diaktifkan." },
      { status: 403 },
    );
  }

  if (!originDiizinkan(request)) {
    return NextResponse.json(
      { pesan: "Asal permintaan tidak diizinkan." },
      { status: 403 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { pesan: "Format data tidak valid." },
      { status: 400 },
    );
  }

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return NextResponse.json({ pesan: "Data tidak valid." }, { status: 400 });
  }

  const data = body as Record<string, unknown>;

  if (typeof data.email !== "string" || typeof data.password !== "string") {
    return NextResponse.json(
      { pesan: "Email dan password wajib diisi." },
      { status: 400 },
    );
  }

  const email = data.email.trim().toLowerCase();
  const password = data.password;

  if (!email || email.length > 254 || !password || password.length > 256) {
    return NextResponse.json(
      { pesan: "Email atau password tidak valid." },
      { status: 400 },
    );
  }

  try {
    const hasil = await db.query<Akun>(
      `
        SELECT
          id::text AS id,
          password_hash,
          peran,
          aktif
        FROM public.pengguna
        WHERE lower(trim(email)) = $1
        LIMIT 1
      `,
      [email],
    );

    const akun = hasil.rows[0];

    // Tetap lakukan hashing meskipun email tidak ditemukan.
    const hashPengganti = `scrypt:${"0".repeat(32)}:${"0".repeat(128)}`;

    const tersimpan = akun?.password_hash ?? hashPengganti;
    const [metode, salt, hash] = tersimpan.split(":");

    if (
      metode !== "scrypt" ||
      !/^[a-f0-9]{32}$/.test(salt ?? "") ||
      !/^[a-f0-9]{128}$/.test(hash ?? "")
    ) {
      throw new Error("Format hash password akun tidak valid.");
    }

    const hashMasukan = (await scryptAsync(password, salt, 64)) as Buffer;

    const cocok = timingSafeEqual(Buffer.from(hash, "hex"), hashMasukan);

    if (!akun || !akun.aktif || !cocok) {
      return NextResponse.json(
        { pesan: "Email atau password salah." },
        { status: 401 },
      );
    }

    const token = randomBytes(32).toString("hex");
    const durasiDetik = 60 * 60 * 8;
    const kedaluwarsa = new Date(Date.now() + durasiDetik * 1000);

    await db.query(
      `
        INSERT INTO public.sesi_pengguna (
          token_hash,
          pengguna_id,
          kedaluwarsa
        )
        VALUES ($1, $2, $3)
      `,
      [hashToken(token), akun.id, kedaluwarsa],
    );

    const response = NextResponse.json({
      pesan: "Login berhasil.",
      tujuan: akun.peran === "admin" ? "/admin" : "/",
    });

    response.headers.set("Cache-Control", "no-store");

    response.cookies.set(NAMA_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: new URL(request.url).protocol === "https:",
      path: "/",
      maxAge: durasiDetik,
    });

    return response;
  } catch (error) {
    console.error(
      "Login gagal:",
      error instanceof Error ? error.message : "Kesalahan tidak dikenal",
    );

    return NextResponse.json(
      { pesan: "Login belum dapat diproses. Silakan coba lagi." },
      { status: 500 },
    );
  }
}
