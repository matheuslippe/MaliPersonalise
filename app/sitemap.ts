import type { MetadataRoute } from "next";
import { repo } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const products = await repo().listProducts();
  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/produtos`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/como-encomendar`, changeFrequency: "monthly" },
    { url: `${base}/contato`, changeFrequency: "monthly" },
    ...products.map((p) => ({ url: `${base}/produtos/${p.slug}`, lastModified: p.createdAt, priority: 0.8 })),
  ];
}
