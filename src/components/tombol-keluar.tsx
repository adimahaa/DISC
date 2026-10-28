"use client";

import { useState } from "react";

export default function TombolKeluar() {
  const [memproses, setMemproses] = useState(false);
  const [pesan, setPesan] = useState("");

  async function keluar() {
    if (memproses) return;

    setMemproses(true);
    setPesan("");

    try {
      const response = await fetch("/api/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Gagal keluar. Silakan coba lagi.");
      }

      window.location.replace("/login");
    } catch (error) {
      setPesan(error instanceof Error ? error.message : "Terjadi kesalahan.");
      setMemproses(false);
    }
  }

  return (
    <div className="text-right">
      <button
        type="button"
        onClick={keluar}
        disabled={memproses}
        className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 disabled:opacity-50"
      >
        {memproses ? "Keluar..." : "Keluar"}
      </button>

      <p role="alert" className="mt-1 text-sm text-rose-700">
        {pesan}
      </p>
    </div>
  );
}
