"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { cartSubtotal, useCart } from "@/lib/cart-store";
import { formatBRL } from "@/lib/money";
import { ButtonLink } from "./Button";
import { ProductImage } from "./ProductImage";

const subscribe = () => () => {};
export const useHydrated = () => useSyncExternalStore(subscribe, () => true, () => false);

export function CartView() {
  const { lines, setQuantity, remove } = useCart();
  const hydrated = useHydrated();

  if (!hydrated) return <p className="mt-10 text-center text-ink">Carregando sacola…</p>;

  if (lines.length === 0) {
    return (
      <div className="mt-12 text-center">
        <p className="text-[17px] text-ink">Sua sacola está vazia.</p>
        <ButtonLink href="/produtos" className="mt-6">
          Explorar produtos <span aria-hidden>→</span>
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="mt-10 grid gap-10 md:grid-cols-[1fr_360px]">
      <ul className="divide-y divide-line border-y border-line">
        {lines.map((l) => (
          <li key={l.key} className="flex gap-4 py-5">
            <Link href={`/produtos/${l.slug}`} className="shrink-0">
              <ProductImage src={l.image} alt={l.name} label=" " color={l.placeholderColor} className="size-24 md:size-28" sizes="112px" />
            </Link>
            <div className="min-w-0 flex-1">
              <Link href={`/produtos/${l.slug}`} className="font-serif text-[20px] text-wine hover:text-rose">
                {l.name}
              </Link>
              {l.variantName && <p className="text-[14px] text-ink">{l.variantName}</p>}
              {l.summary.length > 0 && (
                <dl className="mt-1 text-[14px] text-ink">
                  {l.summary.map((s) => (
                    <div key={s.label} className="flex gap-1">
                      <dt className="shrink-0">{s.label}:</dt>
                      <dd className="truncate text-wine">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
              <div className="mt-3 flex items-center gap-4">
                <div className="flex items-center rounded-full border border-line bg-white">
                  <button
                    type="button"
                    className="size-9 text-wine disabled:opacity-40"
                    onClick={() => setQuantity(l.key, l.quantity - 1)}
                    disabled={l.quantity <= 1}
                    aria-label={`Diminuir quantidade de ${l.name}`}
                  >
                    −
                  </button>
                  <span className="w-8 text-center tabular-nums" aria-live="polite">
                    {l.quantity}
                  </span>
                  <button
                    type="button"
                    className="size-9 text-wine"
                    onClick={() => setQuantity(l.key, l.quantity + 1)}
                    aria-label={`Aumentar quantidade de ${l.name}`}
                  >
                    +
                  </button>
                </div>
                <button type="button" onClick={() => remove(l.key)} className="text-[14px] text-ink underline underline-offset-4 hover:text-rose">
                  Remover
                </button>
              </div>
            </div>
            <p className="text-[16px] text-wine tabular-nums">{formatBRL(l.unitPrice * l.quantity)}</p>
          </li>
        ))}
      </ul>
      <aside className="h-fit rounded-[14px] bg-blush p-6">
        <div className="flex justify-between text-[17px] text-wine">
          <span>Subtotal</span>
          <span className="tabular-nums">{formatBRL(cartSubtotal(lines))}</span>
        </div>
        <p className="mt-1 text-[14px] text-ink">Frete calculado na próxima etapa.</p>
        <ButtonLink href="/checkout" className="mt-6 w-full">
          Finalizar compra <span aria-hidden>→</span>
        </ButtonLink>
        <Link href="/produtos" className="mt-4 block text-center text-[15px] text-ink hover:text-rose">
          Continuar comprando
        </Link>
      </aside>
    </div>
  );
}
