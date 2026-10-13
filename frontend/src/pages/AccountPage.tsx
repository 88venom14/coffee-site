import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { AuthPage } from './AuthPage';
import { useStore } from '../context';

export function AccountPage() {
  const { user, cart, authReady } = useStore();
  if (!authReady)
    return (
      <main className="page-shell">
        <p className="state-text">Загружаем аккаунт…</p>
      </main>
    );
  if (!user) return <AuthPage />;
  return (
    <main className="page-shell">
      <div className="page-intro">
        <p className="eyebrow">Ваш личный раздел</p>
        <h1>
          Рады видеть, <em>{user.name.split(' ')[0]}!</em>
        </h1>
        <p>Всё важное собрано в одном месте.</p>
      </div>
      <div className="account-cards">
        <Link to="/orders" className="account-card">
          <span className="eyebrow">Ваша история</span>
          <h2>Прошлые заказы</h2>
          <p>Вспомните любимые вкусы.</p>
          <ArrowRight />
        </Link>
        <Link to="/cart" className="account-card">
          <span className="eyebrow">Отложено на потом</span>
          <h2>Корзина · {cart.items.length}</h2>
          <p>Продолжите с того места, где остановились.</p>
          <ArrowRight />
        </Link>
        <div className="account-card account-profile">
          <span className="eyebrow">Ваши данные</span>
          <h2>{user.name}</h2>
          <p>{user.email}</p>
        </div>
      </div>
    </main>
  );
}
