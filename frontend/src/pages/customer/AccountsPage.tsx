// src/pages/customer/AccountsPage.tsx
import React, { useEffect, useState } from 'react';
import PageLayout from '../../components/layout/PageLayout';
import { accountAPI, bankAPI, Account, BankBranch } from '../../services/api';
import { toast } from 'react-toastify';

const AccountsPage = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [bankNames, setBankNames] = useState<string[]>([]);
  const [branches, setBranches] = useState<BankBranch[]>([]);
  const [form, setForm] = useState({ accountType: 'SAVINGS', branchName: '', ifscCode: '', initialDeposit: '', bankName: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAccounts();
    bankAPI.getBankNames().then(r => setBankNames(r.data.data || [])).catch(() => {});
  }, []);

  const loadAccounts = async () => {
    try { const r = await accountAPI.getMyAccounts(); setAccounts(r.data.data || []); } catch {}
  };

  const handleBankChange = async (bankName: string) => {
    setForm({ ...form, bankName, branchName: '', ifscCode: '' });
    try { const r = await bankAPI.getBranches(bankName); setBranches(r.data.data || []); } catch {}
  };

  const handleBranchChange = (branchName: string) => {
    const branch = branches.find(b => b.branchName === branchName);
    setForm({ ...form, branchName, ifscCode: branch?.ifscCode || '' });
  };

  const handleOpenAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await accountAPI.openAccount({
        accountType: form.accountType, branchName: form.branchName,
        ifscCode: form.ifscCode, initialDeposit: parseFloat(form.initialDeposit) || 0,
      });
      toast.success('Account opened! Pending approval from bank employee.');
      setShowModal(false); setForm({ accountType: 'SAVINGS', branchName: '', ifscCode: '', initialDeposit: '', bankName: '' });
      loadAccounts();
    } catch (err: any) { toast.error(err?.message || 'Failed to open account'); }
    finally { setLoading(false); }
  };

  const handleCloseRequest = async (accountNumber: string) => {
    if (!window.confirm('Are you sure you want to request closure of this account?')) return;
    try { await accountAPI.requestClosure(accountNumber); toast.success('Closure request submitted'); loadAccounts(); }
    catch (err: any) { toast.error(err?.message || 'Failed to submit request'); }
  };

  const statusColor: any = { ACTIVE: 'success', PENDING: 'pending', CLOSED: 'closed', CLOSE_REQUESTED: 'warning' };

  return (
    <PageLayout title="My Accounts">
      <div className="card-header" style={{ marginBottom: 20 }}>
        <div />
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Open New Account</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
        {accounts.map(acc => (
          <div key={acc.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>{acc.accountType}</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--primary)', marginTop: 4 }}>
                  ₹{acc.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <span className={`badge badge-${statusColor[acc.status] || 'primary'}`}>{acc.status.replace('_', ' ')}</span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Account No: <strong>{acc.accountNumber}</strong></div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>IFSC: <strong>{acc.ifscCode}</strong></div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>Branch: <strong>{acc.branchName}</strong></div>
            {acc.status === 'ACTIVE' && (
              <button className="btn btn-danger btn-sm" onClick={() => handleCloseRequest(acc.accountNumber)}>Request Closure</button>
            )}
          </div>
        ))}
        {accounts.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: 48 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🏦</div>
            <p style={{ color: 'var(--text-muted)' }}>No accounts yet. Open your first account!</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Open New Account</h2>
            <form onSubmit={handleOpenAccount}>
              <div className="form-group">
                <label className="form-label">Account Type *</label>
                <select className="form-control" value={form.accountType} onChange={e => setForm({ ...form, accountType: e.target.value })}>
                  <option value="SAVINGS">Savings Account</option>
                  <option value="CHECKING">Checking Account</option>
                  <option value="BUSINESS">Business Account</option>
                  <option value="FIXED_DEPOSIT">Fixed Deposit</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Bank Name *</label>
                <select className="form-control" value={form.bankName} onChange={e => handleBankChange(e.target.value)} required>
                  <option value="">Select Bank</option>
                  {bankNames.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              {branches.length > 0 && (
                <div className="form-group">
                  <label className="form-label">Branch *</label>
                  <select className="form-control" value={form.branchName} onChange={e => handleBranchChange(e.target.value)} required>
                    <option value="">Select Branch</option>
                    {branches.map(b => <option key={b.id} value={b.branchName}>{b.branchName} - {b.city}</option>)}
                  </select>
                </div>
              )}
              {form.ifscCode && (
                <div className="form-group">
                  <label className="form-label">IFSC Code</label>
                  <input className="form-control" value={form.ifscCode} readOnly style={{ background: 'var(--light-bg)' }} />
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Initial Deposit (₹)</label>
                <input type="number" className="form-control" placeholder="Min ₹500" min="500"
                  value={form.initialDeposit} onChange={e => setForm({ ...form, initialDeposit: e.target.value })} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Opening...' : 'Open Account'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default AccountsPage;
