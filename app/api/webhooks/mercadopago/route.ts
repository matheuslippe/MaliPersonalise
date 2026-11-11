import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { verifyWebhookSignature } from "@/lib/payments/mercadopago";
import { syncPayment } from "@/lib/orders";

export async function POST(req: Request) {
  const url = new URL(req.url);
  const body = (await req.json().catch(() => ({}))) as { type?: string; action?: string; data?: { id?: string } };
  const dataId = url.searchParams.get("data.id") ?? body.data?.id ?? "";
  const type = url.searchParams.get("type") ?? body.type;

  if (!env.mpWebhookSecret) {
    console.error("[webhook] MERCADOPAGO_WEBHOOK_SECRET não configurado");
    return NextResponse.json({ error: "not configured" }, { status: 500 });
  }
  const valid = verifyWebhookSignature({
    signature: req.headers.get("x-signature"),
    requestId: req.headers.get("x-request-id"),
    dataId,
    secret: env.mpWebhookSecret,
  });
  if (!valid) return NextResponse.json({ error: "invalid signature" }, { status: 401 });

  if (type !== "payment" || !/^\d+$/.test(dataId)) return NextResponse.json({ ignored: true });

  try {
    // sempre consulta a API: o corpo da notificação não é usado como fonte da verdade
    const order = await syncPayment(dataId);
    return NextResponse.json({ ok: true, order: order?.code ?? null });
  } catch (err) {
    console.error("[webhook] falha ao processar pagamento", dataId, err);
    return NextResponse.json({ error: "retry" }, { status: 500 }); // o MP tenta de novo
  }
}
