import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { api } from '../api';
import { useStore } from '../context';
import { formatPrice } from '../utils/formatPrice';
import { localizeOrderStatus, localizeOrderType } from '../utils/localization';

export function OrdersPage() {
  const { user, authReady } = useStore();
  const [orders, setOrders] = useState<
    { id: number; status: string; orderType: string; total: number; createdAt: string }[]
  >([]);
  const [error, setError] = useState('');
  useEffect(() => {
    if (user)
      api
        .orders()
        .then(setOrders)
        .catch((e) => setError(e.message));
  }, [user]);
  if (!authReady)
    return (
      <main className="page-shell">
        <p className="state-text">Загружаем заказы…</p>
      </main>
    );
  if (!user)
    return (
      <main className="page-shell center-page">
        <div className="empty-state">
          <h2>Ваши заказы доступны только вам.</h2>
          <p>Войдите, чтобы посмотреть историю покупок.</p>
          <Link className="button button-dark" to="/login">
            Войти
          </Link>
        </div>
      </main>
    );
  return (
    <main className="page-shell">
      <div className="page-intro">
        <p className="eyebrow">Вспомним ваши покупки</p>
        <h1>
          Ваши <em>заказы.</em>
        </h1>
        <p>Всё, что вы заказывали в KIN.</p>
      </div>
      {error && <p className="form-error">{error}</p>}
      {orders.length === 0 && !error ? (
        <div className="empty-state">
          <span className="empty-spark">✳</span>
          <h2>Здесь пока пусто.</h2>
          <p>Всё начинается с первой чашки.</p>
          <Link to="/products" className="button button-dark">
            Перейти в меню
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <Link className="order-row" to={`/orders/${order.id}`} key={order.id}>
              <div>
                <span className="eyebrow">
                  ЗАКАЗ №{order.id} · {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                </span>
                <h2>{localizeOrderType(order.orderType)}</h2>
              </div>
              <span className="order-status">{localizeOrderStatus(order.status)}</span>
              <strong>{formatPrice(order.total)}</strong>
              <ArrowRight />
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
