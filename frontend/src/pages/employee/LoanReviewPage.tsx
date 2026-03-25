// src/pages/employee/LoanReviewPage.tsx
import React, { useEffect, useState } from 'react';
import PageLayout from '../../components/layout/PageLayout';
import { employeeAPI, LoanApplication } from '../../services/api';
import { toast } from 'react-toastify';

const LoanReviewPage = () => {
  const [loans, setLoans] = useState<LoanApplication[]>([]);
  const [selected, setSelected] = useState<LoanApplication | null>(null);
  const [decision, setDecision] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState<number | null>(null);

  useEffect(() => { loadLoans(); }, []);

  const loadLoans = async () => {
    try {
      const res = await employeeAPI.getPendingLoans();
      setLoans(res.data.data || []);
    } catch {}
  };

  const handleDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setLoading(selected.id);
    try {
      await employeeAPI.loanDecision({
        applicationId: selected.id,
        decision,
        rejectionReason: decision === 'REJECTED' ? rejectionReason : undefined,
      });
      toast.success(`Loan application ${decision === 'APPROVED' ? 'approved' : 'rejected'}!`);
      setSelected(null);
      setDecision('');
      setRejectionReason('');
      loadLoans();
    } catch (err: any) {
      toast.error(err?.message || 'Action failed');
    } finally {
      setLoading(null);
    }
  };

  const handleDisburse = async (id: number) => {
    if (!window.confirm('Disburse this loan to the customer account?')) return;
    setLoading(id);
    try {
      await employeeAPI.disburseLoan(id);
      toast.success('Loan disbursed successfully!');
      loadLoans();
    } catch (err: any) {
      toast.error(err?.message || 'Disbursement failed');
    } finally {
      setLoading(null);
    }
  };

  const statusColor: any = {
    PENDING: 'pending', UNDER_REVIEW: 'primary',
    APPROVED: 'success', REJECTED: 'closed', DISBURSED: 'disbursed',
  };

  return (
    <PageLayout title="Loan Review">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Loan Applications ({loans.length})</h2>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Application #</th><th>Applicant</th><th>Loan Type</th>
                <th>Amount</th><th>Tenure</th><th>Purpose</th>
                <th>Status</th><th>Applied On</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loans.map(loan => (
                <tr key={loan.id}>
                  <td><strong>{loan.applicationNumber}</strong></td>
                  <td>{loan.applicantName}</td>
                  <td>{loan.loanProduct?.loanType}</td>
                  <td>₹{loan.requestedAmount.toLocaleString('en-IN')}</td>
                  <td>{loan.tenureMonths} mo.</td>
                  <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{loan.purpose}</td>
                  <td><span className={`badge badge-${statusColor[loan.status] || 'primary'}`}>{loan.status}</span></td>
                  <td>{new Date(loan.createdAt).toLocaleDateString('en-IN')}</td>
                  <td style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {(loan.status === 'PENDING' || loan.status === 'UNDER_REVIEW') && (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => { setSelected(loan); setDecision(''); }}
                      >
                        Review
                      </button>
                    )}
                    {loan.status === 'APPROVED' && (
                      <button
                        className="btn btn-success btn-sm"
                        disabled={loading === loan.id}
                        onClick={() => handleDisburse(loan.id)}
                      >
                        {loading === loan.id ? '...' : '💸 Disburse'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {loans.length === 0 && (
                <tr>
                  <td colSpan={9}>
                    <div className="empty-state">
                      <div className="empty-icon">📋</div>
                      <p>No pending loan applications</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Review Loan Application</h2>
            <div style={{ background: 'var(--light-bg)', borderRadius: 10, padding: 16, marginBottom: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  ['Applicant', selected.applicantName],
                  ['Application #', selected.applicationNumber],
                  ['Loan Type', selected.loanProduct?.loanName],
                  ['Interest Rate', `${selected.loanProduct?.interestRate}% p.a.`],
                  ['Amount', `₹${selected.requestedAmount.toLocaleString('en-IN')}`],
                  ['Tenure', `${selected.tenureMonths} months`],
                  ['Purpose', selected.purpose],
                  ['Disbursement A/C', selected.disbursementAccountNumber],
                ].map(([label, value]) => (
                  <div key={label}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{label}</div>
                    <div style={{ fontWeight: 600 }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>
            <form onSubmit={handleDecision}>
              <div className="form-group">
                <label className="form-label">Decision *</label>
                <select className="form-control" value={decision} onChange={e => setDecision(e.target.value)} required>
                  <option value="">Select decision</option>
                  <option value="APPROVED">✅ Approve</option>
                  <option value="REJECTED">❌ Reject</option>
                </select>
              </div>
              {decision === 'REJECTED' && (
                <div className="form-group">
                  <label className="form-label">Rejection Reason *</label>
                  <textarea className="form-control" rows={3} required
                    placeholder="Provide reason for rejection..."
                    value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} />
                </div>
              )}
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setSelected(null)}>Cancel</button>
                <button
                  type="submit"
                  className={`btn ${decision === 'APPROVED' ? 'btn-success' : 'btn-danger'}`}
                  disabled={!decision || loading === selected.id}
                >
                  {loading === selected.id ? 'Processing...' : `Confirm ${decision}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default LoanReviewPage;
