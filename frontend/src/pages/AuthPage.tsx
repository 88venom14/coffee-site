import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Coffee } from 'lucide-react';
import { api } from '../api';
import { useStore } from '../context';

export function AuthPage({ register = false }: { register?: boolean }) {
  const { signIn } = useStore();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (register && password !== confirm) {
      setError('Пароли не совпадают.');
      return;
    }
    setBusy(true);
    try {
      const current = register
        ? await api.register(name, email, password)
        : await api.login(email, password);
      await signIn(current);
      navigate(params.get('next') || '/account');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Что-то пошло не так. Попробуйте ещё раз.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="auth-shell">
      <div className="auth-art">
        <img
          src="https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1200&q=85"
          alt="Кофе в тихое утро"
        />
        <div>
          <span className="eyebrow">Для вас всегда найдётся место</span>
          <p>
            Не спешите.
            <br />
            <em>Оставайтесь подольше.</em>
          </p>
        </div>
      </div>
      <div className="auth-panel">
        <Link to="/" className="auth-brand">
          <span className="brand-icon">
            <Coffee size={17} />
          </span>
          KIN<span className="brand-dot">.</span>
        </Link>
        <p className="eyebrow">{register ? 'Добро пожаловать' : 'С возвращением'}</p>
        <h1>{register ? 'Давайте знакомиться.' : 'Рады видеть вас снова.'}</h1>
        <p className="auth-sub">
          {register
            ? 'С аккаунтом заказывать любимое будет ещё удобнее.'
            : 'Любимый напиток всего в паре шагов от вас.'}
        </p>
        <form onSubmit={submit} className="auth-form">
          {register && (
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
          )}
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
          <label>
            Пароль
            <input
              type="password"
              required
              minLength={8}
              maxLength={72}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={register ? 'new-password' : 'current-password'}
            />
            {register && <small>Не менее 8 символов.</small>}
          </label>
          {register && (
            <label>
              Повторите пароль
              <input
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
              />
            </label>
          )}
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button className="button button-dark full-button" disabled={busy}>
            {busy ? 'Подождите…' : register ? 'Создать аккаунт' : 'Войти'} <ArrowRight size={16} />
          </button>
        </form>
        <p className="auth-switch">
          {register ? 'Уже есть аккаунт?' : 'Впервые у нас?'}{' '}
          <Link to={register ? '/login' : '/register'}>
            {register ? 'Войти' : 'Создать аккаунт'}
          </Link>
        </p>
      </div>
    </main>
  );
}
