import { useState, type ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ArrowUpRight, Coffee, Menu, ShoppingBag, X } from 'lucide-react';
import { useStore } from '../context';

export function Header() {
  const { user, cart, signOut } = useStore();
  const [open, setOpen] = useState(false);
  return (
    <header className="header">
      <div className="nav-wrap">
        <Link to="/" className="brand" onClick={() => setOpen(false)}>
          <span className="brand-icon">
            <Coffee size={18} />
          </span>
          <span>
            KIN<span className="brand-dot">.</span>
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
          <NavLink to="/orders" onClick={() => setOpen(false)}>
            Заказы
          </NavLink>
        </nav>
        <div className="nav-actions">
          <Link to="/cart" className="cart-link" aria-label="Корзина">
            <ShoppingBag size={18} />
            <span>Корзина</span>
            {cart.items.length > 0 && (
              <b className="cart-count">{cart.items.reduce((n, i) => n + i.quantity, 0)}</b>
            )}
          </Link>
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
            KIN<span className="brand-dot">.</span>
          </span>
        </Link>
        <p>Хорошие вещи требуют времени. Мы проводим его за чашкой кофе.</p>
        <div className="footer-links">
          <Link to="/about">О нас</Link>
          <Link to="/products">Меню</Link>
          <Link to="/orders">Мои заказы</Link>
        </div>
        <small>© {new Date().getFullYear()} KIN Coffee · Сделано с заботой</small>
      </div>
    </footer>
  );
}

export function SiteLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { user } = useStore();
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
