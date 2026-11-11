import { repo } from "@/lib/db";
import { ProductEditor } from "@/components/admin/ProductEditor";

export const metadata = { title: "Novo produto" };

export default async function NewProduct() {
  const categories = await repo().listCategories();
  return (
    <div>
      <h1 className="font-serif text-[34px] text-wine">Novo produto</h1>
      <ProductEditor categories={categories} />
    </div>
  );
}
