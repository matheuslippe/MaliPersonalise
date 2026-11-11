const fmt = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function formatBRL(cents: number): string {
  return fmt.format(cents / 100);
}

/** "49,90" | "49.90" | "R$ 1.049,90" -> 4990 */
export function parseBRL(input: string): number {
  const clean = input.replace(/[^\d,.-]/g, "");
  const normalized = clean.includes(",") ? clean.replace(/\./g, "").replace(",", ".") : clean;
  const value = Number(normalized);
  if (!Number.isFinite(value) || value < 0) throw new Error("Valor inválido");
  return Math.round(value * 100);
}
