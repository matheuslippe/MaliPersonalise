"use client";

import { useState } from "react";
import Link from "next/link";
import { cartSubtotal, useCart } from "@/lib/cart-store";
import { formatBRL } from "@/lib/money";
import { Button, SecondaryButton } from "./Button";
import { useHydrated } from "./CartView";

interface Option {
  serviceId: string;
  name: string;
  price: number;
  deliveryDays: number | null;
}

const input =
  "w-full rounded-[10px] border border-line bg-white px-4 py-3 text-[16px] text-wine focus:border-rose focus:outline-none aria-[invalid=true]:border-rose-dark";

function Field({
  label,
  name,
  error,
  className = "",
  ...props
}: React.ComponentProps<"input"> & { label: string; name: string; error?: string }) {
  return (
    <div className={className}>
      <label htmlFor={name} className="mb-1 block text-[15px] text-wine">
        {label}
      </label>
      <input id={name} name={name} className={input} aria-invalid={Boolean(error)} aria-describedby={error ? `${name}-err` : undefined} {...props} />
      {error && (
        <p id={`${name}-err`} className="mt-1 text-[14px] text-rose-dark">
          {error}
        </p>
      )}
    </div>
  );
}

const maskCep = (v: string) => v.replace(/\D/g, "").slice(0, 8).replace(/(\d{5})(\d)/, "$1-$2");

