/** Lê o corpo JSON de uma requisição pública com limite de tamanho. Devolve null se for inválido ou grande demais. */
export async function readJson(req: Request, maxBytes = 100_000): Promise<unknown> {
  if (Number(req.headers.get("content-length") ?? 0) > maxBytes) return null;
  const text = await req.text().catch(() => "");
  if (!text || text.length > maxBytes) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
