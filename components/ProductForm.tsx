"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import type { PersonalizationField, ProductVariant } from "@/lib/types";
import { formatBRL } from "@/lib/money";
import { useCart } from "@/lib/cart-store";
import { Button } from "./Button";
import { uploadCustomerFile } from "./upload-client";

interface Props {
  product: {
    id: string;
    slug: string;
    name: string;
    basePrice: number;
    variants: ProductVariant[];
    fields: PersonalizationField[];
    placeholderColor: string;
    image: string | null;
  };
}

const inputCls =
  "w-full rounded-[10px] border border-line bg-white px-4 py-3 text-[16px] text-wine placeholder:text-ink/60 focus:border-rose focus:outline-none";

export function ProductForm({ product }: Props) {
  const router = useRouter();
  const add = useCart((s) => s.add);
  const uid = useId();
  const [variantId, setVariantId] = useState<string | null>(product.variants[0]?.id ?? null);
  const [quantity, setQuantity] = useState(1);
  const [values, setValues] = useState<Record<string, string>>({});
  const [fileNames, setFileNames] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [added, setAdded] = useState(false);

  const variant = product.variants.find((v) => v.id === variantId);
  const price = product.basePrice + (variant?.priceDelta ?? 0);

  const set = (id: string, value: string) => {
    setValues((v) => ({ ...v, [id]: value }));
    setErrors((e) => ({ ...e, [id]: "" }));
  };

  async function onFile(field: PersonalizationField, file: File | undefined) {
    if (!file) return;
    setUploading(field.id);
    setErrors((e) => ({ ...e, [field.id]: "" }));
    try {
      const path = await uploadCustomerFile(file);
      set(field.id, path);
      setFileNames((n) => ({ ...n, [field.id]: file.name }));
    } catch (err) {
      setErrors((e) => ({ ...e, [field.id]: (err as Error).message }));
    } finally {
      setUploading(null);
    }
  }

  function validate() {
    const next: Record<string, string> = {};
    for (const f of product.fields) {
      const v = (values[f.id] ?? "").trim();
      if (f.required && !v) next[f.id] = f.type === "file" ? "Envie o arquivo." : "Campo obrigatório.";
      else if (f.maxLength && v.length > f.maxLength) next[f.id] = `Até ${f.maxLength} caracteres.`;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (uploading || !validate()) return;
    const personalization = Object.fromEntries(
      Object.entries(values).filter(([, v]) => v.trim()).map(([k, v]) => [k, v.trim()]),
    );
    add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      variantId,
      variantName: variant?.name ?? null,
      unitPrice: price,
      quantity,
      personalization,
      summary: product.fields
        .filter((f) => personalization[f.id])
        .map((f) => ({ label: f.label, value: f.type === "file" ? fileNames[f.id] ?? "arquivo enviado" : personalization[f.id] })),
      placeholderColor: product.placeholderColor,
      image: product.image,
    });
    setAdded(true);
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-6" noValidate>
      <p className="text-[28px] text-wine tabular-nums">{formatBRL(price)}</p>

      {product.variants.length > 0 && (
        <fieldset>
          <legend className="mb-2 text-[15px] text-wine">Opção</legend>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v) => (
              <label
                key={v.id}
                className={`cursor-pointer rounded-full border px-4 py-2 text-[15px] transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-rose ${
                  v.id === variantId ? "border-rose bg-rose text-white" : "border-line bg-white text-wine hover:border-rose"
                }`}
              >
                <input
                  type="radio"
                  name="variant"
                  value={v.id}
                  checked={v.id === variantId}
                  onChange={() => setVariantId(v.id)}
                  className="sr-only"
                />
                {v.name}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {product.fields.length > 0 && (
        <fieldset className="space-y-5 rounded-[14px] bg-blush p-5">
          <legend className="sr-only">Personalização</legend>
          <p className="font-serif text-[22px] text-wine">Personalize do seu jeito</p>
          {product.fields.map((f) => {
            const id = `${uid}-${f.id}`;
            const err = errors[f.id];
            const describedBy = [f.helpText && `${id}-help`, err && `${id}-err`].filter(Boolean).join(" ") || undefined;
            const common = { id, "aria-invalid": Boolean(err), "aria-describedby": describedBy };
            return (
              <div key={f.id}>
                <label htmlFor={id} className="mb-1 block text-[15px] text-wine">
                  {f.label}
                  {f.required && <span className="text-rose"> *</span>}
                </label>
                {f.type === "text" && (
                  <input {...common} className={inputCls} value={values[f.id] ?? ""} maxLength={f.maxLength} onChange={(e) => set(f.id, e.target.value)} />
                )}
                {f.type === "textarea" && (
                  <textarea {...common} rows={3} className={inputCls} value={values[f.id] ?? ""} maxLength={f.maxLength} onChange={(e) => set(f.id, e.target.value)} />
                )}
                {(f.type === "select" || f.type === "color") && (
                  <select {...common} className={inputCls} value={values[f.id] ?? ""} onChange={(e) => set(f.id, e.target.value)}>
                    <option value="">Selecione…</option>
                    {f.options?.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                )}
                {f.type === "file" && (
                  <div>
                    <input
                      {...common}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,application/pdf"
                      className="block w-full text-[15px] text-ink file:mr-4 file:rounded-full file:border-0 file:bg-rose file:px-5 file:py-2 file:text-white"
                      onChange={(e) => onFile(f, e.target.files?.[0])}
                    />
                    <p className="mt-1 text-[14px] text-ink" aria-live="polite">
                      {uploading === f.id ? "Enviando arquivo…" : fileNames[f.id] ? `Enviado: ${fileNames[f.id]}` : ""}
                    </p>
                  </div>
                )}
                {f.helpText && (
                  <p id={`${id}-help`} className="mt-1 text-[13px] text-ink">
                    {f.helpText}
                  </p>
                )}
                {f.maxLength && (f.type === "text" || f.type === "textarea") && (
                  <p className="mt-1 text-right text-[12px] text-ink tabular-nums">
                    {(values[f.id] ?? "").length}/{f.maxLength}
                  </p>
                )}
                {err && (
                  <p id={`${id}-err`} className="mt-1 text-[14px] text-rose-dark">
                    {err}
                  </p>
                )}
              </div>
            );
          })}
        </fieldset>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-[15px] text-wine">
          Quantidade
          <input
            type="number"
            min={1}
            max={99}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Math.min(99, Number(e.target.value) || 1)))}
            className="w-20 rounded-[10px] border border-line bg-white px-3 py-2 text-center tabular-nums"
          />
        </label>
        <Button type="submit" disabled={Boolean(uploading)} className="flex-1 md:flex-none">
          Adicionar à sacola <span aria-hidden>→</span>
        </Button>
      </div>

      {added && (
        <div role="status" className="flex flex-wrap items-center gap-3 rounded-[14px] border border-line bg-white p-4 text-[15px] text-wine">
          Adicionado à sacola ♡
          <button type="button" onClick={() => router.push("/carrinho")} className="text-rose underline underline-offset-4">
            Ver sacola
          </button>
        </div>
      )}
    </form>
  );
}
