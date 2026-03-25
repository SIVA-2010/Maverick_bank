// src/pages/employee/TransactionReportsPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import PageLayout from '../../components/layout/PageLayout';
import { employeeAPI, Transaction, User } from '../../services/api';

const TransactionReportsPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);
  const [tab, setTab] = useState<'transactions' | 'customers'>('transactions');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await employeeAPI.getAllTransactions(page, 50);
      setTransactions(res.data.data || []);
    } catch {} finally { setLoading(false); }
  }, [page]);

  useEffect(() => {
    loadTransactions();
    employeeAPI.getAllCustomers().then(r => setCustomers(r.data.data || [])).catch(() => {});
  }, [page, loadTransactions]);

  const txIcons: any = { DEPOSIT: '⬇️', WITHDRAWAL: '⬆️', TRANSFER: '↔️', LOAN_DISBURSEMENT: '🏦' };
  const txColors: any = { DEPOSIT: 'var(--success)', WITHDRAWAL: 'var(--danger)', TRANSFER: 'var(--primary)', LOAN_DISBURSEMENT: 'var(--info)' };

  const filteredTx = transactions.filter(tx =>
    !search || tx.transactionId.toLowerCase().includes(search.toLowerCase()) ||
    tx.accountNumber.toLowerCase().includes(search.toLowerCase()) ||
    (tx.description || '').toLowerCase().includes(search.toLowerCase())
  );

  const filteredCustomers = customers.filter(c =>
    !search ||
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  // Stats
  const totalDeposits = transactions.filter(t => t.type === 'DEPOSIT').reduce((s, t) => s + t.amount, 0);
  const totalWithdrawals = transactions.filter(t => t.type === 'WITHDRAWAL').reduce((s, t) => s + t.amount, 0);
  const totalTransfers = transactions.filter(t => t.type === 'TRANSFER').length;

  return (
    <PageLayout title="Reports">
      <div className="stats-grid">
        <div className="stat-card success">
          <div className="stat-icon">⬇️</div>
          <div className="stat-info">
            <h3>₹{totalDeposits.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</h3>
            <p>Total Deposits</p>
          </div>
        </div>
        <div className="stat-card danger">
          <div className="stat-icon">⬆️</div>
          <div className="stat-info">
            <h3>₹{totalWithdrawals.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</h3>
            <p>Total Withdrawals</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">↔️</div>
          <div className="stat-info"><h3>{totalTransfers}</h3><p>Total Transfers</p></div>
        </div>
        <div className="stat-card accent">
          <div className="stat-icon">👥</div>
          <div className="stat-info"><h3>{customers.length}</h3><p>Total Customers</p></div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' }}>
        <div className="tabs" style={{ flex: 1, marginBottom: 0 }}>
          <button className={`tab-btn ${tab === 'transactions' ? 'active' : ''}`} onClick={() => setTab('transactions')}>
            All Transactions ({transactions.length})
          </button>
          <button className={`tab-btn ${tab === 'customers' ? 'active' : ''}`} onClick={() => setTab('customers')}>
            Customers ({customers.length})
          </button>
        </div>
        <input
          className="form-control"
          style={{ width: 260 }}
          placeholder="🔍 Search..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {tab === 'transactions' && (
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Date & Time</th><th>Transaction ID</th><th>Account</th>
                  <th>Type</th><th>Amount</th><th>Description</th>
                  <th>Destination</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: 32 }}>Loading...</td></tr>
                ) : filteredTx.map(tx => (
                  <tr key={tx.id}>
                    <td style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
                      {new Date(tx.createdAt).toLocaleString('en-IN')}
                    </td>
                    <td style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                      {tx.transactionId}
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{tx.accountNumber}</td>
                    <td>
                      <span style={{ fontSize: 16 }}>{txIcons[tx.type]}</span>{' '}
                      <span style={{ fontSize: 12 }}>{tx.type}</span>
                    </td>
                    <td style={{ fontWeight: 700, color: txColors[tx.type] }}>
                      ₹{tx.amount.toLocaleString('en-IN')}
                    </td>
                    <td style={{ fontSize: 12 }}>{tx.description || '-'}</td>
                    <td style={{ fontSize: 12 }}>{tx.destinationAccountNumber || '-'}</td>
                    <td>
                      <span className={`badge badge-${tx.status.toLowerCase()}`}>{tx.status}</span>
                    </td>
                  </tr>
                ))}
                {!loading && filteredTx.length === 0 && (
                  <tr><td colSpan={8}>
                    <div className="empty-state"><div className="empty-icon">📊</div><p>No transactions found</p></div>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
            <button className="btn btn-outline btn-sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>← Prev</button>
            <span style={{ padding: '6px 12px', fontSize: 13 }}>Page {page + 1}</span>
            <button className="btn btn-outline btn-sm" disabled={transactions.length < 50} onClick={() => setPage(p => p + 1)}>Next →</button>
          </div>
        </div>
      )}

      {tab === 'customers' && (
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Name</th><th>Email</th><th>Phone</th><th>DOB</th><th>PAN</th><th>Status</th><th>Joined</th></tr>
              </thead>
              <tbody>
                {filteredCustomers.map(c => (
                  <tr key={c.id}>
                    <td><strong>{c.firstName} {c.lastName}</strong></td>
                    <td>{c.email}</td>
                    <td>{c.phoneNumber}</td>
                    <td>{c.dateOfBirth ? new Date(c.dateOfBirth).toLocaleDateString('en-IN') : '-'}</td>
                    <td style={{ fontFamily: 'monospace' }}>{c.panNumber || '-'}</td>
                    <td><span className={`badge badge-${c.status.toLowerCase()}`}>{c.status}</span></td>
                    <td>{new Date(c.createdAt).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
                {filteredCustomers.length === 0 && (
                  <tr><td colSpan={7}>
                    <div className="empty-state"><div className="empty-icon">👥</div><p>No customers found</p></div>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default TransactionReportsPage;
