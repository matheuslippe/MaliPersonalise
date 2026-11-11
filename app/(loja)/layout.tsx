import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PromoBar } from "@/components/PromoBar";
import { repo } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function StoreLayout({ children }: LayoutProps<"/">) {
  const settings = await repo().getSettings();
  return (
    <>
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-white focus:p-3">
        Pular para o conteúdo
      </a>
      <PromoBar message={settings.promoMessage} />
      <Header />
      <main id="conteudo" className="flex-1">
        {children}
      </main>
      <Footer instagram={settings.instagram} />
    </>
  );
}
