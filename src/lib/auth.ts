import "server-only";

import { createHash } from "node:crypto";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

export const NAMA_COOKIE = "disc_session";

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

type PenggunaLogin = {
  id: string;
  nama: string;
  email: string;
  peran: "mahasiswa" | "admin";
};

export async function penggunaLogin(): Promise<PenggunaLogin | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(NAMA_COOKIE)?.value;

  if (!token || !/^[a-f0-9]{64}$/.test(token)) {
    return null;
  }

  const hasil = await db.query<PenggunaLogin>(
    `
      SELECT
        p.id::text AS id,
        p.nama,
        p.email,
        p.peran
      FROM public.sesi_pengguna s
      JOIN public.pengguna p
        ON p.id = s.pengguna_id
      WHERE s.token_hash = $1
        AND s.kedaluwarsa > NOW()
        AND p.aktif = TRUE
      LIMIT 1
    `,
    [hashToken(token)],
  );

  return hasil.rows[0] ?? null;
}