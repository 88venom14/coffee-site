import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export function AboutPage() {
  return (
    <main className="page-shell about-page">
      <div className="page-intro">
        <p className="eyebrow">Люди, которые готовят ваш кофе</p>
        <h1>
          Немного больше <em>KIN.</em>
        </h1>
        <p>Хороший кофе объединяет людей. В этом и есть вся идея.</p>
      </div>
      <div className="about-story">
        <div className="story-image">
          <img
            src="https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=1400&q=85"
            alt="Солнечный свет в окне кофейни"
          />
        </div>
        <div className="story-copy">
          <p className="eyebrow">Своя кофейня по соседству</p>
          <h2>
            Заходите за кофе.
            <br />
            <em>Оставайтесь ради остального.</em>
          </h2>
          <p>
            KIN начался с простой идеи: хорошая чашка кофе может сделать обычный день чуточку
            особенным. Мы сотрудничаем с внимательными обжарщиками, местными пекарями и людьми,
            которым важны детали.
          </p>
          <p>
            Никакой суеты и спешки. Только вкусные вещи, приготовленные людьми, которые рады вам.
          </p>
          <span className="about-signature">
            До скорой встречи, <em>команда KIN</em>
          </span>
        </div>
      </div>
      <div className="values-row">
        <div>
          <span>01</span>
          <h3>Хорошие ингредиенты</h3>
          <p>Сезонные зёрна, ответственные поставки и ингредиенты, в которых мы уверены.</p>
        </div>
        <div>
          <span>02</span>
          <h3>Приготовлено с заботой</h3>
          <p>Каждый напиток готовим после заказа. У хорошего вкуса нет короткого пути.</p>
        </div>
        <div>
          <span>03</span>
          <h3>Место для каждого</h3>
          <p>Ваш привычный столик, первый визит или короткое приветствие — мы всегда вам рады.</p>
        </div>
      </div>
      <div className="about-cta">
        <p className="eyebrow">Чайник уже греется</p>
        <h2>Заходите в гости.</h2>
        <Link className="button button-dark" to="/products">
          Заглянуть в меню <ArrowRight size={16} />
        </Link>
      </div>
    </main>
  );
}
