import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useStore } from '../context';
import { formatPrice } from '../utils/formatPrice';
import { localizeOrderStatus, localizeOrderType } from '../utils/localization';
import { AuthPage } from './AuthPage';

type OrderSummary = Awaited<ReturnType<typeof api.orders>>[number];

export function AccountPage() {
  const { user, authReady } = useStore();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState('');
  const [reload, setReload] = useState(0);

  useEffect(() => {
    if (!user) return;
    let active = true;
    setOrdersLoading(true);
    setOrdersError('');
    api
      .orders()
      .then((result) => {
        if (active) setOrders(result);
      })
      .catch((error: Error) => {
        if (active) setOrdersError(error.message);
      })
      .finally(() => {
        if (active) setOrdersLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user, reload]);

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
        <a href="#orders" className="account-card">
          <span className="eyebrow">Ваша история</span>
          <h2>Прошлые заказы</h2>
          <p>Все покупки собраны в профиле.</p>
          <ArrowRight />
        </a>
        <div className="account-card account-profile">
          <span className="eyebrow">Ваши данные</span>
          <h2>{user.name}</h2>
          <p>{user.email}</p>
        </div>
      </div>

      <section className="account-orders" id="orders" aria-labelledby="account-orders-title">
        <div className="account-section-heading">
          <div>
            <p className="eyebrow">Вспомним ваши покупки</p>
            <h2 id="account-orders-title">Прошлые заказы</h2>
          </div>
          <Link to="/products">
            В меню <ArrowRight size={15} />
          </Link>
        </div>

        {ordersLoading ? (
          <div className="account-orders-loading" role="status" aria-label="Загружаем историю заказов">
            <span className="account-orders-loading-line skeleton-surface" />
            <span className="account-orders-loading-line skeleton-surface" />
          </div>
        ) : ordersError ? (
          <div className="state-card account-orders-error" role="alert">
            <span>{ordersError}</span>
            <button type="button" onClick={() => setReload((current) => current + 1)}>
              Повторить
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="account-orders-empty">
            <span className="empty-spark">✳</span>
            <h3>Здесь пока пусто.</h3>
            <p>Всё начинается с первой чашки.</p>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <Link className="order-row" to={`/orders/${order.id}`} key={order.id}>
                <div>
                  <span className="eyebrow">
                    ЗАКАЗ №{order.id} · {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                  </span>
                  <h3>{localizeOrderType(order.orderType)}</h3>
                </div>
                <span className="order-status">{localizeOrderStatus(order.status)}</span>
                <strong>{formatPrice(order.total)}</strong>
                <ArrowRight />
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
