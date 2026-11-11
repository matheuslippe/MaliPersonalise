import { CategoryStrip, ContactCta, FeaturedCategories, Hero, HowToOrder } from "@/components/Landing";
import { repo } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const db = repo();
  const [categories, products, settings] = await Promise.all([db.listCategories(), db.listProducts(), db.getSettings()]);

  // usa a primeira foto de um produto de cada categoria nos cards "Feitos para encantar"
  const images: Record<string, string | null> = {};
  for (const c of categories) {
    const p = products.find((p) => p.categoryId === c.id && p.images.length);
    images[c.slug] = p?.images[0].url ?? null;
  }

  return (
    <>
      <Hero />
      <CategoryStrip categories={categories} />
      <FeaturedCategories images={images} />
      <HowToOrder />
      <ContactCta whatsapp={settings.whatsapp} />
    </>
  );
}
