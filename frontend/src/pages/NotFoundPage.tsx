import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export function NotFoundPage() {
  return (
    <main className="page-shell center-page">
      <div className="empty-state">
        <span className="empty-spark">404</span>
        <h2>Эта страница потерялась.</h2>
        <p>Не нашли нужное, зато всегда можно выпить хорошего кофе.</p>
        <Link to="/" className="button button-dark">
          На главную KIN <ArrowRight size={16} />
        </Link>
      </div>
    </main>
  );
}
