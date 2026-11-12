import "server-only";
import { hasSupabase } from "./env";
import { supabaseAdmin } from "./db/supabase";
import { hmac } from "./sign";

export const UPLOAD_LIMIT = 20;
const WINDOW_MS = 60 * 60 * 1000;

const memory = new Map<string, number[]>();

/** IP do cliente atrás do proxy da hospedagem. Guardamos só um hash (LGPD). */
export function clientKey(req: Request): string {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "desconhecido";
  return hmac(`ip:${ip}`).slice(0, 32);
}

/** Registra uma tentativa e diz se ela está dentro do limite (20 por hora). */
export async function allowUpload(key: string): Promise<boolean> {
  const since = Date.now() - WINDOW_MS;

  if (hasSupabase) {
    const db = supabaseAdmin();
    const { count, error } = await db
      .from("upload_log")
      .select("*", { count: "exact", head: true })
      .eq("client_key", key)
      .gte("created_at", new Date(since).toISOString());
    if (error) {
      console.error("[rate-limit]", error.message);
      return true; // não bloqueia vendas se a contagem falhar
    }
    if ((count ?? 0) >= UPLOAD_LIMIT) return false;
    await db.from("upload_log").insert({ client_key: key });
    return true;
  }

  const hits = (memory.get(key) ?? []).filter((t) => t > since);
  if (hits.length >= UPLOAD_LIMIT) {
    memory.set(key, hits);
    return false;
  }
  hits.push(Date.now());
  memory.set(key, hits);
  return true;
}
