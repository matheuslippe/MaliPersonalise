import type { Category, Order, OrderStatus, Product, Settings } from "../types";

export interface Repo {
  listCategories(): Promise<Category[]>;
  listProducts(opts?: { includeInactive?: boolean }): Promise<Product[]>;
  getProductBySlug(slug: string): Promise<Product | null>;
  getProductById(id: string): Promise<Product | null>;
  getProductsByIds(ids: string[]): Promise<Product[]>;
  saveProduct(product: Product): Promise<Product>;
  deleteProduct(id: string): Promise<void>;

  createOrder(order: Order): Promise<Order>;
  getOrder(id: string): Promise<Order | null>;
  listOrders(opts?: { status?: OrderStatus }): Promise<Order[]>;
  updateOrder(id: string, patch: Partial<Order>): Promise<Order | null>;

  getSettings(): Promise<Settings>;
  saveSettings(settings: Settings): Promise<void>;
}
