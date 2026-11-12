export type FieldType = "text" | "textarea" | "select" | "color" | "file";

export interface PersonalizationField {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  options?: string[]; // select / color
  maxLength?: number; // text / textarea
  helpText?: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  priceDelta: number; // centavos somados ao preço base
}

export interface ProductImage {
  url: string;
  alt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string; // glifo usado no Figma (☺ ▤ ♧ ◇)
  sort: number;
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number; // centavos
  active: boolean;
  featured: boolean;
  weightG: number;
  heightCm: number;
  widthCm: number;
  lengthCm: number;
  productionDays: number;
  placeholderColor: string;
  images: ProductImage[];
  variants: ProductVariant[];
  fields: PersonalizationField[];
  createdAt: string;
}

export type OrderStatus =
  | "aguardando_pagamento"
  | "pago"
  | "em_producao"
  | "enviado"
  | "entregue"
  | "cancelado";

export interface Address {
  cep: string;
  street: string;
  number: string;
  complement?: string;
  district: string;
  city: string;
  state: string;
}

export interface Customer {
  name: string;
  email: string;
  phone: string;
  cpf: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  variantId: string | null;
  variantName: string | null;
  quantity: number;
  unitPrice: number;
  personalization: { fieldId: string; label: string; type: FieldType; value: string }[];
}

export interface ShippingChoice {
  serviceId: string; // id do serviço Melhor Envio ou "retirada"
  name: string;
  price: number;
  deliveryDays: number | null;
}

export interface Order {
  id: string;
  code: string;
  status: OrderStatus;
  customer: Customer;
  address: Address | null;
  items: OrderItem[];
  subtotal: number;
  shipping: ShippingChoice;
  total: number;
  notes: string;
  paymentId: string | null;
  paymentStatus: string | null;
  trackingCode: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  promoMessage: string;
  whatsapp: string; // apenas dígitos, com DDI: 5511999999999
  instagram: string; // sem @
  originCep: string;
  pickupEnabled: boolean;
  pickupAddress: string;
  // Dados obrigatórios de loja virtual (Decreto 7.962/2013)
  legalName: string;
  cnpj: string; // apenas dígitos
  address: string;
  contactEmail: string;
}

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  aguardando_pagamento: "Aguardando pagamento",
  pago: "Pago",
  em_producao: "Em produção",
  enviado: "Enviado",
  entregue: "Entregue",
  cancelado: "Cancelado",
};
