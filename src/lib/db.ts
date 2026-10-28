import "server-only";
import { Pool } from "pg";

console.log("KONFIGURASI DATABASE:", {
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  passwordTerisi: Boolean(process.env.PGPASSWORD),
});

const globalDatabase = globalThis as typeof globalThis & {
  postgresPool?: Pool;
};

function buatPool() {
  const pool = new Pool({
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT ?? 5433),
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    max: 5,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
  });

  pool.on("error", (error) => {
    console.error(
      "Koneksi database yang sedang tidak digunakan terputus:",
      error.message,
    );
  });

  return pool;
}

export const db = globalDatabase.postgresPool ?? buatPool();

if (process.env.NODE_ENV !== "production") {
  globalDatabase.postgresPool = db;
}
