import { redirect } from "next/navigation";
import { penggunaLogin } from "@/lib/auth";
import { db } from "@/lib/db";
import TombolKeluar from "@/components/tombol-keluar";
import Dashboard, { type HasilTes } from "./dashboard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const pengguna = await penggunaLogin();

  if (!pengguna) {
    redirect("/login");
  }

  if (pengguna.peran !== "admin") {
    redirect("/");
  }

  // Ambil hasil hanya setelah sesi dan peran admin diperiksa.
  const hasil = await db.query<{
    id: string;
    nama: string;
    kelompok: string;
    skor_d: number;
    skor_i: number;
    skor_s: number;
    skor_c: number;
    dibuat_pada: Date;
  }>(`
    SELECT
      id::text AS id,
      nama,
      kelompok,
      skor_d,
      skor_i,
      skor_s,
      skor_c,
      dibuat_pada
    FROM public.hasil_disc
    ORDER BY dibuat_pada DESC, id DESC
  `);

  const data: HasilTes[] = hasil.rows.map((item) => ({
    id: item.id,
    nama: item.nama,
    kelompok: item.kelompok,
    skorD: item.skor_d,
    skorI: item.skor_i,
    skorS: item.skor_s,
    skorC: item.skor_c,
    dibuatPada: item.dibuat_pada.toISOString(),
  }));

  return (
    <>
      <div className="border-b border-slate-200 bg-white px-5 py-3">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-slate-900">{pengguna.nama}</p>

            <p className="text-sm text-slate-500">{pengguna.email}</p>
          </div>

          <TombolKeluar />
        </div>
      </div>

      <Dashboard data={data} />
    </>
  );
}
