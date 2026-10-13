import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useStore } from '../context';
import { formatPrice } from '../utils/formatPrice';

export function CartPage() {
  const { cart, updateCart, removeFromCart, user, authReady } = useStore();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  async function changeQuantity(id: number, quantity: number) {
    setError('');
    try {
      await updateCart(id, quantity);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось обновить корзину.');
    }
  }
  async function removeItem(id: number) {
    setError('');
    try {
      await removeFromCart(id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось удалить товар.');
    }
  }
  if (!authReady)
    return (
      <main className="page-shell">
        <p className="state-text">Загружаем корзину…</p>
      </main>
    );
  if (!user)
    return (
      <main className="page-shell center-page">
        <div className="empty-state">
          <span className="empty-spark">
            <ShoppingBag />
          </span>
          <h2>Корзина ждёт вас.</h2>
          <p>Войдите, чтобы увидеть сохранённые товары и продолжить покупки.</p>
          <Link to="/login" className="button button-dark">
            Войти и продолжить
          </Link>
          <Link className="line-link" to="/products">
            Продолжить покупки <ArrowRight size={15} />
          </Link>
        </div>
      </main>
    );
  return (
    <main className="page-shell">
      <div className="page-intro compact-intro">
        <p className="eyebrow">Немного радости для вас</p>
        <h1>
          Ваша <em>корзина.</em>
        </h1>
        <p>Товаров в корзине: {cart.items.length}</p>
      </div>
      {error && <p className="form-error">{error}</p>}
      {cart.items.length === 0 ? (
        <div className="empty-state">
          <span className="empty-spark">✳</span>
          <h2>Корзина пока отдыхает.</h2>
          <p>Выберите что-нибудь вкусное и возвращайтесь.</p>
          <Link to="/products" className="button button-dark">
            Перейти в меню <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items">
            {cart.items.map((item) => (
              <article className="cart-item" key={item.id}>
                <Link to={`/products/${item.productId}`} className="cart-thumb">
                  <img src={item.imageUrl} alt={item.name} />
                </Link>
                <div className="cart-item-copy">
                  <Link to={`/products/${item.productId}`} className="cart-item-name">
                    {item.name}
                  </Link>
                  <p>{item.description}</p>
                  <span>{formatPrice(item.price)} за шт.</span>
                  <div className="quantity-control small">
                    <button
                      onClick={() => {
                        if (item.quantity === 1) void removeItem(item.id);
                        else void changeQuantity(item.id, item.quantity - 1);
                      }}
                      aria-label="Уменьшить количество"
                    >
                      <Minus size={13} />
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      disabled={item.quantity >= 99}
                      onClick={() => void changeQuantity(item.id, item.quantity + 1)}
                      aria-label="Увеличить количество"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                </div>
                <div className="cart-line-end">
                  <strong>{formatPrice(item.subtotal)}</strong>
                  <button onClick={() => void removeItem(item.id)} className="remove-link">
                    Удалить
                  </button>
                </div>
              </article>
            ))}
          </div>
          <aside className="order-summary">
            <p className="eyebrow">Ваш заказ по пунктам</p>
            <h2>Итого</h2>
            <div className="summary-row">
              <span>Сумма товаров</span>
              <span>{formatPrice(cart.subtotal)}</span>
            </div>
            <div className="summary-row">
              <span>Доставка</span>
              <span>Самовывоз бесплатный</span>
            </div>
            <div className="summary-total">
              <span>Итого</span>
              <strong>{formatPrice(cart.total)}</strong>
            </div>
            <button
              className="button button-dark full-button"
              onClick={() => navigate('/checkout')}
            >
              Перейти к оформлению <ArrowRight size={16} />
            </button>
            <p className="summary-small">
              <Check size={14} /> Оплата пока производится при получении.
            </p>
          </aside>
        </div>
      )}
    </main>
  );
}
