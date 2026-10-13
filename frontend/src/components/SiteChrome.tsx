import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ArrowUpRight, Coffee, Menu, ShoppingBag, X } from 'lucide-react';
import { useStore } from '../context';
import { CartDrawer } from './CartDrawer';

export function Header() {
  const { user, cart, signOut } = useStore();
  const [open, setOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const cartButtonRef = useRef<HTMLButtonElement>(null);
  const location = useLocation();
  const cartCount = cart.items.reduce((count, item) => count + item.quantity, 0);
  const closeCart = useCallback(() => setCartOpen(false), []);

  useEffect(() => {
    setCartOpen(false);
    setOpen(false);
  }, [location.pathname]);

  return (
    <header className="header">
      <div className="nav-wrap">
        <Link to="/" className="brand" onClick={() => setOpen(false)}>
          <span className="brand-icon">
            <Coffee size={18} />
          </span>
          <span>
            Coffee
          </span>
        </Link>
        <button
          className="mobile-toggle"
          aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
        <nav className={open ? 'nav-links open' : 'nav-links'}>
          <NavLink to="/" onClick={() => setOpen(false)}>
            Главная
          </NavLink>
          <NavLink to="/about" onClick={() => setOpen(false)}>
            О нас
          </NavLink>
          <NavLink to="/products" onClick={() => setOpen(false)}>
            Меню
          </NavLink>
        </nav>
        <div className="nav-actions">
          <button
            ref={cartButtonRef}
            type="button"
            className="cart-link"
            aria-label={`Корзина, товаров: ${cartCount}`}
            aria-haspopup="dialog"
            aria-expanded={cartOpen}
            onClick={() => setCartOpen(true)}
          >
            <ShoppingBag size={18} />
            <span>Корзина</span>
            {cartCount > 0 && <b className="cart-count">{cartCount}</b>}
          </button>
          {user ? (
            <div className="account-menu">
              <Link to="/account" className="account-name">
                Привет, {user.name.split(' ')[0]}
              </Link>
              <button className="text-button" onClick={() => void signOut()}>
                Выйти
              </button>
            </div>
          ) : (
            <Link className="sign-in" to="/login">
              Войти <ArrowUpRight size={15} />
            </Link>
          )}
        </div>
      </div>
      <CartDrawer open={cartOpen} onClose={closeCart} />
    </header>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <Link to="/" className="brand">
          <span className="brand-icon">
            <Coffee size={18} />
          </span>
          <span>
            Coffee
          </span>
        </Link>
        <p>Хорошие вещи требуют времени. Мы проводим его за чашкой кофе.</p>
        <div className="footer-links">
          <Link to="/about">О нас</Link>
          <Link to="/products">Меню</Link>
          <Link to="/account#orders">Мои заказы</Link>
        </div>
        <small>© {new Date().getFullYear()} Coffee · Сделано с заботой</small>
      </div>
    </footer>
  );
}

export function SiteLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { user } = useStore();
  useLayoutEffect(() => {
    const anchor = location.hash
      ? document.getElementById(decodeURIComponent(location.hash.slice(1)))
      : null;

    if (anchor) {
      document.documentElement.scrollTop =
        window.scrollY + anchor.getBoundingClientRect().top - 28;
      return;
    }

    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [location.pathname, location.hash]);

  const isAuthPage =
    location.pathname === '/login' ||
    location.pathname === '/register' ||
    (location.pathname === '/account' && !user);

  return (
    <div className="site-layout">
      <Header />
      <div className="route-transition" key={location.pathname}>
        {children}
      </div>
      {!isAuthPage && <Footer />}
    </div>
  );
}
