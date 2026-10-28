"use client";

import { useState, type FormEvent } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pesan, setPesan] = useState("");
  const [memproses, setMemproses] = useState(false);

  async function masuk(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (memproses) return;

    setMemproses(true);
    setPesan("");

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.headers.get("content-type")?.includes("application/json")) {
        throw new Error(
          "Respons server tidak valid. Periksa terminal VS Code.",
        );
      }

      const hasil = await response.json();

      if (!response.ok) {
        throw new Error(hasil.pesan || "Login gagal.");
      }

      // Muat halaman baru agar pemeriksaan sesi dilakukan di server.
      window.location.assign(hasil.tujuan === "/admin" ? "/admin" : "/");
    } catch (error) {
      setPesan(error instanceof Error ? error.message : "Terjadi kesalahan.");
      setMemproses(false);
    }
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-5 py-12">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold tracking-widest text-blue-600">
          PORTAL DISC
        </p>

        <h1 className="mt-3 text-3xl font-bold text-slate-900">
          Masuk ke akun
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Gunakan email dan password akun Anda.
        </p>

        <form onSubmit={masuk} className="mt-7 space-y-5">
          <div>
            <label
              htmlFor="email"
              className="text-sm font-medium text-slate-700"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              autoComplete="username"
              required
              maxLength={254}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="text-sm font-medium text-slate-700"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              maxLength={256}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={inputClass}
            />
          </div>

          <p role="alert" className="text-sm text-rose-600">
            {pesan}
          </p>

          <button
            type="submit"
            disabled={memproses || !email.trim() || !password}
            className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {memproses ? "Memeriksa akun..." : "Masuk"}
          </button>
        </form>
      </section>
    </main>
  );
}
