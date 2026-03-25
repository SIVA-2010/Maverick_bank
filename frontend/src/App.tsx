// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './assets/styles/global.css';

import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import AccountsPage from './pages/customer/AccountsPage';
import AccountDetailPage from './pages/customer/AccountDetailPage';
import TransactionsPage from './pages/customer/TransactionsPage';
import LoansPage from './pages/customer/LoansPage';
import BeneficiariesPage from './pages/customer/BeneficiariesPage';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import AccountApprovalsPage from './pages/employee/AccountApprovalsPage';
import LoanReviewPage from './pages/employee/LoanReviewPage';
import TransactionReportsPage from './pages/employee/TransactionReportsPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsersPage from './pages/admin/ManageUsersPage';
import NotFoundPage from './pages/NotFoundPage';

// ---- Protected Route ----
const ProtectedRoute = ({ children, roles }: { children: JSX.Element; roles?: string[] }) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/unauthorized" replace />;
  return children;
};

const AppRoutes = () => {
  const { user, isAuthenticated } = useAuth();

  const getDefaultRoute = () => {
    if (!user) return '/login';
    if (user.role === 'CUSTOMER') return '/customer/dashboard';
    if (user.role === 'BANK_EMPLOYEE') return '/employee/dashboard';
    if (user.role === 'ADMIN') return '/admin/dashboard';
    return '/login';
  };

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Navigate to={getDefaultRoute()} replace />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to={getDefaultRoute()} /> : <LoginPage />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to={getDefaultRoute()} /> : <RegisterPage />} />

      {/* Customer */}
      <Route path="/customer/dashboard" element={<ProtectedRoute roles={['CUSTOMER']}><CustomerDashboard /></ProtectedRoute>} />
      <Route path="/customer/accounts" element={<ProtectedRoute roles={['CUSTOMER']}><AccountsPage /></ProtectedRoute>} />
      <Route path="/customer/accounts/:accountNumber" element={<ProtectedRoute roles={['CUSTOMER']}><AccountDetailPage /></ProtectedRoute>} />
      <Route path="/customer/transactions" element={<ProtectedRoute roles={['CUSTOMER']}><TransactionsPage /></ProtectedRoute>} />
      <Route path="/customer/loans" element={<ProtectedRoute roles={['CUSTOMER']}><LoansPage /></ProtectedRoute>} />
      <Route path="/customer/beneficiaries" element={<ProtectedRoute roles={['CUSTOMER']}><BeneficiariesPage /></ProtectedRoute>} />

      {/* Employee */}
      <Route path="/employee/dashboard" element={<ProtectedRoute roles={['BANK_EMPLOYEE', 'ADMIN']}><EmployeeDashboard /></ProtectedRoute>} />
      <Route path="/employee/accounts" element={<ProtectedRoute roles={['BANK_EMPLOYEE', 'ADMIN']}><AccountApprovalsPage /></ProtectedRoute>} />
      <Route path="/employee/loans" element={<ProtectedRoute roles={['BANK_EMPLOYEE', 'ADMIN']}><LoanReviewPage /></ProtectedRoute>} />
      <Route path="/employee/transactions" element={<ProtectedRoute roles={['BANK_EMPLOYEE', 'ADMIN']}><TransactionReportsPage /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin/dashboard" element={<ProtectedRoute roles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute roles={['ADMIN']}><ManageUsersPage /></ProtectedRoute>} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

const App = () => (
  <AuthProvider>
    <Router>
      <AppRoutes />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </Router>
  </AuthProvider>
);

export default App;
