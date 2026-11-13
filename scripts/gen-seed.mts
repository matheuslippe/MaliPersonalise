// Gera supabase/seed.sql a partir de lib/seed-data.ts
// Uso: node --experimental-strip-types scripts/gen-seed.mts
import { writeFileSync } from "node:fs";
import { seedProducts } from "../lib/seed-data.ts";

const q = (v: string) => `'${v.replace(/'/g, "''")}'`;
const j = (v: unknown) => `${q(JSON.stringify(v))}::jsonb`;

const rows = seedProducts.map((p) =>
  `  (${[
    q(p.id), q(p.categoryId), q(p.name), q(p.slug), q(p.description), p.basePrice, p.active, p.featured,
    p.weightG, p.heightCm, p.widthCm, p.lengthCm, p.productionDays, q(p.placeholderColor),
    j(p.images), j(p.variants), j(p.fields),
  ].join(", ")})`,
);

writeFileSync(
  "supabase/seed.sql",
  `-- Produtos de EXEMPLO (gerado por scripts/gen-seed.mts). Revise preços e medidas no painel depois.
-- Rode no SQL Editor do Supabase DEPOIS das migrações. Pode rodar de novo sem duplicar.
insert into public.products (id, category_id, name, slug, description, base_price, active, featured,
  weight_g, height_cm, width_cm, length_cm, production_days, placeholder_color, images, variants, personalization_fields)
values
${rows.join(",\n")}
on conflict (id) do nothing;
`,
);
console.log(`seed.sql: ${rows.length} produtos`);
