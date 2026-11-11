"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { cartCount, useCart } from "@/lib/cart-store";

const subscribe = () => () => {};

export function CartButton() {
  const lines = useCart((s) => s.lines);
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false);
  const count = hydrated ? cartCount(lines) : 0;
  return (
    <Link
      href="/carrinho"
      className="relative flex size-12 items-center justify-center font-serif text-[42px] leading-none text-wine"
      aria-label={count ? `Sacola com ${count} ${count === 1 ? "item" : "itens"}` : "Sacola vazia"}
    >
      <span aria-hidden>♧</span>
      {count > 0 && (
        <span className="absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-full bg-rose px-1 font-sans text-[12px] leading-5 text-white tabular-nums">
          {count}
        </span>
      )}
    </Link>
  );
}
