import type { Metadata } from "next";
import { HowToOrder, SectionTitle } from "@/components/Landing";
import { ButtonLink } from "@/components/Button";

export const metadata: Metadata = { title: "Como encomendar" };

const FAQ = [
  { q: "Como envio minha arte ou foto?", a: "Na página do produto há um campo para enviar o arquivo (PNG, JPG, WEBP ou PDF, até 10 MB). Se preferir, descreva sua ideia nas observações e ajustamos juntas pelo WhatsApp." },
  { q: "Quais as formas de pagamento?", a: "Pix, cartão de crédito (com parcelamento) e boleto, tudo pelo ambiente seguro do Mercado Pago." },
  { q: "Qual o prazo?", a: "Cada produto mostra o prazo de produção. O prazo de entrega exibido no frete já soma a produção e o transporte." },
  { q: "Posso trocar ou cancelar?", a: "Como os produtos são personalizados, não aceitamos troca por arrependimento depois que a produção começa. Se houver qualquer defeito, resolvemos com você." },
];

export default function HowToOrderPage() {
  return (
    <div className="py-10 md:py-14">
      <div className="px-4">
        <SectionTitle as="h1">Como encomendar</SectionTitle>
      </div>
      <div className="mt-10">
        <HowToOrder />
      </div>
      <section className="mx-auto mt-14 max-w-[860px] px-4" aria-labelledby="duvidas">
        <h2 id="duvidas" className="font-serif text-[30px] text-wine">Dúvidas frequentes</h2>
        <div className="mt-4 divide-y divide-line border-y border-line">
          {FAQ.map((f) => (
            <details key={f.q} className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between text-[17px] text-wine">
                {f.q}
                <span aria-hidden className="text-rose transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-2 text-[16px] text-ink">{f.a}</p>
            </details>
          ))}
        </div>
        <div className="mt-10 text-center">
          <ButtonLink href="/produtos">
            Explorar produtos <span aria-hidden>→</span>
          </ButtonLink>
        </div>
      </section>
    </div>
  );
}
