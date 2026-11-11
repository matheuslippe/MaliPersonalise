import Link from "next/link";
import { repo } from "@/lib/db";
import { formatBRL } from "@/lib/money";
import { ORDER_STATUS_LABEL, type OrderStatus } from "@/lib/types";

export const metadata = { title: "Pedidos" };

const dateFmt = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" });

export const STATUS_STYLE: Record<OrderStatus, string> = {
  aguardando_pagamento: "bg-white text-ink border border-line",
  pago: "bg-rose text-white",
  em_producao: "bg-[#e0cfe8] text-wine",
  enviado: "bg-sand text-wine",
  entregue: "bg-blush text-wine",
  cancelado: "bg-white text-ink/70 line-through border border-line",
};

export default async function OrdersPage({ searchParams }: PageProps<"/admin/pedidos">) {
  const { status } = await searchParams;
  const current = typeof status === "string" && status in ORDER_STATUS_LABEL ? (status as OrderStatus) : undefined;
  const orders = await repo().listOrders({ status: current });

  return (
    <div>
      <h1 className="font-serif text-[34px] text-wine">Pedidos</h1>
      <nav aria-label="Filtrar por status" className="mt-4 flex flex-wrap gap-2 text-[14px]">
        {[undefined, ...Object.keys(ORDER_STATUS_LABEL)].map((s) => (
          <Link
            key={s ?? "todos"}
            href={s ? `/admin/pedidos?status=${s}` : "/admin/pedidos"}
            aria-current={s === current ? "page" : undefined}
            className={`rounded-full border px-4 py-1.5 ${s === current ? "border-rose bg-rose text-white" : "border-line bg-white text-wine"}`}
          >
            {s ? ORDER_STATUS_LABEL[s as OrderStatus] : "Todos"}
          </Link>
        ))}
      </nav>
      {orders.length === 0 ? (
        <p className="mt-10 text-ink">Nenhum pedido por aqui ainda.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-[14px] border border-line bg-white">
          <table className="w-full text-left text-[15px]">
            <thead className="border-b border-line text-[13px] text-ink">
              <tr>
                <th className="px-4 py-3 font-normal">Pedido</th>
                <th className="px-4 py-3 font-normal">Cliente</th>
                <th className="px-4 py-3 font-normal">Data</th>
                <th className="px-4 py-3 font-normal">Status</th>
                <th className="px-4 py-3 text-right font-normal">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-cream">
                  <td className="px-4 py-3">
                    <Link href={`/admin/pedidos/${o.id}`} className="text-rose underline underline-offset-4">
                      {o.code}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-wine">{o.customer.name}</td>
                  <td className="px-4 py-3 text-ink tabular-nums">{dateFmt.format(new Date(o.createdAt))}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block whitespace-nowrap rounded-full px-3 py-0.5 text-[13px] ${STATUS_STYLE[o.status]}`}>
                      {ORDER_STATUS_LABEL[o.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-wine tabular-nums">{formatBRL(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
