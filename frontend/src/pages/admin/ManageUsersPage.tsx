// src/pages/admin/ManageUsersPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import PageLayout from '../../components/layout/PageLayout';
import { adminAPI, User } from '../../services/api';
import { toast } from 'react-toastify';

const ManageUsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [tab, setTab] = useState<'customers' | 'employees'>('employees');
  const [showAddModal, setShowAddModal] = useState(false);
  const [empForm, setEmpForm] = useState({ firstName: '', lastName: '', email: '', password: '', phoneNumber: '', address: '' });
  const [empErrors, setEmpErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const loadUsers = useCallback(async () => {
    try {
      const res = tab === 'employees' ? await adminAPI.getEmployees() : await adminAPI.getCustomers();
      setUsers(res.data.data || []);
    } catch {}
  }, [tab]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const validateEmpForm = () => {
    const e: any = {};
    if (!empForm.firstName.trim()) e.firstName = 'Required';
    if (!empForm.lastName.trim()) e.lastName = 'Required';
    if (!empForm.email) e.email = 'Required';
    else if (!/\S+@\S+\.\S+/.test(empForm.email)) e.email = 'Invalid email';
    if (!empForm.password) e.password = 'Required';
    else if (empForm.password.length < 8) e.password = 'Min 8 characters';
    if (!empForm.phoneNumber) e.phoneNumber = 'Required';
    setEmpErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmpForm()) return;
    setLoading(true);
    try {
      await adminAPI.createEmployee(empForm);
      toast.success('Employee account created!');
      setShowAddModal(false);
      setEmpForm({ firstName: '', lastName: '', email: '', password: '', phoneNumber: '', address: '' });
      loadUsers();
    } catch (err: any) { toast.error(err?.message || 'Failed to create employee'); }
    finally { setLoading(false); }
  };

  const handleStatusUpdate = async (userId: number, status: string) => {
    try {
      await adminAPI.updateUserStatus(userId, { status });
      toast.success(`User ${status.toLowerCase()}`);
      loadUsers();
    } catch (err: any) { toast.error(err?.message || 'Update failed'); }
  };

  const handleDeactivate = async (userId: number) => {
    if (!window.confirm('Deactivate this user?')) return;
    try {
      await adminAPI.deactivateUser(userId);
      toast.success('User deactivated');
      loadUsers();
    } catch (err: any) { toast.error(err?.message || 'Failed'); }
  };

  const filtered = users.filter(u =>
    !search ||
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageLayout title="Manage Users">
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="tabs" style={{ flex: 1, marginBottom: 0 }}>
          <button className={`tab-btn ${tab === 'employees' ? 'active' : ''}`} onClick={() => setTab('employees')}>
            Bank Employees
          </button>
          <button className={`tab-btn ${tab === 'customers' ? 'active' : ''}`} onClick={() => setTab('customers')}>
            Customers
          </button>
        </div>
        <input className="form-control" style={{ width: 220 }} placeholder="🔍 Search users..."
          value={search} onChange={e => setSearch(e.target.value)} />
        {tab === 'employees' && (
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>+ Add Employee</button>
        )}
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th><th>Name</th><th>Email</th><th>Phone</th>
                {tab === 'customers' && <><th>PAN</th><th>Age</th></>}
                <th>Status</th><th>Joined</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <tr key={u.id}>
                  <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                  <td><strong>{u.firstName} {u.lastName}</strong></td>
                  <td>{u.email}</td>
                  <td>{u.phoneNumber}</td>
                  {tab === 'customers' && (
                    <>
                      <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{u.panNumber || '-'}</td>
                      <td>{u.age || '-'}</td>
                    </>
                  )}
                  <td><span className={`badge badge-${u.status.toLowerCase()}`}>{u.status}</span></td>
                  <td>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {u.status === 'ACTIVE' && (
                        <button className="btn btn-sm btn-danger" onClick={() => handleStatusUpdate(u.id, 'SUSPENDED')}>
                          Suspend
                        </button>
                      )}
                      {u.status === 'SUSPENDED' && (
                        <button className="btn btn-sm btn-success" onClick={() => handleStatusUpdate(u.id, 'ACTIVE')}>
                          Activate
                        </button>
                      )}
                      {u.status !== 'INACTIVE' && (
                        <button className="btn btn-sm btn-outline" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
                          onClick={() => handleDeactivate(u.id)}>
                          Deactivate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={tab === 'customers' ? 9 : 7}>
                  <div className="empty-state"><div className="empty-icon">👤</div><p>No users found</p></div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Add Bank Employee</h2>
            <form onSubmit={handleAddEmployee}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">First Name *</label>
                  <input className={`form-control ${empErrors.firstName ? 'error' : ''}`}
                    value={empForm.firstName} onChange={e => setEmpForm({ ...empForm, firstName: e.target.value })} />
                  {empErrors.firstName && <div className="error-text">{empErrors.firstName}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name *</label>
                  <input className={`form-control ${empErrors.lastName ? 'error' : ''}`}
                    value={empForm.lastName} onChange={e => setEmpForm({ ...empForm, lastName: e.target.value })} />
                  {empErrors.lastName && <div className="error-text">{empErrors.lastName}</div>}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input type="email" className={`form-control ${empErrors.email ? 'error' : ''}`}
                  value={empForm.email} onChange={e => setEmpForm({ ...empForm, email: e.target.value })} />
                {empErrors.email && <div className="error-text">{empErrors.email}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Phone *</label>
                <input className={`form-control ${empErrors.phoneNumber ? 'error' : ''}`}
                  value={empForm.phoneNumber} onChange={e => setEmpForm({ ...empForm, phoneNumber: e.target.value })} />
                {empErrors.phoneNumber && <div className="error-text">{empErrors.phoneNumber}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Password *</label>
                <input type="password" className={`form-control ${empErrors.password ? 'error' : ''}`}
                  placeholder="Min 8 characters"
                  value={empForm.password} onChange={e => setEmpForm({ ...empForm, password: e.target.value })} />
                {empErrors.password && <div className="error-text">{empErrors.password}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Address</label>
                <textarea className="form-control" rows={2} value={empForm.address}
                  onChange={e => setEmpForm({ ...empForm, address: e.target.value })} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default ManageUsersPage;
