import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashToken, NAMA_COOKIE } from "@/lib/auth";
import { originDiizinkan } from "@/lib/origin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!originDiizinkan(request)) {
    return NextResponse.json(
      { pesan: "Asal permintaan tidak diizinkan." },
      { status: 403 },
    );
  }

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(NAMA_COOKIE)?.value;

    if (token) {
      await db.query(
        `
          DELETE FROM public.sesi_pengguna
          WHERE token_hash = $1
        `,
        [hashToken(token)],
      );
    }

    const response = NextResponse.json({
      pesan: "Anda berhasil keluar.",
    });

    response.headers.set("Cache-Control", "no-store");

    response.cookies.set(NAMA_COOKIE, "", {
      httpOnly: true,
      sameSite: "lax",
      secure: new URL(request.url).protocol === "https:",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error(
      "Logout gagal:",
      error instanceof Error ? error.message : "Kesalahan tidak dikenal",
    );

    return NextResponse.json(
      { pesan: "Gagal keluar. Silakan coba lagi." },
      { status: 500 },
    );
  }
}
