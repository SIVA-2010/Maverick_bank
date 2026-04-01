// src/pages/admin/AdminDashboard.tsx
import React, { useEffect, useState } from 'react';
import PageLayout from '../../components/layout/PageLayout';
import { adminAPI, User } from '../../services/api';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [employees, setEmployees] = useState<User[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);

  useEffect(() => {
    adminAPI.getEmployees().then(r => setEmployees(r.data.data || [])).catch(() => {});
    adminAPI.getCustomers().then(r => setCustomers(r.data.data || [])).catch(() => {});
  }, []);

  const activeCustomers = customers.filter(c => c.status === 'ACTIVE').length;
  const activeEmployees = employees.filter(e => e.status === 'ACTIVE').length;

  return (
    <PageLayout title="Admin Dashboard">
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-icon">👥</div><div className="stat-info"><h3>{customers.length}</h3><p>Total Customers</p></div></div>
        <div className="stat-card success"><div className="stat-icon">✅</div><div className="stat-info"><h3>{activeCustomers}</h3><p>Active Customers</p></div></div>
        <div className="stat-card accent"><div className="stat-icon">💼</div><div className="stat-info"><h3>{employees.length}</h3><p>Total Employees</p></div></div>
        <div className="stat-card warning"><div className="stat-icon">⚡</div><div className="stat-info"><h3>{activeEmployees}</h3><p>Active Employees</p></div></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Employees</h2>
            <Link to="/admin/users" className="btn btn-sm btn-outline">Manage All</Link>
          </div>
          {employees.slice(0, 5).map(e => (
            <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{e.firstName} {e.lastName}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{e.email}</div>
              </div>
              <span className={`badge badge-${e.status.toLowerCase()}`}>{e.status}</span>
            </div>
          ))}
          {employees.length === 0 && <div className="empty-state"><div className="empty-icon">💼</div><p>No employees yet</p></div>}
        </div>
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Customers</h2>
          </div>
          {customers.slice(0, 5).map(c => (
            <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{c.firstName} {c.lastName}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.email}</div>
              </div>
              <span className={`badge badge-${c.status.toLowerCase()}`}>{c.status}</span>
            </div>
          ))}
          {customers.length === 0 && <div className="empty-state"><div className="empty-icon">👥</div><p>No customers yet</p></div>}
        </div>
      </div>
    </PageLayout>
  );
};

export default AdminDashboard;
