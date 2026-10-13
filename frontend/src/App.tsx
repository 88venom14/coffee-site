import { Navigate, Route, Routes } from 'react-router-dom';
import { SiteLayout } from './components/SiteChrome';
import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { AuthPage } from './pages/AuthPage';
import { AccountPage } from './pages/AccountPage';
import { OrderDetail } from './pages/OrderDetailPage';
import { AboutPage } from './pages/AboutPage';
import { NotFoundPage } from './pages/NotFoundPage';

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <SiteLayout>
            <HomePage />
          </SiteLayout>
        }
      />
      <Route
        path="/products"
        element={
          <SiteLayout>
            <ProductsPage />
          </SiteLayout>
        }
      />
      <Route
        path="/products/:id"
        element={
          <SiteLayout>
            <ProductDetailPage />
          </SiteLayout>
        }
      />
      <Route
        path="/cart"
        element={
          <SiteLayout>
            <CartPage />
          </SiteLayout>
        }
      />
      <Route
        path="/checkout"
        element={
          <SiteLayout>
            <CheckoutPage />
          </SiteLayout>
        }
      />
      <Route
        path="/login"
        element={
          <SiteLayout>
            <AuthPage />
          </SiteLayout>
        }
      />
      <Route
        path="/register"
        element={
          <SiteLayout>
            <AuthPage register />
          </SiteLayout>
        }
      />
      <Route
        path="/about"
        element={
          <SiteLayout>
            <AboutPage />
          </SiteLayout>
        }
      />
      <Route
        path="/account"
        element={
          <SiteLayout>
            <AccountPage />
          </SiteLayout>
        }
      />
      <Route
        path="/orders"
        element={<Navigate to="/account#orders" replace />}
      />
      <Route
        path="/orders/:id"
        element={
          <SiteLayout>
            <OrderDetail />
          </SiteLayout>
        }
      />
      <Route
        path="*"
        element={
          <SiteLayout>
            <NotFoundPage />
          </SiteLayout>
        }
      />
    </Routes>
  );
}
