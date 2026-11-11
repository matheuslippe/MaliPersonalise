-- Mali Personalizê — esquema inicial
-- Rode no SQL Editor do Supabase (ou `supabase db push`).

create table if not exists public.categories (
  id text primary key,
  name text not null,
  slug text not null unique,
  icon text not null default '♡',
  sort int not null default 0
);

create table if not exists public.products (
  id text primary key,
  category_id text references public.categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  description text not null default '',
  base_price int not null check (base_price >= 0),           -- centavos
  active boolean not null default true,
  featured boolean not null default false,
  weight_g int not null default 200,
  height_cm numeric(5,1) not null default 3,
  width_cm numeric(5,1) not null default 16,
  length_cm numeric(5,1) not null default 22,
  production_days int not null default 5,
  placeholder_color text not null default '#f0d4d1',
  images jsonb not null default '[]',                       -- [{url, alt}]
  variants jsonb not null default '[]',                     -- [{id, name, priceDelta}]
  personalization_fields jsonb not null default '[]',       -- [{id, label, type, required, options?, maxLength?, helpText?}]
  created_at timestamptz not null default now()
);
create index if not exists products_category_idx on public.products(category_id) where active;

create table if not exists public.orders (
  id uuid primary key,
  code text not null unique,
  status text not null default 'aguardando_pagamento'
    check (status in ('aguardando_pagamento','pago','em_producao','enviado','entregue','cancelado')),
  customer jsonb not null,          -- {name, email, phone, cpf}
  address jsonb,                    -- null = retirada
  items jsonb not null,             -- snapshot dos itens com preço e personalização
  subtotal int not null,
  shipping jsonb not null,          -- {serviceId, name, price, deliveryDays}
  total int not null,
  notes text not null default '',
  payment_id text,
  payment_status text,
  tracking_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists orders_status_idx on public.orders(status, created_at desc);

create table if not exists public.settings (
  key text primary key,
  value jsonb not null
);

-- RLS: o site acessa tudo pelo servidor com a service role.
-- Anônimos só leem catálogo ativo; pedidos e configurações ficam fechados.
alter table public.categories enable row level security;
alter table public.products   enable row level security;
alter table public.orders     enable row level security;
alter table public.settings   enable row level security;

drop policy if exists "catalogo publico" on public.categories;
create policy "catalogo publico" on public.categories for select using (true);
drop policy if exists "produtos ativos publicos" on public.products;
create policy "produtos ativos publicos" on public.products for select using (active);

-- Storage
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('product-images', 'product-images', true, 4194304, array['image/png','image/jpeg','image/webp']),
  ('customer-uploads', 'customer-uploads', false, 10485760, array['image/png','image/jpeg','image/webp','application/pdf'])
on conflict (id) do nothing;

-- Dados iniciais
insert into public.categories (id, name, slug, icon, sort) values
  ('cat-bottons', 'Bottons', 'bottons', '☺', 1),
  ('cat-agendas', 'Agendas e planners', 'agendas-e-planners', '▤', 2),
  ('cat-lembrancinhas', 'Lembrancinhas', 'lembrancinhas', '♧', 3),
  ('cat-papelaria', 'Papelaria personalizada', 'papelaria-personalizada', '◇', 4)
on conflict (id) do nothing;

insert into public.settings (key, value) values
  ('store', '{"promoMessage":"Personalizados feitos com carinho ♡","whatsapp":"","instagram":"malipersonalize_","originCep":"","pickupEnabled":false,"pickupAddress":""}')
on conflict (key) do nothing;
