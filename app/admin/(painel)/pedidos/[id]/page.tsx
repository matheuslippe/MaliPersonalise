import Link from "next/link";
import { notFound } from "next/navigation";
import { repo } from "@/lib/db";
import { formatBRL } from "@/lib/money";
import { customerUploadUrl } from "@/lib/storage";
import { ORDER_STATUS_LABEL } from "@/lib/types";
import { updateOrderAction } from "../../../actions";

export const metadata = { title: "Pedido" };

const dateFmt = new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeStyle: "short", timeZone: "America/Sao_Paulo" });
const fmtCpf = (v: string) => v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
const fmtPhone = (v: string) => v.replace(/(\d{2})(\d{4,5})(\d{4})/, "($1) $2-$3");

export default async function OrderDetail({ params }: PageProps<"/admin/pedidos/[id]">) {
  const { id } = await params;
  const order = await repo().getOrder(id);
  if (!order) notFound();

  const fileLinks = new Map<string, string>();
  for (const item of order.items) {
    for (const p of item.personalization) {
      if (p.type === "file") fileLinks.set(p.value, await customerUploadUrl(p.value));
    }
  }

  return (
    <div>
      <Link href="/admin/pedidos" className="text-[14px] text-ink hover:text-rose">
        ← Pedidos
      </Link>
      <div className="mt-2 flex flex-wrap items-baseline gap-4">
        <h1 className="font-serif text-[34px] text-wine">{order.code}</h1>
        <p className="text-ink">{dateFmt.format(new Date(order.createdAt))}</p>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <section className="rounded-[14px] border border-line bg-white p-5">
            <h2 className="font-serif text-[22px] text-wine">Itens</h2>
            <ul className="mt-3 divide-y divide-line">
              {order.items.map((i, idx) => (
                <li key={idx} className="py-4">
                  <div className="flex justify-between gap-4">
                    <p className="text-wine">
                      {i.quantity}× {i.productName}
                      {i.variantName && <span className="text-ink"> — {i.variantName}</span>}
                    </p>
                    <p className="text-wine tabular-nums">{formatBRL(i.unitPrice * i.quantity)}</p>
                  </div>
                  {i.personalization.length > 0 && (
                    <dl className="mt-2 space-y-1 rounded-[10px] bg-blush p-3 text-[14px]">
                      {i.personalization.map((p) => (
                        <div key={p.fieldId} className="flex flex-wrap gap-x-2">
                          <dt className="text-ink">{p.label}:</dt>
                          <dd className="whitespace-pre-line text-wine">
                            {p.type === "file" ? (
                              <a href={fileLinks.get(p.value)} target="_blank" rel="noopener noreferrer" className="text-rose underline underline-offset-4">
                                Abrir arquivo ↗
                              </a>
                            ) : (
                              p.value
                            )}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </li>
              ))}
            </ul>
            <dl className="mt-2 space-y-1 border-t border-line pt-3 text-[15px]">
              <div className="flex justify-between"><dt className="text-ink">Subtotal</dt><dd className="tabular-nums">{formatBRL(order.subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-ink">Frete · {order.shipping.name}</dt><dd className="tabular-nums">{formatBRL(order.shipping.price)}</dd></div>
              <div className="flex justify-between text-[17px] text-wine"><dt>Total</dt><dd className="tabular-nums">{formatBRL(order.total)}</dd></div>
            </dl>
          </section>
          {order.notes && (
            <section className="rounded-[14px] border border-line bg-white p-5">
              <h2 className="font-serif text-[22px] text-wine">Recado do cliente</h2>
              <p className="mt-2 whitespace-pre-line text-ink">{order.notes}</p>
            </section>
          )}
        </div>

        <aside className="space-y-6">
          <section className="rounded-[14px] border border-line bg-white p-5">
            <h2 className="font-serif text-[22px] text-wine">Status</h2>
            <form action={updateOrderAction} className="mt-3 space-y-3">
              <input type="hidden" name="id" value={order.id} />
              <label className="block text-[14px] text-ink">
                Situação
                <select name="status" defaultValue={order.status} className="mt-1 w-full rounded-[10px] border border-line bg-white px-3 py-2 text-wine">
                  {Object.entries(ORDER_STATUS_LABEL).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </label>
              <label className="block text-[14px] text-ink">
                Código de rastreio
                <input name="trackingCode" defaultValue={order.trackingCode ?? ""} className="mt-1 w-full rounded-[10px] border border-line px-3 py-2 text-wine" />
              </label>
              <p className="text-[13px] text-ink">Ao mudar para &quot;Enviado&quot;, o cliente recebe um e-mail com o rastreio.</p>
              <button className="h-10 w-full rounded-full bg-rose text-white hover:bg-rose-dark">Salvar</button>
            </form>
            <p className="mt-3 text-[13px] text-ink">
              Pagamento: {order.paymentStatus ?? "—"} {order.paymentId && <span className="tabular-nums">(#{order.paymentId})</span>}
            </p>
          </section>
          <section className="rounded-[14px] border border-line bg-white p-5 text-[15px]">
            <h2 className="font-serif text-[22px] text-wine">Cliente</h2>
            <p className="mt-2 text-wine">{order.customer.name}</p>
            <p className="text-ink">{order.customer.email}</p>
            <p className="text-ink">
              <a href={`https://wa.me/55${order.customer.phone}`} target="_blank" rel="noopener noreferrer" className="text-rose underline underline-offset-4">
                {fmtPhone(order.customer.phone)}
              </a>
            </p>
            <p className="text-ink">CPF {fmtCpf(order.customer.cpf)}</p>
            <h3 className="mt-4 text-[15px] text-wine">Entrega</h3>
            {order.address ? (
              <p className="text-ink">
                {order.address.street}, {order.address.number}
                {order.address.complement && ` — ${order.address.complement}`}
                <br />
                {order.address.district} · {order.address.city}/{order.address.state}
                <br />
                CEP {order.address.cep.replace(/(\d{5})(\d{3})/, "$1-$2")}
              </p>
            ) : (
              <p className="text-ink">Retirada</p>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
