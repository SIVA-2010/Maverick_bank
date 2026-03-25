// src/components/layout/Sidebar.tsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const customerLinks = [
  { to: '/customer/dashboard', icon: '🏠', label: 'Dashboard' },
  { to: '/customer/accounts', icon: '🏦', label: 'My Accounts' },
  { to: '/customer/transactions', icon: '💸', label: 'Transactions' },
  { to: '/customer/loans', icon: '💰', label: 'Loans' },
  { to: '/customer/beneficiaries', icon: '👥', label: 'Beneficiaries' },
];
const employeeLinks = [
  { to: '/employee/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/employee/accounts', icon: '✅', label: 'Account Approvals' },
  { to: '/employee/loans', icon: '📋', label: 'Loan Reviews' },
  { to: '/employee/transactions', icon: '📈', label: 'Transaction Reports' },
];
const adminLinks = [
  { to: '/admin/dashboard', icon: '⚙️', label: 'Dashboard' },
  { to: '/admin/users', icon: '👤', label: 'Manage Users' },
];

const Sidebar = () => {
  const { user, logout, isCustomer, isEmployee, isAdmin } = useAuth();
  const navigate = useNavigate();
  const links = isCustomer ? customerLinks : isAdmin ? adminLinks : employeeLinks;

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div style={{ fontSize: 28 }}>🏛️</div>
        <h2>Maverick <span>Bank</span></h2>
      </div>
      <div className="sidebar-section-label">
        {isCustomer ? 'Customer Portal' : isAdmin ? 'Admin Portal' : 'Employee Portal'}
      </div>
      <nav className="sidebar-nav">
        {links.map(link => (
          <NavLink key={link.to} to={link.to} className={({ isActive }) => isActive ? 'active' : ''}>
            <span className="nav-icon">{link.icon}</span> {link.label}
          </NavLink>
        ))}
      </nav>
      <div style={{ marginTop: 'auto', padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginBottom: 8 }}>
          {user?.firstName} {user?.lastName}
        </div>
        <button onClick={handleLogout} className="btn btn-outline" style={{ width: '100%', color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.3)' }}>
          🚪 Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
