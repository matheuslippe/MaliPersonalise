import Link from "next/link";
import type { Category } from "@/lib/types";
import { ButtonLink } from "./Button";
import { Logo } from "./Logo";
import { ProductImage } from "./ProductImage";

export function whatsappLink(number: string, text = "Oi, Mali! Vim pelo site e gostaria de fazer um pedido ♡") {
  return number ? `https://wa.me/${number}?text=${encodeURIComponent(text)}` : "/contato";
}

export function Hero({ heroImage }: { heroImage?: string | null }) {
  return (
    <section className="bg-sand">
      <div className="mx-auto grid max-w-[1440px] gap-8 px-4 py-10 md:grid-cols-[1fr_690px] md:items-center md:gap-7 md:py-[25px] md:pl-[82px] md:pr-[50px]">
        <div className="md:pb-[60px] md:pt-[63px]">
          <h1 className="font-serif text-[40px] leading-[1.15] text-wine md:text-[60px]">
            Pequenos
            <br />
            detalhes,
            <br />
            grandes memórias.
          </h1>
          <p className="mt-5 max-w-[570px] text-[19px] leading-snug text-ink md:mt-[30px] md:text-[25px]">
            Papelaria e presentes personalizados para deixar cada momento com a sua cara.
          </p>
          <ButtonLink href="/produtos" size="lg" className="mt-8 md:mt-[37px]">
            Explorar produtos <span aria-hidden>→</span>
          </ButtonLink>
        </div>
        <ProductImage
          src={heroImage}
          alt="Agenda rosa e itens de papelaria personalizados"
          label="Foto principal · agenda rosa + papelaria"
          color="#f0d4d1"
          className="aspect-[690/570] w-full"
          sizes="(min-width: 768px) 690px, 100vw"
          priority
        />
      </div>
    </section>
  );
}

