import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { CustomersPage } from '../pages/CustomersPage';
import { CustomerDetailPage } from '../pages/CustomerDetailPage';
import { ProductsPage } from '../pages/ProductsPage';
import { ProductDetailPage } from '../pages/ProductDetailPage';
import { StockMovementsPage } from '../pages/StockMovementsPage';
import { ChallansPage } from '../pages/ChallansPage';
import { ChallanFormPage } from '../pages/ChallanFormPage';
import { ChallanDetailPage } from '../pages/ChallanDetailPage';
import { InvoicesPage } from '../pages/InvoicesPage';
import { InvoiceDetailPage } from '../pages/InvoiceDetailPage';
import { ReportsPage } from '../pages/ReportsPage';
import { UsersPage } from '../pages/UsersPage';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { Role } from '../types';

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: Role[] }> = ({
  children,
  allowedRoles,
}) => {
  const { user, loading, hasRole } = useAuth();

  if (loading) return <LoadingSkeleton rows={6} />;
  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.some((r) => hasRole(r))) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />

        {/* CRM */}
        <Route
          path="customers"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SALES', 'ACCOUNTS']}>
              <CustomersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="customers/:id"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SALES', 'ACCOUNTS']}>
              <CustomerDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Products & Inventory */}
        <Route
          path="products"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SALES', 'WAREHOUSE']}>
              <ProductsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="products/:id"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SALES', 'WAREHOUSE']}>
              <ProductDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="inventory"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'WAREHOUSE']}>
              <StockMovementsPage />
            </ProtectedRoute>
          }
        />

        {/* Sales Challans */}
        <Route
          path="challans"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS']}>
              <ChallansPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="challans/new"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SALES']}>
              <ChallanFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="challans/:id"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS']}>
              <ChallanDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="challans/:id/edit"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SALES']}>
              <ChallanFormPage />
            </ProtectedRoute>
          }
        />

        {/* Invoices */}
        <Route
          path="invoices"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'ACCOUNTS']}>
              <InvoicesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="invoices/:id"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'ACCOUNTS']}>
              <InvoiceDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Reports */}
        <Route
          path="reports"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'ACCOUNTS']}>
              <ReportsPage />
            </ProtectedRoute>
          }
        />

        {/* Admin User Management */}
        <Route
          path="users"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <UsersPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