export function CheckoutForm({ pickupEnabled, pickupAddress }: { pickupEnabled: boolean; pickupAddress: string }) {
  const hydrated = useHydrated();
  const lines = useCart((s) => s.lines);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", cpf: "",
    cep: "", street: "", number: "", complement: "", district: "", city: "", state: "", notes: "",
  });
  const [options, setOptions] = useState<Option[]>([]);
  const [serviceId, setServiceId] = useState("");
  const [quoting, setQuoting] = useState(false);
  const [quoteError, setQuoteError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formErrors, setFormErrors] = useState<string[]>([]);

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [k]: k === "cep" ? maskCep(e.target.value) : e.target.value }));
    setErrors((er) => ({ ...er, [k]: "" }));
  };

  async function quote() {
    const cep = form.cep.replace(/\D/g, "");
    if (cep.length !== 8) {
      setErrors((e) => ({ ...e, cep: "CEP inválido" }));
      return;
    }
    setQuoting(true);
    setQuoteError("");
    setOptions([]);
    setServiceId((s) => (s === "retirada" ? s : ""));
    try {
      // endereço automático pelo CEP (ViaCEP)
      fetch(`https://viacep.com.br/ws/${cep}/json/`)
        .then((r) => r.json())
        .then((d) => {
          if (d.erro) return;
          setForm((f) => ({
            ...f,
            street: f.street || d.logradouro || "",
            district: f.district || d.bairro || "",
            city: d.localidade || f.city,
            state: d.uf || f.state,
          }));
        })
        .catch(() => {});
      const res = await fetch("/api/frete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cep, items: lines.map((l) => ({ productId: l.productId, quantity: l.quantity })) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Não foi possível calcular o frete.");
      setOptions(data.options);
      if (!data.options.length) setQuoteError("Nenhuma transportadora atende esse CEP. Fale com a gente pelo WhatsApp.");
    } catch (err) {
      setQuoteError((err as Error).message);
    } finally {
      setQuoting(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormErrors([]);
    setErrors({});
    const pickup = serviceId === "retirada";
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: lines.map((l) => ({
            productId: l.productId,
            variantId: l.variantId,
            quantity: l.quantity,
            personalization: l.personalization,
          })),
          customer: { name: form.name, email: form.email, phone: form.phone, cpf: form.cpf },
          shippingServiceId: serviceId,
          address: pickup
            ? null
            : {
                cep: form.cep, street: form.street, number: form.number, complement: form.complement,
                district: form.district, city: form.city, state: form.state,
              },
          notes: form.notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors(data.fieldErrors ?? {});
        setFormErrors(data.errors ?? [data.error ?? "Não foi possível finalizar o pedido."]);
        setSubmitting(false);
        return;
      }
      useCart.getState().clear();
      window.location.href = data.redirectUrl;
    } catch {
      setFormErrors(["Falha de conexão. Tente novamente."]);
      setSubmitting(false);
    }
  }

  if (!hydrated) return <p className="mt-10 text-center text-ink">Carregando…</p>;
  if (!lines.length) {
    return (
      <p className="mt-12 text-center text-[17px] text-ink">
        Sua sacola está vazia.{" "}
        <Link href="/produtos" className="text-rose underline underline-offset-4">
          Ver produtos
        </Link>
      </p>
    );
  }

  const subtotal = cartSubtotal(lines);
  const allOptions: Option[] = [
    ...(pickupEnabled ? [{ serviceId: "retirada", name: "Retirada", price: 0, deliveryDays: null }] : []),
    ...options,
  ];
  const chosen = allOptions.find((o) => o.serviceId === serviceId);
  const pickup = serviceId === "retirada";

  return (
    <form onSubmit={submit} className="mt-10 grid gap-10 md:grid-cols-[1fr_380px]" noValidate>
      <div className="space-y-10">
        <section aria-labelledby="dados">
          <h2 id="dados" className="font-serif text-[26px] text-wine">Seus dados</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Field label="Nome completo" name="name" autoComplete="name" value={form.name} onChange={update("name")} error={errors.name} className="md:col-span-2" required />
            <Field label="E-mail" name="email" type="email" autoComplete="email" value={form.email} onChange={update("email")} error={errors.email} required />
            <Field label="WhatsApp" name="phone" type="tel" autoComplete="tel" placeholder="(11) 99999-9999" value={form.phone} onChange={update("phone")} error={errors.phone} required />
            <Field label="CPF" name="cpf" inputMode="numeric" placeholder="000.000.000-00" value={form.cpf} onChange={update("cpf")} error={errors.cpf} required />
          </div>
        </section>

        <section aria-labelledby="entrega">
          <h2 id="entrega" className="font-serif text-[26px] text-wine">Entrega</h2>
          <div className="mt-4 flex items-end gap-3">
            <Field label="CEP" name="cep" inputMode="numeric" autoComplete="postal-code" placeholder="00000-000" value={form.cep} onChange={update("cep")} error={errors.cep} className="w-44" />
            <SecondaryButton type="button" onClick={quote} disabled={quoting} className="mb-[2px] h-[50px]">
              {quoting ? "Calculando…" : "Calcular frete"}
            </SecondaryButton>
          </div>
          {quoteError && <p className="mt-2 text-[14px] text-rose-dark">{quoteError}</p>}

          {allOptions.length > 0 && (
            <fieldset className="mt-4 space-y-2">
              <legend className="sr-only">Forma de entrega</legend>
              {allOptions.map((o) => (
                <label
                  key={o.serviceId}
                  className={`flex cursor-pointer items-center justify-between gap-4 rounded-[12px] border bg-white px-4 py-3 ${
                    serviceId === o.serviceId ? "border-rose" : "border-line"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <input type="radio" name="shipping" value={o.serviceId} checked={serviceId === o.serviceId} onChange={() => setServiceId(o.serviceId)} className="accent-rose" />
                    <span>
                      <span className="block text-wine">{o.name}</span>
                      <span className="block text-[13px] text-ink">
                        {o.serviceId === "retirada"
                          ? pickupAddress || "Combinamos o local pelo WhatsApp"
                          : `Chega em até ${o.deliveryDays} dias úteis (já com o prazo de produção)`}
                      </span>
                    </span>
                  </span>
                  <span className="text-wine tabular-nums">{o.price === 0 ? "Grátis" : formatBRL(o.price)}</span>
                </label>
              ))}
            </fieldset>
          )}

          {serviceId && !pickup && (
            <div className="mt-6 grid gap-4 md:grid-cols-6">
              <Field label="Rua" name="street" autoComplete="address-line1" value={form.street} onChange={update("street")} error={errors.street} className="md:col-span-4" />
              <Field label="Número" name="number" value={form.number} onChange={update("number")} error={errors.number} className="md:col-span-2" />
              <Field label="Complemento" name="complement" autoComplete="address-line2" value={form.complement} onChange={update("complement")} className="md:col-span-3" />
              <Field label="Bairro" name="district" value={form.district} onChange={update("district")} error={errors.district} className="md:col-span-3" />
              <Field label="Cidade" name="city" autoComplete="address-level2" value={form.city} onChange={update("city")} error={errors.city} className="md:col-span-4" />
              <Field label="UF" name="state" autoComplete="address-level1" maxLength={2} value={form.state} onChange={update("state")} error={errors.state} className="md:col-span-2" />
            </div>
          )}
        </section>

        <section>
          <label htmlFor="notes" className="mb-1 block font-serif text-[22px] text-wine">
            Algum recado para a Mali? <span className="font-sans text-[14px] text-ink">(opcional)</span>
          </label>
          <textarea id="notes" rows={3} className={input} value={form.notes} onChange={update("notes")} maxLength={1000} />
        </section>
      </div>

      <aside className="h-fit rounded-[14px] bg-blush p-6 md:sticky md:top-6">
        <h2 className="font-serif text-[24px] text-wine">Resumo</h2>
        <ul className="mt-4 space-y-3 text-[15px]">
          {lines.map((l) => (
            <li key={l.key} className="flex justify-between gap-3">
              <span className="text-ink">
                {l.quantity}× {l.name}
                {l.variantName && <span className="block text-[13px]">{l.variantName}</span>}
              </span>
              <span className="text-wine tabular-nums">{formatBRL(l.unitPrice * l.quantity)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-2 border-t border-line pt-4 text-[15px]">
          <div className="flex justify-between">
            <dt className="text-ink">Subtotal</dt>
            <dd className="text-wine tabular-nums">{formatBRL(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink">Frete</dt>
            <dd className="text-wine tabular-nums">{chosen ? formatBRL(chosen.price) : "—"}</dd>
          </div>
          <div className="flex justify-between text-[18px]">
            <dt className="text-wine">Total</dt>
            <dd className="text-wine tabular-nums">{formatBRL(subtotal + (chosen?.price ?? 0))}</dd>
          </div>
        </dl>
        {formErrors.length > 0 && (
          <ul role="alert" className="mt-4 space-y-1 rounded-[10px] bg-white p-3 text-[14px] text-rose-dark">
            {formErrors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        )}
        <Button type="submit" className="mt-6 w-full" disabled={submitting || !serviceId}>
          {submitting ? "Abrindo pagamento…" : "Ir para o pagamento"} <span aria-hidden>→</span>
        </Button>
        <p className="mt-3 text-center text-[13px] text-ink">Pagamento seguro pelo Mercado Pago: Pix, cartão ou boleto.</p>
      </aside>
    </form>
  );
}
