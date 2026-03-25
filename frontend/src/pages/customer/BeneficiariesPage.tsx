// src/pages/customer/BeneficiariesPage.tsx
import React, { useEffect, useState } from 'react';
import PageLayout from '../../components/layout/PageLayout';
import { beneficiaryAPI, bankAPI, Beneficiary, BankBranch } from '../../services/api';
import { toast } from 'react-toastify';

const BeneficiariesPage = () => {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [bankNames, setBankNames] = useState<string[]>([]);
  const [branches, setBranches] = useState<BankBranch[]>([]);
  const [form, setForm] = useState({ accountHolderName: '', accountNumber: '', bankName: '', branchName: '', ifscCode: '' });
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    beneficiaryAPI.getAll().then(r => setBeneficiaries(r.data.data || [])).catch(() => {});
    bankAPI.getBankNames().then(r => setBankNames(r.data.data || [])).catch(() => {});
  }, []);

  const handleBankChange = async (bankName: string) => {
    setForm({ ...form, bankName, branchName: '', ifscCode: '' });
    if (bankName) {
      try { const r = await bankAPI.getBranches(bankName); setBranches(r.data.data || []); } catch {}
    }
  };

  const handleBranchChange = (branchName: string) => {
    const branch = branches.find(b => b.branchName === branchName);
    setForm({ ...form, branchName, ifscCode: branch?.ifscCode || '' });
  };

  const validate = () => {
    const e: any = {};
    if (!form.accountHolderName.trim()) e.accountHolderName = 'Required';
    if (!form.accountNumber.trim()) e.accountNumber = 'Required';
    else if (form.accountNumber.length < 9) e.accountNumber = 'Min 9 characters';
    if (!form.bankName) e.bankName = 'Required';
    if (!form.branchName) e.branchName = 'Required';
    if (!form.ifscCode) e.ifscCode = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await beneficiaryAPI.add(form);
      toast.success('Beneficiary added!');
      setShowModal(false);
      setForm({ accountHolderName: '', accountNumber: '', bankName: '', branchName: '', ifscCode: '' });
      beneficiaryAPI.getAll().then(r => setBeneficiaries(r.data.data || []));
    } catch (err: any) { toast.error(err?.message || 'Failed to add beneficiary'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Remove this beneficiary?')) return;
    try {
      await beneficiaryAPI.delete(id);
      toast.success('Beneficiary removed');
      setBeneficiaries(prev => prev.filter(b => b.id !== id));
    } catch (err: any) { toast.error(err?.message || 'Failed'); }
  };

  return (
    <PageLayout title="Beneficiaries">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Beneficiary</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
        {beneficiaries.map(b => (
          <div key={b.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{ fontSize: 32 }}>👤</div>
              <button className="btn btn-sm btn-danger" onClick={() => handleDelete(b.id)}>Remove</button>
            </div>
            <h3 style={{ fontWeight: 700, marginBottom: 8, color: 'var(--primary)' }}>{b.accountHolderName}</h3>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>
              Account: <strong style={{ fontFamily: 'monospace' }}>{b.accountNumber}</strong>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Bank: <strong>{b.bankName}</strong></div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Branch: <strong>{b.branchName}</strong></div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>IFSC: <strong style={{ fontFamily: 'monospace' }}>{b.ifscCode}</strong></div>
          </div>
        ))}
        {beneficiaries.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: 48 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>👥</div>
            <p style={{ color: 'var(--text-muted)' }}>No beneficiaries added yet</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Add Beneficiary</h2>
            <form onSubmit={handleAdd}>
              <div className="form-group">
                <label className="form-label">Account Holder Name *</label>
                <input className={`form-control ${errors.accountHolderName ? 'error' : ''}`}
                  placeholder="Full name of account holder"
                  value={form.accountHolderName} onChange={e => setForm({ ...form, accountHolderName: e.target.value })} />
                {errors.accountHolderName && <div className="error-text">{errors.accountHolderName}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Account Number *</label>
                <input className={`form-control ${errors.accountNumber ? 'error' : ''}`}
                  placeholder="Bank account number"
                  value={form.accountNumber} onChange={e => setForm({ ...form, accountNumber: e.target.value })} />
                {errors.accountNumber && <div className="error-text">{errors.accountNumber}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Bank Name *</label>
                <select className={`form-control ${errors.bankName ? 'error' : ''}`}
                  value={form.bankName} onChange={e => handleBankChange(e.target.value)}>
                  <option value="">Select Bank</option>
                  {bankNames.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                {errors.bankName && <div className="error-text">{errors.bankName}</div>}
              </div>
              {branches.length > 0 && (
                <div className="form-group">
                  <label className="form-label">Branch *</label>
                  <select className={`form-control ${errors.branchName ? 'error' : ''}`}
                    value={form.branchName} onChange={e => handleBranchChange(e.target.value)}>
                    <option value="">Select Branch</option>
                    {branches.map(b => <option key={b.id} value={b.branchName}>{b.branchName} - {b.city}</option>)}
                  </select>
                  {errors.branchName && <div className="error-text">{errors.branchName}</div>}
                </div>
              )}
              <div className="form-group">
                <label className="form-label">IFSC Code *</label>
                <input className={`form-control ${errors.ifscCode ? 'error' : ''}`}
                  placeholder="Auto-filled from branch selection"
                  value={form.ifscCode}
                  onChange={e => setForm({ ...form, ifscCode: e.target.value.toUpperCase() })} />
                {errors.ifscCode && <div className="error-text">{errors.ifscCode}</div>}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Adding...' : 'Add Beneficiary'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default BeneficiariesPage;
