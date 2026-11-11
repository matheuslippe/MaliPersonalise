import type { Metadata } from "next";
import { repo } from "@/lib/db";
import { ContactCta, SectionTitle } from "@/components/Landing";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Contato" };

export default async function ContactPage() {
  const settings = await repo().getSettings();
  return (
    <div className="pt-10 md:pt-14">
      <div className="px-4">
        <SectionTitle as="h1">Contato</SectionTitle>
        <p className="mx-auto mt-6 max-w-[560px] text-center text-[17px] text-ink">
          Quer um orçamento sob medida, tem uma ideia diferente ou precisa de ajuda com um pedido? Chama a gente no WhatsApp
          {settings.instagram && (
            <>
              {" "}ou no Instagram{" "}
              <a href={`https://instagram.com/${settings.instagram}`} className="text-rose underline underline-offset-4" target="_blank" rel="noopener noreferrer">
                @{settings.instagram}
              </a>
            </>
          )}
          .
        </p>
      </div>
      <div className="mt-10">
        <ContactCta whatsapp={settings.whatsapp} />
      </div>
    </div>
  );
}
