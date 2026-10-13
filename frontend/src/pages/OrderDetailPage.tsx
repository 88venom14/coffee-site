import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { api } from '../api';
import { useStore } from '../context';
import { formatPrice } from '../utils/formatPrice';
import { localizeOrderType } from '../utils/localization';

export function OrderDetail() {
  const { id = '' } = useParams();
  const { user, authReady } = useStore();
  const [params] = useSearchParams();
  const [order, setOrder] = useState<Awaited<ReturnType<typeof api.order>> | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user)
      api
        .order(id)
        .then(setOrder)
        .catch((requestError: Error) => setError(requestError.message));
  }, [user, id]);

  if (!authReady)
    return (
      <main className="page-shell">
        <p className="state-text">Ищем ваш заказ…</p>
      </main>
    );
  if (!user)
    return (
      <main className="page-shell center-page">
        <div className="empty-state">
          <h2>Войдите, чтобы посмотреть заказ.</h2>
          <Link className="button button-dark" to="/login">
            Войти
          </Link>
        </div>
      </main>
    );
  if (error)
    return (
      <main className="page-shell center-page">
        <div className="empty-state">
          <h2>{error}</h2>
          <Link to="/account#orders" className="button button-dark">
            К списку заказов
          </Link>
        </div>
      </main>
    );
  if (!order)
    return (
      <main className="page-shell">
        <p className="state-text">Ищем ваш заказ…</p>
      </main>
    );

  const confirmed = params.has('confirmed');
  const title = confirmed ? 'Заказ оформлен!' : `Заказ №${order.id}`;
  const message = confirmed
    ? 'Спасибо, что выбрали Coffee. Мы уже готовим для вас что-то вкусное.'
    : `Оформлен ${new Date(order.createdAt).toLocaleDateString('ru-RU')}. Дальше мы всё сделаем сами.`;

  return (
    <main className="page-shell confirmation">
      <div className="confirm-icon">
        <Check size={28} />
      </div>
      <p className="eyebrow">{confirmed ? 'Новый заказ' : 'Информация о заказе'}</p>
      <h1>{title}</h1>
      <p className="confirm-copy">{message}</p>
      <div className="confirm-card">
        <span className="eyebrow">
          ЗАКАЗ №{order.id} · {localizeOrderType(order.orderType).toLocaleUpperCase('ru-RU')}
        </span>
        {order.items.map((item, index) => (
          <div className="summary-item" key={index}>
            <span className="summary-qty">{item.quantity}</span>
            <span>{item.name}</span>
            <strong>{formatPrice(item.price * item.quantity)}</strong>
          </div>
        ))}
        <div className="summary-total">
          <span>Итого</span>
          <strong>{formatPrice(order.total)}</strong>
        </div>
        <p className="payment-note">
          Онлайн-оплата появится позже.
          <br />
          Оплатите заказ при получении.
        </p>
      </div>
      <Link to="/products" className="button button-dark">
        Выбрать что-нибудь ещё <ArrowRight size={16} />
      </Link>
      <Link to="/account#orders" className="line-link">
        Все заказы
      </Link>
    </main>
  );
}
