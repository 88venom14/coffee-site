import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Coffee } from 'lucide-react';
import { api } from '../api';
import { useStore } from '../context';
import { formatPrice } from '../utils/formatPrice';

export function CheckoutPage() {
  const { cart, user, authReady, refreshCart } = useStore();
  const navigate = useNavigate();
  const [type, setType] = useState('pickup');
  const [address, setAddress] = useState('');
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);
  if (!authReady)
    return (
      <main className="page-shell">
        <p className="state-text">Готовим оформление заказа…</p>
      </main>
    );
  if (!user)
    return (
      <main className="page-shell center-page">
        <div className="empty-state">
          <span className="empty-spark">
            <Coffee />
          </span>
          <h2>Остался один шаг.</h2>
          <p>Войдите, чтобы оформить заказ и сохранить его в истории.</p>
          <Link className="button button-dark" to="/login?next=%2Fcheckout">
            Войти
          </Link>
        </div>
      </main>
    );
  if (cart.items.length === 0)
    return (
      <main className="page-shell center-page">
        <div className="empty-state">
          <h2>Корзина пуста.</h2>
          <Link className="button button-dark" to="/products">
            Перейти в меню
          </Link>
        </div>
      </main>
    );
  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const order = await api.placeOrder(type, address, name, email, phone);
      await refreshCart();
      navigate(`/orders/${order.id}?confirmed=1`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось оформить заказ. Попробуйте ещё раз.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="page-shell">
      <div className="page-intro compact-intro">
        <p className="eyebrow">Почти готово</p>
        <h1>
          Оформим <em>заказ.</em>
        </h1>
        <p>Ваш любимый кофе. Оплатить заказ можно будет при получении.</p>
      </div>
      <form className="checkout-layout" onSubmit={submit}>
        <div className="checkout-form">
          <section className="form-section">
            <span className="step-number">01</span>
            <div>
              <h2>Контактные данные</h2>
              <p>Оставьте данные, чтобы мы могли связаться с вами.</p>
            </div>
            <div className="field-grid">
              <label>
                Ваше имя
                <input
                  required
                  minLength={2}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                />
              </label>
              <label>
                Электронная почта
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </label>
              <label className="field-wide">
                Номер телефона
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                  placeholder="+353 00 000 0000"
                />
              </label>
            </div>
          </section>
          <section className="form-section">
            <span className="step-number">02</span>
            <div>
              <h2>Как вам удобнее получить заказ?</h2>
              <p>Выбирайте подходящий вариант.</p>
            </div>
            <div className="order-type-options">
              <button
                type="button"
                className={type === 'pickup' ? 'order-type active' : 'order-type'}
                onClick={() => setType('pickup')}
              >
                <span className="radio-dot" />
                <span>
                  <strong>Заберу сам</strong>
                  <small>У стойки кофейни · Бесплатно</small>
                </span>
                <Coffee size={21} />
              </button>
              <button
                type="button"
                className={type === 'delivery' ? 'order-type active' : 'order-type'}
                onClick={() => setType('delivery')}
              >
                <span className="radio-dot" />
                <span>
                  <strong>Доставьте мне</strong>
                  <small>Стоимость доставки уточняется</small>
                </span>
                <ArrowRight size={20} />
              </button>
            </div>
            {type === 'delivery' && (
              <label className="address-field">
                Адрес доставки
                <textarea
                  required
                  minLength={5}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  placeholder="Улица, город, индекс"
                />
              </label>
            )}
          </section>
        </div>
        <aside className="order-summary checkout-summary">
          <p className="eyebrow">Всё самое вкусное</p>
          <h2>Ваш заказ</h2>
          <div className="summary-items">
            {cart.items.map((i) => (
              <div className="summary-item" key={i.id}>
                <span className="summary-qty">{i.quantity}</span>
                <span>{i.name}</span>
                <strong>{formatPrice(i.subtotal)}</strong>
              </div>
            ))}
          </div>
          <div className="summary-row">
            <span>Сумма товаров</span>
            <span>{formatPrice(cart.subtotal)}</span>
          </div>
          <div className="summary-row">
            <span>{type === 'pickup' ? 'Самовывоз' : 'Доставка'}</span>
            <span>{type === 'pickup' ? 'Бесплатно' : 'Скоро'}</span>
          </div>
          <div className="summary-total">
            <span>Итого</span>
            <strong>{formatPrice(cart.total)}</strong>
          </div>
          {error && <p className="form-error">{error}</p>}
          <button className="button button-dark full-button" disabled={busy}>
            {busy ? 'Оформляем заказ…' : 'Подтвердить заказ'} <ArrowRight size={16} />
          </button>
          <p className="summary-small">
            Оплачивать сейчас не нужно. Команда KIN подтвердит ваш заказ.
          </p>
        </aside>
      </form>
    </main>
  );
}
