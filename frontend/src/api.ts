import type { Cart, Product, User } from './types';
type Envelope<T> = { data: T; error: string | null };

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api${path}`, {
      ...options,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...options.headers },
    });
  } catch {
    throw new Error('Магазин временно недоступен. Попробуйте ещё раз чуть позже.');
  }

  const responseText = await response.text();
  let result: Envelope<T>;
  try {
    result = JSON.parse(responseText) as Envelope<T>;
  } catch {
    throw new Error(
      response.ok
        ? 'Магазин вернул неожиданный ответ. Попробуйте ещё раз.'
        : 'Магазин временно недоступен. Попробуйте ещё раз чуть позже.',
    );
  }

  if (!response.ok || result.error) {
    throw new Error(result.error || 'Что-то пошло не так. Попробуйте ещё раз.');
  }
  return result.data;
}
export const api = {
  products: (query = '') => request<Product[]>(`/products${query}`),
  product: (id: string) => request<Product>(`/products/${id}`),
  me: () => request<User>('/auth/me'),
  login: (email: string, password: string) =>
    request<User>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (name: string, email: string, password: string) =>
    request<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),
  logout: () => request<{ ok: boolean }>('/auth/logout', { method: 'POST' }),
  cart: () => request<Cart>('/cart'),
  add: (productId: number, quantity = 1) =>
    request<Cart>('/cart/items', { method: 'POST', body: JSON.stringify({ productId, quantity }) }),
  update: (id: number, quantity: number) =>
    request<Cart>(`/cart/items/${id}`, { method: 'PATCH', body: JSON.stringify({ quantity }) }),
  remove: (id: number) => request<Cart>(`/cart/items/${id}`, { method: 'DELETE' }),
  clear: () => request<Cart>('/cart', { method: 'DELETE' }),
  placeOrder: (orderType: string, address: string, name: string, email: string, phone: string) =>
    request<{ id: number; status: string; total: number; paymentMessage: string }>('/orders', {
      method: 'POST',
      body: JSON.stringify({ orderType, address, name, email, phone }),
    }),
  orders: () =>
    request<{ id: number; status: string; orderType: string; total: number; createdAt: string }[]>(
      '/orders',
    ),
  order: (id: string) =>
    request<{
      id: number;
      status: string;
      orderType: string;
      address: string;
      total: number;
      createdAt: string;
      items: { name: string; price: number; quantity: number }[];
    }>(`/orders/${id}`),
};
