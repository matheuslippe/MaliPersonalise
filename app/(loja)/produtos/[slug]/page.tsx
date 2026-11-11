import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { repo } from "@/lib/db";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductForm } from "@/components/ProductForm";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/produtos/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await repo().getProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.description.slice(0, 160),
    openGraph: { images: product.images[0] ? [product.images[0].url] : [] },
  };
}

export default async function ProductPage({ params }: PageProps<"/produtos/[slug]">) {
  const { slug } = await params;
  const db = repo();
  const product = await db.getProductBySlug(slug);
  if (!product || !product.active) notFound();
  const category = (await db.listCategories()).find((c) => c.id === product.categoryId);

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 md:px-[72px] md:py-12">
      <nav aria-label="Você está em" className="text-[14px] text-ink">
        <Link href="/produtos" className="hover:text-rose">
          Produtos
        </Link>
        {category && (
          <>
            {" "}
            /{" "}
            <Link href={`/produtos?categoria=${category.slug}`} className="hover:text-rose">
              {category.name}
            </Link>
          </>
        )}
      </nav>
      <div className="mt-6 grid gap-10 md:grid-cols-2 md:gap-16">
        <ProductGallery images={product.images} name={product.name} color={product.placeholderColor} />
        <div>
          <h1 className="font-serif text-[34px] leading-tight text-wine md:text-[44px]">{product.name}</h1>
          <p className="mt-4 whitespace-pre-line text-[16px] leading-relaxed text-ink md:text-[17px]">{product.description}</p>
          <p className="mt-3 text-[14px] text-ink">
            Produção em até {product.productionDays} dias úteis após a confirmação do pagamento.
          </p>
          <ProductForm
            product={{
              id: product.id,
              slug: product.slug,
              name: product.name,
              basePrice: product.basePrice,
              variants: product.variants,
              fields: product.fields,
              placeholderColor: product.placeholderColor,
              image: product.images[0]?.url ?? null,
            }}
          />
        </div>
      </div>
    </div>
  );
}
