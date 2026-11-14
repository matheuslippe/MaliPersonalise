import { requireAdmin } from "@/lib/auth";
import { headers } from "next/headers";
import { repo } from "@/lib/db";
import { clientIp } from "@/lib/rate-limit";
import { SettingsForm } from "./SettingsForm";

export const metadata = { title: "Configurações" };

export default async function SettingsPage() {
  await requireAdmin(); // cada página confere o login: o layout sozinho não protege
  const settings = await repo().getSettings();
  const h = await headers();
  return (
    <div className="max-w-[640px]">
      <h1 className="font-serif text-[34px] text-wine">Configurações</h1>
      <SettingsForm settings={settings} />
      <section className="mt-6 rounded-[14px] border border-line bg-white p-6 text-[14px] text-ink">
        <h2 className="font-serif text-[20px] text-wine">Diagnóstico de segurança</h2>
        <p className="mt-2">
          O site enxerga o seu IP como <strong className="font-medium text-wine tabular-nums">{clientIp(h)}</strong>.
        </p>
        <p className="mt-1">
          Compare com o IP mostrado em um site como &quot;meu ip&quot;. Se for diferente, os limites contra abuso estão
          contando o IP errado: ajuste a variável <code>TRUSTED_PROXY_HOPS</code> na hospedagem (2, 3…) até bater.
        </p>
        <p className="mt-1 break-all text-[12px]">X-Forwarded-For recebido: {h.get("x-forwarded-for") ?? "(vazio)"}</p>
      </section>
    </div>
  );
}
