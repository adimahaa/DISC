import { notFound } from "next/navigation";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function CekDatabasePage() {
  // Halaman ini hanya tersedia saat pengembangan lokal.
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  let terhubung = false;

  try {
    await db.query("SELECT 1");
    terhubung = true;
  } catch (error) {
    console.error(
      "Pemeriksaan koneksi database gagal:",
      error instanceof Error ? error.message : "Kesalahan tidak dikenal",
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-5">
      <section className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">
          Pemeriksaan database
        </h1>

        <p
          className={`mt-5 rounded-xl p-4 font-medium ${
            terhubung
              ? "bg-emerald-50 text-emerald-800"
              : "bg-rose-50 text-rose-800"
          }`}
        >
          {terhubung
            ? "Berhasil terhubung ke PostgreSQL."
            : "Koneksi gagal. Periksa pesan error di terminal VS Code."}
        </p>
      </section>
    </main>
  );
}
