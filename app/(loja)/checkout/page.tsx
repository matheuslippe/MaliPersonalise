import type { Metadata } from "next";
import { CheckoutForm } from "@/components/CheckoutForm";
import { SectionTitle } from "@/components/Landing";
import { repo } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Finalizar compra", robots: { index: false } };

export default async function CheckoutPage() {
  const settings = await repo().getSettings();
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-10 md:py-14">
      <SectionTitle as="h1">Finalizar compra</SectionTitle>
      <CheckoutForm pickupEnabled={settings.pickupEnabled} pickupAddress={settings.pickupAddress} />
    </div>
  );
}
