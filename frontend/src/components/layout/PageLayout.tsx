// src/components/layout/PageLayout.tsx
import React, { ReactNode } from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';

interface PageLayoutProps { title: string; children: ReactNode; }

const PageLayout = ({ title, children }: PageLayoutProps) => {
  const { user } = useAuth();
  const initials = user ? `${user.firstName[0]}${user.lastName[0]}` : 'U';

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <h1 className="topbar-title">{title}</h1>
          <div className="topbar-right">
            <div className="user-badge">
              <div className="avatar">{initials}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{user?.firstName} {user?.lastName}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user?.role?.replace('_', ' ')}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="page-content">{children}</div>
      </div>
    </div>
  );
};

export default PageLayout;
