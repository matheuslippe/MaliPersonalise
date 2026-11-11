import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { hasMelhorEnvio, hasMercadoPago, hasSupabase } from "@/lib/env";
import { logoutAction } from "../actions";

export const dynamic = "force-dynamic";

const NAV = [
  { href: "/admin/pedidos", label: "Pedidos" },
  { href: "/admin/produtos", label: "Produtos" },
  { href: "/admin/configuracoes", label: "Configurações" },
];

export default async function PanelLayout({ children }: LayoutProps<"/admin">) {
  const email = await requireAdmin();
  const missing = [
    !hasSupabase && "Supabase (usando arquivo local)",
    !hasMercadoPago && "Mercado Pago (pagamento simulado)",
    !hasMelhorEnvio && "Melhor Envio (frete simulado)",
  ].filter(Boolean);

  return (
    <>
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-x-8 gap-y-2 px-4 py-4">
          <Link href="/admin/pedidos" className="font-serif text-[28px] italic text-wine">
            Mali <span className="font-sans text-[13px] not-italic text-ink">painel</span>
          </Link>
          <nav aria-label="Painel" className="flex gap-5 text-[16px]">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="text-ink hover:text-rose">
                {n.label}
              </Link>
            ))}
            <Link href="/" className="text-ink hover:text-rose" target="_blank">
              Ver loja ↗
            </Link>
          </nav>
          <form action={logoutAction} className="ml-auto flex items-center gap-3 text-[14px] text-ink">
            <span className="hidden md:inline">{email}</span>
            <button className="underline underline-offset-4 hover:text-rose">Sair</button>
          </form>
        </div>
      </header>
      {missing.length > 0 && (
        <p className="bg-blush px-4 py-2 text-center text-[14px] text-wine">
          Modo de desenvolvimento. Falta configurar: {missing.join(" · ")}
        </p>
      )}
      <div className="mx-auto max-w-[1200px] px-4 py-8">{children}</div>
    </>
  );
}
