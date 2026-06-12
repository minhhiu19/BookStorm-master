import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Layouts
import Layout from './components/layout/Layout';
import AdminLayout from './components/layout/AdminLayout';
import StaffLayout from './components/layout/StaffLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Customer Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import BookDetail from './pages/BookDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Wishlist from './pages/Wishlist';
import Contact from './pages/Contact';

// Profile Pages
import Profile from './pages/profile/Profile';
import MyOrders from './pages/profile/MyOrders';
import OrderDetail from './pages/profile/OrderDetail';
import Addresses from './pages/profile/Addresses';
import Notifications from './pages/profile/Notifications';
import ChangePassword from './pages/profile/ChangePassword';
import MyReturns from './pages/profile/MyReturns';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminCategories from './pages/admin/Categories';
import AdminOrders from './pages/admin/Orders';
import AdminUsers from './pages/admin/Users';
import AdminReviews from './pages/admin/Reviews';
import AdminCoupons from './pages/admin/Coupons';
import AdminBanners from './pages/admin/Banners';
import AdminShipping from './pages/admin/Shipping';
import AdminReturns from './pages/admin/Returns';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminProductForm from './pages/admin/ProductForm';
import RevenueReports from './pages/admin/RevenueReports';
import AdminInventory from './pages/admin/Inventory';
import AdminBestSellers from './pages/admin/BestSellers';
import AdminContactMessages from './pages/admin/ContactMessages';

// Staff Pages
import StaffDashboard from './pages/staff/StaffDashboard';
import StaffOrders from './pages/staff/StaffOrders';
import StaffInventory from './pages/staff/StaffInventory';
import StaffProductEdit from './pages/staff/StaffProductEdit';
import StaffReturns from './pages/staff/StaffReturns';
import StaffSupport from './pages/staff/StaffSupport';

// Components
import PrivateRoute from './components/common/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              fontFamily: 'var(--font-body)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-text)',
              color: 'var(--color-bg-white)',
              fontSize: '14px',
            },
          }}
        />
        <Routes>
          {/* Public Customer Routes */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/book/:slug" element={<BookDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/contact" element={<Contact />} />

            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected Customer Routes */}
            <Route element={<PrivateRoute />}>
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-success/:orderCode" element={<OrderSuccess />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/profile" element={<Profile />}>
                <Route path="orders" element={<MyOrders />} />
                <Route path="orders/:orderCode" element={<OrderDetail />} />
                <Route path="addresses" element={<Addresses />} />
                <Route path="returns" element={<MyReturns />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="change-password" element={<ChangePassword />} />
              </Route>
            </Route>
          </Route>

          {/* Admin Routes */}
          <Route element={<PrivateRoute roles={['ADMIN']} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<Dashboard />} />
              <Route path="/admin/books" element={<AdminProducts />} />
              <Route path="/admin/books/new" element={<AdminProductForm />} />
              <Route path="/admin/books/:id/edit" element={<AdminProductForm />} />
              <Route path="/admin/categories" element={<AdminCategories />} />
              <Route path="/admin/inventory" element={<AdminInventory />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/reviews" element={<AdminReviews />} />
              <Route path="/admin/coupons" element={<AdminCoupons />} />
              <Route path="/admin/banners" element={<AdminBanners />} />
              <Route path="/admin/shipping" element={<AdminShipping />} />
              <Route path="/admin/returns" element={<AdminReturns />} />
              <Route path="/admin/notifications" element={<AdminNotifications />} />
              <Route path="/admin/reports" element={<RevenueReports />} />
              <Route path="/admin/best-sellers" element={<AdminBestSellers />} />
              <Route path="/admin/contacts" element={<AdminContactMessages />} />
            </Route>
          </Route>

          {/* Staff Routes */}
          <Route element={<PrivateRoute roles={['ADMIN', 'STAFF']} />}>
            <Route element={<StaffLayout />}>
              <Route path="/staff" element={<Navigate to="/staff/dashboard" replace />} />
              <Route path="/staff/dashboard" element={<StaffDashboard />} />
              <Route path="/staff/orders" element={<StaffOrders />} />
              <Route path="/staff/inventory" element={<StaffInventory />} />
              <Route path="/staff/books/:id/edit" element={<StaffProductEdit />} />
              <Route path="/staff/returns" element={<StaffReturns />} />
              <Route path="/staff/support" element={<StaffSupport />} />
            </Route>
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
