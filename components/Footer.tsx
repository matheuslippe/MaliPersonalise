import Link from "next/link";
import type { Settings } from "@/lib/types";

const fmtCnpj = (v: string) => v.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");

export function Footer({ settings }: { settings: Settings }) {
  const { instagram, legalName, cnpj, address, contactEmail } = settings;
  const legal = [legalName, cnpj && `CNPJ ${fmtCnpj(cnpj)}`, address].filter(Boolean).join(" · ");
  return (
    <footer className="bg-petal">
      <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-center gap-3 px-4 py-6 text-center md:h-[78px] md:flex-row md:gap-6 md:py-0">
        {instagram && (
          <a
            href={`https://instagram.com/${instagram}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[18px] text-wine hover:text-rose md:w-[300px]"
          >
            <span aria-hidden>◎</span>&nbsp; @{instagram}
          </a>
        )}
        <span className="hidden h-[34px] w-px bg-line md:block" aria-hidden />
        <p className="text-[15px] text-ink md:w-[530px] md:text-[17px]">Papelaria personalizada para momentos únicos ♡</p>
      </div>
      <div className="border-t border-line/60">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-2 px-4 py-4 text-center text-[13px] text-ink md:flex-row md:justify-between md:text-left">
          <p>
            {legal || "Mali Personalizê"}
            {contactEmail && (
              <>
                {" · "}
                <a href={`mailto:${contactEmail}`} className="hover:text-rose">
                  {contactEmail}
                </a>
              </>
            )}
          </p>
          <nav aria-label="Políticas" className="flex gap-4">
            <Link href="/politicas/trocas" className="hover:text-rose">
              Trocas e devoluções
            </Link>
            <Link href="/politicas/privacidade" className="hover:text-rose">
              Privacidade
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
