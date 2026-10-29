import React, { useState } from 'react';

export default function AdminLoginView({ onNavigate, onAdminAuthenticated }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Fixed admin credentials for authorized personnel
  const VALID_ADMIN_USER = 'admin';
  const VALID_ADMIN_PASS = 'Admin@12345';

  const handleAdminLogin = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    const trimmedUser = username.trim();

    setTimeout(() => {
      setIsLoading(false);
      // Strictly verify credentials
      if (trimmedUser === VALID_ADMIN_USER && password === VALID_ADMIN_PASS) {
        const session = {
          role: 'admin',
          username: 'admin',
          name: 'Chief Librarian / Administrator',
          loggedInAt: new Date().toISOString()
        };
        localStorage.setItem('bookspot_admin_session', JSON.stringify(session));
        if (onAdminAuthenticated) {
          onAdminAuthenticated(session);
        }
        onNavigate('admin-dashboard');
      } else {
        setErrorMessage('Access Denied: Invalid Admin ID or Password. Only authorized library staff can log in.');
      }
    }, 600);
  };

  const handleQuickDemoFill = () => {
    setUsername('admin');
    setPassword('Admin@12345');
    setErrorMessage('');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        backgroundColor: '#1b1718',
        color: '#fcf8f9',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        fontFamily: "'Inter', sans-serif"
      }}
    >
      {/* Header */}
      <header
        style={{
          height: '68px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          backgroundColor: 'rgba(27, 23, 24, 0.9)',
          backdropFilter: 'blur(12px)'
        }}
      >
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
          onClick={() => onNavigate('landing')}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: '#8b484f',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(139, 72, 79, 0.4)'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>admin_panel_settings</span>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '18px', letterSpacing: '-0.02em', color: '#ffffff' }}>
              BookSpot <span style={{ color: '#ffb2b9', fontSize: '13px', fontWeight: 600, marginLeft: '6px' }}>ADMIN CONSOLE</span>
            </div>
            <div style={{ fontSize: '11px', color: '#baa9ab' }}>Library Allocation & Resource Management</div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('landing')}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            color: '#ffdadb',
            padding: '8px 16px',
            borderRadius: '999px',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.borderColor = '#ffdadb';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.16)';
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
          <span>Student Portal</span>
        </button>
      </header>

      {/* Main Login Card */}
      <main
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          flex: 1
        }}
      >
        <div
          style={{
            maxWidth: '460px',
            width: '100%',
            backgroundColor: '#262022',
            border: '1px solid rgba(216, 193, 194, 0.16)',
            borderRadius: '24px',
            padding: '36px 32px',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.45)',
            position: 'relative'
          }}
        >
          {/* Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '999px',
              backgroundColor: 'rgba(139, 72, 79, 0.3)',
              color: '#ffb2b9',
              fontSize: '12px',
              fontWeight: 600,
              marginBottom: '16px',
              border: '1px solid rgba(255, 178, 185, 0.25)'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>verified_user</span>
            <span>RESTRICTED ACCESS</span>
          </div>

          <h1 style={{ fontSize: '26px', fontWeight: 700, margin: '0 0 8px 0', letterSpacing: '-0.02em', color: '#ffffff' }}>
            Administrator Sign In
          </h1>
          <p style={{ fontSize: '14px', color: '#baa9ab', margin: '0 0 24px 0', lineHeight: 1.5 }}>
            Access library seat inventory, active reservations, student registries, and allocation analytics.
          </p>

          {/* Error Message */}
          {errorMessage && (
            <div
              style={{
                backgroundColor: 'rgba(179, 38, 30, 0.15)',
                border: '1px solid rgba(242, 184, 181, 0.35)',
                color: '#f2b8b5',
                padding: '12px 16px',
                borderRadius: '12px',
                fontSize: '13px',
                lineHeight: 1.4,
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#ffb4ab', flexShrink: 0 }}>
                error
              </span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Username */}
            <div>
              <label
                htmlFor="admin-username"
                style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#e8dcde', marginBottom: '8px' }}
              >
                Admin ID / Username
              </label>
              <div style={{ position: 'relative' }}>
                <span
                  className="material-symbols-outlined"
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#8c8083',
                    fontSize: '20px'
                  }}
                >
                  badge
                </span>
                <input
                  id="admin-username"
                  type="text"
                  required
                  placeholder="Enter admin ID"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 44px',
                    borderRadius: '12px',
                    backgroundColor: '#1b1718',
                    border: '1px solid rgba(216, 193, 194, 0.25)',
                    color: '#ffffff',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#8b484f')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(216, 193, 194, 0.25)')}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label
                  htmlFor="admin-password"
                  style={{ fontSize: '13px', fontWeight: 600, color: '#e8dcde' }}
                >
                  Password
                </label>
              </div>
              <div style={{ position: 'relative' }}>
                <span
                  className="material-symbols-outlined"
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#8c8083',
                    fontSize: '20px'
                  }}
                >
                  lock
                </span>
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 44px 12px 44px',
                    borderRadius: '12px',
                    backgroundColor: '#1b1718',
                    border: '1px solid rgba(216, 193, 194, 0.25)',
                    color: '#ffffff',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#8b484f')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(216, 193, 194, 0.25)')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: '#baa9ab',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px'
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                marginTop: '10px',
                padding: '14px',
                borderRadius: '12px',
                backgroundColor: '#8b484f',
                color: '#ffffff',
                border: 'none',
                fontWeight: 600,
                fontSize: '15px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(139, 72, 79, 0.4)',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#a3555c')}
              onMouseLeave={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#8b484f')}
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined" style={{ animation: 'spin 1s linear infinite' }}>
                    progress_activity
                  </span>
                  <span>Verifying credentials...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>login</span>
                  <span>Enter Admin Dashboard</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Credential Helper Pill */}
          <div
            style={{
              marginTop: '24px',
              padding: '14px',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              borderRadius: '12px',
              border: '1px dashed rgba(216, 193, 194, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', color: '#ffdadb', fontWeight: 600 }}>Default Admin Credentials:</span>
              <button
                type="button"
                onClick={handleQuickDemoFill}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ffb2b9',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Auto-fill
              </button>
            </div>
            <div style={{ fontSize: '12px', color: '#baa9ab', fontFamily: 'monospace' }}>
              ID: <span style={{ color: '#ffffff', fontWeight: 600 }}>admin</span> | Pass: <span style={{ color: '#ffffff', fontWeight: 600 }}>Admin@12345</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          padding: '16px 32px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          textAlign: 'center',
          fontSize: '12px',
          color: '#8c8083'
        }}
      >
        BookSpot Smart Library Allocation System • Restricted Administrator Console • © 2026 Central University Library
      </footer>
    </div>
  );
}
