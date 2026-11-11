import type { Category, Product, Settings } from "./types";

// Categorias da faixa do Figma (04 · Faixa de categorias)
export const seedCategories: Category[] = [
  { id: "cat-bottons", name: "Bottons", slug: "bottons", icon: "☺", sort: 1 },
  { id: "cat-agendas", name: "Agendas e planners", slug: "agendas-e-planners", icon: "▤", sort: 2 },
  { id: "cat-lembrancinhas", name: "Lembrancinhas", slug: "lembrancinhas", icon: "♧", sort: 3 },
  { id: "cat-papelaria", name: "Papelaria personalizada", slug: "papelaria-personalizada", icon: "◇", sort: 4 },
];

const now = "2026-11-01T12:00:00.000Z";

// Produtos de EXEMPLO: preços, medidas e textos devem ser revisados pela Mali.
export const seedProducts: Product[] = [
  {
    id: "prod-agenda-2027",
    categoryId: "cat-agendas",
    name: "Agenda personalizada 2027",
    slug: "agenda-personalizada-2027",
    description:
      "Agenda A5 com capa personalizada com seu nome, miolo datado de janeiro a dezembro, páginas mensais e semanais, elástico e fita marcadora.",
    basePrice: 8990,
    active: true,
    featured: true,
    weightG: 450,
    heightCm: 3,
    widthCm: 16,
    lengthCm: 22,
    productionDays: 7,
    placeholderColor: "#e8b8b2",
    images: [],
    variants: [
      { id: "v-wireo", name: "Wire-o, capa dura", priceDelta: 0 },
      { id: "v-costurada", name: "Costurada, capa dura", priceDelta: 1500 },
    ],
    fields: [
      { id: "f-nome", label: "Nome na capa", type: "text", required: true, maxLength: 24 },
      { id: "f-cor", label: "Cor da capa", type: "color", required: true, options: ["Rosa floral", "Lilás", "Nude", "Verde sálvia"] },
      { id: "f-frase", label: "Frase na contracapa (opcional)", type: "textarea", required: false, maxLength: 120 },
    ],
    createdAt: now,
  },
  {
    id: "prod-planner-semanal",
    categoryId: "cat-agendas",
    name: "Planner semanal sem data",
    slug: "planner-semanal",
    description:
      "Planner A5 não datado para começar quando quiser: 52 semanas, metas do mês, controle de hábitos e páginas de anotações. Capa personalizada com nome.",
    basePrice: 6990,
    active: true,
    featured: true,
    weightG: 380,
    heightCm: 2,
    widthCm: 16,
    lengthCm: 22,
    productionDays: 5,
    placeholderColor: "#f7d6d1",
    images: [],
    variants: [],
    fields: [
      { id: "f-nome", label: "Nome na capa", type: "text", required: true, maxLength: 24 },
      { id: "f-cor", label: "Cor da capa", type: "color", required: true, options: ["Rosa floral", "Lilás", "Nude"] },
    ],
    createdAt: now,
  },
  {
    id: "prod-bottons",
    categoryId: "cat-bottons",
    name: "Bottons personalizados 4,5 cm",
    slug: "bottons-personalizados",
    description:
      "Bottons de 4,5 cm com alfinete, feitos com a sua arte, foto ou logo. Ideais para eventos, festas, formaturas e lembrancinhas.",
    basePrice: 3500,
    active: true,
    featured: true,
    weightG: 120,
    heightCm: 4,
    widthCm: 12,
    lengthCm: 16,
    productionDays: 4,
    placeholderColor: "#e0cfe8",
    images: [],
    variants: [
      { id: "v-10", name: "Kit com 10", priceDelta: 0 },
      { id: "v-20", name: "Kit com 20", priceDelta: 2500 },
      { id: "v-50", name: "Kit com 50", priceDelta: 9000 },
    ],
    fields: [
      { id: "f-arte", label: "Sua arte ou foto", type: "file", required: true, helpText: "PNG, JPG ou PDF até 10 MB. Se preferir, descreva a ideia abaixo." },
      { id: "f-obs", label: "Observações sobre a arte", type: "textarea", required: false, maxLength: 300 },
    ],
    createdAt: now,
  },
  {
    id: "prod-tag-floral",
    categoryId: "cat-papelaria",
    name: "Tags florais personalizadas",
    slug: "tags-florais",
    description: "Kit de tags com nome ou mensagem, papel 250 g e cordão de algodão. Perfeitas para presentes e lembrancinhas.",
    basePrice: 2490,
    active: true,
    featured: false,
    weightG: 80,
    heightCm: 2,
    widthCm: 12,
    lengthCm: 16,
    productionDays: 3,
    placeholderColor: "#f0d9cc",
    images: [],
    variants: [
      { id: "v-20", name: "Kit com 20", priceDelta: 0 },
      { id: "v-50", name: "Kit com 50", priceDelta: 2500 },
    ],
    fields: [{ id: "f-texto", label: "Texto da tag", type: "text", required: true, maxLength: 40 }],
    createdAt: now,
  },
];

export const defaultSettings: Settings = {
  promoMessage: "Personalizados feitos com carinho ♡",
  whatsapp: "",
  instagram: "malipersonalize_",
  originCep: "",
  pickupEnabled: false,
  pickupAddress: "",
};
