import type { OrderStatus } from "../types";

/**
 * Próximo status do pedido a partir do status do pagamento no Mercado Pago.
 * Idempotente e sem retrocessos: um pedido já em produção não volta para "pago".
 */
export function nextOrderStatus(current: OrderStatus, mpStatus: string): OrderStatus {
  if (mpStatus === "approved") {
    return current === "aguardando_pagamento" || current === "cancelado" ? "pago" : current;
  }
  if (mpStatus === "refunded" || mpStatus === "charged_back") {
    return current === "entregue" ? current : "cancelado";
  }
  if (mpStatus === "cancelled") {
    return current === "aguardando_pagamento" ? "cancelado" : current;
  }
  // pending, in_process, authorized, rejected (cliente pode tentar de novo)
  return current;
}

/** O valor pago (em reais, como vem do Mercado Pago) cobre o total do pedido (em centavos)? */
export function coversOrderTotal(totalCents: number, paidAmount: number, currency: string): boolean {
  return currency === "BRL" && Number.isFinite(paidAmount) && Math.round(paidAmount * 100) >= totalCents;
}
