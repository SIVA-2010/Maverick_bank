// src/pages/RegisterPage.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const getPasswordStrength = (password: string) => {
  if (password.length < 4) return { level: 0, label: '', cls: '' };
  if (password.length < 8) return { level: 1, label: 'Weak', cls: 'strength-weak' };
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecial = /[@$!%*?&]/.test(password);
  const score = [hasUpper, hasLower, hasDigit, hasSpecial].filter(Boolean).length;
  if (score <= 2) return { level: 1, label: 'Weak', cls: 'strength-weak' };
  if (score === 3) return { level: 2, label: 'Medium', cls: 'strength-medium' };
  return { level: 3, label: 'Strong', cls: 'strength-strong' };
};

const RegisterPage = () => {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', confirmPassword: '',
    phoneNumber: '', address: '', gender: '', dateOfBirth: '',
    aadharNumber: '', panNumber: '',
  });
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const { login } = useAuth();
  const navigate = useNavigate();
  const strength = getPasswordStrength(form.password);

  const calc_age = (dob: string): number => {
    if (!dob) return 0;
    const diff = Date.now() - new Date(dob).getTime();
    return Math.floor(diff / (365.25 * 24 * 3600 * 1000));
  };

  const validateStep1 = () => {
    const e: any = {};
    if (!form.firstName.trim()) e.firstName = 'First name required';
    if (!form.lastName.trim()) e.lastName = 'Last name required';
    if (!form.email) e.email = 'Email required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.password) e.password = 'Password required';
    else if (form.password.length < 8) e.password = 'Minimum 8 characters';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(form.password))
      e.password = 'Must include uppercase, lowercase, digit and special char';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: any = {};
    if (!form.phoneNumber) e.phoneNumber = 'Phone required';
    else if (!/^[0-9]{10}$/.test(form.phoneNumber)) e.phoneNumber = 'Must be 10 digits';
    if (!form.dateOfBirth) e.dateOfBirth = 'Date of birth required';
    else if (calc_age(form.dateOfBirth) < 18) e.dateOfBirth = 'Must be at least 18 years old';
    if (form.aadharNumber && !/^[0-9]{12}$/.test(form.aadharNumber)) e.aadharNumber = 'Must be 12 digits';
    if (form.panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.panNumber)) e.panNumber = 'Invalid PAN format (e.g. ABCDE1234F)';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => { if (validateStep1()) setStep(2); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) return;
    setLoading(true);
    try {
      const payload: any = { ...form };
      delete payload.confirmPassword;
      if (!payload.address) delete payload.address;
      if (!payload.gender) delete payload.gender;
      if (!payload.aadharNumber) delete payload.aadharNumber;
      if (!payload.panNumber) delete payload.panNumber;
      
      const res = await authAPI.register(payload);
      const { accessToken, refreshToken, user } = res.data.data;
      login(accessToken, refreshToken, user);
      toast.success('Account created successfully! Welcome to Maverick Bank!');
      navigate('/customer/dashboard');
    } catch (err: any) {
      if (err?.data && typeof err.data === 'object' && Object.keys(err.data).length > 0) {
        // Show validation errors from backend
        Object.entries(err.data).forEach(([field, msg]) => {
          toast.error(`${field}: ${msg}`);
        });
      } else {
        toast.error(err?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{ alignItems: 'flex-start', paddingTop: 32 }}>
      <div className="auth-card" style={{ maxWidth: 560 }}>
        <div className="auth-logo">
          <h1>🏛️ Maverick <span>Bank</span></h1>
          <p>Open Your Account Today</p>
        </div>

        {/* Progress */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 28, gap: 8 }}>
          {[1, 2].map((s, i) => (
            <React.Fragment key={s}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14,
                  background: step >= s ? 'var(--primary)' : 'var(--border)',
                  color: step >= s ? 'white' : 'var(--text-muted)',
                }}>{s}</div>
                <span style={{ fontSize: 13, color: step >= s ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 600 }}>
                  {s === 1 ? 'Account Details' : 'Personal Info'}
                </span>
              </div>
              {i < 1 && <div style={{ flex: 1, height: 2, background: step >= 2 ? 'var(--primary)' : 'var(--border)' }} />}
            </React.Fragment>
          ))}
        </div>

        <form onSubmit={step === 1 ? (e) => { e.preventDefault(); handleNext(); } : handleSubmit}>
          {step === 1 && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">First Name *</label>
                  <input className={`form-control ${errors.firstName ? 'error' : ''}`} placeholder="John"
                    value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
                  {errors.firstName && <div className="error-text">{errors.firstName}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name *</label>
                  <input className={`form-control ${errors.lastName ? 'error' : ''}`} placeholder="Doe"
                    value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
                  {errors.lastName && <div className="error-text">{errors.lastName}</div>}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input type="email" className={`form-control ${errors.email ? 'error' : ''}`} placeholder="you@example.com"
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                {errors.email && <div className="error-text">{errors.email}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Password *</label>
                <input type="password" className={`form-control ${errors.password ? 'error' : ''}`} placeholder="Create a strong password"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                {form.password && (
                  <div className={`password-strength ${strength.cls}`}>
                    <div className="strength-bar"><div className="strength-fill" /></div>
                    <div className="strength-text" style={{ color: strength.level === 3 ? 'var(--success)' : strength.level === 2 ? 'var(--warning)' : 'var(--danger)' }}>
                      {strength.label}
                    </div>
                  </div>
                )}
                {errors.password && <div className="error-text">{errors.password}</div>}
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                  Min 8 chars with uppercase, lowercase, number & special char (@$!%*?&)
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password *</label>
                <input type="password" className={`form-control ${errors.confirmPassword ? 'error' : ''}`} placeholder="Confirm your password"
                  value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} />
                {errors.confirmPassword && <div className="error-text">{errors.confirmPassword}</div>}
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
                Continue →
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input className={`form-control ${errors.phoneNumber ? 'error' : ''}`} placeholder="10-digit mobile"
                    value={form.phoneNumber} onChange={e => setForm({ ...form, phoneNumber: e.target.value })} />
                  {errors.phoneNumber && <div className="error-text">{errors.phoneNumber}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select className="form-control" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Date of Birth * {form.dateOfBirth && <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(Age: {calc_age(form.dateOfBirth)})</span>}</label>
                <input type="date" className={`form-control ${errors.dateOfBirth ? 'error' : ''}`}
                  value={form.dateOfBirth} onChange={e => setForm({ ...form, dateOfBirth: e.target.value })} />
                {errors.dateOfBirth && <div className="error-text">{errors.dateOfBirth}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Address</label>
                <textarea className="form-control" placeholder="Your full address" rows={2}
                  value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Aadhar Number</label>
                  <input className={`form-control ${errors.aadharNumber ? 'error' : ''}`} placeholder="12-digit Aadhar"
                    value={form.aadharNumber} onChange={e => setForm({ ...form, aadharNumber: e.target.value })} />
                  {errors.aadharNumber && <div className="error-text">{errors.aadharNumber}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">PAN Number</label>
                  <input className={`form-control ${errors.panNumber ? 'error' : ''}`} placeholder="ABCDE1234F"
                    value={form.panNumber.toUpperCase()} onChange={e => setForm({ ...form, panNumber: e.target.value.toUpperCase() })} />
                  {errors.panNumber && <div className="error-text">{errors.panNumber}</div>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1, padding: '12px' }} onClick={() => setStep(1)}>
                  ← Back
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 2, padding: '12px' }}>
                  {loading ? '⏳ Creating Account...' : '✅ Create Account'}
                </button>
              </div>
            </>
          )}
        </form>
        <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-muted)', fontSize: 14 }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary-light)', fontWeight: 600 }}>Login</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
