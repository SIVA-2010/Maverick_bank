// src/pages/employee/AccountApprovalsPage.tsx
import React, { useEffect, useState } from 'react';
import PageLayout from '../../components/layout/PageLayout';
import { employeeAPI, Account } from '../../services/api';
import { toast } from 'react-toastify';

const AccountApprovalsPage = () => {
  const [pending, setPending] = useState<Account[]>([]);
  const [closeRequests, setCloseRequests] = useState<Account[]>([]);
  const [tab, setTab] = useState<'pending' | 'close'>('pending');
  const [loading, setLoading] = useState<number | null>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [pRes, cRes] = await Promise.all([employeeAPI.getPendingAccounts(), employeeAPI.getCloseRequests()]);
      setPending(pRes.data.data || []);
      setCloseRequests(cRes.data.data || []);
    } catch {}
  };

  const handleApprove = async (id: number) => {
    setLoading(id);
    try { await employeeAPI.approveAccount(id); toast.success('Account approved!'); loadData(); }
    catch (err: any) { toast.error(err?.message || 'Failed'); }
    finally { setLoading(null); }
  };

  const handleClose = async (id: number) => {
    if (!window.confirm('Confirm closing this account?')) return;
    setLoading(id);
    try { await employeeAPI.closeAccount(id); toast.success('Account closed!'); loadData(); }
    catch (err: any) { toast.error(err?.message || 'Failed'); }
    finally { setLoading(null); }
  };

  const renderTable = (accounts: Account[], type: 'pending' | 'close') => (
    <div className="card">
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Account Number</th><th>Holder</th><th>Type</th>
              <th>IFSC Code</th><th>Branch</th><th>Balance</th>
              <th>Opened On</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map(acc => (
              <tr key={acc.id}>
                <td><strong>{acc.accountNumber}</strong></td>
                <td>{acc.holderName}</td>
                <td><span className="badge badge-primary">{acc.accountType}</span></td>
                <td style={{ fontFamily: 'monospace' }}>{acc.ifscCode}</td>
                <td>{acc.branchName}</td>
                <td>₹{acc.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                <td>{new Date(acc.createdAt).toLocaleDateString('en-IN')}</td>
                <td>
                  {type === 'pending' ? (
                    <button
                      className="btn btn-success btn-sm"
                      disabled={loading === acc.id}
                      onClick={() => handleApprove(acc.id)}
                    >
                      {loading === acc.id ? '...' : '✅ Approve'}
                    </button>
                  ) : (
                    <button
                      className="btn btn-danger btn-sm"
                      disabled={loading === acc.id}
                      onClick={() => handleClose(acc.id)}
                    >
                      {loading === acc.id ? '...' : '🔒 Close Account'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {accounts.length === 0 && (
              <tr>
                <td colSpan={8}>
                  <div className="empty-state">
                    <div className="empty-icon">✅</div>
                    <p>No {type === 'pending' ? 'pending approvals' : 'closure requests'}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <PageLayout title="Account Approvals">
      <div className="tabs">
        <button className={`tab-btn ${tab === 'pending' ? 'active' : ''}`} onClick={() => setTab('pending')}>
          New Account Requests ({pending.length})
        </button>
        <button className={`tab-btn ${tab === 'close' ? 'active' : ''}`} onClick={() => setTab('close')}>
          Closure Requests ({closeRequests.length})
        </button>
      </div>
      {tab === 'pending' ? renderTable(pending, 'pending') : renderTable(closeRequests, 'close')}
    </PageLayout>
  );
};

export default AccountApprovalsPage;
