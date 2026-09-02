import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import CustomerLayout from '../components/CustomerLayout';
import AdminLayout from '../components/AdminLayout';
import MenuPage from '../features/menu/MenuPage';
import CartPage from '../features/cart/CartPage';
import CheckoutPage from '../features/order/CheckoutPage';
import OrderStatusPage from '../features/order/OrderStatusPage';
import ReservationPage from '../features/reservation/ReservationPage';
import LoginPage from '../features/admin/LoginPage';
import DashboardPage from '../features/admin/DashboardPage';
import MenuManagePage from '../features/admin/MenuManagePage';
import OrdersPage from '../features/admin/OrdersPage';
import KitchenPage from '../features/admin/KitchenPage';
import ReservationsPage from '../features/admin/ReservationsPage';
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
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="menu" element={<MenuManagePage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="kitchen" element={<KitchenPage />} />
          <Route path="reservations" element={<ReservationsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
