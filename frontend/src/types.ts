export type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  categorySlug: string;
  imageUrl: string;
  available: boolean;
  popular: boolean;
  createdAt: string;
};
export type User = { id: string; name: string; email: string };
export type CartItem = {
  id: number;
  productId: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  quantity: number;
  available: boolean;
  subtotal: number;
};
export type Cart = { items: CartItem[]; subtotal: number; delivery: number; total: number };
