import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Repo } from "./repo";
import type { Category, Order, Product, Settings } from "../types";
import { defaultSettings } from "../seed-data";
import { env } from "../env";

let client: SupabaseClient | null = null;

/** Cliente com service role: SOMENTE no servidor. As políticas RLS bloqueiam o acesso anônimo às tabelas sensíveis. */
export function supabaseAdmin(): SupabaseClient {
  client ??= createClient(env.supabaseUrl!, env.supabaseServiceKey!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
const toProduct = (r: any): Product => ({
  id: r.id,
  categoryId: r.category_id,
  name: r.name,
  slug: r.slug,
  description: r.description,
  basePrice: r.base_price,
  active: r.active,
  featured: r.featured,
  weightG: r.weight_g,
  heightCm: Number(r.height_cm),
  widthCm: Number(r.width_cm),
  lengthCm: Number(r.length_cm),
  productionDays: r.production_days,
  placeholderColor: r.placeholder_color,
  images: r.images ?? [],
  variants: r.variants ?? [],
  fields: r.personalization_fields ?? [],
  createdAt: r.created_at,
});

const fromProduct = (p: Product) => ({
  id: p.id,
  category_id: p.categoryId,
  name: p.name,
  slug: p.slug,
  description: p.description,
  base_price: p.basePrice,
  active: p.active,
  featured: p.featured,
  weight_g: p.weightG,
  height_cm: p.heightCm,
  width_cm: p.widthCm,
  length_cm: p.lengthCm,
  production_days: p.productionDays,
  placeholder_color: p.placeholderColor,
  images: p.images,
  variants: p.variants,
  personalization_fields: p.fields,
});

const toOrder = (r: any): Order => ({
  id: r.id,
  code: r.code,
  status: r.status,
  customer: r.customer,
  address: r.address,
  items: r.items,
  subtotal: r.subtotal,
  shipping: r.shipping,
  total: r.total,
  notes: r.notes ?? "",
  paymentId: r.payment_id,
  paymentStatus: r.payment_status,
  trackingCode: r.tracking_code,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

const fromOrderPatch = (o: Partial<Order>) => {
  const row: Record<string, unknown> = {};
  if (o.status !== undefined) row.status = o.status;
  if (o.paymentId !== undefined) row.payment_id = o.paymentId;
  if (o.paymentStatus !== undefined) row.payment_status = o.paymentStatus;
  if (o.trackingCode !== undefined) row.tracking_code = o.trackingCode;
  if (o.notes !== undefined) row.notes = o.notes;
  row.updated_at = new Date().toISOString();
  return row;
};
/* eslint-enable @typescript-eslint/no-explicit-any */

function check<T>(res: { data: T; error: { message: string; code?: string } | null }): T {
  if (res.error) {
    if (res.error.code === "23505") throw new Error("Já existe um produto com esse endereço (slug).");
    throw new Error(res.error.message);
  }
  return res.data;
}

export const supabaseRepo: Repo = {
  async listCategories() {
    const data = check(await supabaseAdmin().from("categories").select("*").order("sort"));
    return (data as Category[]) ?? [];
  },
  async listProducts(opts) {
    let q = supabaseAdmin().from("products").select("*").order("name");
    if (!opts?.includeInactive) q = q.eq("active", true);
    return (check(await q) ?? []).map(toProduct);
  },
  async getProductBySlug(slug) {
    const data = check(await supabaseAdmin().from("products").select("*").eq("slug", slug).maybeSingle());
    return data ? toProduct(data) : null;
  },
  async getProductById(id) {
    const data = check(await supabaseAdmin().from("products").select("*").eq("id", id).maybeSingle());
    return data ? toProduct(data) : null;
  },
  async getProductsByIds(ids) {
    if (!ids.length) return [];
    return (check(await supabaseAdmin().from("products").select("*").in("id", ids)) ?? []).map(toProduct);
  },
  async saveProduct(product) {
    const data = check(
      await supabaseAdmin().from("products").upsert(fromProduct(product)).select("*").single(),
    );
    return toProduct(data);
  },
  async deleteProduct(id) {
    check(await supabaseAdmin().from("products").delete().eq("id", id));
  },
  async createOrder(o) {
    const data = check(
      await supabaseAdmin()
        .from("orders")
        .insert({
          id: o.id,
          code: o.code,
          status: o.status,
          customer: o.customer,
          address: o.address,
          items: o.items,
          subtotal: o.subtotal,
          shipping: o.shipping,
          total: o.total,
          notes: o.notes,
        })
        .select("*")
        .single(),
    );
    return toOrder(data);
  },
  async getOrder(id) {
    if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
    const data = check(await supabaseAdmin().from("orders").select("*").eq("id", id).maybeSingle());
    return data ? toOrder(data) : null;
  },
  async listOrders(opts) {
    let q = supabaseAdmin().from("orders").select("*").order("created_at", { ascending: false }).limit(500);
    if (opts?.status) q = q.eq("status", opts.status);
    return (check(await q) ?? []).map(toOrder);
  },
  async updateOrder(id, patch) {
    const data = check(
      await supabaseAdmin().from("orders").update(fromOrderPatch(patch)).eq("id", id).select("*").maybeSingle(),
    );
    return data ? toOrder(data) : null;
  },
  async getSettings() {
    const data = check(await supabaseAdmin().from("settings").select("value").eq("key", "store").maybeSingle());
    return { ...defaultSettings, ...((data?.value as Partial<Settings>) ?? {}) };
  },
  async saveSettings(settings) {
    check(await supabaseAdmin().from("settings").upsert({ key: "store", value: settings }));
  },
};