export function CategoryStrip({ categories }: { categories: Category[] }) {
  return (
    <nav aria-label="Categorias" className="bg-blush">
      <ul className="mx-auto grid max-w-[1440px] grid-cols-2 md:h-[100px] md:grid-cols-4 md:px-[40px]">
        {categories.map((c, i) => (
          <li
            key={c.id}
            className={`flex items-center ${i > 0 ? "md:border-l md:border-line" : ""} md:my-[22px]`}
          >
            <Link
              href={`/produtos?categoria=${c.slug}`}
              className="flex w-full items-center gap-3 px-4 py-4 text-[16px] text-wine hover:text-rose md:px-[25px] md:py-0 md:text-[19px]"
            >
              <span aria-hidden className="w-[34px] text-center font-serif text-[30px] leading-none text-rose md:text-[36px]">
                {c.icon}
              </span>
              {c.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

const FEATURED = [
  { title: "Bottons personalizados", label: "Personalizados · bottons", color: "#e0cfe8", slug: "bottons" },
  { title: "Agendas e planners", label: "Agenda rosa floral", color: "#e8b8b2", slug: "agendas-e-planners" },
  { title: "Lembrancinhas", label: "Presente com laço", color: "#f7d6d1", slug: "lembrancinhas" },
  { title: "Tags e cartões", label: "Tag floral", color: "#f0d9cc", slug: "papelaria-personalizada" },
];

export function SectionTitle({ children, as: As = "h2" }: { children: React.ReactNode; as?: "h1" | "h2" }) {
  return (
    <div className="text-center">
      <As className="font-serif text-[32px] text-wine md:text-[42px]">{children}</As>
      <p aria-hidden className="text-[20px] leading-none text-rose">
        ♥
      </p>
    </div>
  );
}

export function FeaturedCategories({ images }: { images?: Record<string, string | null> }) {
  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-[1440px] px-4 pb-10 pt-7 md:px-[34px]">
        <SectionTitle>Feitos para encantar</SectionTitle>
        <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4 md:gap-7">
          {FEATURED.map((f) => (
            <li key={f.slug + f.title}>
              <Link href={`/produtos?categoria=${f.slug}`} className="group block">
                <ProductImage
                  src={images?.[f.slug]}
                  alt={f.title}
                  label={f.label}
                  color={f.color}
                  className="aspect-[322/300] w-full transition-transform duration-300 group-hover:-translate-y-1"
                />
                <h3 className="mt-[10px] px-2 font-serif text-[18px] text-wine md:text-[21px]">{f.title}</h3>
                <p className="mt-2 px-2 text-[14px] text-ink group-hover:text-rose md:text-[16px]">
                  Personalize do seu jeito&nbsp; <span aria-hidden>→</span>
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const STEPS = [
  { icon: "♧", title: "Escolha seu produto", text: "Veja nossas opções e encontre o que combina com você." },
  { icon: "✎", title: "Conte sua ideia", text: "Nos diga como gostaria de personalizar. Vamos juntas deixar tudo do seu jeitinho!" },
  { icon: "♧", title: "Receba com carinho", text: "Produzimos com todo cuidado e enviamos para você viver essa experiência especial." },
];

export function HowToOrder() {
  return (
    <section className="px-[14px]">
      <div className="mx-auto grid max-w-[1412px] gap-8 rounded-[16px] bg-blush px-6 py-10 md:min-h-[300px] md:grid-cols-[448px_1fr] md:gap-0 md:py-0 md:pl-[52px] md:pr-[40px]">
        <div className="md:my-[48px] md:border-r md:border-line md:pr-6">
          <h2 className="font-serif text-[32px] leading-tight text-wine md:text-[40px]">
            Sua ideia vira
            <br />
            um presente especial.
          </h2>
          <p className="mt-5 text-[17px] text-ink md:mt-[26px] md:text-[20px]">
            Do seu jeitinho, para momentos que realmente importam.
          </p>
        </div>
        <ol className="grid gap-8 md:grid-cols-3 md:gap-[55px] md:py-[30px] md:pl-[40px]">
          {STEPS.map((s, i) => (
            <li key={s.title} className="flex flex-col items-center text-center">
              <span className="relative flex size-[82px] items-center justify-center rounded-full bg-white font-serif text-[32px] text-rose">
                <span aria-hidden>{s.icon}</span>
                <span className="absolute -bottom-[29px] left-1/2 flex size-[28px] -translate-x-1/2 items-center justify-center rounded-full bg-rose font-sans text-[15px] text-white">
                  {i + 1}
                </span>
              </span>
              <h3 className="mt-[39px] font-serif text-[19px] text-wine">{s.title}</h3>
              <p className="mt-3 max-w-[230px] text-[14px] text-ink">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function ContactCta({ whatsapp, image }: { whatsapp: string; image?: string | null }) {
  return (
    <section className="bg-shell">
      <div className="mx-auto grid max-w-[1440px] items-center gap-6 md:min-h-[230px] md:grid-cols-[300px_1fr_250px] md:gap-[30px] md:pr-[60px]">
        <ProductImage
          src={image}
          alt="Foto decorativa"
          label="Foto decorativa · coração"
          color="#f2d6cc"
          className="hidden h-[230px] md:block"
          sizes="300px"
        />
        <div className="px-4 py-10 text-center md:px-0 md:py-[30px]">
          <h2 className="font-serif text-[32px] text-wine md:text-[42px]">Vamos criar algo lindo?</h2>
          <p className="mx-auto mt-2 max-w-[520px] text-[16px] text-ink md:text-[17px]">
            Tire suas dúvidas, faça seu pedido ou conte sua ideia. Estou aqui para te ajudar! ♡
          </p>
          <a
            href={whatsappLink(whatsapp)}
            target={whatsapp ? "_blank" : undefined}
            rel="noopener noreferrer"
            className="mt-6 inline-flex h-[52px] w-full max-w-[370px] items-center justify-center gap-3 rounded-[24px] bg-rose text-[18px] text-white transition-colors hover:bg-rose-dark md:text-[20px]"
          >
            <span aria-hidden>◉</span> Fale com a Mali <span aria-hidden>→</span>
          </a>
        </div>
        <div className="hidden justify-center md:flex">
          <Logo size="lg" href={null} />
        </div>
      </div>
    </section>
  );
}
