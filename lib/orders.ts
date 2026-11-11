import "server-only";
import { randomBytes, randomUUID } from "node:crypto";
import { repo } from "./db";
import { hasMercadoPago } from "./env";
import type { CheckoutInput } from "./checkout-schema";
import { buildOrderItems, unitPrice } from "./pricing";
import { quoteShipping } from "./shipping/melhorenvio";
import { customerUploadExists } from "./storage";
import { createPreference, getPayment } from "./payments/mercadopago";
import { nextOrderStatus } from "./payments/status";
import { sendPaymentConfirmed } from "./email";
import type { Order, ShippingChoice } from "./types";

export class CheckoutError extends Error {
  constructor(public messages: string[]) {
    super(messages.join(" "));
  }
}

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function orderCode() {
  const bytes = randomBytes(6);
  return "MALI-" + Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join("");
}

export async function createCheckout(input: CheckoutInput): Promise<{ orderId: string; redirectUrl: string }> {
  const db = repo();
  const [products, settings] = await Promise.all([
    db.getProductsByIds([...new Set(input.items.map((i) => i.productId))]),
    db.getSettings(),
  ]);

  const { items, subtotal, errors } = buildOrderItems(products, input.items);
  if (errors.length) throw new CheckoutError([...new Set(errors)]);

  // garante que as artes informadas foram realmente enviadas
  const files = items.flatMap((i) => i.personalization.filter((p) => p.type === "file").map((p) => p.value));
  const exists = await Promise.all(files.map(customerUploadExists));
  if (exists.includes(false)) throw new CheckoutError(["Não encontramos um dos arquivos enviados. Envie a arte novamente."]);

  let shipping: ShippingChoice;
  if (input.shippingServiceId === "retirada") {
    if (!settings.pickupEnabled) throw new CheckoutError(["Retirada não está disponível."]);
    shipping = { serviceId: "retirada", name: "Retirada", price: 0, deliveryDays: null };
  } else {
    if (!input.address) throw new CheckoutError(["Informe o endereço de entrega."]);
    const byId = new Map(products.map((p) => [p.id, p]));
    const quotes = await quoteShipping(
      settings.originCep,
      input.address.cep,
      input.items.map((l) => {
        const product = byId.get(l.productId)!;
        return { product, quantity: l.quantity, unitPrice: unitPrice(product, l.variantId) };
      }),
    );
    const chosen = quotes.find((q) => q.serviceId === input.shippingServiceId);
    if (!chosen) throw new CheckoutError(["A forma de entrega escolhida não está mais disponível. Calcule o frete novamente."]);
    shipping = chosen;
  }

  const now = new Date().toISOString();
  const order: Order = {
    id: randomUUID(),
    code: orderCode(),
    status: "aguardando_pagamento",
    customer: input.customer,
    address: shipping.serviceId === "retirada" ? null : input.address,
    items,
    subtotal,
    shipping,
    total: subtotal + shipping.price,
    notes: input.notes,
    paymentId: null,
    paymentStatus: null,
    trackingCode: null,
    createdAt: now,
    updatedAt: now,
  };
  await db.createOrder(order);

  if (hasMercadoPago) {
    return { orderId: order.id, redirectUrl: await createPreference(order) };
  }
  if (process.env.NODE_ENV === "production") throw new Error("Mercado Pago não configurado.");
  return { orderId: order.id, redirectUrl: `/pedido/${order.id}` };
}

/** Aplica um status de pagamento ao pedido (webhook ou simulação local). */
export async function applyPaymentStatus(orderId: string, paymentId: string, mpStatus: string) {
  const db = repo();
  const order = await db.getOrder(orderId);
  if (!order) return null;
  const status = nextOrderStatus(order.status, mpStatus);
  const updated = await db.updateOrder(order.id, { status, paymentId, paymentStatus: mpStatus });
  if (updated && order.status !== "pago" && status === "pago") {
    await sendPaymentConfirmed(updated);
  }
  return updated;
}

export async function syncPayment(paymentId: string) {
  const payment = await getPayment(paymentId);
  if (!payment.externalReference) return null;
  return applyPaymentStatus(payment.externalReference, payment.id, payment.status);
}
