import React, { useState } from 'react';

export default function Navbar({ onNavigate }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLinkClick = (e, sectionId) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={{ width: '100%', position: 'sticky', top: 0, zIndex: 40 }}>
      {/* Top Notification / Live Campus Ticker */}
      <aside
        aria-label="Campus Library Status"
        style={{
          width: '100%',
          backgroundColor: 'var(--surface-container-high)',
          padding: '8px var(--margin)',
          color: 'var(--on-surface-variant)',
          fontSize: '12px',
          fontWeight: 500,
          borderBottom: '1px solid rgba(216, 193, 194, 0.2)'
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--tertiary)',
                display: 'inline-block'
              }}
              className="animate-pulse-slow"
            />
            <span className="headline-sm" style={{ color: 'var(--on-surface)', fontSize: '13px', fontWeight: 600 }}>
              Main Campus Central Library
            </span>
            <span style={{ color: 'var(--outline-variant)' }}>•</span>
            <span>Level 2 Silent Reading & Research Floor Active</span>
            <span className="desktop-only" style={{ color: 'var(--outline-variant)' }}>•</span>
            <span className="desktop-only">Operating Hours: 08:00 – 22:00</span>
          </div>

          <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: 'var(--tertiary)', fontWeight: 600 }}>68 seats available</span>
          </div>
        </div>
      </aside>

      {/* Main Navigation Header */}
      <header
        style={{
          width: '100%',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(216, 193, 194, 0.3)',
          transition: 'colors 0.2s ease'
        }}
      >
        <nav
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '12px var(--margin)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px'
          }}
        >
          {/* Brand Logo */}
          <div
            onClick={() => onNavigate('landing')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
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
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>auto_stories</span>
            </div>
            <span
              className="headline-sm"
              style={{ fontSize: '18px', fontWeight: 700, color: '#30292B', letterSpacing: '-0.02em' }}
            >
              BookSpot
            </span>
          </div>

          {/* Nav Links Desktop */}
          <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
            <a
              href="#home"
              onClick={(e) => handleLinkClick(e, 'home')}
              style={{
                color: 'var(--primary)',
                fontWeight: 600,
                borderBottom: '2px solid var(--primary)',
                paddingBottom: '2px',
                textDecoration: 'none',
                fontSize: '14px'
              }}
            >
              Home
            </a>
            <a
              href="#how-it-works"
              onClick={(e) => handleLinkClick(e, 'how-it-works')}
              style={{
                color: 'var(--on-surface-variant)',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 500,
                transition: 'color 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--on-surface-variant)')}
            >
              How It Works
            </a>
            <a
              href="#features-section"
              onClick={(e) => handleLinkClick(e, 'features-section')}
              style={{
                color: 'var(--on-surface-variant)',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 500,
                transition: 'color 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--on-surface-variant)')}
            >
              Features
            </a>
            <a
              href="#floor-plan"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('book-a-seat');
              }}
              style={{
                color: 'var(--on-surface-variant)',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'color 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--on-surface-variant)')}
            >
              Floor Plan
            </a>
            <a
              href="#guidelines-section"
              onClick={(e) => handleLinkClick(e, 'guidelines-section')}
              style={{
                color: 'var(--on-surface-variant)',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 500,
                transition: 'color 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--on-surface-variant)')}
            >
              Guidelines
            </a>
          </div>

          {/* Right Action Cluster */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={() => onNavigate('signin')}
              style={{
                border: 'none',
                background: 'transparent',
                color: 'var(--on-surface-variant)',
                padding: '6px 12px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'color 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--on-surface-variant)')}
            >
              Sign In
            </button>

            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              style={{
                border: 'none',
                background: 'transparent',
                color: 'var(--on-surface-variant)',
                padding: '6px 12px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--on-surface-variant)')}
            >
              Student Portal
            </button>

            <button
              type="button"
              className="btn-primary"
              onClick={() => onNavigate('book-a-seat')}
              style={{ padding: '8px 16px', fontSize: '13px' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>event_seat</span>
              <span>Book a Seat</span>
            </button>

            {/* Mobile Hamburger toggle */}
            <button
              type="button"
              className="md-hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                border: 'none',
                background: 'transparent',
                color: 'var(--on-surface)',
                cursor: 'pointer',
                display: 'none',
                padding: '6px'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </nav>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div
            style={{
              padding: '16px var(--margin)',
              borderTop: '1px solid rgba(216, 193, 194, 0.2)',
              backgroundColor: 'var(--surface-container-lowest)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <a
              href="#how-it-works"
              onClick={(e) => handleLinkClick(e, 'how-it-works')}
              style={{ textDecoration: 'none', color: 'var(--on-surface)', fontSize: '14px', fontWeight: 500 }}
            >
              How It Works
            </a>
            <a
              href="#features-section"
              onClick={(e) => handleLinkClick(e, 'features-section')}
              style={{ textDecoration: 'none', color: 'var(--on-surface)', fontSize: '14px', fontWeight: 500 }}
            >
              Features
            </a>
            <a
              href="#floor-plan"
              onClick={(e) => {
                e.preventDefault();
                setMobileMenuOpen(false);
                onNavigate('book-a-seat');
              }}
              style={{ textDecoration: 'none', color: 'var(--on-surface)', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}
            >
              Floor Plan
            </a>
            <a
              href="#guidelines-section"
              onClick={(e) => handleLinkClick(e, 'guidelines-section')}
              style={{ textDecoration: 'none', color: 'var(--on-surface)', fontSize: '14px', fontWeight: 500 }}
            >
              Guidelines
            </a>
            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('signin');
                }}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-default)',
                  backgroundColor: 'var(--surface-container)',
                  border: '1px solid rgba(216, 193, 194, 0.4)',
                  color: 'var(--on-surface)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('dashboard');
                }}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-default)',
                  backgroundColor: 'var(--surface-container-high)',
                  border: 'none',
                  color: 'var(--primary)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Student Portal
              </button>
            </div>
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('book-a-seat');
              }}
              style={{ width: '100%', marginTop: '6px' }}
            >
              Book a Seat Now
            </button>
          </div>
        )}
      </header>
    </div>
  );
}
