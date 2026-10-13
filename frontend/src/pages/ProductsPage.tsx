import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Heart, X } from 'lucide-react';
import { api } from '../api';
import { CustomSelect } from '../components/CustomSelect';
import { ProductCard } from '../components/ProductCard';
import type { Product } from '../types';

const categories = [
  ['', 'Все категории'],
  ['coffee', 'Кофе'],
  ['tea', 'Чай'],
  ['cold-drinks', 'Холодные напитки'],
  ['pastries', 'Выпечка'],
  ['desserts', 'Десерты'],
  ['accessories', 'Аксессуары'],
];

export function ProductsPage() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchInput, setSearchInput] = useState(params.get('search') || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const search = params.get('search') || '';
  const category = params.get('category') || '';
  const sort = params.get('sort') || '';
  const popular = params.get('popular') || '';
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    const query = params.toString();
    api
      .products(query ? `?${query}` : '', { signal: controller.signal })
      .then(setProducts)
      .catch((e) => {
        if (!controller.signal.aborted) setError(e.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [params]);
  useEffect(() => {
    setSearchInput(search);
  }, [search]);
  useEffect(() => {
    if (searchInput === search) return;
    const timeout = window.setTimeout(() => {
      const next = new URLSearchParams(params);
      searchInput ? next.set('search', searchInput) : next.delete('search');
      setParams(next);
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [params, search, searchInput, setParams]);
  const set = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    value ? next.set(key, value) : next.delete(key);
    setParams(next);
  };
  return (
    <main className="page-shell">
      <div className="page-intro">
        <p className="eyebrow">Всё самое вкусное</p>
        <h1>
          Найдите свой <em>любимый вкус.</em>
        </h1>
        <p>Любимые напитки и угощения, которые сделают день чуточку лучше.</p>
      </div>
      <div className="filter-bar">
        <label className="search-box">
          <span>⌕</span>
          <input
            value={searchInput}
            maxLength={120}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Найти что-нибудь вкусное…"
            aria-label="Поиск по товарам"
          />
          {searchInput && (
            <button onClick={() => setSearchInput('')} aria-label="Очистить поиск">
              <X size={15} />
            </button>
          )}
        </label>
        <CustomSelect
          label="Сортировка товаров"
          value={sort}
          onChange={(value) => set('sort', value)}
          options={[
            { value: '', label: 'По умолчанию' },
            { value: 'price_asc', label: 'Сначала недорогие' },
            { value: 'price_desc', label: 'Сначала дорогие' },
            { value: 'newest', label: 'Сначала новинки' },
            { value: 'popular', label: 'Сначала популярные' },
          ]}
        />
        <button
          className={popular ? 'filter-chip active' : 'filter-chip'}
          onClick={() => set('popular', popular ? '' : 'true')}
        >
          Любимое в Coffee <Heart size={14} />
        </button>
      </div>
      <section className="category-filter" aria-label="Фильтр по категориям">
        <div className="category-filter-heading">
          <span className="eyebrow">Выберите настроение</span>
          <span className="category-filter-caption">Категории</span>
        </div>
        <div className="category-list" role="group" aria-label="Категории товаров">
          {categories.map(([slug, label]) => (
            <button
              className={category === slug ? 'category-pill active' : 'category-pill'}
              key={slug || 'all'}
              type="button"
              aria-pressed={category === slug}
              onClick={() => set('category', slug)}
            >
              <span>{label}</span>
              <span className="category-pill-mark" aria-hidden="true">↗</span>
            </button>
          ))}
        </div>
      </section>
      <div className="results-meta">
        <span role="status" aria-live="polite">
          {loading ? 'Ищем любимые товары…' : `Позиций: ${products.length}`}
        </span>
        <span>
          Каждый день свежие <span className="tiny-spark">✳</span>
        </span>
      </div>
      {error ? (
        <div className="state-card">
          {error} <button onClick={() => setParams(new URLSearchParams(params))}>Повторить</button>
        </div>
      ) : products.length === 0 && !loading ? (
        <div className="empty-state">
          <span className="empty-spark">✳</span>
          <h2>На этой полке пока пусто.</h2>
          <p>Попробуйте изменить запрос или посмотреть весь ассортимент.</p>
          <button className="button button-dark" onClick={() => setParams(new URLSearchParams())}>
            Сбросить фильтры
          </button>
        </div>
      ) : (
        <div
          className={`product-grid catalog-grid${loading && products.length === 0 ? ' catalog-grid-loading' : ''}`}
          aria-busy={loading}
        >
          {loading && products.length === 0
            ? Array.from({ length: search || category || popular ? 6 : 14 }, (_, index) => (
                <article className="product-card product-card-skeleton" key={`skeleton-${index}`} aria-hidden="true">
                  <div className="product-image-link skeleton-surface" />
                  <div className="product-info">
                    <div className="skeleton-heading">
                      <span className="skeleton-surface skeleton-category" />
                      <span className="skeleton-surface skeleton-price" />
                    </div>
                    <span className="skeleton-surface skeleton-name" />
                    <span className="skeleton-surface skeleton-description" />
                    <span className="skeleton-surface skeleton-description skeleton-description-short" />
                    <span className="skeleton-surface skeleton-button" />
                  </div>
                </article>
              ))
            : products.map((p) => <ProductCard product={p} key={p.id} />)}
        </div>
      )}
    </main>
  );
}
