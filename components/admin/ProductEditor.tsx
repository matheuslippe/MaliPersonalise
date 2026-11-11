"use client";

import { useState, useTransition } from "react";
import type { Category, FieldType, PersonalizationField, Product, ProductVariant } from "@/lib/types";
import { formatBRL, parseBRL } from "@/lib/money";
import { saveProductAction } from "@/app/admin/actions";
import { ProductImage } from "@/components/ProductImage";

const input = "mt-1 w-full rounded-[10px] border border-line bg-white px-3 py-2 text-[15px] text-wine focus:border-rose focus:outline-none";
const card = "rounded-[14px] border border-line bg-white p-5";
const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: "text", label: "Texto curto" },
  { value: "textarea", label: "Texto longo" },
  { value: "select", label: "Lista de opções" },
  { value: "color", label: "Cor" },
  { value: "file", label: "Upload de arquivo" },
];

const newId = () => Math.random().toString(36).slice(2, 10);
const toReais = (cents: number) => (cents / 100).toFixed(2).replace(".", ",");

type Draft = Omit<Product, "id" | "createdAt" | "slug"> & { id?: string; slug: string };

const empty = (categoryId: string): Draft => ({
  categoryId,
  name: "",
  slug: "",
  description: "",
  basePrice: 0,
  active: true,
  featured: false,
  weightG: 200,
  heightCm: 3,
  widthCm: 16,
  lengthCm: 22,
  productionDays: 5,
  placeholderColor: "#f0d4d1",
  images: [],
  variants: [],
  fields: [],
});

