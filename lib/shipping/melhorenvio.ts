import "server-only";
import type { Product } from "../types";
import { env, hasMelhorEnvio } from "../env";

export interface ShippingOption {
  serviceId: string;
  name: string;
  price: number; // centavos
  deliveryDays: number | null;
}

interface Line {
  product: Product;
  quantity: number;
  unitPrice: number;
}

const BASE = () =>
  env.melhorEnvioSandbox ? "https://sandbox.melhorenvio.com.br" : "https://melhorenvio.com.br";

/** Cota frete no Melhor Envio. O prazo inclui o tempo de produção do item mais demorado. */
export async function quoteShipping(originCep: string, destCep: string, lines: Line[]): Promise<ShippingOption[]> {
  const productionDays = Math.max(0, ...lines.map((l) => l.product.productionDays));

  if (!hasMelhorEnvio) {
    if (process.env.NODE_ENV === "production") throw new Error("Melhor Envio não configurado.");
    return demoQuotes(destCep, productionDays);
  }
  if (!/^\d{8}$/.test(originCep)) throw new Error("CEP de origem não configurado no painel.");

  const res = await fetch(`${BASE()}/api/v2/me/shipment/calculate`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.melhorEnvioToken}`,
      "User-Agent": env.melhorEnvioUserAgent,
    },
    body: JSON.stringify({
      from: { postal_code: originCep },
      to: { postal_code: destCep },
      products: lines.map((l) => ({
        id: l.product.id,
        width: l.product.widthCm,
        height: l.product.heightCm,
        length: l.product.lengthCm,
        weight: l.product.weightG / 1000,
        insurance_value: l.unitPrice / 100,
        quantity: l.quantity,
      })),
      options: { receipt: false, own_hand: false },
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`Melhor Envio respondeu ${res.status}`);

  const data = (await res.json()) as Array<{
    id: number;
    name: string;
    custom_price?: string;
    price?: string;
    custom_delivery_time?: number;
    delivery_time?: number;
    error?: string;
    company?: { name: string };
  }>;

  return data
    .filter((s) => !s.error && (s.custom_price ?? s.price))
    .map((s) => ({
      serviceId: String(s.id),
      name: `${s.company?.name ?? ""} ${s.name}`.trim(),
      price: Math.round(Number(s.custom_price ?? s.price) * 100),
      deliveryDays: (s.custom_delivery_time ?? s.delivery_time ?? 0) + productionDays,
    }))
    .sort((a, b) => a.price - b.price);
}

/** Cotação fictícia usada só em desenvolvimento, sem token do Melhor Envio. */
function demoQuotes(cep: string, productionDays: number): ShippingOption[] {
  const region = Number(cep[0]);
  const far = region >= 4 && region <= 7 ? 1.6 : 1;
  return [
    { serviceId: "demo-pac", name: "Correios PAC (simulado)", price: Math.round(2290 * far), deliveryDays: 8 + productionDays },
    { serviceId: "demo-sedex", name: "Correios SEDEX (simulado)", price: Math.round(3890 * far), deliveryDays: 3 + productionDays },
  ];
}
