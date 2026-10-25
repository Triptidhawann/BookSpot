import React from 'react';

export default function Toast({
  show,
  title,
  subtitle,
  onClose
}) {
  if (!show) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 60,
        pointerEvents: 'auto',
        maxWidth: '420px',
        width: 'calc(100vw - 48px)',
        animation: 'slideUp 0.3s ease-out'
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--inverse-surface)',
          color: 'var(--inverse-on-surface)',
          padding: 'var(--space-md)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-xl)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-md)'
        }}
      >
        <span
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'var(--tertiary)',
            color: 'var(--on-tertiary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>done</span>
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, paddingRight: '8px' }}>
          <span className="label-lg" style={{ fontWeight: 600, color: 'var(--inverse-on-surface)' }}>
            {title}
          </span>
          <span className="body-sm" style={{ color: 'rgba(247, 238, 242, 0.8)' }}>
            {subtitle}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          style={{
            border: 'none',
            background: 'transparent',
            color: 'rgba(247, 238, 242, 0.6)',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: 'var(--radius-default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--inverse-on-surface)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(247, 238, 242, 0.6)')}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
        </button>
      </div>
    </div>
  );
}
