import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { originDiizinkan } from "@/lib/origin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { pesan: "Penyimpanan produksi belum diaktifkan." },
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

  if (typeof data.nama !== "string" || typeof data.kelompok !== "string") {
    return NextResponse.json(
      { pesan: "Nama dan kelompok wajib diisi." },
      { status: 400 },
    );
  }

  const nama = data.nama.trim();
  const kelompok = data.kelompok.trim();

  if (!nama || !kelompok || nama.length > 100 || kelompok.length > 100) {
    return NextResponse.json(
      { pesan: "Nama dan kelompok harus berisi 1–100 karakter." },
      { status: 400 },
    );
  }

  const jawaban = data.jawaban;

  if (
    !Array.isArray(jawaban) ||
    jawaban.length !== 32 ||
    !jawaban.every(
      (nilai: unknown) =>
        typeof nilai === "number" &&
        Number.isInteger(nilai) &&
        nilai >= 1 &&
        nilai <= 4,
    )
  ) {
    return NextResponse.json(
      { pesan: "Lengkapi 32 jawaban dengan nilai 1–4." },
      { status: 400 },
    );
  }

  // Posisi a, b, c, d masing-masing mewakili D, I, S, C.
  // Skor dihitung ulang oleh server.
  const skor = [0, 0, 0, 0];

  jawaban.forEach((nilai: number, indeks: number) => {
    skor[indeks % 4] += nilai;
  });

  try {
    const hasil = await db.query(
      `
        INSERT INTO public.hasil_disc (
          nama,
          kelompok,
          jawaban,
          skor_d,
          skor_i,
          skor_s,
          skor_c
        )
        VALUES ($1, $2, $3::jsonb, $4, $5, $6, $7)
        RETURNING id
      `,
      [
        nama,
        kelompok,
        JSON.stringify(jawaban),
        skor[0],
        skor[1],
        skor[2],
        skor[3],
      ],
    );

    return NextResponse.json(
      {
        pesan: "Hasil tes berhasil disimpan.",
        id: hasil.rows[0].id,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "Gagal menyimpan hasil DISC:",
      error instanceof Error ? error.message : "Kesalahan tidak dikenal",
    );

    return NextResponse.json(
      { pesan: "Gagal menyimpan hasil. Silakan coba lagi." },
      { status: 500 },
    );
  }
}
