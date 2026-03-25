// src/pages/customer/LoansPage.tsx
import React, { useEffect, useState } from 'react';
import PageLayout from '../../components/layout/PageLayout';
import { loanAPI, accountAPI, LoanProduct, LoanApplication, Account } from '../../services/api';
import { toast } from 'react-toastify';

export const LoansPage = () => {
  const [products, setProducts] = useState<LoanProduct[]>([]);
  const [myLoans, setMyLoans] = useState<LoanApplication[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selected, setSelected] = useState<LoanProduct | null>(null);
  const [form, setForm] = useState({ requestedAmount: '', tenureMonths: '', purpose: '', disbursementAccountNumber: '' });
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'products' | 'my-loans'>('products');

  useEffect(() => {
    loanAPI.getProducts().then(r => setProducts(r.data.data || [])).catch(() => {});
    loanAPI.getMyLoans().then(r => setMyLoans(r.data.data || [])).catch(() => {});
    accountAPI.getMyAccounts().then(r => setAccounts((r.data.data || []).filter((a: Account) => a.status === 'ACTIVE'))).catch(() => {});
  }, []);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setLoading(true);
    try {
      await loanAPI.apply({ loanProductId: selected.id, requestedAmount: parseFloat(form.requestedAmount), tenureMonths: parseInt(form.tenureMonths), purpose: form.purpose, disbursementAccountNumber: form.disbursementAccountNumber });
      toast.success('Loan application submitted!');
      setSelected(null);
      loanAPI.getMyLoans().then(r => setMyLoans(r.data.data || []));
    } catch (err: any) { toast.error(err?.message || 'Application failed'); }
    finally { setLoading(false); }
  };

  const statusColor: any = { PENDING: 'pending', UNDER_REVIEW: 'primary', APPROVED: 'success', REJECTED: 'closed', DISBURSED: 'disbursed' };

  return (
    <PageLayout title="Loans">
      <div className="tabs">
        <button className={`tab-btn ${tab === 'products' ? 'active' : ''}`} onClick={() => setTab('products')}>Available Loans</button>
        <button className={`tab-btn ${tab === 'my-loans' ? 'active' : ''}`} onClick={() => setTab('my-loans')}>My Applications ({myLoans.length})</button>
      </div>

      {tab === 'products' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {products.map(p => (
            <div key={p.id} className="card">
              <div style={{ fontSize: 28, marginBottom: 8 }}>
                {p.loanType === 'HOME' ? '🏠' : p.loanType === 'PERSONAL' ? '👤' : p.loanType === 'EDUCATION' ? '🎓' : p.loanType === 'VEHICLE' ? '🚗' : '💼'}
              </div>
              <h3 style={{ color: 'var(--primary)', marginBottom: 8 }}>{p.loanName}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 12 }}>{p.description}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                <div style={{ background: 'var(--light-bg)', padding: '8px 12px', borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Interest Rate</div>
                  <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{p.interestRate}% p.a.</div>
                </div>
                <div style={{ background: 'var(--light-bg)', padding: '8px 12px', borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Tenure</div>
                  <div style={{ fontWeight: 700 }}>{p.minTenureMonths}-{p.maxTenureMonths} months</div>
                </div>
                <div style={{ background: 'var(--light-bg)', padding: '8px 12px', borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Min Amount</div>
                  <div style={{ fontWeight: 700 }}>₹{p.minimumAmount.toLocaleString('en-IN')}</div>
                </div>
                <div style={{ background: 'var(--light-bg)', padding: '8px 12px', borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Max Amount</div>
                  <div style={{ fontWeight: 700 }}>₹{p.maximumAmount.toLocaleString('en-IN')}</div>
                </div>
              </div>
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setSelected(p)}>Apply Now</button>
            </div>
          ))}
        </div>
      )}

      {tab === 'my-loans' && (
        <div className="card">
          <table><thead><tr><th>Application #</th><th>Loan Type</th><th>Amount</th><th>Tenure</th><th>Purpose</th><th>Status</th><th>Applied On</th></tr></thead>
            <tbody>
              {myLoans.map(l => (
                <tr key={l.id}>
                  <td style={{ fontWeight: 600 }}>{l.applicationNumber}</td>
                  <td>{l.loanProduct?.loanName}</td>
                  <td>₹{l.requestedAmount.toLocaleString('en-IN')}</td>
                  <td>{l.tenureMonths} months</td>
                  <td>{l.purpose}</td>
                  <td><span className={`badge badge-${statusColor[l.status] || 'primary'}`}>{l.status}</span></td>
                  <td>{new Date(l.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {myLoans.length === 0 && <tr><td colSpan={7}><div className="empty-state"><div className="empty-icon">📋</div><p>No loan applications</p></div></td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Apply for {selected.loanName}</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 20, fontSize: 13 }}>
              Rate: {selected.interestRate}% | Range: ₹{selected.minimumAmount.toLocaleString()} - ₹{selected.maximumAmount.toLocaleString()}
            </p>
            <form onSubmit={handleApply}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Loan Amount (₹) *</label>
                  <input type="number" className="form-control" required min={selected.minimumAmount} max={selected.maximumAmount}
                    value={form.requestedAmount} onChange={e => setForm({ ...form, requestedAmount: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Tenure (months) *</label>
                  <input type="number" className="form-control" required min={selected.minTenureMonths} max={selected.maxTenureMonths}
                    value={form.tenureMonths} onChange={e => setForm({ ...form, tenureMonths: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Purpose *</label>
                <input className="form-control" required placeholder="Purpose of loan"
                  value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Disbursement Account *</label>
                <select className="form-control" required value={form.disbursementAccountNumber} onChange={e => setForm({ ...form, disbursementAccountNumber: e.target.value })}>
                  <option value="">Select Account</option>
                  {accounts.map(a => <option key={a.id} value={a.accountNumber}>{a.accountType} - ••{a.accountNumber.slice(-4)}</option>)}
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setSelected(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Submitting...' : 'Submit Application'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default LoansPage;
