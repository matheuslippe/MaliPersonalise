import { ButtonLink } from "@/components/Button";

export default function NotFound() {
  return (
    <div className="px-4 py-24 text-center">
      <h1 className="font-serif text-[40px] text-wine">Página não encontrada</h1>
      <p className="mt-3 text-ink">Esse link não existe mais ou foi digitado errado.</p>
      <ButtonLink href="/produtos" className="mt-8">
        Ver produtos <span aria-hidden>→</span>
      </ButtonLink>
    </div>
  );
}
