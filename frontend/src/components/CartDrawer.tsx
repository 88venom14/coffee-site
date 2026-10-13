import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useStore } from '../context';
import { formatPrice } from '../utils/formatPrice';

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { cart, user, updateCart, removeFromCart } = useStore();
  const [visible, setVisible] = useState(open);
  const [closing, setClosing] = useState(false);
  const [error, setError] = useState('');
  const [busyItem, setBusyItem] = useState<number | null>(null);
  const panelRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      setVisible(true);
      setClosing(false);
      return;
    }
    if (!visible) return;

    setClosing(true);
    const timeout = window.setTimeout(() => {
      setVisible(false);
      setClosing(false);
    }, 220);
    return () => window.clearTimeout(timeout);
  }, [open, visible]);

  useEffect(() => {
    if (!open || !visible) return;
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const bodyPaddingRight = Number.parseFloat(getComputedStyle(document.body).paddingRight) || 0;

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${bodyPaddingRight + scrollbarWidth}px`;
    }
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !panelRef.current) return;

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
      previousFocus?.focus();
    };
  }, [open, visible, onClose]);

  async function changeQuantity(itemId: number, quantity: number) {
    setError('');
    setBusyItem(itemId);
    try {
      if (quantity < 1) await removeFromCart(itemId);
      else await updateCart(itemId, quantity);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось обновить корзину.');
    } finally {
      setBusyItem(null);
    }
  }

  async function removeItem(itemId: number) {
    setError('');
    setBusyItem(itemId);
    try {
      await removeFromCart(itemId);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось удалить товар.');
    } finally {
      setBusyItem(null);
    }
  }

  if (!visible) return null;

  return (
    <div className={`cart-drawer-layer${closing ? ' closing' : ''}`}>
      <button
        className="cart-drawer-backdrop"
        type="button"
        aria-label="Закрыть корзину"
        onClick={onClose}
      />
      <aside className="cart-drawer-panel" ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="cart-drawer-title">
        <div className="cart-drawer-header">
          <div>
            <p className="eyebrow">Ваш заказ</p>
            <h2 id="cart-drawer-title">Корзина <span>· {cart.items.length}</span></h2>
          </div>
          <button ref={closeButtonRef} className="cart-drawer-close" type="button" onClick={onClose} aria-label="Закрыть корзину">
            <X size={20} />
          </button>
        </div>

        {error && <p className="cart-drawer-error" role="alert">{error}</p>}

        {cart.items.length === 0 ? (
          <div className="cart-drawer-empty">
            <span className="empty-spark"><ShoppingBag size={20} /></span>
            <h3>Корзина пока пуста</h3>
            <p>{user ? 'Выберите любимый напиток или что-нибудь к нему.' : 'Войдите, чтобы увидеть сохранённые товары.'}</p>
            <Link className="button button-dark" to={user ? '/products' : '/login'} onClick={onClose}>
              {user ? 'Перейти в меню' : 'Войти'} <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <>
            <div className="cart-drawer-items">
              {cart.items.map((item) => (
                <article className="cart-drawer-item" key={item.id}>
                  <Link to={`/products/${item.productId}`} className="cart-drawer-thumb" onClick={onClose}>
                    <img src={item.imageUrl} alt="" />
                  </Link>
                  <div className="cart-drawer-item-copy">
                    <Link to={`/products/${item.productId}`} className="cart-drawer-item-name" onClick={onClose}>
                      {item.name}
                    </Link>
                    <span>{formatPrice(item.price)} за шт.</span>
                    <div className="cart-drawer-quantity">
                      <button
                        type="button"
                        disabled={busyItem === item.id}
                        onClick={() => void changeQuantity(item.id, item.quantity - 1)}
                        aria-label={`Уменьшить количество: ${item.name}`}
                      >
                        <Minus size={13} />
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        disabled={busyItem === item.id || item.quantity >= 99}
                        onClick={() => void changeQuantity(item.id, item.quantity + 1)}
                        aria-label={`Увеличить количество: ${item.name}`}
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>
                  <div className="cart-drawer-item-end">
                    <strong>{formatPrice(item.subtotal)}</strong>
                    <button
                      type="button"
                      disabled={busyItem === item.id}
                      onClick={() => void removeItem(item.id)}
                      aria-label={`Удалить ${item.name}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <div className="cart-drawer-footer">
              <div className="cart-drawer-total">
                <span>Итого</span>
                <strong>{formatPrice(cart.total)}</strong>
              </div>
              <Link className="button button-dark full-button" to="/checkout" onClick={onClose}>
                Оформить заказ <ArrowRight size={16} />
              </Link>
              <button className="cart-drawer-view" type="button" onClick={() => { onClose(); navigate('/cart'); }}>
                Открыть корзину целиком
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
