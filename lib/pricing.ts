import type { OrderItem, Product } from "./types";
import type { CartItemInput } from "./checkout-schema";
import { UPLOAD_PATH_RE } from "./uploads";

export function unitPrice(product: Product, variantId: string | null): number {
  const variant = variantId ? product.variants.find((v) => v.id === variantId) : undefined;
  return product.basePrice + (variant?.priceDelta ?? 0);
}

/** Valida os campos de personalização de um item. Retorna mensagens de erro (vazio = ok). */
export function validatePersonalization(product: Product, values: Record<string, string>): string[] {
  const errors: string[] = [];
  for (const field of product.fields) {
    const value = (values[field.id] ?? "").trim();
    if (!value) {
      if (field.required) errors.push(`${product.name}: preencha "${field.label}".`);
      continue;
    }
    if ((field.type === "text" || field.type === "textarea") && field.maxLength && value.length > field.maxLength) {
      errors.push(`${product.name}: "${field.label}" deve ter até ${field.maxLength} caracteres.`);
    }
    if ((field.type === "select" || field.type === "color") && field.options && !field.options.includes(value)) {
      errors.push(`${product.name}: opção inválida em "${field.label}".`);
    }
    if (field.type === "file" && !UPLOAD_PATH_RE.test(value)) {
      errors.push(`${product.name}: envie novamente o arquivo de "${field.label}".`);
    }
  }
  const known = new Set(product.fields.map((f) => f.id));
  for (const key of Object.keys(values)) {
    if (!known.has(key)) errors.push(`${product.name}: campo desconhecido.`);
  }
  return errors;
}

/**
 * Monta os itens do pedido a partir do carrinho usando SEMPRE o preço do banco
 * (o preço exibido no navegador é ignorado).
 */
export function buildOrderItems(products: Product[], cart: CartItemInput[]) {
  const byId = new Map(products.map((p) => [p.id, p]));
  const errors: string[] = [];
  const items: OrderItem[] = [];

  for (const line of cart) {
    const product = byId.get(line.productId);
    if (!product || !product.active) {
      errors.push("Um dos produtos do carrinho não está mais disponível.");
      continue;
    }
    let variantName: string | null = null;
    if (product.variants.length) {
      const variant = product.variants.find((v) => v.id === line.variantId);
      if (!variant) {
        errors.push(`${product.name}: escolha uma opção.`);
        continue;
      }
      variantName = variant.name;
    } else if (line.variantId) {
      errors.push(`${product.name}: opção inválida.`);
      continue;
    }
    errors.push(...validatePersonalization(product, line.personalization));
    items.push({
      productId: product.id,
      productName: product.name,
      variantId: product.variants.length ? line.variantId : null,
      variantName,
      quantity: line.quantity,
      unitPrice: unitPrice(product, line.variantId),
      personalization: product.fields
        .filter((f) => (line.personalization[f.id] ?? "").trim())
        .map((f) => ({ fieldId: f.id, label: f.label, type: f.type, value: line.personalization[f.id].trim() })),
    });
  }

  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  return { items, subtotal, errors };
}
