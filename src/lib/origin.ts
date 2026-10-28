import "server-only";

export function originDiizinkan(request: Request): boolean {
  const origin = request.headers.get("origin");

  if (!origin) return false;

  const daftarOrigin = (process.env.APP_ORIGINS ?? "")
    .split(",")
    .map((nilai) => nilai.trim())
    .filter(Boolean);

  return daftarOrigin.includes(origin);
}
