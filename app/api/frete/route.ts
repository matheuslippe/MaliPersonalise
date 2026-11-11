import { NextResponse } from "next/server";
import { repo } from "@/lib/db";
import { shippingQuoteSchema } from "@/lib/checkout-schema";
import { quoteShipping } from "@/lib/shipping/melhorenvio";

export async function POST(req: Request) {
  const parsed = shippingQuoteSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "CEP inválido" }, { status: 400 });

  const db = repo();
  const [products, settings] = await Promise.all([
    db.getProductsByIds([...new Set(parsed.data.items.map((i) => i.productId))]),
    db.getSettings(),
  ]);
  const byId = new Map(products.filter((p) => p.active).map((p) => [p.id, p]));
  const lines = parsed.data.items
    .filter((i) => byId.has(i.productId))
    .map((i) => ({ product: byId.get(i.productId)!, quantity: i.quantity, unitPrice: byId.get(i.productId)!.basePrice }));
  if (!lines.length) return NextResponse.json({ error: "Carrinho vazio" }, { status: 400 });

  try {
    const options = await quoteShipping(settings.originCep, parsed.data.cep, lines);
    return NextResponse.json({ options });
  } catch (err) {
    console.error("[frete]", err);
    return NextResponse.json({ error: "Não foi possível calcular o frete agora. Tente novamente em instantes." }, { status: 502 });
  }
}
