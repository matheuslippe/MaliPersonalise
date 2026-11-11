import type { Metadata } from "next";
import Link from "next/link";
import { repo } from "@/lib/db";
import { formatBRL } from "@/lib/money";
import { ProductImage } from "@/components/ProductImage";
import { SectionTitle } from "@/components/Landing";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Produtos" };

export default async function ProductsPage({ searchParams }: PageProps<"/produtos">) {
  const { categoria } = await searchParams;
  const db = repo();
  const [categories, products] = await Promise.all([db.listCategories(), db.listProducts()]);
  const current = categories.find((c) => c.slug === categoria);
  const list = current ? products.filter((p) => p.categoryId === current.id) : products;

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-10 md:px-[34px] md:py-14">
      <SectionTitle as="h1">{current?.name ?? "Nossos produtos"}</SectionTitle>

      <nav aria-label="Filtrar por categoria" className="mt-8">
        <ul className="flex flex-wrap justify-center gap-2">
          {[{ slug: undefined, name: "Todos" }, ...categories].map((c) => {
            const active = c.slug === current?.slug;
            return (
              <li key={c.slug ?? "todos"}>
                <Link
                  href={c.slug ? `/produtos?categoria=${c.slug}` : "/produtos"}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex h-10 items-center rounded-full border px-5 text-[15px] transition-colors ${
                    active ? "border-rose bg-rose text-white" : "border-line bg-white text-wine hover:border-rose hover:text-rose"
                  }`}
                >
                  {c.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {list.length === 0 ? (
        <p className="mt-16 text-center text-[17px] text-ink">
          Ainda não temos produtos nessa categoria. Fale com a gente pelo WhatsApp que criamos algo sob medida ♡
        </p>
      ) : (
        <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-7">
          {list.map((p) => (
            <li key={p.id}>
              <Link href={`/produtos/${p.slug}`} className="group block">
                <ProductImage
                  src={p.images[0]?.url}
                  alt={p.images[0]?.alt || p.name}
                  label={p.name}
                  color={p.placeholderColor}
                  className="aspect-[322/300] w-full transition-transform duration-300 group-hover:-translate-y-1"
                />
                <h2 className="mt-[10px] px-2 font-serif text-[18px] text-wine md:text-[21px]">{p.name}</h2>
                <p className="mt-1 px-2 text-[15px] text-ink tabular-nums md:text-[16px]">
                  {p.variants.length > 1 ? "a partir de " : ""}
                  {formatBRL(p.basePrice + Math.min(0, ...p.variants.map((v) => v.priceDelta)))}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
