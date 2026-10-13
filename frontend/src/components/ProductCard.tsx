import { useState, type CSSProperties, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Plus } from 'lucide-react';
import { useStore } from '../context';
import { formatPrice } from '../utils/formatPrice';
import { localizeCategory } from '../utils/localization';
import type { Product } from '../types';

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { addToCart, user } = useStore();
  const [message, setMessage] = useState('');
  async function add(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (!user) {
        setMessage('Войдите, чтобы добавить товар в корзину');
        return;
      }
      await addToCart(product.id);
      setMessage('Товар добавлен в корзину');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Не удалось добавить товар.');
    }
    setTimeout(() => setMessage(''), 2600);
  }
  return (
    <article className="product-card" style={{ '--delay': `${index * 60}ms` } as CSSProperties}>
      <Link to={`/products/${product.id}`} className="product-image-link">
        <img className="product-image" src={product.imageUrl} alt={product.name} loading="lazy" />
        <span className="image-label">
          {product.popular ? 'Любимое в KIN' : localizeCategory(product.category)}
        </span>
        <span className="image-arrow">
          <ArrowUpRight size={17} />
        </span>
      </Link>
      <div className="product-info">
        <div className="product-heading">
          <div>
            <p className="eyebrow">{localizeCategory(product.category)}</p>
            <Link to={`/products/${product.id}`} className="product-name">
              {product.name}
            </Link>
          </div>
          <span className="product-price">{formatPrice(product.price)}</span>
        </div>
        <p className="product-desc">{product.description}</p>
        <div className="product-bottom">
          <button className="add-button" onClick={add} disabled={!product.available}>
            {product.available ? 'В корзину' : 'Нет в наличии'}
            <Plus size={16} />
          </button>
          {message && (
            <span className="toast-text" role="status">
              {message}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

export function SectionTitle({
  kicker,
  title,
  link,
  to,
}: {
  kicker: string;
  title: string;
  link?: string;
  to?: string;
}) {
  return (
    <div className="section-title">
      <div>
        <p className="eyebrow">{kicker}</p>
        <h2>{title}</h2>
      </div>
      {link && to && (
        <Link className="line-link" to={to}>
          {link}
          <ArrowRight size={16} />
        </Link>
      )}
    </div>
  );
}
