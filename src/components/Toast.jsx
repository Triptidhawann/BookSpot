import React, { useEffect, useRef } from 'react';

export default function Toast({
  status = true,
  show,
  title,
  subtitle,
  onClose
}) {
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!show) return undefined;
    const timeout = window.setTimeout(() => onCloseRef.current?.(), 4000);
    return () => window.clearTimeout(timeout);
  }, [show, title, subtitle, status]);

  if (!show) return null;
  const isSuccess = status === true || status === 'true';

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
            backgroundColor: isSuccess ? 'var(--tertiary)' : 'var(--error)',
            color: isSuccess ? 'var(--on-tertiary)' : 'var(--on-error)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <svg
  width="22"
  height="22"
  viewBox="0 0 24 24"
  fill="none"
  role="img"
  aria-label={isSuccess ? 'Success' : 'Error'}
>
  {isSuccess ? (
    // Success: Tick
    <path
      d="M5 12.5L10 17.5L20 6.5"
      stroke="currentColor"
      strokeWidth="2.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ) : (
    // Error: Cross
    <path
      d="M6 6L18 18M18 6L6 18"
      stroke="currentColor"
      strokeWidth="2.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  )}
</svg>
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
