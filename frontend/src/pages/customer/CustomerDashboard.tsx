// src/pages/customer/CustomerDashboard.tsx
import React, { useEffect, useState } from 'react';
import PageLayout from '../../components/layout/PageLayout';
import { accountAPI, transactionAPI, loanAPI, Account, Transaction, LoanApplication } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [recentTx, setRecentTx] = useState<Transaction[]>([]);
  const [loans, setLoans] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [accRes, loanRes] = await Promise.all([accountAPI.getMyAccounts(), loanAPI.getMyLoans()]);
        const accs = accRes.data.data || [];
        setAccounts(accs);
        setLoans(loanRes.data.data || []);
        if (accs.length > 0) {
          const txRes = await transactionAPI.getLast10(accs[0].accountNumber);
          setRecentTx(txRes.data.data || []);
        }
      } catch { } finally { setLoading(false); }
    };
    load();
  }, []);

  const totalBalance = accounts.filter(a => a.status === 'ACTIVE').reduce((s, a) => s + a.balance, 0);
  const activeAccounts = accounts.filter(a => a.status === 'ACTIVE').length;
  const activeLoans = loans.filter(l => l.status === 'DISBURSED' || l.status === 'APPROVED').length;

  return (
    <PageLayout title="Dashboard">
      {loading ? <div>Loading...</div> : (
        <>
          <div style={{ marginBottom: 8, color: 'var(--text-muted)' }}>
            Good day, <strong>{user?.firstName}</strong>! Here's your financial overview.
          </div>
          <div className="stats-grid">
            <div className="stat-card accent">
              <div className="stat-icon">💰</div>
              <div className="stat-info"><h3>₹{totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3><p>Total Balance</p></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🏦</div>
              <div className="stat-info"><h3>{activeAccounts}</h3><p>Active Accounts</p></div>
            </div>
            <div className="stat-card success">
              <div className="stat-icon">💳</div>
              <div className="stat-info"><h3>{activeLoans}</h3><p>Active Loans</p></div>
            </div>
            <div className="stat-card warning">
              <div className="stat-icon">📊</div>
              <div className="stat-info"><h3>{recentTx.length}</h3><p>Recent Transactions</p></div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {/* Accounts */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">My Accounts</h2>
                <Link to="/customer/accounts" className="btn btn-sm btn-outline">View All</Link>
              </div>
              {accounts.slice(0, 3).map(acc => (
                <Link key={acc.id} to={`/customer/accounts/${acc.accountNumber}`} style={{ textDecoration: 'none' }}>
                  <div className="account-card" style={{ marginBottom: 12 }}>
                    <div className="account-type">{acc.accountType} Account</div>
                    <div className="account-balance">₹{acc.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                    <div className="account-number">•••• {acc.accountNumber.slice(-4)}</div>
                    <span className={`badge badge-${acc.status.toLowerCase()}`} style={{ marginTop: 8 }}>{acc.status}</span>
                  </div>
                </Link>
              ))}
              {accounts.length === 0 && (
                <div className="empty-state"><div className="empty-icon">🏦</div><p>No accounts yet</p>
                  <Link to="/customer/accounts" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>Open Account</Link>
                </div>
              )}
            </div>

            {/* Recent Transactions */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Recent Transactions</h2>
                <Link to="/customer/transactions" className="btn btn-sm btn-outline">View All</Link>
              </div>
              {recentTx.slice(0, 6).map(tx => (
                <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ fontSize: 20 }}>{tx.type === 'DEPOSIT' ? '⬇️' : tx.type === 'WITHDRAWAL' ? '⬆️' : '↔️'}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{tx.description || tx.type}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(tx.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, color: tx.type === 'DEPOSIT' ? 'var(--success)' : 'var(--danger)' }}>
                    {tx.type === 'DEPOSIT' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
              {recentTx.length === 0 && <div className="empty-state"><div className="empty-icon">💸</div><p>No transactions yet</p></div>}
            </div>
          </div>
        </>
      )}
    </PageLayout>
  );
};

export default CustomerDashboard;
