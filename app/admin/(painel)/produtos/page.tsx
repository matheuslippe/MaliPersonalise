import Link from "next/link";
import { repo } from "@/lib/db";
import { formatBRL } from "@/lib/money";
import { ProductImage } from "@/components/ProductImage";

export const metadata = { title: "Produtos" };

export default async function AdminProducts() {
  const db = repo();
  const [products, categories] = await Promise.all([db.listProducts({ includeInactive: true }), db.listCategories()]);
  const catName = new Map(categories.map((c) => [c.id, c.name]));
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-[34px] text-wine">Produtos</h1>
        <Link href="/admin/produtos/novo" className="inline-flex h-11 items-center rounded-full bg-rose px-6 text-white hover:bg-rose-dark">
          Novo produto
        </Link>
      </div>
      <ul className="mt-6 divide-y divide-line rounded-[14px] border border-line bg-white">
        {products.map((p) => (
          <li key={p.id}>
            <Link href={`/admin/produtos/${p.id}`} className="flex items-center gap-4 p-4 hover:bg-cream">
              <ProductImage src={p.images[0]?.url} alt={p.name} label=" " color={p.placeholderColor} className="size-14 shrink-0 rounded-[10px]" sizes="56px" />
              <div className="min-w-0 flex-1">
                <p className="text-wine">{p.name}</p>
                <p className="text-[14px] text-ink">
                  {catName.get(p.categoryId) ?? "Sem categoria"} · {p.variants.length || 1} opç{(p.variants.length || 1) > 1 ? "ões" : "ão"} · {p.fields.length} campos
                </p>
              </div>
              {!p.active && <span className="rounded-full border border-line px-3 py-0.5 text-[13px] text-ink">Oculto</span>}
              <span className="text-wine tabular-nums">{formatBRL(p.basePrice)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
