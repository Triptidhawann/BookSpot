import React from 'react';

export default function Sidebar({
  activeView,
  onNavigate,
  isMobileOpen,
  onCloseMobile
}) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'home' },
    { id: 'book-a-seat', label: 'Book a Seat', icon: 'chair' },
    { id: 'my-bookings', label: 'My Bookings', icon: 'bookmark' },
    { id: 'booking-history', label: 'Booking History', icon: 'history' },
    { id: 'profile', label: 'Profile', icon: 'person' },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.3)',
            zIndex: 49,
            display: 'block'
          }}
        />
      )}

      <aside
        className={`sidebar-nav ${isMobileOpen ? 'open' : ''}`}
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          height: '100%',
          width: '260px',
          backgroundColor: 'var(--surface-container-lowest)',
          boxShadow: '0 1px 8px rgba(48, 41, 43, 0.04)',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderRight: '1px solid rgba(216, 193, 194, 0.25)',
          transition: 'transform 0.25s ease'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Logo */}
          <div
            style={{
              height: '64px',
              padding: '0 var(--space-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 'var(--space-sm)'
            }}
          >
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
              onClick={() => {
                onNavigate('landing');
                if (onCloseMobile) onCloseMobile();
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-default)',
                  backgroundColor: 'var(--primary)',
                  color: 'var(--on-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  boxShadow: 'var(--shadow-xs)'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>auto_stories</span>
              </div>
              <span className="headline-sm" style={{ color: 'var(--primary)', letterSpacing: '-0.02em', fontWeight: 700 }}>
                BookSpot
              </span>
            </div>

            {/* Close button for mobile */}
            <button
              type="button"
              className="md-hidden"
              onClick={onCloseMobile}
              style={{
                border: 'none',
                background: 'transparent',
                color: 'var(--on-surface-variant)',
                cursor: 'pointer',
                padding: '4px',
                display: 'none'
              }}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Navigation Links */}
          <nav
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-xs)',
              padding: '0 var(--space-md)',
              marginTop: 'var(--space-md)'
            }}
          >
            {navItems.map((item) => {
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onNavigate(item.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-md)',
                    padding: '10px var(--space-md)',
                    borderRadius: 'var(--radius-default)',
                    border: 'none',
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'left',
                    fontFamily: 'inherit',
                    fontSize: '14px',
                    fontWeight: isActive ? 600 : 500,
                    backgroundColor: isActive ? 'var(--secondary-container)' : 'transparent',
                    color: isActive ? 'var(--on-secondary-container)' : 'var(--on-surface-variant)',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'var(--surface-container-high)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: '20px',
                      color: isActive ? 'var(--on-secondary-container)' : 'inherit'
                    }}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom widgets */}
        <div style={{ padding: 'var(--space-md)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {/* Library Hours */}
          <div
            style={{
              backgroundColor: 'var(--surface-container-low)',
              padding: 'var(--space-md)',
              borderRadius: 'var(--radius-default)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 'var(--space-sm)',
              boxShadow: '0 1px 3px rgba(48, 41, 43, 0.02)'
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--tertiary)',
                marginTop: '6px',
                flexShrink: 0
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="label-sm" style={{ color: 'var(--on-surface-variant)', fontWeight: 500 }}>
                Open Today
              </span>
              <span className="body-sm" style={{ color: 'var(--on-surface)', fontWeight: 600 }}>
                8:00 AM – 10:00 PM
              </span>
            </div>
          </div>

          {/* Admin Portal shortcut */}
          <button
            type="button"
            onClick={() => {
              onNavigate('admin-login');
              if (onCloseMobile) onCloseMobile();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-md)',
              padding: '10px var(--space-md)',
              borderRadius: 'var(--radius-default)',
              border: 'none',
              cursor: 'pointer',
              width: '100%',
              backgroundColor: 'rgba(139, 72, 79, 0.08)',
              color: 'var(--primary)',
              fontFamily: 'inherit',
              fontSize: '14px',
              fontWeight: 600,
              marginBottom: '6px'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>admin_panel_settings</span>
            <span>Admin Console</span>
          </button>

          {/* Sign Out */}
          <button
            type="button"
            onClick={() => {
              onNavigate('landing');
              if (onCloseMobile) onCloseMobile();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-md)',
              padding: '10px var(--space-md)',
              borderRadius: 'var(--radius-default)',
              border: 'none',
              cursor: 'pointer',
              width: '100%',
              backgroundColor: 'transparent',
              color: 'var(--on-surface-variant)',
              fontFamily: 'inherit',
              fontSize: '14px',
              fontWeight: 500,
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface-container-high)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>logout</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
