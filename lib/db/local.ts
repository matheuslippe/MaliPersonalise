import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { Repo } from "./repo";
import type { Category, Order, Product, Settings } from "../types";
import { defaultSettings, seedCategories, seedProducts } from "../seed-data";

/**
 * Armazenamento em arquivo JSON para desenvolvimento local, quando o Supabase
 * ainda não está configurado. Não use em produção (a Vercel tem disco somente leitura).
 */
interface Db {
  categories: Category[];
  products: Product[];
  orders: Order[];
  settings: Settings;
}

const DATA_DIR = path.join(process.cwd(), ".data");
const DB_FILE = path.join(DATA_DIR, "db.json");

let queue: Promise<unknown> = Promise.resolve();

async function load(): Promise<Db> {
  try {
    return JSON.parse(await fs.readFile(DB_FILE, "utf8")) as Db;
  } catch {
    const db: Db = { categories: seedCategories, products: seedProducts, orders: [], settings: defaultSettings };
    await save(db);
    return db;
  }
}

async function save(db: Db) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = `${DB_FILE}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(db, null, 2));
  await fs.rename(tmp, DB_FILE);
}

/** Serializa leituras-escritas para evitar condições de corrida no arquivo. */
function mutate<T>(fn: (db: Db) => T | Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const db = await load();
    const result = await fn(db);
    await save(db);
    return result;
  });
  queue = run.catch(() => undefined);
  return run;
}

export const localRepo: Repo = {
  async listCategories() {
    return (await load()).categories.sort((a, b) => a.sort - b.sort);
  },
  async listProducts(opts) {
    const { products } = await load();
    return products
      .filter((p) => opts?.includeInactive || p.active)
      .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  },
  async getProductBySlug(slug) {
    return (await load()).products.find((p) => p.slug === slug) ?? null;
  },
  async getProductById(id) {
    return (await load()).products.find((p) => p.id === id) ?? null;
  },
  async getProductsByIds(ids) {
    return (await load()).products.filter((p) => ids.includes(p.id));
  },
  saveProduct(product) {
    return mutate((db) => {
      const i = db.products.findIndex((p) => p.id === product.id);
      if (db.products.some((p) => p.slug === product.slug && p.id !== product.id)) {
        throw new Error("Já existe um produto com esse endereço (slug).");
      }
      if (i >= 0) db.products[i] = product;
      else db.products.push(product);
      return product;
    });
  },
  deleteProduct(id) {
    return mutate((db) => {
      db.products = db.products.filter((p) => p.id !== id);
    });
  },
  createOrder(order) {
    return mutate((db) => {
      db.orders.push(order);
      return order;
    });
  },
  async getOrder(id) {
    return (await load()).orders.find((o) => o.id === id) ?? null;
  },
  async listOrders(opts) {
    return (await load()).orders
      .filter((o) => !opts?.status || o.status === opts.status)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  updateOrder(id, patch) {
    return mutate((db) => {
      const order = db.orders.find((o) => o.id === id);
      if (!order) return null;
      Object.assign(order, patch, { updatedAt: new Date().toISOString() });
      return order;
    });
  },
  async getSettings() {
    return { ...defaultSettings, ...(await load()).settings };
  },
  saveSettings(settings) {
    return mutate((db) => {
      db.settings = settings;
    });
  },
};
