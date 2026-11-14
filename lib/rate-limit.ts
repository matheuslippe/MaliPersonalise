import "server-only";
import { env, hasSupabase } from "./env";
import { supabaseAdmin } from "./db/supabase";
import { pickClientIp } from "./client-ip";
import { hmac } from "./sign";

/** Limites por visitante. [máximo de tentativas, janela em minutos] */
export const LIMITS = {
  upload: [20, 60],
  checkout: [10, 60],
  frete: [60, 60],
  login: [10, 15],
} as const satisfies Record<string, readonly [number, number]>;
export type LimitName = keyof typeof LIMITS;

const memory = new Map<string, number[]>();

export function clientIp(headers: Headers): string {
  return pickClientIp(headers.get("x-forwarded-for"), headers.get("x-real-ip"), env.trustedProxyHops);
}

/** Guardamos só um hash do IP (LGPD). */
function keyFor(name: LimitName, headers: Headers): string {
  return `${name}:${hmac(`ip:${clientIp(headers)}`).slice(0, 32)}`;
}

/** Registra uma tentativa e diz se ela está dentro do limite. */
export async function allow(name: LimitName, headers: Headers): Promise<boolean> {
  const [max, minutes] = LIMITS[name];
  const key = keyFor(name, headers);
  const since = Date.now() - minutes * 60_000;

  if (hasSupabase) {
    const db = supabaseAdmin();
    const { count, error } = await db
      .from("upload_log") // tabela de tentativas (o nome é histórico: começou só com uploads)
      .select("*", { count: "exact", head: true })
      .eq("client_key", key)
      .gte("created_at", new Date(since).toISOString());
    if (error) {
      console.error("[rate-limit]", error.message);
      return true; // não bloqueia vendas se a contagem falhar
    }
    if ((count ?? 0) >= max) return false;
    await db.from("upload_log").insert({ client_key: key });
    return true;
  }

  if (memory.size > 5000) {
    for (const [k, hits] of memory) if (!hits.some((t) => t > Date.now() - 60 * 60_000)) memory.delete(k);
  }
  const hits = (memory.get(key) ?? []).filter((t) => t > since);
  if (hits.length >= max) {
    memory.set(key, hits);
    return false;
  }
  hits.push(Date.now());
  memory.set(key, hits);
  return true;
}

export const TOO_MANY = "Muitas tentativas em pouco tempo. Aguarde um pouco e tente de novo.";
