/**
 * Descobre o IP do visitante a partir do X-Forwarded-For.
 *
 * O cabeçalho é uma lista "cliente, proxy1, proxy2". O visitante pode escrever o que quiser no
 * começo dela, então NÃO confiamos no primeiro valor: contamos a partir do fim, onde cada proxy
 * da hospedagem acrescenta o IP de quem se conectou a ele. Com 1 proxy na frente do site
 * (hops = 1), o último valor é o IP real.
 */
export function pickClientIp(forwardedFor: string | null, realIp: string | null, hops = 1): string {
  const list = (forwardedFor ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (list.length) return list[Math.max(0, list.length - Math.max(1, hops))];
  return realIp?.trim() || "desconhecido";
}
