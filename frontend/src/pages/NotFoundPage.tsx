// src/pages/NotFoundPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--light-bg)', flexDirection: 'column', gap: 16 }}>
    <div style={{ fontSize: 80 }}>🏛️</div>
    <h1 style={{ fontSize: 48, fontWeight: 800, color: 'var(--primary)' }}>404</h1>
    <p style={{ color: 'var(--text-muted)', fontSize: 18 }}>Page not found</p>
    <Link to="/" className="btn btn-primary">Go to Dashboard</Link>
  </div>
);

export default NotFoundPage;