export function ProductEditor({ categories, product }: { categories: Category[]; product?: Product }) {
  const [p, setP] = useState<Draft>(product ?? empty(categories[0]?.id ?? ""));
  const [price, setPrice] = useState(toReais(p.basePrice));
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [pending, start] = useTransition();

  const patch = (v: Partial<Draft>) => setP((cur) => ({ ...cur, ...v }));
  const num = (v: string) => (v === "" ? 0 : Number(v.replace(",", ".")));

  const setVariant = (i: number, v: Partial<ProductVariant>) =>
    patch({ variants: p.variants.map((x, j) => (j === i ? { ...x, ...v } : x)) });
  const setField = (i: number, v: Partial<PersonalizationField>) =>
    patch({ fields: p.fields.map((x, j) => (j === i ? { ...x, ...v } : x)) });

  async function uploadImages(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setError("");
    try {
      const uploaded: { url: string; alt: string }[] = [];
      for (const file of Array.from(files)) {
        const body = new FormData();
        body.append("file", file);
        const res = await fetch("/api/admin/product-image", { method: "POST", body });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        uploaded.push({ url: data.url as string, alt: p.name });
      }
      setP((cur) => ({ ...cur, images: [...cur.images, ...uploaded].slice(0, 10) }));
    } catch (err) {
      setError((err as Error).message || "Falha no upload");
    } finally {
      setUploading(false);
    }
  }

  function save() {
    setError("");
    let basePrice: number;
    try {
      basePrice = parseBRL(price);
    } catch {
      setError("Preço inválido");
      return;
    }
    start(async () => {
      const res = await saveProductAction(JSON.stringify({ ...p, basePrice }));
      if (res?.error) setError(res.error);
    });
  }

  return (
    <form
      className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]"
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <div className="space-y-6">
        <section className={card}>
          <label className="block text-[14px] text-ink">
            Nome
            <input className={input} value={p.name} onChange={(e) => patch({ name: e.target.value })} required />
          </label>
          <label className="mt-4 block text-[14px] text-ink">
            Descrição
            <textarea className={input} rows={5} value={p.description} onChange={(e) => patch({ description: e.target.value })} />
          </label>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <label className="block text-[14px] text-ink">
              Categoria
              <select className={input} value={p.categoryId} onChange={(e) => patch({ categoryId: e.target.value })}>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </label>
            <label className="block text-[14px] text-ink">
              Preço base (R$)
              <input className={input} inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} />
            </label>
            <label className="block text-[14px] text-ink">
              Prazo de produção (dias úteis)
              <input className={input} type="number" min={0} value={p.productionDays} onChange={(e) => patch({ productionDays: num(e.target.value) })} />
            </label>
          </div>
        </section>

        <section className={card}>
          <h2 className="font-serif text-[22px] text-wine">Fotos</h2>
          <ul className="mt-3 flex flex-wrap gap-3">
            {p.images.map((img, i) => (
              <li key={img.url} className="relative">
                <ProductImage src={img.url} alt={img.alt} color={p.placeholderColor} className="size-24 rounded-[10px]" sizes="96px" />
                <div className="mt-1 flex justify-between text-[12px]">
                  <button type="button" disabled={i === 0} className="text-ink disabled:opacity-30" onClick={() => {
                    const imgs = [...p.images];
                    [imgs[i - 1], imgs[i]] = [imgs[i], imgs[i - 1]];
                    patch({ images: imgs });
                  }} aria-label="Mover para a esquerda">←</button>
                  <button type="button" className="text-rose-dark" onClick={() => patch({ images: p.images.filter((_, j) => j !== i) })}>
                    remover
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <label className="mt-3 inline-flex cursor-pointer items-center rounded-full border border-line px-5 py-2 text-[15px] text-wine hover:border-rose">
            {uploading ? "Enviando…" : "Adicionar fotos"}
            <input type="file" accept="image/png,image/jpeg,image/webp" multiple className="sr-only" onChange={(e) => uploadImages(e.target.files)} disabled={uploading} />
          </label>
          <p className="mt-2 text-[13px] text-ink">A primeira foto é a capa. PNG, JPG ou WEBP até 4 MB (de preferência quadradas, 1200 × 1200 px).</p>
          <label className="mt-4 flex items-center gap-3 text-[14px] text-ink">
            Cor de fundo quando não há foto
            <input type="color" value={p.placeholderColor} onChange={(e) => patch({ placeholderColor: e.target.value })} />
          </label>
        </section>

        <section className={card}>
          <h2 className="font-serif text-[22px] text-wine">Opções (tamanho, kit, acabamento)</h2>
          <p className="text-[13px] text-ink">Deixe vazio se o produto tem uma única opção. O acréscimo é somado ao preço base.</p>
          <ul className="mt-3 space-y-2">
            {p.variants.map((v, i) => (
              <li key={v.id} className="flex flex-wrap items-end gap-3">
                <label className="flex-1 text-[14px] text-ink">
                  Nome
                  <input className={input} value={v.name} onChange={(e) => setVariant(i, { name: e.target.value })} />
                </label>
                <label className="w-36 text-[14px] text-ink">
                  Acréscimo (R$)
                  <input
                    className={input}
                    inputMode="decimal"
                    defaultValue={toReais(v.priceDelta)}
                    onBlur={(e) => {
                      try {
                        setVariant(i, { priceDelta: parseBRL(e.target.value || "0") });
                      } catch {
                        setError("Acréscimo inválido");
                      }
                    }}
                  />
                </label>
                <span className="pb-2 text-[13px] text-ink tabular-nums">{(() => { try { return formatBRL(parseBRL(price) + v.priceDelta); } catch { return ""; } })()}</span>
                <button type="button" className="pb-2 text-[13px] text-rose-dark" onClick={() => patch({ variants: p.variants.filter((_, j) => j !== i) })}>
                  remover
                </button>
              </li>
            ))}
          </ul>
          <button type="button" className="mt-3 text-[15px] text-rose underline underline-offset-4" onClick={() => patch({ variants: [...p.variants, { id: newId(), name: "", priceDelta: 0 }] })}>
            + Adicionar opção
          </button>
        </section>

        <section className={card}>
          <h2 className="font-serif text-[22px] text-wine">Campos de personalização</h2>
          <p className="text-[13px] text-ink">O que o cliente preenche antes de comprar: nome na capa, cor, arte do botton…</p>
          <ul className="mt-3 space-y-4">
            {p.fields.map((f, i) => (
              <li key={f.id} className="rounded-[10px] bg-blush p-4">
                <div className="grid gap-3 md:grid-cols-[1fr_180px]">
                  <label className="text-[14px] text-ink">
                    Pergunta
                    <input className={input} value={f.label} onChange={(e) => setField(i, { label: e.target.value })} />
                  </label>
                  <label className="text-[14px] text-ink">
                    Tipo
                    <select className={input} value={f.type} onChange={(e) => setField(i, { type: e.target.value as FieldType })}>
                      {FIELD_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </label>
                </div>
                {(f.type === "select" || f.type === "color") && (
                  <label className="mt-3 block text-[14px] text-ink">
                    Opções (uma por linha)
                    <textarea
                      className={input}
                      rows={3}
                      defaultValue={f.options?.join("\n") ?? ""}
                      onBlur={(e) => setField(i, { options: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })}
                    />
                  </label>
                )}
                {(f.type === "text" || f.type === "textarea") && (
                  <label className="mt-3 block w-48 text-[14px] text-ink">
                    Limite de caracteres
                    <input className={input} type="number" min={1} value={f.maxLength ?? ""} onChange={(e) => setField(i, { maxLength: e.target.value ? Number(e.target.value) : undefined })} />
                  </label>
                )}
                <label className="mt-3 block text-[14px] text-ink">
                  Texto de ajuda (opcional)
                  <input className={input} value={f.helpText ?? ""} onChange={(e) => setField(i, { helpText: e.target.value || undefined })} />
                </label>
                <div className="mt-3 flex items-center justify-between">
                  <label className="flex items-center gap-2 text-[14px] text-wine">
                    <input type="checkbox" className="accent-rose" checked={f.required} onChange={(e) => setField(i, { required: e.target.checked })} />
                    Obrigatório
                  </label>
                  <button type="button" className="text-[13px] text-rose-dark" onClick={() => patch({ fields: p.fields.filter((_, j) => j !== i) })}>
                    remover campo
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <button type="button" className="mt-3 text-[15px] text-rose underline underline-offset-4" onClick={() => patch({ fields: [...p.fields, { id: newId(), label: "", type: "text", required: true }] })}>
            + Adicionar campo
          </button>
        </section>
      </div>

      <aside className="space-y-6">
        <section className={card}>
          <label className="flex items-center gap-3 text-[15px] text-wine">
            <input type="checkbox" className="size-4 accent-rose" checked={p.active} onChange={(e) => patch({ active: e.target.checked })} />
            Visível na loja
          </label>
          <label className="mt-3 flex items-center gap-3 text-[15px] text-wine">
            <input type="checkbox" className="size-4 accent-rose" checked={p.featured} onChange={(e) => patch({ featured: e.target.checked })} />
            Destaque
          </label>
          <label className="mt-4 block text-[14px] text-ink">
            Endereço da página (slug)
            <input className={input} value={p.slug} placeholder="gerado a partir do nome" onChange={(e) => patch({ slug: e.target.value })} />
          </label>
        </section>
        <section className={card}>
          <h2 className="font-serif text-[20px] text-wine">Embalagem (para o frete)</h2>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <label className="text-[14px] text-ink">Peso (g)<input className={input} type="number" min={1} value={p.weightG} onChange={(e) => patch({ weightG: num(e.target.value) })} /></label>
            <label className="text-[14px] text-ink">Altura (cm)<input className={input} type="number" min={1} step="0.5" value={p.heightCm} onChange={(e) => patch({ heightCm: num(e.target.value) })} /></label>
            <label className="text-[14px] text-ink">Largura (cm)<input className={input} type="number" min={1} step="0.5" value={p.widthCm} onChange={(e) => patch({ widthCm: num(e.target.value) })} /></label>
            <label className="text-[14px] text-ink">Comprimento (cm)<input className={input} type="number" min={1} step="0.5" value={p.lengthCm} onChange={(e) => patch({ lengthCm: num(e.target.value) })} /></label>
          </div>
        </section>
        {error && <p role="alert" className="rounded-[10px] bg-white p-3 text-[14px] text-rose-dark">{error}</p>}
        <button type="submit" disabled={pending || uploading} className="h-12 w-full rounded-full bg-rose text-[17px] text-white hover:bg-rose-dark disabled:opacity-60">
          {pending ? "Salvando…" : "Salvar produto"}
        </button>
      </aside>
    </form>
  );
}
