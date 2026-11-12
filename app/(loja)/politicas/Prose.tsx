export function Prose({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <article className="mx-auto max-w-[760px] px-4 py-10 md:py-14">
      <h1 className="text-center font-serif text-[34px] text-wine md:text-[42px]">{title}</h1>
      <p className="mt-2 text-center text-[14px] text-ink">Atualizado em {updated}</p>
      <div className="mt-10 space-y-4 text-[16px] leading-relaxed text-ink [&_a]:text-rose [&_a]:underline [&_a]:underline-offset-4 [&_h2]:mt-10 [&_h2]:font-serif [&_h2]:text-[24px] [&_h2]:text-wine [&_li]:ml-5 [&_li]:list-disc [&_strong]:font-medium [&_strong]:text-wine">
        {children}
      </div>
    </article>
  );
}

export function contactLine(settings: { contactEmail: string; whatsapp: string }) {
  const parts = [];
  if (settings.contactEmail) parts.push(`pelo e-mail ${settings.contactEmail}`);
  if (settings.whatsapp) parts.push("pelo WhatsApp informado no site");
  return parts.length ? parts.join(" ou ") : "pelos canais de contato do site";
}
