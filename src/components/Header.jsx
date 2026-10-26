import React from 'react';
import { currentUser } from '../data/mockData';

export default function Header({
  onOpenMobileSidebar,
  searchQuery,
  onSearchChange,
  onNavigate,
  user = currentUser
}) {
  return (
    <header
      className="dashboard-header"
      style={{
        position: 'fixed',
        top: 0,
        left: '260px',
        right: 0,
        height: '64px',
        backgroundColor: 'rgba(255, 247, 249, 0.85)',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 1px 8px rgba(48, 41, 43, 0.04)',
        zIndex: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--gutter-desktop)',
        borderBottom: '1px solid rgba(216, 193, 194, 0.25)',
        transition: 'left 0.25s ease'
      }}
    >
      {/* Left Search & Mobile Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="mobile-sidebar-toggle"
          style={{
            display: 'none',
            border: 'none',
            background: 'transparent',
            color: 'var(--on-surface)',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: 'var(--radius-default)'
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>menu</span>
        </button>

        {/* Search Input */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'var(--surface-container-lowest)',
            padding: '6px var(--space-md)',
            borderRadius: 'var(--radius-default)',
            boxShadow: '0 1px 3px rgba(48, 41, 43, 0.04)',
            width: '280px',
            maxWidth: '100%',
            border: '1px solid rgba(216, 193, 194, 0.2)'
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: '18px', color: 'var(--on-surface-variant)', marginRight: '8px' }}
          >
            search
          </span>
          <input
            type="text"
            placeholder="Search seats, zones, or resources..."
            value={searchQuery}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              padding: 0,
              color: 'var(--on-surface)',
              fontFamily: 'inherit',
              fontSize: '13px',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Right controls: Campus Badge, Notification, Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
        <span
          className="desktop-only label-sm"
          style={{
            backgroundColor: 'var(--surface-container-low)',
            padding: '4px var(--space-md)',
            borderRadius: 'var(--radius-full)',
            color: 'var(--on-surface-variant)',
            fontWeight: 500
          }}
        >
          Central University Library
        </span>

        {/* Notifications */}
        <button
          type="button"
          style={{
            position: 'relative',
            padding: '6px',
            color: 'var(--on-surface-variant)',
            background: 'transparent',
            border: 'none',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface-container-high)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>notifications</span>
          <span
            style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              width: '8px',
              height: '8px',
              backgroundColor: 'var(--primary)',
              borderRadius: '50%'
            }}
          />
        </button>

        {/* User profile */}
        <div
          onClick={() => onNavigate && onNavigate('profile')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            paddingLeft: '8px',
            cursor: 'pointer'
          }}
        >
          <div className="desktop-only" style={{ textAlign: 'right' }}>
            <div className="label-lg" style={{ fontWeight: 600, color: 'var(--on-surface)', lineHeight: 1.2 }}>
              {user.name}
            </div>
            <div className="label-sm" style={{ color: 'var(--on-surface-variant)' }}>
              {user.role}
            </div>
          </div>
          <img
            src={user.avatar}
            alt={user.name}
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              objectFit: 'cover',
              boxShadow: '0 1px 3px rgba(48, 41, 43, 0.08)',
              border: '1.5px solid var(--surface-container-high)'
            }}
          />
        </div>
      </div>
    </header>
  );
}
