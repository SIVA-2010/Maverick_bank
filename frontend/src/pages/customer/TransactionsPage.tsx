// src/pages/customer/TransactionsPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import PageLayout from '../../components/layout/PageLayout';
import { accountAPI, transactionAPI, beneficiaryAPI, Account, Transaction, Beneficiary } from '../../services/api';
import { toast } from 'react-toastify';

const TransactionsPage = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [filter, setFilter] = useState<'LAST_10' | 'LAST_MONTH' | 'DATE_RANGE'>('LAST_10');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showTxModal, setShowTxModal] = useState(false);
  const [txForm, setTxForm] = useState({ type: 'DEPOSIT', amount: '', description: '', destinationAccountNumber: '', destinationBankName: '', saveBeneficiary: false });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    accountAPI.getMyAccounts().then(r => {
      const accs = (r.data.data || []).filter((a: Account) => a.status === 'ACTIVE');
      setAccounts(accs);
      if (accs.length > 0) { setSelectedAccount(accs[0].accountNumber); }
    }).catch(() => {});
    beneficiaryAPI.getAll().then(r => setBeneficiaries(r.data.data || [])).catch(() => {});
  }, []);

  const loadTransactions = useCallback(async () => {
    if (!selectedAccount) return;
    try {
      let res;
      if (filter === 'LAST_10') res = await transactionAPI.getLast10(selectedAccount);
      else if (filter === 'LAST_MONTH') res = await transactionAPI.getLastMonth(selectedAccount);
      else if (filter === 'DATE_RANGE' && dateRange.start && dateRange.end)
        res = await transactionAPI.getByDateRange(selectedAccount, dateRange.start + 'T00:00:00', dateRange.end + 'T23:59:59');
      if (res) setTransactions(res.data.data || []);
    } catch {}
  }, [selectedAccount, filter, dateRange.start, dateRange.end]);

  useEffect(() => { if (selectedAccount) loadTransactions(); }, [selectedAccount, filter, loadTransactions]);

  const handleTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await transactionAPI.perform({
        type: txForm.type, amount: parseFloat(txForm.amount),
        accountNumber: selectedAccount, description: txForm.description,
        destinationAccountNumber: txForm.destinationAccountNumber || undefined,
        destinationBankName: txForm.destinationBankName || undefined,
        saveBeneficiary: txForm.saveBeneficiary,
      });
      toast.success('Transaction completed successfully!');
      setShowTxModal(false);
      setTxForm({ type: 'DEPOSIT', amount: '', description: '', destinationAccountNumber: '', destinationBankName: '', saveBeneficiary: false });
      loadTransactions();
    } catch (err: any) { toast.error(err?.message || 'Transaction failed'); }
    finally { setLoading(false); }
  };

  const selectBeneficiary = (ben: Beneficiary) => {
    setTxForm({ ...txForm, destinationAccountNumber: ben.accountNumber, destinationBankName: ben.bankName });
  };

  const txColors: any = { DEPOSIT: 'var(--success)', WITHDRAWAL: 'var(--danger)', TRANSFER: 'var(--primary)', LOAN_DISBURSEMENT: 'var(--info)' };
  const txIcons: any = { DEPOSIT: '⬇️', WITHDRAWAL: '⬆️', TRANSFER: '↔️', LOAN_DISBURSEMENT: '🏦' };

  return (
    <PageLayout title="Transactions">
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <select className="form-control" style={{ width: 220 }} value={selectedAccount} onChange={e => setSelectedAccount(e.target.value)}>
          {accounts.map(a => <option key={a.id} value={a.accountNumber}>{a.accountType} - ••{a.accountNumber.slice(-4)}</option>)}
        </select>
        <div className="tabs" style={{ flex: 1, minWidth: 280 }}>
          {(['LAST_10', 'LAST_MONTH', 'DATE_RANGE'] as const).map(f => (
            <button key={f} className={`tab-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f === 'LAST_10' ? 'Last 10' : f === 'LAST_MONTH' ? 'Last Month' : 'Date Range'}
            </button>
          ))}
        </div>
        {selectedAccount && <button className="btn btn-primary" onClick={() => setShowTxModal(true)}>+ New Transaction</button>}
      </div>

      {filter === 'DATE_RANGE' && (
        <div className="card" style={{ marginBottom: 16, padding: 16 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
              <label className="form-label">Start Date</label>
              <input type="date" className="form-control" value={dateRange.start} onChange={e => setDateRange({ ...dateRange, start: e.target.value })} />
            </div>
            <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
              <label className="form-label">End Date</label>
              <input type="date" className="form-control" value={dateRange.end} onChange={e => setDateRange({ ...dateRange, end: e.target.value })} />
            </div>
            <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={loadTransactions}>Search</button>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Transaction History ({transactions.length})</h2>
        </div>
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Date</th><th>ID</th><th>Type</th><th>Description</th><th>Amount</th><th>Balance After</th><th>Status</th></tr></thead>
            <tbody>
              {transactions.map(tx => (
                <tr key={tx.id}>
                  <td>{new Date(tx.createdAt).toLocaleDateString('en-IN')}</td>
                  <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{tx.transactionId}</td>
                  <td><span style={{ fontSize: 16 }}>{txIcons[tx.type]}</span> {tx.type}</td>
                  <td>{tx.description || '-'}</td>
                  <td style={{ fontWeight: 700, color: txColors[tx.type] }}>
                    {tx.type === 'DEPOSIT' || tx.type === 'LOAN_DISBURSEMENT' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                  </td>
                  <td>₹{tx.balanceAfter?.toLocaleString('en-IN') || '-'}</td>
                  <td><span className={`badge badge-${tx.status.toLowerCase()}`}>{tx.status}</span></td>
                </tr>
              ))}
              {transactions.length === 0 && <tr><td colSpan={7}><div className="empty-state"><div className="empty-icon">💸</div><p>No transactions found</p></div></td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {showTxModal && (
        <div className="modal-overlay" onClick={() => setShowTxModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">New Transaction</h2>
            <form onSubmit={handleTransaction}>
              <div className="form-group">
                <label className="form-label">Transaction Type *</label>
                <select className="form-control" value={txForm.type} onChange={e => setTxForm({ ...txForm, type: e.target.value })}>
                  <option value="DEPOSIT">Deposit</option>
                  <option value="WITHDRAWAL">Withdrawal</option>
                  <option value="TRANSFER">Transfer</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Amount (₹) *</label>
                <input type="number" className="form-control" placeholder="Enter amount" min="1" required
                  value={txForm.amount} onChange={e => setTxForm({ ...txForm, amount: e.target.value })} />
              </div>
              {txForm.type === 'TRANSFER' && (
                <>
                  {beneficiaries.length > 0 && (
                    <div className="form-group">
                      <label className="form-label">Select Beneficiary</label>
                      <select className="form-control" onChange={e => { const b = beneficiaries.find(b => b.id === parseInt(e.target.value)); if (b) selectBeneficiary(b); }}>
                        <option value="">-- Select saved beneficiary --</option>
                        {beneficiaries.map(b => <option key={b.id} value={b.id}>{b.accountHolderName} - {b.bankName}</option>)}
                      </select>
                    </div>
                  )}
                  <div className="form-group">
                    <label className="form-label">Destination Account Number *</label>
                    <input className="form-control" placeholder="Account number" required
                      value={txForm.destinationAccountNumber} onChange={e => setTxForm({ ...txForm, destinationAccountNumber: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Destination Bank Name</label>
                    <input className="form-control" placeholder="Bank name"
                      value={txForm.destinationBankName} onChange={e => setTxForm({ ...txForm, destinationBankName: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                      <input type="checkbox" checked={txForm.saveBeneficiary} onChange={e => setTxForm({ ...txForm, saveBeneficiary: e.target.checked })} />
                      Save as beneficiary for future transfers
                    </label>
                  </div>
                </>
              )}
              <div className="form-group">
                <label className="form-label">Description</label>
                <input className="form-control" placeholder="Optional description" value={txForm.description} onChange={e => setTxForm({ ...txForm, description: e.target.value })} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowTxModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Processing...' : 'Confirm Transaction'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default TransactionsPage;
