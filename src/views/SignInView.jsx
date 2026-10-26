import React, { useState } from 'react';
import signinIllustration from '../assets/signin_illustration.jpg';
import axios from 'axios';

export default function SignInView({ onNavigate, onAuthenticated }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSsoClick = () => {
    // Fill demo student account and authenticate
    setEmail('TEST_01');
    setPassword('password123');
    setToastMessage('Prefilled institutional credentials for demo student (TEST_01). Click Sign In below.');
    setErrorMessage('');
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setToastMessage('');
    setErrorMessage('');

    const rollToSubmit = email.trim();

    try {
      const response = await axios.post('/api/login', {
        roll_no: rollToSubmit,
        password
      });

      const data = response.data;

      if (data.status) {
        setToastMessage(data.msg || 'Login successful! Redirecting to student dashboard...');
        // Store authenticated user session
        if (data.user) {
          localStorage.setItem('bookspot_user', JSON.stringify(data.user));
          onAuthenticated?.(data.user);
        } else {
          const fallbackUser = { roll_no: rollToSubmit, name: 'Student ' + rollToSubmit };
          localStorage.setItem('bookspot_user', JSON.stringify(fallbackUser));
          onAuthenticated?.(fallbackUser);
        }

        setTimeout(() => {
          onNavigate('dashboard');
        }, 1200);
      } else {
        setErrorMessage(data.msg || 'Invalid roll number or password. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setErrorMessage(err.response?.data?.msg || 'Could not connect to the authentication server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--surface)',
        color: 'var(--on-surface)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
    >
      {/* Fixed Header */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          backgroundColor: 'rgba(255, 247, 249, 0.85)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(216, 193, 194, 0.3)'
        }}
      >
        <div
          style={{
            height: '64px',
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 var(--margin)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          {/* Logo */}
          <div
            onClick={() => onNavigate('landing')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          >
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: 'var(--radius-default)',
                backgroundColor: 'var(--primary)',
                color: 'var(--on-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-xs)'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                menu_book
              </span>
            </div>
            <span
              className="headline-md"
              style={{ fontSize: '18px', fontWeight: 700, color: '#30292B', letterSpacing: '-0.02em' }}
            >
              BookSpot
            </span>
          </div>

          {/* Back link */}
          <button
            type="button"
            onClick={() => onNavigate('landing')}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--on-surface-variant)',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'color 0.15s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--on-surface-variant)')}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              arrow_back
            </span>
            <span>Back to Library Home</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main
        style={{
          width: '100%',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--space-md) var(--margin)'
        }}
      >
        <div style={{ width: '100%', maxWidth: '1024px', margin: '0 auto' }}>
          {/* Dual Card Container */}
          <div
            style={{
              backgroundColor: 'var(--surface-container-lowest)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: '0 4px 24px rgba(48, 41, 43, 0.06), 0 1px 3px rgba(48, 41, 43, 0.03)',
              overflow: 'hidden',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              minHeight: '620px',
              border: '1px solid rgba(216, 193, 194, 0.25)'
            }}
          >
            {/* Left Column: Storytelling & Visual */}
            <div
              style={{
                backgroundColor: 'var(--surface-container-low)',
                padding: 'var(--space-xl)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Subtle Decorative Gradient Orbs */}
              <div
                style={{
                  position: 'absolute',
                  top: '-64px',
                  left: '-64px',
                  width: '240px',
                  height: '240px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 206, 210, 0.35)',
                  filter: 'blur(40px)',
                  pointerEvents: 'none'
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: '16px',
                  right: '16px',
                  width: '180px',
                  height: '180px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(195, 237, 203, 0.25)',
                  filter: 'blur(36px)',
                  pointerEvents: 'none'
                }}
              />

              {/* Top Meta */}
              <div style={{ position: 'relative', zIndex: 10 }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 12px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--surface-container)',
                    color: 'var(--secondary)',
                    fontSize: '11px',
                    fontWeight: 600,
                    letterSpacing: '0.02em',
                    marginBottom: '14px'
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                    chair
                  </span>
                  <span>Reserved Reading Spaces</span>
                </div>

                <h2
                  className="headline-lg"
                  style={{ fontSize: '24px', fontWeight: 600, color: 'var(--on-surface)', letterSpacing: '-0.01em', lineHeight: 1.25 }}
                >
                  Unlock Your Quiet Corner
                </h2>
                <p
                  className="body-md"
                  style={{ color: 'var(--on-surface-variant)', marginTop: '8px', lineHeight: 1.6 }}
                >
                  Reserve distraction-free study carrels, silent zones, and collaborative rooms in seconds with your university credentials.
                </p>
              </div>

              {/* Center Image with Desk Spec Tag */}
              <div
                style={{
                  position: 'relative',
                  zIndex: 10,
                  margin: 'var(--space-md) 0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: '300px',
                    aspectRatio: '1 / 1',
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    backgroundColor: 'var(--surface-container)',
                    boxShadow: '0 2px 12px rgba(48, 41, 43, 0.05)',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <img
                    src={signinIllustration}
                    alt="Student unlocking dedicated quiet study room with a key in line-art with serene rose accents"
                    style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 'var(--radius-default)' }}
                  />

                  {/* Floating Desk Spec Tag */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '12px',
                      left: '12px',
                      right: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.92)',
                      backdropFilter: 'blur(8px)',
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-default)',
                      boxShadow: 'var(--shadow-xs)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '11px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--tertiary)' }}
                      />
                      <span style={{ color: 'var(--on-surface)', fontWeight: 600 }}>East Atrium • Pod 14B</span>
                    </div>
                    <span style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: 600 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>bolt</span>
                      Outlet
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Quote */}
              <div style={{ position: 'relative', zIndex: 10, paddingTop: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--surface-container-high)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--primary)' }}>
                      local_library
                    </span>
                  </div>
                  <div>
                    <p className="body-sm" style={{ color: 'var(--on-surface-variant)', fontStyle: 'italic', margin: 0 }}>
                      “Deep concentration is the bedrock of original research.”
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Authentication Form */}
            <div
              style={{
                padding: 'var(--space-xl)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                backgroundColor: 'var(--surface-container-lowest)'
              }}
            >
              <div style={{ maxWidth: '420px', width: '100%', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ marginBottom: '24px' }}>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 12px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'rgba(255, 206, 210, 0.45)',
                      color: 'var(--on-secondary-container)',
                      marginBottom: '10px',
                      fontSize: '11px',
                      fontWeight: 600,
                      letterSpacing: '0.02em'
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--primary)' }}>
                      school
                    </span>
                    <span>University Identity Portal</span>
                  </div>

                  <h1
                    className="headline-lg"
                    style={{ fontSize: '26px', fontWeight: 600, color: 'var(--on-surface)', letterSpacing: '-0.02em' }}
                  >
                    Welcome back
                  </h1>
                  <p className="body-md" style={{ color: 'var(--on-surface-variant)', marginTop: '4px', fontSize: '13px', lineHeight: 1.5 }}>
                    Sign in with your university student or faculty account to manage your reservations and seat check-ins.
                  </p>
                </div>

                {/* Institutional SSO Button */}
                <button
                  type="button"
                  onClick={handleSsoClick}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 16px',
                    borderRadius: 'var(--radius-default)',
                    backgroundColor: 'var(--surface-container-low)',
                    border: '1px solid rgba(216, 193, 194, 0.3)',
                    color: 'var(--on-surface)',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: 'var(--shadow-xs)'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface-container)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface-container-low)')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '4px',
                        backgroundColor: 'var(--primary)',
                        color: 'var(--on-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 700
                      }}
                    >
                      U
                    </div>
                    <span>Sign in with Institutional Roll Number</span>
                  </div>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--on-surface-variant)' }}>
                    arrow_forward
                  </span>
                </button>

                {/* Divider */}
                <div
                  style={{
                    position: 'relative',
                    margin: '22px 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <div style={{ position: 'absolute', width: '100%', height: '1px', backgroundColor: 'var(--surface-container-high)' }} />
                  <span
                    style={{
                      position: 'relative',
                      padding: '0 12px',
                      backgroundColor: 'var(--surface-container-lowest)',
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: 'var(--on-surface-variant)'
                    }}
                  >
                    or sign in with student email
                  </span>
                </div>

                {/* Form */}
                <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Email */}
                  <div>
                    <label
                     
                      className="label-sm"
                      style={{ display: 'block', color: 'var(--on-surface)', fontWeight: 600, marginBottom: '6px' }}
                    >
                      University Email or Campus ID
                    </label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <span
                        className="material-symbols-outlined"
                        style={{
                          position: 'absolute',
                          left: '12px',
                          fontSize: '18px',
                          color: 'var(--outline)',
                          pointerEvents: 'none'
                        }}
                      >
                        alternate_email
                      </span>
                      <input
                        id="signin-email"
                        type="text"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="s1234567@university.edu"
                        style={{
                          width: '100%',
                          padding: '10px 12px 10px 38px',
                          borderRadius: 'var(--radius-default)',
                          border: '1px solid rgba(216, 193, 194, 0.6)',
                          backgroundColor: 'var(--surface-container-lowest)',
                          color: 'var(--on-surface)',
                          fontSize: '14px',
                          outline: 'none',
                          transition: 'border 0.2s ease, box-shadow 0.2s ease'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = 'var(--primary)';
                          e.target.style.boxShadow = '0 0 0 3px rgba(139, 72, 79, 0.15)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'rgba(216, 193, 194, 0.6)';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <label htmlFor="signin-password" className="label-sm" style={{ color: 'var(--on-surface)', fontWeight: 600 }}>
                        Password
                      </label>
                      <a
                        href="#forgot"
                        onClick={(e) => {
                          e.preventDefault();
                          setToastMessage('Password recovery link sent to registered campus email.');
                        }}
                        style={{ fontSize: '11px', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}
                      >
                        Forgot password?
                      </a>
                    </div>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <span
                        className="material-symbols-outlined"
                        style={{
                          position: 'absolute',
                          left: '12px',
                          fontSize: '18px',
                          color: 'var(--outline)',
                          pointerEvents: 'none'
                        }}
                      >
                        lock
                      </span>
                      <input
                        id="signin-password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        style={{
                          width: '100%',
                          padding: '10px 38px 10px 38px',
                          borderRadius: 'var(--radius-default)',
                          border: '1px solid rgba(216, 193, 194, 0.6)',
                          backgroundColor: 'var(--surface-container-lowest)',
                          color: 'var(--on-surface)',
                          fontSize: '14px',
                          outline: 'none',
                          transition: 'border 0.2s ease, box-shadow 0.2s ease'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = 'var(--primary)';
                          e.target.style.boxShadow = '0 0 0 3px rgba(139, 72, 79, 0.15)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'rgba(216, 193, 194, 0.6)';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute',
                          right: '10px',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--outline)',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        aria-label="Toggle password visibility"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                          {showPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={isLoading}
                    style={{
                      width: '100%',
                      marginTop: '8px',
                      padding: '12px 20px',
                      fontSize: '14px',
                      fontWeight: 600,
                      borderRadius: 'var(--radius-default)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    {isLoading ? (
                      <>
                        <span className="material-symbols-outlined animate-spin" style={{ fontSize: '18px' }}>
                          progress_activity
                        </span>
                        <span>Verifying credentials...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In to BookSpot</span>
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                          login
                        </span>
                      </>
                    )}
                  </button>
                </form>

                {/* Error Message */}
                {errorMessage && (
                  <div
                    style={{
                      marginTop: '16px',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-default)',
                      backgroundColor: 'var(--error-container)',
                      color: 'var(--on-error-container)',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      border: '1px solid rgba(186, 26, 26, 0.3)'
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--error)' }}>
                      error
                    </span>
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Toast Notification message */}
                {toastMessage && (
                  <div
                    style={{
                      marginTop: '16px',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-default)',
                      backgroundColor: 'var(--secondary-container)',
                      color: 'var(--on-secondary-container)',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      border: '1px solid rgba(216, 193, 194, 0.4)'
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--primary)' }}>
                      info
                    </span>
                    <span>{toastMessage}</span>
                  </div>
                )}

                {/* Footer Switch to Sign Up */}
                <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--surface-container-high)', textAlign: 'center' }}>
                  <p className="body-sm" style={{ color: 'var(--on-surface-variant)', margin: 0 }}>
                    Don't have an academic seat profile yet?{' '}
                    <a
                      href="#signup"
                      onClick={(e) => {
                        e.preventDefault();
                        onNavigate('signup');
                      }}
                      style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none', marginLeft: '4px' }}
                    >
                      Register Student Account
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ width: '100%', padding: 'var(--space-md) var(--margin)', textAlign: 'center' }}>
        <p className="body-sm" style={{ color: 'var(--on-surface-variant)', fontSize: '12px', margin: 0 }}>
          Academic Reserve & Study Hall Management • University Library System
        </p>
      </footer>
    </div>
  );
}
