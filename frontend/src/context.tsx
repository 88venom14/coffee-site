import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { api } from './api';
import type { Cart, User } from './types';
type Store = {
  user: User | null;
  authReady: boolean;
  cart: Cart;
  refreshCart: () => Promise<void>;
  addToCart: (id: number, qty?: number) => Promise<void>;
  updateCart: (id: number, qty: number) => Promise<void>;
  removeFromCart: (id: number) => Promise<void>;
  signIn: (user: User) => Promise<void>;
  signOut: () => Promise<void>;
};
const emptyCart: Cart = { items: [], subtotal: 0, delivery: 0, total: 0 };
const StoreContext = createContext<Store | null>(null);
export function StoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [cart, setCart] = useState<Cart>(emptyCart);
  const refreshCart = useCallback(async () => {
    try {
      setCart(await api.cart());
    } catch {
      setCart(emptyCart);
    }
  }, []);
  const signIn = useCallback(async (nextUser: User) => {
    setUser(nextUser);
    try {
      setCart(await api.cart());
    } finally {
      setAuthReady(true);
    }
  }, []);
  const signOut = useCallback(async () => {
    await api.logout();
    setUser(null);
    setCart(emptyCart);
    setAuthReady(true);
  }, []);
  const addToCart = useCallback(
    async (id: number, qty = 1) => {
      if (!user) throw new Error('Войдите, чтобы добавить товар в корзину.');
      setCart(await api.add(id, qty));
    },
    [user],
  );
  const updateCart = useCallback(
    async (id: number, qty: number) => setCart(await api.update(id, qty)),
    [],
  );
  const removeFromCart = useCallback(async (id: number) => setCart(await api.remove(id)), []);
  useEffect(() => {
    api
      .me()
      .then(async (current) => {
        setUser(current);
        setCart(await api.cart());
      })
      .catch(() => undefined)
      .finally(() => setAuthReady(true));
  }, []);
  const value = useMemo(
    () => ({
      user,
      authReady,
      cart,
      refreshCart,
      addToCart,
      updateCart,
      removeFromCart,
      signIn,
      signOut,
    }),
    [user, authReady, cart, refreshCart, addToCart, updateCart, removeFromCart, signIn, signOut],
  );
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
export function useStore() {
  const value = useContext(StoreContext);
  if (!value) throw new Error('useStore must be used within StoreProvider');
  return value;
}
