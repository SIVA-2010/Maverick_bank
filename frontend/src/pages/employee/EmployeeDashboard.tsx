// src/pages/employee/EmployeeDashboard.tsx
import React, { useEffect, useState } from 'react';
import PageLayout from '../../components/layout/PageLayout';
import { employeeAPI } from '../../services/api';

const EmployeeDashboard = () => {
  const [stats, setStats] = useState({ pendingAccounts: 0, closeRequests: 0, pendingLoans: 0, customers: 0 });

  useEffect(() => {
    Promise.all([
      employeeAPI.getPendingAccounts(),
      employeeAPI.getCloseRequests(),
      employeeAPI.getPendingLoans(),
      employeeAPI.getAllCustomers(),
    ]).then(([pa, cr, pl, cu]) => {
      setStats({
        pendingAccounts: pa.data.data?.length || 0,
        closeRequests: cr.data.data?.length || 0,
        pendingLoans: pl.data.data?.length || 0,
        customers: cu.data.data?.length || 0,
      });
    }).catch(() => {});
  }, []);

  return (
    <PageLayout title="Employee Dashboard">
      <div className="stats-grid">
        <div className="stat-card warning"><div className="stat-icon">⏳</div><div className="stat-info"><h3>{stats.pendingAccounts}</h3><p>Pending Account Approvals</p></div></div>
        <div className="stat-card danger"><div className="stat-icon">🔒</div><div className="stat-info"><h3>{stats.closeRequests}</h3><p>Account Closure Requests</p></div></div>
        <div className="stat-card accent"><div className="stat-icon">📋</div><div className="stat-info"><h3>{stats.pendingLoans}</h3><p>Pending Loan Reviews</p></div></div>
        <div className="stat-card"><div className="stat-icon">👥</div><div className="stat-info"><h3>{stats.customers}</h3><p>Total Customers</p></div></div>
      </div>
      <div className="card">
        <h2 className="card-title" style={{ marginBottom: 16 }}>Quick Actions</h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <a href="/employee/accounts" className="btn btn-primary">✅ Review Account Requests</a>
          <a href="/employee/loans" className="btn btn-accent">💰 Review Loan Applications</a>
          <a href="/employee/transactions" className="btn btn-outline">📊 View Transactions</a>
        </div>
      </div>
    </PageLayout>
  );
};

export default EmployeeDashboard;
