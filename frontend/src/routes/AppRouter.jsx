import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import CustomerLayout from '../components/CustomerLayout';
import MenuPage from '../features/menu/MenuPage';
import CartPage from '../features/cart/CartPage';
import CheckoutPage from '../features/order/CheckoutPage';
import OrderStatusPage from '../features/order/OrderStatusPage';
import ReservationPage from '../features/reservation/ReservationPage';
import LoginPage from '../features/admin/LoginPage';
import AdminPlaceholder from '../features/admin/AdminPlaceholder';
import ProtectedRoute from './ProtectedRoute';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Customer app */}
        <Route element={<CustomerLayout />}>
          <Route index element={<MenuPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="track" element={<OrderStatusPage />} />
          <Route path="book" element={<ReservationPage />} />
        </Route>

        {/* Admin portal */}
        <Route path="/admin/login" element={<LoginPage />} />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <AdminPlaceholder />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
