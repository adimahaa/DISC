"use client";

import { useState, type FormEvent } from "react";
import { kategori, pertanyaan } from "@/data/disc";

type Tahap = "identitas" | "petunjuk" | "tes" | "hasil";

const jumlahPernyataan = pertanyaan.length * 4;

const tombolUtama =
  "rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-50";

const tombolKembali =
  "rounded-xl px-4 py-3 font-medium text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-600";

const kolomInput =
  "mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

export default function Home() {
  const [nama, setNama] = useState("");
  const [kelompok, setKelompok] = useState("");
  const [tahap, setTahap] = useState<Tahap>("identitas");
  const [halaman, setHalaman] = useState(0);
  const [menyimpan, setMenyimpan] = useState(false);
  const [pesanSimpan, setPesanSimpan] = useState("");

  const [jawaban, setJawaban] = useState<(number | null)[]>(
    Array(jumlahPernyataan).fill(null),
  );

  const terjawab = jawaban.filter((nilai) => nilai !== null).length;

  const kelompokLengkap = pertanyaan[halaman].every(
    (_, indeks) => jawaban[halaman * 4 + indeks] !== null,
  );

  const skor = kategori.map((item, indeksKategori) => ({
    ...item,
    nilai: jawaban.reduce<number>((total, nilai, indeks) => {
      if (indeks % 4 === indeksKategori) {
        return total + (nilai ?? 0);
      }

      return total;
    }, 0),
  }));

  const nilaiTertinggi = Math.max(...skor.map((item) => item.nilai));

  const profilDominan = skor.filter((item) => item.nilai === nilaiTertinggi);

  function lanjutDariIdentitas(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!nama.trim() || !kelompok.trim()) return;

    setTahap("petunjuk");
  }

  function pilihJawaban(indeksJawaban: number, nilai: number) {
    setJawaban((sebelumnya) =>
      sebelumnya.map((item, indeks) =>
        indeks === indeksJawaban ? nilai : item,
      ),
    );
  }

  async function lanjutTes() {
    if (!kelompokLengkap || menyimpan) return;

    if (halaman < pertanyaan.length - 1) {
      setHalaman((sebelumnya) => sebelumnya + 1);
      return;
    }

    if (terjawab !== jumlahPernyataan) return;

    setMenyimpan(true);
    setPesanSimpan("");

    try {
      const response = await fetch("/api/hasil-disc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nama: nama.trim(),
          kelompok: kelompok.trim(),
          jawaban,
        }),
      });

      const hasil = await response.json();
      console.log("PESAN API HASIL DISC:", hasil);
      console.log("DATA YANG DIKIRIM:", {
        nama: nama.trim(),
        kelompok: kelompok.trim(),
        jumlahJawaban: jawaban.length,
        jawabanTidakValid: jawaban
          .map((nilai, indeks) => ({
            pernyataan: indeks + 1,
            nilai,
          }))
          .filter(
            ({ nilai }) =>
              typeof nilai !== "number" ||
              !Number.isInteger(nilai) ||
              nilai < 1 ||
              nilai > 4,
          ),
      });

      if (!response.ok) {
        throw new Error(hasil.pesan || "Hasil gagal disimpan.");
      }

      setPesanSimpan("Hasil tes berhasil disimpan ke database.");
      setTahap("hasil");
    } catch (error) {
      setPesanSimpan(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menyimpan.",
      );
    } finally {
      setMenyimpan(false);
    }
  }

  function kembaliTes() {
    if (halaman === 0) {
      setTahap("petunjuk");
    } else {
      setHalaman((sebelumnya) => sebelumnya - 1);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 px-5 py-10 sm:py-14">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold tracking-widest text-blue-600">
          ASESMEN MAHASISWA
        </p>

        <h1 className="mt-3 text-3xl font-bold text-slate-900">
          Tes Kepribadian DISC
        </h1>

        <p className="mt-3 leading-relaxed text-slate-600">
          Kenali kecenderungan perilaku Anda melalui pernyataan yang sesuai
          dengan keseharian Anda.
        </p>

        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          {tahap === "identitas" && (
            <>
              <h2 className="text-xl font-semibold text-slate-900">
                Identitas peserta
              </h2>

              <p className="mt-2 text-sm text-slate-600">
                Lengkapi identitas sebelum melanjutkan.
              </p>

              <form onSubmit={lanjutDariIdentitas} className="mt-6 space-y-5">
                <div>
                  <label
                    htmlFor="nama"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Nama lengkap
                  </label>

                  <input
                    id="nama"
                    type="text"
                    autoComplete="name"
                    required
                    maxLength={100}
                    value={nama}
                    onChange={(event) => setNama(event.target.value)}
                    placeholder="Masukkan nama lengkap"
                    className={kolomInput}
                  />
                </div>

                <div>
                  <label
                    htmlFor="kelompok"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Nama kelompok
                  </label>

                  <input
                    id="kelompok"
                    type="text"
                    required
                    maxLength={100}
                    value={kelompok}
                    onChange={(event) => setKelompok(event.target.value)}
                    placeholder="Masukkan nama kelompok"
                    className={kolomInput}
                  />
                </div>

                <button
                  type="submit"
                  disabled={!nama.trim() || !kelompok.trim()}
                  className={`${tombolUtama} w-full`}
                >
                  Lanjut ke petunjuk
                </button>
              </form>
            </>
          )}

          {tahap === "petunjuk" && (
            <>
              <p className="text-sm font-medium text-blue-600">
                {nama.trim()} · {kelompok.trim()}
              </p>

              <h2 className="mt-3 text-xl font-semibold text-slate-900">
                Petunjuk pengisian
              </h2>

              <ul className="mt-5 list-disc space-y-3 pl-5 leading-relaxed text-slate-600">
                <li>Terdapat 8 kelompok, masing-masing berisi 4 pernyataan.</li>
                <li>Berikan nilai 1–4 pada setiap pernyataan.</li>
                <li>Nilai 1 berarti paling tidak cocok dengan diri Anda.</li>
                <li>Nilai 4 berarti paling cocok dengan diri Anda.</li>
                <li>Jawablah sesuai keadaan diri Anda saat ini.</li>
              </ul>

              <div className="mt-8 flex flex-wrap justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setTahap("identitas")}
                  className={tombolKembali}
                >
                  Kembali
                </button>

                <button
                  type="button"
                  onClick={() => setTahap("tes")}
                  className={tombolUtama}
                >
                  {terjawab > 0 ? "Lanjutkan tes" : "Mulai tes"}
                </button>
              </div>
            </>
          )}

          {tahap === "tes" && (
            <>
              <div className="flex flex-wrap justify-between gap-2">
                <p className="text-sm font-medium text-blue-600">
                  {nama.trim()}
                </p>

                <p className="text-sm text-slate-500" aria-live="polite">
                  {terjawab} dari {jumlahPernyataan} pernyataan terisi
                </p>
              </div>

              <progress
                value={terjawab}
                max={jumlahPernyataan}
                aria-label="Progres pengisian tes"
                className="mt-4 h-2 w-full overflow-hidden rounded-full [&::-webkit-progress-bar]:bg-slate-100 [&::-webkit-progress-value]:bg-blue-600 [&::-moz-progress-bar]:bg-blue-600"
              />

              <div className="mt-6" aria-live="polite">
                <h2 className="text-xl font-semibold text-slate-900">
                  Kelompok {halaman + 1} dari {pertanyaan.length}
                </h2>

                <p className="mt-2 text-sm text-slate-600">
                  Pilih nilai pada setiap pernyataan. 1 = paling tidak cocok, 4
                  = paling cocok.
                </p>
              </div>

              <div className="mt-6 space-y-5">
                {pertanyaan[halaman].map((teks, indeks) => {
                  const indeksJawaban = halaman * 4 + indeks;

                  return (
                    <fieldset
                      key={indeksJawaban}
                      className="min-w-0 rounded-xl border border-slate-200 p-4 sm:p-5"
                    >
                      <legend className="px-2 text-sm font-semibold text-slate-500">
                        Pernyataan {indeksJawaban + 1}
                      </legend>

                      <p className="leading-relaxed text-slate-800">{teks}</p>

                      <div className="mt-4 grid grid-cols-4 gap-3">
                        {[1, 2, 3, 4].map((nilai) => {
                          const dipilih = jawaban[indeksJawaban] === nilai;

                          return (
                            <label
                              key={nilai}
                              className="relative cursor-pointer"
                            >
                              <input
                                type="radio"
                                name={`pernyataan-${indeksJawaban}`}
                                value={nilai}
                                checked={dipilih}
                                onChange={() =>
                                  pilihJawaban(indeksJawaban, nilai)
                                }
                                aria-label={`Nilai ${nilai}`}
                                className="peer sr-only"
                              />

                              <span
                                className={`flex min-h-12 items-center justify-center rounded-lg border font-semibold transition peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-blue-600 ${
                                  dipilih
                                    ? "border-blue-600 bg-blue-600 text-white"
                                    : "border-slate-300 bg-white text-slate-700 hover:border-blue-400 hover:bg-blue-50"
                                }`}
                              >
                                {nilai}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </fieldset>
                  );
                })}
              </div>

              {!kelompokLengkap && (
                <p className="mt-5 text-sm text-slate-500">
                  Lengkapi keempat pernyataan untuk melanjutkan.
                </p>
              )}

              <div className="mt-7 flex justify-between gap-4">
                <button
                  type="button"
                  onClick={kembaliTes}
                  className={tombolKembali}
                >
                  Kembali
                </button>

                <button
                  type="button"
                  onClick={lanjutTes}
                  disabled={!kelompokLengkap || menyimpan}
                  className={tombolUtama}
                >
                  {menyimpan
                    ? "Menyimpan..."
                    : halaman === pertanyaan.length - 1
                      ? "Simpan dan lihat hasil"
                      : "Selanjutnya"}
                </button>
              </div>
            </>
          )}

          {tahap === "hasil" && (
            <>
              <p className="text-sm font-semibold text-blue-600">TES SELESAI</p>

              <h2 className="mt-3 text-2xl font-bold text-slate-900">
                Hasil tes {nama.trim()}
              </h2>

              <p className="mt-2 text-slate-600">Kelompok: {kelompok.trim()}</p>

              <div className="mt-6 rounded-xl bg-blue-50 p-5">
                <p className="text-sm text-blue-800">
                  {profilDominan.length === 1
                    ? "Profil dengan skor tertinggi"
                    : "Terdapat skor tertinggi yang sama"}
                </p>

                <p className="mt-2 text-2xl font-bold text-blue-900">
                  {profilDominan
                    .map((item) => `${item.nama} (${item.kode})`)
                    .join(" & ")}
                </p>

                <p className="mt-2 text-sm text-blue-800">
                  {profilDominan.length === 1
                    ? `Total skor: ${nilaiTertinggi}`
                    : `Masing-masing mendapat skor ${nilaiTertinggi}. Tidak ada satu profil dominan tunggal.`}
                </p>
              </div>

              <div className="mt-7 space-y-5">
                {skor.map((item) => (
                  <div key={item.kode}>
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="font-medium text-slate-700">
                        {item.nama} ({item.kode})
                      </span>

                      <span className="text-slate-600">
                        {item.nilai} / {pertanyaan.length * 4}
                      </span>
                    </div>

                    <div
                      role="meter"
                      aria-label={`Skor ${item.nama}`}
                      aria-valuemin={pertanyaan.length}
                      aria-valuemax={pertanyaan.length * 4}
                      aria-valuenow={item.nilai}
                      className="h-3 overflow-hidden rounded-full bg-slate-100"
                    >
                      <div
                        className="h-full rounded-full bg-blue-600"
                        style={{
                          width: `${
                            (item.nilai / (pertanyaan.length * 4)) * 100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-6 text-sm leading-relaxed text-slate-500">
                Skor dihitung dengan menjumlahkan nilai pada posisi a, b, c, dan
                d di seluruh kelompok. Hasil mengikuti perhitungan pada lembar
                tes dan bukan diagnosis psikologis.
              </p>

              <button
                type="button"
                onClick={() => {
                  setHalaman(0);
                  setTahap("tes");
                }}
                className="mt-6 rounded-xl px-4 py-3 font-semibold text-blue-600 hover:bg-blue-50"
              >
                Tinjau jawaban
              </button>
            </>
          )}
        </section>

        <div className="mt-5 text-center">
          <p
            role="status"
            aria-live="polite"
            className="text-sm font-medium text-blue-700"
          >
            {pesanSimpan}
          </p>

          <p className="mt-2 text-xs leading-relaxed text-slate-500">
            Jawaban disimpan ke database setelah Anda menekan Simpan dan lihat
            hasil. Isian yang belum disimpan akan hilang jika halaman dimuat
            ulang.
          </p>
        </div>
      </div>
    </main>
  );
}
