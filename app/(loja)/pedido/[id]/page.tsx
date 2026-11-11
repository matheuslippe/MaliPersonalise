import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { repo } from "@/lib/db";
import { hasMercadoPago } from "@/lib/env";
import { formatBRL } from "@/lib/money";
import { applyPaymentStatus, syncPayment } from "@/lib/orders";
import { ORDER_STATUS_LABEL } from "@/lib/types";
import { ButtonLink } from "@/components/Button";
import { SectionTitle, whatsappLink } from "@/components/Landing";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Seu pedido", robots: { index: false } };

const MESSAGES: Record<string, string> = {
  aguardando_pagamento: "Estamos aguardando a confirmação do pagamento. Pix costuma ser aprovado em instantes e boleto em até 3 dias úteis.",
  pago: "Pagamento aprovado! Já vamos começar a produzir seu pedido com muito carinho ♡",
  em_producao: "Seu pedido está sendo produzido com todo cuidado.",
  enviado: "Seu pedido está a caminho!",
  entregue: "Pedido entregue. Esperamos que você ame ♡",
  cancelado: "Este pedido foi cancelado. Se precisar de ajuda, fale com a gente.",
};

async function simulatePayment(formData: FormData) {
  "use server";
  if (hasMercadoPago || process.env.NODE_ENV === "production") return;
  const id = String(formData.get("id"));
  await applyPaymentStatus(id, `simulado-${Date.now()}`, "approved");
  revalidatePath(`/pedido/${id}`);
}

export default async function OrderPage({ params, searchParams }: PageProps<"/pedido/[id]">) {
  const { id } = await params;
  const sp = await searchParams;
  const db = repo();
  let order = await db.getOrder(id);
  if (!order) notFound();

  // retorno do Mercado Pago: confere o pagamento na API (não confia nos parâmetros da URL)
  const paymentId = typeof sp.payment_id === "string" ? sp.payment_id : null;
  if (hasMercadoPago && paymentId && /^\d+$/.test(paymentId) && order.status === "aguardando_pagamento") {
    try {
      const synced = await syncPayment(paymentId);
      if (synced?.id === order.id) order = synced;
    } catch (err) {
      console.error("[pedido] falha ao consultar pagamento", err);
    }
  }
  const settings = await db.getSettings();

  return (
    <div className="mx-auto max-w-[760px] px-4 py-10 md:py-14">
      <SectionTitle as="h1">Pedido {order.code}</SectionTitle>
      <div className="mt-8 rounded-[14px] bg-blush p-6 text-center">
        <p className="text-[14px] uppercase tracking-wide text-ink">Status</p>
        <p className="mt-1 font-serif text-[28px] text-wine">{ORDER_STATUS_LABEL[order.status]}</p>
        <p className="mx-auto mt-2 max-w-[520px] text-[16px] text-ink">{MESSAGES[order.status]}</p>
        {order.trackingCode && (
          <p className="mt-3 text-[16px] text-wine">
            Rastreio: <strong className="font-medium">{order.trackingCode}</strong>
          </p>
        )}
        {!hasMercadoPago && process.env.NODE_ENV !== "production" && order.status === "aguardando_pagamento" && (
          <form action={simulatePayment} className="mt-5">
            <input type="hidden" name="id" value={order.id} />
            <p className="mb-2 text-[13px] text-ink">Modo de desenvolvimento: Mercado Pago não configurado.</p>
            <button className="rounded-full border border-rose px-5 py-2 text-[15px] text-rose hover:bg-rose hover:text-white">
              Simular pagamento aprovado
            </button>
          </form>
        )}
      </div>

      <ul className="mt-8 divide-y divide-line border-y border-line">
        {order.items.map((i, idx) => (
          <li key={idx} className="flex justify-between gap-4 py-4">
            <div>
              <p className="text-wine">
                {i.quantity}× {i.productName}
              </p>
              {i.variantName && <p className="text-[14px] text-ink">{i.variantName}</p>}
              {i.personalization
                .filter((p) => p.type !== "file")
                .map((p) => (
                  <p key={p.fieldId} className="text-[14px] text-ink">
                    {p.label}: <span className="text-wine">{p.value}</span>
                  </p>
                ))}
              {i.personalization.some((p) => p.type === "file") && <p className="text-[14px] text-ink">Arte enviada ✓</p>}
            </div>
            <p className="text-wine tabular-nums">{formatBRL(i.unitPrice * i.quantity)}</p>
          </li>
        ))}
      </ul>
      <dl className="mt-4 space-y-1 text-[16px]">
        <div className="flex justify-between">
          <dt className="text-ink">Entrega · {order.shipping.name}</dt>
          <dd className="tabular-nums text-wine">{formatBRL(order.shipping.price)}</dd>
        </div>
        <div className="flex justify-between text-[18px]">
          <dt className="text-wine">Total</dt>
          <dd className="tabular-nums text-wine">{formatBRL(order.total)}</dd>
        </div>
      </dl>

      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <a
          href={whatsappLink(settings.whatsapp, `Oi, Mali! Tenho uma dúvida sobre o pedido ${order.code}.`)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-[52px] items-center rounded-[24px] border border-rose px-8 text-[18px] text-rose hover:bg-rose hover:text-white"
        >
          Falar com a Mali
        </a>
        <ButtonLink href="/produtos">Continuar comprando</ButtonLink>
      </div>
    </div>
  );
}
