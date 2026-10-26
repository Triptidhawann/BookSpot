import React, { useState } from 'react';
import signupIllustration from '../assets/signup_illustration.jpg';
import axios from 'axios';


export default function SignUpView({ onNavigate }) {
  const [formData, setFormData] = useState({ name: '', roll_no: '', password: '' });
  // const [rememberDevice, setRememberDevice] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
 

  const handleSsoClick = () => {
    setFormData({
      name: 'Alex Morgan',
      roll_no: 'CS-2024-048',
      password: 'CampusPass@2025'
    });
    setToastMessage('Prefilled institutional SSO credentials. Click Create Student Account to finalize.');
    setErrorMessage('');
  };

  function handleChange(e){
      setFormData((previous) => ({
        ...previous,
        [e.target.name]: e.target.value
      }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setToastMessage('');
    setErrorMessage('');

    try {
      const response = await axios.post('/api/register', formData);
      setToastMessage(response.data.msg || 'Account created successfully. Redirecting to sign in...');
      setFormData({ name: '', roll_no: '', password: '' });
      setTimeout(() => onNavigate('signin'), 1200);
    } catch (err) {
      setErrorMessage(err.response?.data?.msg || 'Could not create your account. Please try again.');
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
          borderBottom: '1px solid rgba(216, 193, 194, 0.3)',
          boxShadow: '0 1px 8px rgba(48, 41, 43, 0.04)'
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
            justifyContent: 'space-between',
            gap: '16px'
          }}
        >
          {/* Logo & Live Availability */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              onClick={() => onNavigate('landing')}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
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
                  boxShadow: '0 1px 3px rgba(48, 41, 43, 0.06)'
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

            <span className="desktop-only" style={{ height: '16px', width: '1px', backgroundColor: 'rgba(216, 193, 194, 0.6)' }} />

            <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--on-surface-variant)' }}>
              <span
                style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--tertiary)' }}
                className="animate-pulse-slow"
              />
              <span>Main Quad Hall: 142 Desks Available Now</span>
            </div>
          </div>

          {/* Right Institutional Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--on-surface-variant)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--tertiary)' }}>
              verified_user
            </span>
            <span className="desktop-only">Institutional SSO v4.2 • Term Spring 2025</span>
          </div>
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
        <div style={{ width: '100%', maxWidth: '1280px', margin: '0 auto', padding: 'var(--space-sm) 0' }}>
          <div
            style={{
              width: '100%',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: 'var(--space-lg)',
              alignItems: 'stretch'
            }}
          >
            {/* Left Column: Academic Storytelling & Visual */}
            <div
              style={{
                backgroundColor: 'var(--surface-container-low)',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-xl)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-sm)',
                border: '1px solid rgba(216, 193, 194, 0.25)'
              }}
            >
              {/* Blur orbs */}
              <div
                style={{
                  position: 'absolute',
                  top: '-96px',
                  left: '-96px',
                  width: '320px',
                  height: '320px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 206, 210, 0.4)',
                  filter: 'blur(48px)',
                  pointerEvents: 'none'
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: '-96px',
                  right: '-96px',
                  width: '320px',
                  height: '320px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(195, 237, 203, 0.3)',
                  filter: 'blur(48px)',
                  pointerEvents: 'none'
                }}
              />

              {/* Storytelling Header */}
              <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 12px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--surface-container-lowest)',
                    boxShadow: 'var(--shadow-xs)',
                    width: 'fit-content'
                  }}
                >
                  <span
                    style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--tertiary)' }}
                    className="animate-pulse-slow"
                  />
                  <span
                    className="label-sm"
                    style={{ textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--on-surface-variant)', fontWeight: 600 }}
                  >
                    Reserved Reading Spaces
                  </span>
                </div>

                <h2
                  className="headline-xl"
                  style={{ fontSize: '32px', fontWeight: 600, color: 'var(--on-surface)', letterSpacing: '-0.02em', lineHeight: 1.2, marginTop: '4px' }}
                >
                  Unlock Your Full
                  <br />
                  Potential
                </h2>

                <p className="body-md" style={{ color: 'var(--on-surface-variant)', lineHeight: 1.6, marginTop: '2px' }}>
                  Access silent carrels, collaborative media suites, and archival desks across all university campus libraries.
                </p>
              </div>

              {/* Center Illustration Card */}
              <div
                style={{
                  position: 'relative',
                  zIndex: 10,
                  margin: 'var(--space-md) 0',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                <div
                  style={{
                    width: '100%',
                    maxWidth: '300px',
                    aspectRatio: '1 / 1',
                    borderRadius: 'var(--radius-xl)',
                    backgroundColor: 'var(--surface-container-lowest)',
                    padding: '12px',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    border: '1px solid rgba(216, 193, 194, 0.2)'
                  }}
                >
                  <img
                    src={signupIllustration}
                    alt="BookSpot Library Access Illustration"
                    style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 'var(--radius-lg)' }}
                  />
                  <div style={{ width: '100%', paddingTop: '6px', display: 'flex', justifyContent: 'center' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        color: 'var(--on-surface-variant)',
                        padding: '2px 10px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: 'var(--surface-container-low)',
                        border: '1px solid rgba(216, 193, 194, 0.3)',
                        fontWeight: 500
                      }}
                    >
                      East Atrium • Pod 14B
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Quote Banner */}
              <div
                style={{
                  position: 'relative',
                  zIndex: 10,
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-default)',
                  backgroundColor: 'rgba(255, 255, 255, 0.85)',
                  border: '1px solid rgba(216, 193, 194, 0.4)'
                }}
              >
                <p className="body-sm" style={{ color: 'var(--on-surface-variant)', fontStyle: 'italic', margin: 0, lineHeight: 1.5 }}>
                  “Deep concentration is the bedrock of original research.”
                </p>
                <span style={{ display: 'block', fontSize: '11px', color: 'var(--on-surface-variant)', opacity: 0.75, fontWeight: 600, marginTop: '4px' }}>
                  — University Library Services
                </span>
              </div>
            </div>

            {/* Right Column: Registration Form */}
            <div
              style={{
                backgroundColor: 'var(--surface-container-lowest)',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-xl)',
                boxShadow: 'var(--shadow-sm)',
                border: '1px solid rgba(216, 193, 194, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}
            >
              <div style={{ maxWidth: '440px', width: '100%', margin: '0 auto' }}>
                {/* Title and Subtitle */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', marginBottom: '4px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                      school
                    </span>
                    <span className="label-md" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                      University Identity Portal
                    </span>
                  </div>
                  <h1
                    className="headline-lg"
                    style={{ fontSize: '26px', fontWeight: 600, color: 'var(--on-surface)', letterSpacing: '-0.02em' }}
                  >
                    Create student account
                  </h1>
                  <p className="body-md" style={{ color: 'var(--on-surface-variant)', marginTop: '4px', fontSize: '13px', lineHeight: 1.5 }}>
                    Join BookSpot to find and reserve your ideal quiet study space across university libraries.
                  </p>
                </div>

                {/* SSO Button */}
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
                    boxShadow: 'var(--shadow-xs)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface-container)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface-container-low)')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--primary)' }}>
                      account_balance
                    </span>
                    <span style={{ fontWeight: 600 }}>Sign up with Institutional SSO</span>
                  </div>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--on-surface-variant)' }}>
                    arrow_forward
                  </span>
                </button>

                {/* Divider */}
                <div
                  style={{
                    position: 'relative',
                    margin: '20px 0',
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
                    or register with student credentials
                  </span>
                </div>

                {/* Form */}
                <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Full Name */}
                  <div>
                    <label htmlFor="signup-name" className="label-sm" style={{ display: 'block', color: 'var(--on-surface)', fontWeight: 600, marginBottom: '6px' }}>
                      Full Name
                    </label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <span
                        className="material-symbols-outlined"
                        style={{ position: 'absolute', left: '12px', fontSize: '18px', color: 'var(--outline)', pointerEvents: 'none' }}
                      >
                        person
                      </span>
                      <input
                        id="signup-name"
                        type="text"
                        required
                        value={formData.name}
                        name = "name"
                        onChange={handleChange}
                        placeholder="e.g. Alex Morgan"
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

                  {/* University Email */}
                  <div>
                    <label htmlFor="signup-email" className="label-sm" style={{ display: 'block', color: 'var(--on-surface)', fontWeight: 600, marginBottom: '6px' }}>
                      University Email or Campus ID
                    </label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <span
                        className="material-symbols-outlined"
                        style={{ position: 'absolute', left: '12px', fontSize: '18px', color: 'var(--outline)', pointerEvents: 'none' }}
                      >
                        alternate_email
                      </span>
                      <input
                        id="signup-email"
                        type="text"
                        name="roll_no"
                        required
                        value={formData.roll_no}
                        onChange={handleChange}
                        placeholder="e.g. alex.morgan@univ.edu"
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

                  {/* Create Password */}
                  <div>
                    <label htmlFor="signup-password" className="label-sm" style={{ display: 'block', color: 'var(--on-surface)', fontWeight: 600, marginBottom: '6px' }}>
                      Create Password
                    </label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <span
                        className="material-symbols-outlined"
                        style={{ position: 'absolute', left: '12px', fontSize: '18px', color: 'var(--outline)', pointerEvents: 'none' }}
                      >
                        lock
                      </span>
                      <input
                        id="signup-password"
                        type="password"
                        required
                        name = "password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="At least 8 characters"
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
                      marginTop: '6px',
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
                        <span>Creating account...</span>
                      </>
                    ) : (
                      <>
                        <span>Create Student Account</span>
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                          arrow_forward
                        </span>
                      </>
                    )}
                  </button>
                </form>

                {/* Error Message */}
                {errorMessage && (
                  <div
                    style={{
                      marginTop: '14px',
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
                      marginTop: '14px',
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

                {/* Footer Switch to Sign In */}
                <div style={{ marginTop: '18px', textAlign: 'center' }}>
                  <p className="body-md" style={{ color: 'var(--on-surface-variant)', fontSize: '13px', margin: 0 }}>
                    Already have an account?{' '}
                    <a
                      href="#signin"
                      onClick={(e) => {
                        e.preventDefault();
                        onNavigate('signin');
                      }}
                      style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none', marginLeft: '4px' }}
                    >
                      Sign in
                    </a>
                  </p>
                </div>

                {/* Code of Conduct Disclaimer */}
                <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--surface-container-high)', textAlign: 'center' }}>
                  <p className="body-sm" style={{ color: 'var(--on-surface-variant)', opacity: 0.75, fontSize: '11px', margin: 0, lineHeight: 1.5 }}>
                    By joining BookSpot, you agree to respect quiet zone noise tiers and honor the University Code of Conduct.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ width: '100%', padding: 'var(--space-md) var(--margin)', textAlign: 'center' }}>
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            fontSize: '12px',
            color: 'var(--on-surface-variant)'
          }}
        >
          <p style={{ margin: 0 }}>Interactive Floor Blueprint • ADA Accessible Desks • Help Desk Ext. 4402</p>
          <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.8 }}>
            <span className="material-symbols-outlined" style={{ fontSize: '15px', color: 'var(--tertiary)' }}>
              lock
            </span>
            <span>Session encrypted via TLS 1.3</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
