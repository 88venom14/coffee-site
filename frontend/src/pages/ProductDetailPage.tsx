import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Check, Coffee, Minus, Plus } from 'lucide-react';
import { api } from '../api';
import { SectionTitle } from '../components/ProductCard';
import { useStore } from '../context';
import { formatPrice } from '../utils/formatPrice';
import { localizeCategory } from '../utils/localization';
import type { Product } from '../types';

export function ProductDetailPage() {
  const { id = '' } = useParams();
  const { user, addToCart } = useStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);
  const [state, setState] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    api
      .product(id)
      .then(setProduct)
      .catch((e) => setError(e.message));
  }, [id]);
  if (error)
    return (
      <main className="page-shell center-page">
        <div className="empty-state">
          <span className="empty-spark">✳</span>
          <h2>Не удалось найти этот товар.</h2>
          <Link to="/products" className="button button-dark">
            Вернуться в меню
          </Link>
        </div>
      </main>
    );
  if (!product)
    return (
      <main className="page-shell">
        <p className="state-text">Загружаем страницу товара…</p>
      </main>
    );
  return (
    <main className="page-shell">
      <div className="breadcrumbs">
        <Link to="/">Главная</Link>
        <span>/</span>
        <Link to="/products">Меню</Link>
        <span>/</span>
        <span>{product.name}</span>
      </div>
      <div className="detail-layout">
        <div className="detail-image">
          <img src={product.imageUrl} alt={product.name} />
          <span>{product.popular ? 'Любимое в Coffee' : localizeCategory(product.category)}</span>
        </div>
        <div className="detail-copy">
          <p className="eyebrow">Приготовлено с заботой · {localizeCategory(product.category)}</p>
          <h1>
            {product.name}
            <em>.</em>
          </h1>
          <div className="detail-price">{formatPrice(product.price)}</div>
          <p className="detail-description">
            {product.description} Готовим после заказа из ингредиентов, которым доверяем. Найдите
            минутку для себя.
          </p>
          <p className={product.available ? 'availability' : 'availability unavailable'}>
            <span />
            {product.available ? 'Есть сегодня' : 'Временно нет в наличии'}
          </p>
          <div className="detail-buy">
            <div className="quantity-control">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                aria-label="Уменьшить количество"
              >
                <Minus size={15} />
              </button>
              <span>{qty}</span>
              <button
                onClick={() => setQty(Math.min(99, qty + 1))}
                aria-label="Увеличить количество"
              >
                <Plus size={15} />
              </button>
            </div>
            <button
              className="button button-dark"
              disabled={!product.available}
              onClick={async () => {
                try {
                  if (!user) throw new Error('Войдите, чтобы добавить товар в корзину.');
                  await addToCart(product.id, qty);
                  setState('Товар добавлен в корзину. Отличный выбор!');
                } catch (e) {
                  setState(e instanceof Error ? e.message : 'Не удалось добавить товар.');
                }
                setTimeout(() => setState(''), 3000);
              }}
            >
              В корзину <ArrowRight size={17} />
            </button>
          </div>
          {state && (
            <p className="success-note" role="status">
              <Check size={15} />
              {state}
            </p>
          )}
          <div className="detail-note">
            <Coffee size={20} />
            <span>
              Каждая чашка помогает нам заниматься любимым делом.
              <br />
              <Link to="/about">
                Больше о нашей кофейне <ArrowUpRight size={13} />
              </Link>
            </span>
          </div>
        </div>
      </div>
      <section className="section related">
        <SectionTitle
          kicker="Продолжайте выбирать"
          title="Может быть, ещё что-нибудь?"
          link="Всё меню"
          to="/products"
        />
      </section>
    </main>
  );
}
