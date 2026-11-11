import "server-only";
import { MercadoPagoConfig, Payment, Preference } from "mercadopago";
import type { Order } from "../types";
import { env } from "../env";
import { hmac, safeEqual } from "../sign";

function client() {
  return new MercadoPagoConfig({ accessToken: env.mpAccessToken!, options: { timeout: 10_000 } });
}

export async function createPreference(order: Order): Promise<string> {
  const isHttps = env.siteUrl.startsWith("https://");
  const pref = await new Preference(client()).create({
    body: {
      external_reference: order.id,
      statement_descriptor: "MALI PERSONALIZE",
      items: [
        ...order.items.map((i, idx) => ({
          id: `${i.productId}-${idx}`,
          title: i.variantName ? `${i.productName} — ${i.variantName}` : i.productName,
          quantity: i.quantity,
          unit_price: i.unitPrice / 100,
          currency_id: "BRL",
        })),
        ...(order.shipping.price > 0
          ? [{ id: "frete", title: `Frete — ${order.shipping.name}`, quantity: 1, unit_price: order.shipping.price / 100, currency_id: "BRL" }]
          : []),
      ],
      payer: {
        name: order.customer.name,
        email: order.customer.email,
        identification: { type: "CPF", number: order.customer.cpf },
      },
      back_urls: {
        success: `${env.siteUrl}/pedido/${order.id}`,
        pending: `${env.siteUrl}/pedido/${order.id}`,
        failure: `${env.siteUrl}/pedido/${order.id}`,
      },
      // auto_return e webhook exigem URL pública https
      ...(isHttps
        ? { auto_return: "approved", notification_url: `${env.siteUrl}/api/webhooks/mercadopago` }
        : {}),
    },
    requestOptions: { idempotencyKey: order.id },
  });
  if (!pref.init_point) throw new Error("Mercado Pago não retornou link de pagamento");
  return pref.init_point;
}

export async function getPayment(id: string) {
  const p = await new Payment(client()).get({ id });
  return { id: String(p.id), status: p.status ?? "unknown", externalReference: p.external_reference ?? null };
}

/**
 * Valida o cabeçalho x-signature do webhook.
 * Manifesto: id:{data.id};request-id:{x-request-id};ts:{ts};
 * https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks
 */
export function verifyWebhookSignature(opts: {
  signature: string | null;
  requestId: string | null;
  dataId: string;
  secret: string;
  now?: number;
}): boolean {
  if (!opts.signature) return false;
  const parts = Object.fromEntries(
    opts.signature.split(",").map((kv) => kv.split("=").map((s) => s.trim()) as [string, string]),
  );
  const ts = parts.ts;
  const v1 = parts.v1;
  if (!ts || !v1) return false;
  // rejeita notificações muito antigas (replay); ts vem em milissegundos
  const age = Math.abs((opts.now ?? Date.now()) - Number(ts));
  if (!Number.isFinite(age) || age > 10 * 60 * 1000) return false;

  let manifest = `id:${opts.dataId.toLowerCase()};`;
  if (opts.requestId) manifest += `request-id:${opts.requestId};`;
  manifest += `ts:${ts};`;
  return safeEqual(hmac(manifest, opts.secret), v1);
}
