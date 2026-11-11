"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartLine {
  key: string; // produto + variação + personalização
  productId: string;
  slug: string;
  name: string;
  variantId: string | null;
  variantName: string | null;
  unitPrice: number; // só para exibição; o servidor recalcula
  quantity: number;
  personalization: Record<string, string>;
  summary: { label: string; value: string }[]; // texto legível da personalização
  placeholderColor: string;
  image: string | null;
}

interface CartState {
  lines: CartLine[];
  add: (line: Omit<CartLine, "key">) => void;
  setQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
}

export function lineKey(l: Pick<CartLine, "productId" | "variantId" | "personalization">) {
  const p = Object.keys(l.personalization)
    .sort()
    .map((k) => `${k}=${l.personalization[k]}`)
    .join("&");
  return `${l.productId}|${l.variantId ?? ""}|${p}`;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      add: (line) =>
        set((s) => {
          const key = lineKey(line);
          const existing = s.lines.find((l) => l.key === key);
          if (existing) {
            return {
              lines: s.lines.map((l) =>
                l.key === key ? { ...l, quantity: Math.min(99, l.quantity + line.quantity) } : l,
              ),
            };
          }
          return { lines: [...s.lines, { ...line, key }] };
        }),
      setQuantity: (key, quantity) =>
        set((s) => ({
          lines: s.lines.map((l) => (l.key === key ? { ...l, quantity: Math.max(1, Math.min(99, quantity)) } : l)),
        })),
      remove: (key) => set((s) => ({ lines: s.lines.filter((l) => l.key !== key) })),
      clear: () => set({ lines: [] }),
    }),
    { name: "mali-cart", version: 1 },
  ),
);

export const cartCount = (lines: CartLine[]) => lines.reduce((n, l) => n + l.quantity, 0);
export const cartSubtotal = (lines: CartLine[]) => lines.reduce((n, l) => n + l.unitPrice * l.quantity, 0);
