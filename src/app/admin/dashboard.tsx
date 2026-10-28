"use client";

import Link from "next/link";
import { useState } from "react";

export type HasilTes = {
  id: string;
  nama: string;
  kelompok: string;
  skorD: number;
  skorI: number;
  skorS: number;
  skorC: number;
  dibuatPada: string;
};

const kategori = [
  { kode: "D", nama: "Dominant" },
  { kode: "I", nama: "Influence" },
  { kode: "S", nama: "Steadiness" },
  { kode: "C", nama: "Compliant" },
] as const;

function profilTertinggi(item: HasilTes): string[] {
  const skor = [item.skorD, item.skorI, item.skorS, item.skorC];
  const tertinggi = Math.max(...skor);

  return kategori
    .filter((_, indeks) => skor[indeks] === tertinggi)
    .map((item) => item.kode);
}

function formatTanggal(tanggal: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Makassar",
  }).format(new Date(tanggal));
}

export default function Dashboard({ data }: { data: HasilTes[] }) {
  const [pencarian, setPencarian] = useState("");
  const [filterProfil, setFilterProfil] = useState("semua");

  const hasilDenganProfil = data.map((item) => ({
    ...item,
    profil: profilTertinggi(item),
  }));

  const hasilTampil = hasilDenganProfil.filter((item) => {
    const kataKunci = pencarian.trim().toLowerCase();

    const cocokPencarian =
      item.nama.toLowerCase().includes(kataKunci) ||
      item.kelompok.toLowerCase().includes(kataKunci);

    const cocokProfil =
      filterProfil === "semua" ||
      (filterProfil === "seri"
        ? item.profil.length > 1
        : item.profil.includes(filterProfil));

    return cocokPencarian && cocokProfil;
  });

  const jumlahKelompok = new Set(
    data.map((item) => item.kelompok.trim().toLowerCase()),
  ).size;

  const jumlahSeri = hasilDenganProfil.filter(
    (item) => item.profil.length > 1,
  ).length;

  const ringkasan = [
    {
      judul: "Hasil tersimpan",
      nilai: data.length,
      keterangan: "Jumlah pengerjaan tes yang dikirim",
    },
    {
      judul: "Kelompok",
      nilai: jumlahKelompok,
      keterangan: "Berdasarkan nama kelompok yang diisi",
    },
    {
      judul: "Skor tertinggi seri",
      nilai: jumlahSeri,
      keterangan: "Lebih dari satu kategori memiliki skor tertinggi",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-100 px-5 py-8 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              ADMINISTRASI ASESMEN
            </p>

            <h1 className="mt-2 text-3xl font-bold">Dashboard DISC</h1>

            <p className="mt-3 text-slate-600">
              Hasil tes yang tersimpan di database.
            </p>
          </div>

          <Link
            href="/"
            className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-blue-600 shadow-sm hover:bg-blue-50"
          >
            Buka halaman tes
          </Link>
        </div>

        <section
          aria-label="Ringkasan hasil"
          className="mt-7 grid gap-4 sm:grid-cols-3"
        >
          {ringkasan.map((item) => (
            <article
              key={item.judul}
              className="rounded-2xl border border-slate-200 bg-white p-5"
            >
              <h2 className="text-sm font-medium text-slate-500">
                {item.judul}
              </h2>

              <p className="mt-3 text-3xl font-bold">{item.nilai}</p>

              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                {item.keterangan}
              </p>
            </article>
          ))}
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold">Ringkasan profil tertinggi</h2>

          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Hasil seri dihitung terpisah agar satu pengerjaan tidak masuk ke
            beberapa kategori.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {kategori.map((kategoriItem) => {
              const jumlah = hasilDenganProfil.filter(
                (item) =>
                  item.profil.length === 1 &&
                  item.profil[0] === kategoriItem.kode,
              ).length;

              return (
                <div
                  key={kategoriItem.kode}
                  className="rounded-xl bg-blue-50 p-4"
                >
                  <p className="text-sm font-medium text-blue-800">
                    {kategoriItem.nama}
                  </p>

                  <p className="mt-2 text-2xl font-bold text-blue-900">
                    {jumlah}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 p-6">
            <h2 className="text-lg font-semibold">Daftar hasil tes</h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_220px]">
              <div>
                <label
                  htmlFor="pencarian"
                  className="text-sm font-medium text-slate-700"
                >
                  Cari nama atau kelompok
                </label>

                <input
                  id="pencarian"
                  type="search"
                  value={pencarian}
                  onChange={(event) => setPencarian(event.target.value)}
                  placeholder="Ketik pencarian..."
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label
                  htmlFor="profil"
                  className="text-sm font-medium text-slate-700"
                >
                  Profil tertinggi
                </label>

                <select
                  id="profil"
                  value={filterProfil}
                  onChange={(event) => setFilterProfil(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="semua">Semua profil</option>

                  {kategori.map((item) => (
                    <option key={item.kode} value={item.kode}>
                      {item.kode} · {item.nama}
                    </option>
                  ))}

                  <option value="seri">Skor tertinggi seri</option>
                </select>
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-500">
              Filter D, I, S, atau C juga menyertakan hasil seri yang memiliki
              kategori tersebut.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">
                Hasil tes DISC dari database
              </caption>

              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  {[
                    "Nama",
                    "Kelompok",
                    "D",
                    "I",
                    "S",
                    "C",
                    "Profil tertinggi",
                    "Waktu (WITA)",
                  ].map((judul) => (
                    <th
                      key={judul}
                      scope="col"
                      className="whitespace-nowrap px-4 py-4 font-medium"
                    >
                      {judul}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {hasilTampil.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <th
                      scope="row"
                      className="whitespace-nowrap px-4 py-4 font-medium"
                    >
                      {item.nama}
                    </th>

                    <td className="whitespace-nowrap px-4 py-4">
                      {item.kelompok}
                    </td>

                    <td className="px-4 py-4">{item.skorD}</td>
                    <td className="px-4 py-4">{item.skorI}</td>
                    <td className="px-4 py-4">{item.skorS}</td>
                    <td className="px-4 py-4">{item.skorC}</td>

                    <td className="whitespace-nowrap px-4 py-4">
                      <span className="rounded-lg bg-blue-50 px-3 py-1 font-semibold text-blue-700">
                        {item.profil.join(" / ")}
                      </span>

                      {item.profil.length > 1 && (
                        <span className="ml-2 text-xs text-slate-500">
                          Seri
                        </span>
                      )}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-slate-500">
                      {formatTanggal(item.dibuatPada)}
                    </td>
                  </tr>
                ))}

                {hasilTampil.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-12 text-center text-slate-500"
                    >
                      {data.length === 0
                        ? "Belum ada hasil tes yang tersimpan."
                        : "Tidak ada hasil yang sesuai dengan filter."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <p
            role="status"
            className="border-t border-slate-200 px-6 py-4 text-xs text-slate-500"
          >
            Menampilkan {hasilTampil.length} dari {data.length} hasil tes.
          </p>
        </section>

        <p className="mt-5 text-sm leading-relaxed text-slate-500">
          Satu baris mewakili satu pengiriman tes. Mahasiswa yang mengirim
          beberapa kali dapat memiliki beberapa baris. Muat ulang halaman untuk
          mengambil hasil terbaru.
        </p>
      </div>
    </main>
  );
}
