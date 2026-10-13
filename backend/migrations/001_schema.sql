CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY, user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id);
CREATE TABLE IF NOT EXISTS categories (
  id BIGSERIAL PRIMARY KEY, name TEXT NOT NULL UNIQUE, slug TEXT NOT NULL UNIQUE
);
CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY, name TEXT NOT NULL, description TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0), category_id BIGINT NOT NULL REFERENCES categories(id),
  image_url TEXT NOT NULL DEFAULT '', is_available BOOLEAN NOT NULL DEFAULT true,
  is_popular BOOLEAN NOT NULL DEFAULT false, created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS products_category_idx ON products(category_id);
CREATE TABLE IF NOT EXISTS carts (
  id BIGSERIAL PRIMARY KEY, user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS cart_items (
  id BIGSERIAL PRIMARY KEY, cart_id BIGINT NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES products(id), quantity INTEGER NOT NULL CHECK (quantity BETWEEN 1 AND 99),
  UNIQUE(cart_id, product_id)
);
CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL PRIMARY KEY, user_id UUID NOT NULL REFERENCES users(id), status TEXT NOT NULL DEFAULT 'placed',
  customer_name TEXT NOT NULL DEFAULT '', customer_email TEXT NOT NULL DEFAULT '', customer_phone TEXT NOT NULL DEFAULT '',
  order_type TEXT NOT NULL CHECK(order_type IN ('pickup','delivery')), delivery_address TEXT NOT NULL DEFAULT '',
  total_price NUMERIC(10,2) NOT NULL CHECK(total_price >= 0), created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS orders_user_created_idx ON orders(user_id, created_at DESC);
CREATE TABLE IF NOT EXISTS order_items (
  id BIGSERIAL PRIMARY KEY, order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id BIGINT REFERENCES products(id) ON DELETE SET NULL, product_name TEXT NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL, quantity INTEGER NOT NULL CHECK(quantity > 0)
);
