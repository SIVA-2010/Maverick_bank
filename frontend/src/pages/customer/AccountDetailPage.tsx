// src/pages/customer/AccountDetailPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageLayout from '../../components/layout/PageLayout';
import { accountAPI, transactionAPI, Account, Transaction } from '../../services/api';

const AccountDetailPage = () => {
  const { accountNumber } = useParams<{ accountNumber: string }>();
  const [account, setAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<'LAST_10' | 'LAST_MONTH' | 'DATE_RANGE'>('LAST_10');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    if (accountNumber) {
      accountAPI.getAccountDetails(accountNumber).then(r => setAccount(r.data.data)).catch(() => {});
      loadTx();
    }
  }, [accountNumber]);

  useEffect(() => { if (accountNumber) loadTx(); }, [filter]);

  const loadTx = async () => {
    if (!accountNumber) return;
    try {
      let res;
      if (filter === 'LAST_10') res = await transactionAPI.getLast10(accountNumber);
      else if (filter === 'LAST_MONTH') res = await transactionAPI.getLastMonth(accountNumber);
      else if (filter === 'DATE_RANGE' && dateRange.start && dateRange.end)
        res = await transactionAPI.getByDateRange(accountNumber, dateRange.start + 'T00:00:00', dateRange.end + 'T23:59:59');
      if (res) setTransactions(res.data.data || []);
    } catch {}
  };

  if (!account) return <PageLayout title="Account Details"><div>Loading...</div></PageLayout>;

  const txColors: any = { DEPOSIT: 'var(--success)', WITHDRAWAL: 'var(--danger)', TRANSFER: 'var(--primary)', LOAN_DISBURSEMENT: 'var(--info)' };

  return (
    <PageLayout title="Account Details">
      <Link to="/customer/accounts" style={{ color: 'var(--primary)', marginBottom: 20, display: 'inline-block' }}>← Back to Accounts</Link>

      {/* Account Info Card */}
      <div className="card" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)', color: 'white', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>{account.accountType} Account</div>
            <div style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>₹{account.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            <div style={{ opacity: 0.8, letterSpacing: 3, fontFamily: 'monospace' }}>{account.accountNumber}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ opacity: 0.75, fontSize: 13 }}>Branch</div>
            <div style={{ fontWeight: 600 }}>{account.branchName}</div>
            <div style={{ opacity: 0.75, fontSize: 13, marginTop: 8 }}>IFSC</div>
            <div style={{ fontFamily: 'monospace', fontWeight: 600 }}>{account.ifscCode}</div>
          </div>
        </div>
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
          <span style={{ background: 'rgba(255,255,255,0.15)', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
            {account.status}
          </span>
          <span style={{ marginLeft: 12, opacity: 0.7, fontSize: 12 }}>Holder: {account.holderName}</span>
        </div>
      </div>

      {/* Transactions */}
      <div className="card">
        <div className="card-header" style={{ flexWrap: 'wrap', gap: 12 }}>
          <h2 className="card-title">Transaction History</h2>
          <div className="tabs" style={{ marginBottom: 0 }}>
            {(['LAST_10', 'LAST_MONTH', 'DATE_RANGE'] as const).map(f => (
              <button key={f} className={`tab-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                {f === 'LAST_10' ? 'Last 10' : f === 'LAST_MONTH' ? 'Last Month' : 'Date Range'}
              </button>
            ))}
          </div>
        </div>
        {filter === 'DATE_RANGE' && (
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Start Date</label>
              <input type="date" className="form-control" value={dateRange.start} onChange={e => setDateRange({ ...dateRange, start: e.target.value })} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">End Date</label>
              <input type="date" className="form-control" value={dateRange.end} onChange={e => setDateRange({ ...dateRange, end: e.target.value })} />
            </div>
            <button className="btn btn-primary" onClick={loadTx}>Search</button>
          </div>
        )}
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Date</th><th>Transaction ID</th><th>Type</th><th>Description</th><th>Amount</th><th>Balance After</th><th>Status</th></tr></thead>
            <tbody>
              {transactions.map(tx => (
                <tr key={tx.id}>
                  <td style={{ fontSize: 12 }}>{new Date(tx.createdAt).toLocaleString('en-IN')}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)' }}>{tx.transactionId}</td>
                  <td>{tx.type}</td>
                  <td>{tx.description || '-'}</td>
                  <td style={{ fontWeight: 700, color: txColors[tx.type] }}>
                    {tx.type === 'DEPOSIT' || tx.type === 'LOAN_DISBURSEMENT' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                  </td>
                  <td>₹{tx.balanceAfter?.toLocaleString('en-IN') || '-'}</td>
                  <td><span className={`badge badge-${tx.status.toLowerCase()}`}>{tx.status}</span></td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr><td colSpan={7}><div className="empty-state"><div className="empty-icon">💸</div><p>No transactions found</p></div></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageLayout>
  );
};

export default AccountDetailPage;
