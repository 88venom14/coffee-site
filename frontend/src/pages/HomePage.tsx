import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Heart } from 'lucide-react';
import { api } from '../api';
import { ProductCard, SectionTitle } from '../components/ProductCard';
import type { Product } from '../types';

export function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState('');
  useEffect(() => {
    api
      .products()
      .then(setProducts)
      .catch((e) => setError(e.message));
  }, []);
  return (
    <>
      <main>
        <section className="hero">
          <div className="hero-copy">
            <div className="hero-kicker">
              <span /> Кофейная традиция вашего района
            </div>
            <h1 className="hero-title">
              Хорошие вещи
              <br />
              <em>не спешат.</em>
            </h1>
            <p>
              Кофе от ответственных обжарщиков, приготовленный не спеша и с заботой. Найдите свой
              любимый напиток в KIN.
            </p>
            <div className="hero-actions">
              <Link className="button button-dark" to="/products">
                Перейти в меню <ArrowRight size={17} />
              </Link>
              <Link className="hero-secondary" to="/about">
                Немного о нас <ArrowUpRight size={16} />
              </Link>
            </div>
            <div className="hero-note">
              <div className="avatar-stack">
                <span>J</span>
                <span>M</span>
                <span>A</span>
              </div>
              <span>Любимый кофе соседей, каждый день свежий</span>
            </div>
          </div>
          <div className="hero-visual">
            <img
              src="https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1400&q=90"
              alt="Свежеприготовленный кофе в керамической чашке"
            />
            <div className="hero-image-caption">
              <span className="caption-mark">KIN</span>
              <span>
                Не спеша начинается утро
                <br />— здесь.
              </span>
              <ArrowUpRight size={19} />
            </div>
            <div className="hero-stamp">
              НЕБОЛЬШИЕ ПАРТИИ
              <br />
              С БОЛЬШОЙ ЛЮБОВЬЮ <Heart size={15} />
            </div>
          </div>
          <div className="hero-side-note">РАБОТАЕМ С ЗАБОТОЙ · 2024</div>
        </section>
        <section className="section popular-section">
          <SectionTitle
            kicker="Хорошее место для начала"
            title="Популярное на этой неделе"
            link="Смотреть всё меню"
            to="/products"
          />
          {error ? (
            <p className="state-text">{error}</p>
          ) : products.length === 0 ? (
            <p className="state-text">Готовим кофемолку…</p>
          ) : (
            <div className="product-rail">
              {products
                .filter((p) => p.popular)
                .slice(0, 6)
                .map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
            </div>
          )}
        </section>
        <section className="manifesto">
          <div className="manifesto-mark">“</div>
          <p>
            Не просто чашка кофе.
            <br />
            <em>Маленькая пауза, которая принадлежит вам.</em>
          </p>
          <span>В СТИЛЕ KIN</span>
        </section>
        <section className="section explore-section">
          <SectionTitle
            kicker="На каждый день"
            title="Найдётся что-то для каждого"
            link="Все 14 позиций"
            to="/products"
          />
          {products.length > 0 ? (
            <div className="product-grid home-grid">
              {products
                .filter((p) => !p.popular)
                .slice(0, 4)
                .map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
            </div>
          ) : (
            <div className="empty-grid" />
          )}
          <div className="center-action">
            <Link className="button button-outline" to="/products">
              Все товары <ArrowRight size={17} />
            </Link>
          </div>
        </section>
        <section className="home-about">
          <div className="about-image">
            <img
              src="https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=1200&q=85"
              alt="Уютный интерьер кофейни"
            />
            <span>БУДЬТЕ СОБОЙ</span>
          </div>
          <div className="about-copy">
            <p className="eyebrow">Больше, чем утренний кофе</p>
            <h2>
              Хороший кофе.
              <br />
              <em>Хорошая компания.</em>
            </h2>
            <p>
              Мы верим, что лучшие моменты происходят за столом. Поэтому выбираем отличные зёрна,
              печём что-нибудь тёплое и всегда оставляем место для вас.
            </p>
            <Link className="line-link" to="/about">
              Больше о KIN <ArrowRight size={16} />
            </Link>
            <div className="about-signature">
              Ваши друзья из KIN <span>✳</span>
            </div>
          </div>
        </section>
        <section className="visit-strip">
          <div>
            <p className="eyebrow">Ваш столик ждёт</p>
            <h2>Заходите, выдохните.</h2>
          </div>
          <p>Свежий кофе, тёплая выпечка — и больше никуда не нужно спешить.</p>
          <Link className="button button-cream" to="/products">
            Найти любимое <ArrowRight size={16} />
          </Link>
        </section>
      </main>
    </>
  );
}
