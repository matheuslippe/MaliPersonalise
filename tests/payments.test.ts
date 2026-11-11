import { describe, expect, it } from "vitest";
import { createHmac } from "node:crypto";
import { nextOrderStatus } from "@/lib/payments/status";
import { verifyWebhookSignature } from "@/lib/payments/mercadopago";

describe("nextOrderStatus", () => {
  it("aprova pedido aguardando pagamento", () => {
    expect(nextOrderStatus("aguardando_pagamento", "approved")).toBe("pago");
  });
  it("é idempotente e não regride status", () => {
    expect(nextOrderStatus("pago", "approved")).toBe("pago");
    expect(nextOrderStatus("em_producao", "approved")).toBe("em_producao");
    expect(nextOrderStatus("enviado", "pending")).toBe("enviado");
  });
  it("cancela em estorno, mas não após entrega", () => {
    expect(nextOrderStatus("pago", "refunded")).toBe("cancelado");
    expect(nextOrderStatus("entregue", "refunded")).toBe("entregue");
  });
  it("mantém aguardando quando o cartão é recusado (cliente pode tentar de novo)", () => {
    expect(nextOrderStatus("aguardando_pagamento", "rejected")).toBe("aguardando_pagamento");
  });
});

describe("verifyWebhookSignature", () => {
  const secret = "segredo";
  const now = 1_700_000_000_000;
  const sign = (dataId: string, requestId: string, ts: number) =>
    createHmac("sha256", secret).update(`id:${dataId};request-id:${requestId};ts:${ts};`).digest("hex");

  it("aceita assinatura válida", () => {
    const v1 = sign("123", "req-1", now);
    expect(verifyWebhookSignature({ signature: `ts=${now},v1=${v1}`, requestId: "req-1", dataId: "123", secret, now })).toBe(true);
  });
  it("rejeita assinatura adulterada, ausente ou antiga", () => {
    const v1 = sign("123", "req-1", now);
    expect(verifyWebhookSignature({ signature: `ts=${now},v1=${v1}`, requestId: "req-1", dataId: "999", secret, now })).toBe(false);
    expect(verifyWebhookSignature({ signature: null, requestId: "req-1", dataId: "123", secret, now })).toBe(false);
    expect(verifyWebhookSignature({ signature: `ts=${now},v1=${v1}`, requestId: "req-1", dataId: "123", secret, now: now + 60 * 60 * 1000 })).toBe(false);
  });
});
