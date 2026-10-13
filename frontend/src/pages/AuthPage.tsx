import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Coffee, Eye, EyeOff } from 'lucide-react';
import { api } from '../api';
import { useStore } from '../context';

function limitUtf8Bytes(value: string, limit: number) {
  let result = '';
  let bytes = 0;
  for (const character of value) {
    const size = new TextEncoder().encode(character).length;
    if (bytes + size > limit) break;
    result += character;
    bytes += size;
  }
  return result;
}

export function AuthPage({ register = false }: { register?: boolean }) {
  const { signIn } = useStore();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (email.trim().length > 254) {
      setError('Электронная почта не должна быть длиннее 254 символов.');
      return;
    }
    if (new TextEncoder().encode(password).length > 72) {
      setError('Пароль не должен быть длиннее 72 байт.');
      return;
    }
    if (register && (Array.from(name.trim()).length < 2 || Array.from(name.trim()).length > 100)) {
      setError('Имя должно содержать от 2 до 100 символов.');
      return;
    }
    if (register && Array.from(password).length < 8) {
      setError('Пароль должен содержать не менее 8 символов.');
      return;
    }
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
          Coffee
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
                maxLength={100}
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
              <small>От 2 до 100 символов.</small>
            </label>
          )}
          <label>
            Электронная почта
            <input
              type="email"
              required
              maxLength={254}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <small>Не более 254 символов.</small>
          </label>
          <label>
            Пароль
            <span className="password-input-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={register ? 8 : undefined}
                maxLength={72}
                value={password}
                onChange={(e) => setPassword(limitUtf8Bytes(e.target.value, 72))}
                autoComplete={register ? 'new-password' : 'current-password'}
                aria-describedby="password-hint"
              />
              <button
                className="password-visibility"
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                aria-pressed={showPassword}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </span>
            <small id="password-hint">
              {register ? 'Не менее 8 символов; максимум — 72 байта.' : 'Максимум — 72 байта.'}
            </small>
          </label>
          {register && (
            <label>
              Повторите пароль
              <span className="password-input-wrap">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  required
                  maxLength={72}
                  value={confirm}
                  onChange={(e) => setConfirm(limitUtf8Bytes(e.target.value, 72))}
                  autoComplete="new-password"
                  aria-describedby="confirm-hint"
                />
                <button
                  className="password-visibility"
                  type="button"
                  onClick={() => setShowConfirm((visible) => !visible)}
                  aria-label={showConfirm ? 'Скрыть повтор пароля' : 'Показать повтор пароля'}
                  aria-pressed={showConfirm}
                >
                  {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </span>
              <small id="confirm-hint">Максимум — 72 байта.</small>
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
