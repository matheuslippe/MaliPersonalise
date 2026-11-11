import type { Metadata } from "next";
import { CartView } from "@/components/CartView";
import { SectionTitle } from "@/components/Landing";

export const metadata: Metadata = { title: "Sacola", robots: { index: false } };

export default function CartPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-10 md:py-14">
      <SectionTitle as="h1">Sua sacola</SectionTitle>
      <CartView />
    </div>
  );
}
