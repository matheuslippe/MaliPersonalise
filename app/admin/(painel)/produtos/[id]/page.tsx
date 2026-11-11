import { notFound } from "next/navigation";
import { repo } from "@/lib/db";
import { ProductEditor } from "@/components/admin/ProductEditor";
import { deleteProductAction } from "../../../actions";

export const metadata = { title: "Editar produto" };

export default async function EditProduct({ params }: PageProps<"/admin/produtos/[id]">) {
  const { id } = await params;
  const db = repo();
  const [product, categories] = await Promise.all([db.getProductById(id), db.listCategories()]);
  if (!product) notFound();
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-[34px] text-wine">{product.name}</h1>
        <form action={deleteProductAction}>
          <input type="hidden" name="id" value={product.id} />
          <button className="text-[14px] text-ink underline underline-offset-4 hover:text-rose-dark">
            Excluir produto
          </button>
        </form>
      </div>
      <p className="text-[14px] text-ink">Dica: para tirar da loja sem perder o histórico, desmarque &quot;Visível na loja&quot;.</p>
      <ProductEditor categories={categories} product={product} />
    </div>
  );
}
