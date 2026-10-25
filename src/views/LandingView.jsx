import React from 'react';
import Navbar from '../components/Navbar';
import heroIllustration from '../assets/hero_illustration.jpg';

export default function LandingView({ onNavigate, onSelectSeatAndBook }) {
  return (
    <div style={{ width: '100%', minHeight: '100vh', backgroundColor: 'var(--surface)', display: 'flex', flexDirection: 'column' }}>
      <Navbar onNavigate={onNavigate} />

      <main style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* HERO SECTION */}
        <section
          id="home"
          style={{
            width: '100%',
            padding: 'var(--space-xl) var(--margin)',
            display: 'flex',
            justifyContent: 'center',
            backgroundColor: 'var(--surface)'
          }}
        >
          <div
            style={{
              maxWidth: '1280px',
              width: '100%',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: 'var(--space-xl)',
              alignItems: 'center'
            }}
          >
            {/* Left Value Narrative */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  alignSelf: 'flex-start',
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--surface-container-high)',
                  color: 'var(--on-surface-variant)'
                }}
                className="label-sm"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--tertiary)' }}>
                  verified
                </span>
                <span>Official University Seat Management</span>
              </div>

              <h1 className="headline-xl" style={{ fontSize: '42px', lineHeight: 1.15, color: 'var(--on-surface)', letterSpacing: '-0.025em' }}>
                Find your quiet corner.
              </h1>

              <p className="body-lg" style={{ color: 'var(--on-surface-variant)', maxWidth: '520px', lineHeight: 1.6 }}>
                Your library seat, reserved in a few clicks. Spend less time searching across crowded study halls and more time studying.
              </p>

              {/* CTAs */}
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '14px', paddingTop: '8px' }}>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => onNavigate('book-a-seat')}
                  style={{ padding: '12px 24px', fontSize: '15px', borderRadius: 'var(--radius-lg)' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>chair</span>
                  <span>Book a Seat</span>
                </button>

                <a
                  href="#how-it-works"
                  className="btn-secondary"
                  style={{ padding: '12px 24px', fontSize: '15px', borderRadius: 'var(--radius-lg)', textDecoration: 'none' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>play_circle</span>
                  <span>See How It Works</span>
                </a>
              </div>

              {/* Metric indicators */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px', paddingTop: '12px', color: 'var(--on-surface-variant)' }} className="label-md">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--tertiary)' }} />
                  <span>68 seats open now</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--primary)' }} />
                  <span>Instant SSO access</span>
                </div>
              </div>
            </div>

            {/* Right: Stitch Design Illustration Card */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div
                style={{
                  width: '100%',
                  maxWidth: '520px',
                  backgroundColor: 'var(--surface-container-lowest)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '28px',
                  boxShadow: 'var(--shadow-sm)',
                  border: '1px solid rgba(216, 193, 194, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}
              >
                <img
                  src={heroIllustration}
                  alt="Minimalist line-art illustration of a student in round glasses studying comfortably on a dusty rose beanbag chair with a laptop"
                  style={{
                    width: '100%',
                    height: 'auto',
                    objectFit: 'contain',
                    maxHeight: '440px',
                    borderRadius: 'var(--radius-lg)'
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* 4-COLUMN STATS BAR */}
        <section style={{ width: '100%', padding: 'var(--space-md) var(--margin)' }}>
          <div
            style={{
              maxWidth: '1280px',
              margin: '0 auto',
              backgroundColor: 'var(--surface-container-lowest)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-lg)',
              boxShadow: 'var(--shadow-sm)',
              border: '1px solid rgba(216, 193, 194, 0.25)'
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 'var(--space-lg)'
              }}
            >
              {/* Stat 1 */}
              <div>
                <span className="label-sm" style={{ textTransform: 'uppercase', color: 'var(--on-surface-variant)', letterSpacing: '0.05em' }}>
                  Total Seating Capacity
                </span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
                  <span className="headline-lg" style={{ fontWeight: 700, color: 'var(--on-surface)' }}>112</span>
                  <span className="body-sm" style={{ color: 'var(--on-surface-variant)' }}>chairs</span>
                </div>
                <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--surface-container-high)', borderRadius: '9999px', marginTop: '8px', overflow: 'hidden' }}>
                  <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--primary)', borderRadius: '9999px' }} />
                </div>
              </div>

              {/* Stat 2 */}
              <div>
                <span className="label-sm" style={{ textTransform: 'uppercase', color: 'var(--on-surface-variant)', letterSpacing: '0.05em' }}>
                  Available Right Now
                </span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
                  <span className="headline-lg" style={{ fontWeight: 700, color: 'var(--tertiary)' }}>68</span>
                  <span className="label-sm" style={{ color: 'var(--tertiary)', fontWeight: 600 }}>Ready to reserve</span>
                </div>
                <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--surface-container-high)', borderRadius: '9999px', marginTop: '8px', overflow: 'hidden' }}>
                  <div style={{ width: '61%', height: '100%', backgroundColor: 'var(--tertiary)', borderRadius: '9999px' }} />
                </div>
              </div>

              {/* Stat 3 */}
              <div>
                <span className="label-sm" style={{ textTransform: 'uppercase', color: 'var(--on-surface-variant)', letterSpacing: '0.05em' }}>
                  Currently Occupied
                </span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
                  <span className="headline-lg" style={{ fontWeight: 700, color: 'var(--secondary)' }}>36</span>
                  <span className="body-sm" style={{ color: 'var(--on-surface-variant)' }}>Checked-in</span>
                </div>
                <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--surface-container-high)', borderRadius: '9999px', marginTop: '8px', overflow: 'hidden' }}>
                  <div style={{ width: '32%', height: '100%', backgroundColor: 'var(--secondary)', borderRadius: '9999px' }} />
                </div>
              </div>

              {/* Stat 4 */}
              <div>
                <span className="label-sm" style={{ textTransform: 'uppercase', color: 'var(--on-surface-variant)', letterSpacing: '0.05em' }}>
                  Silent Zones Index
                </span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
                  <span className="headline-lg" style={{ fontWeight: 700, color: 'var(--primary)' }}>92%</span>
                  <span className="label-sm" style={{ color: 'var(--on-surface-variant)' }}>High availability</span>
                </div>
                <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--surface-container-high)', borderRadius: '9999px', marginTop: '8px', overflow: 'hidden' }}>
                  <div style={{ width: '92%', height: '100%', backgroundColor: 'var(--primary-container)', borderRadius: '9999px' }} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3 CORE FEATURE CARDS */}
        <section
          id="features-section"
          style={{ width: '100%', padding: 'var(--space-xl) var(--margin)' }}
        >
          <div
            style={{
              maxWidth: '1280px',
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-lg)'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '640px' }}>
              <span className="label-md" style={{ color: 'var(--primary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Designed For Deep Focus
              </span>
              <h2 className="headline-lg" style={{ color: 'var(--on-surface)', fontSize: '28px' }}>
                Built specifically for campus research and exam prep.
              </h2>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: 'var(--space-md)'
              }}
            >
              {/* Feature 1 */}
              <div
                style={{
                  backgroundColor: 'var(--surface-container-lowest)',
                  borderRadius: 'var(--radius-xl)',
                  padding: 'var(--space-lg)',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: '1px solid rgba(216, 193, 194, 0.25)'
                }}
              >
                <div>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: 'var(--radius-default)',
                      backgroundColor: 'var(--surface-container)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 'var(--space-md)'
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>view_quilt</span>
                  </div>
                  <h3 className="headline-sm" style={{ color: 'var(--on-surface)', marginBottom: '8px' }}>
                    Interactive Seat Map
                  </h3>
                  <p className="body-md" style={{ color: 'var(--on-surface-variant)', lineHeight: 1.6 }}>
                    Find and select your preferred seat visually with our digital replica of the library floor plan. Pinpoint quiet alcoves, study carrels, and natural window lighting before stepping foot inside.
                  </p>
                </div>
                <div
                  onClick={() => onNavigate('book-a-seat')}
                  style={{
                    paddingTop: 'var(--space-md)',
                    marginTop: 'var(--space-md)',
                    color: 'var(--primary)',
                    fontWeight: 600,
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer'
                  }}
                >
                  <span>Explore live layout</span>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
                </div>
              </div>

              {/* Feature 2 */}
              <div
                style={{
                  backgroundColor: 'var(--surface-container-lowest)',
                  borderRadius: 'var(--radius-xl)',
                  padding: 'var(--space-lg)',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: '1px solid rgba(216, 193, 194, 0.25)'
                }}
              >
                <div>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: 'var(--radius-default)',
                      backgroundColor: 'var(--surface-container)',
                      color: 'var(--tertiary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 'var(--space-md)'
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>schedule</span>
                  </div>
                  <h3 className="headline-sm" style={{ color: 'var(--on-surface)', marginBottom: '8px' }}>
                    Flexible Reservations
                  </h3>
                  <p className="body-md" style={{ color: 'var(--on-surface-variant)', lineHeight: 1.6 }}>
                    Reserve your seat for 1 to 12 hours according to your study schedule and library hours. Need to extend? Renew seamlessly with a single tap from your mobile dashboard if no queue is waiting.
                  </p>
                </div>
                <div
                  onClick={() => onNavigate('book-a-seat')}
                  style={{
                    paddingTop: 'var(--space-md)',
                    marginTop: 'var(--space-md)',
                    color: 'var(--tertiary)',
                    fontWeight: 600,
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer'
                  }}
                >
                  <span>View slot policy</span>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
                </div>
              </div>

              {/* Feature 3 */}
              <div
                style={{
                  backgroundColor: 'var(--surface-container-lowest)',
                  borderRadius: 'var(--radius-xl)',
                  padding: 'var(--space-lg)',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: '1px solid rgba(216, 193, 194, 0.25)'
                }}
              >
                <div>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: 'var(--radius-default)',
                      backgroundColor: 'var(--surface-container)',
                      color: 'var(--secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 'var(--space-md)'
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>badge</span>
                  </div>
                  <h3 className="headline-sm" style={{ color: 'var(--on-surface)', marginBottom: '8px' }}>
                    Easy Booking Management
                  </h3>
                  <p className="body-md" style={{ color: 'var(--on-surface-variant)', lineHeight: 1.6 }}>
                    View, manage, check in, or cancel reservations anytime with student ID single sign-on. Fast QR verification at entrance turnstiles releases desks when you're done early.
                  </p>
                </div>
                <div
                  onClick={() => onNavigate('dashboard')}
                  style={{
                    paddingTop: 'var(--space-md)',
                    marginTop: 'var(--space-md)',
                    color: 'var(--secondary)',
                    fontWeight: 600,
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer'
                  }}
                >
                  <span>Campus SSO integration</span>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS 3-STEP PROGRESSION */}
        <section
          id="how-it-works"
          style={{ width: '100%', padding: 'var(--space-xl) var(--margin)', backgroundColor: 'var(--surface-container-low)' }}
        >
          <div
            style={{
              maxWidth: '1280px',
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-lg)'
            }}
          >
            <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span className="label-md" style={{ color: 'var(--primary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Effortless Workflow
              </span>
              <h2 className="headline-lg" style={{ color: 'var(--on-surface)', fontSize: '28px' }}>
                How BookSpot Works in 3 Steps
              </h2>
              <p className="body-md" style={{ color: 'var(--on-surface-variant)' }}>
                Simple, rapid verification designed so students spend their time learning rather than waiting.
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '24px'
              }}
            >
              {/* Step 1 */}
              <div
                style={{
                  backgroundColor: 'var(--surface-container-lowest)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '24px',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary)',
                    color: 'var(--on-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '18px'
                  }}
                >
                  1
                </div>
                <div>
                  <h3 className="headline-sm" style={{ color: 'var(--on-surface)', marginBottom: '8px' }}>
                    Sign in with College Credentials
                  </h3>
                  <p className="body-md" style={{ color: 'var(--on-surface-variant)', lineHeight: 1.6 }}>
                    Use your university email and student Roll Number. No extra account creation or passwords to remember; instant federated security.
                  </p>
                </div>
                <div style={{ marginTop: 'auto', paddingTop: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--on-surface-variant)', fontSize: '12px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--tertiary)' }}>lock</span>
                  <span>Campus CAS / SAML Protected</span>
                </div>
              </div>

              {/* Step 2 */}
              <div
                style={{
                  backgroundColor: 'var(--surface-container-lowest)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '24px',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary)',
                    color: 'var(--on-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '18px'
                  }}
                >
                  2
                </div>
                <div>
                  <h3 className="headline-sm" style={{ color: 'var(--on-surface)', marginBottom: '8px' }}>
                    Explore Map & Pick a Desk
                  </h3>
                  <p className="body-md" style={{ color: 'var(--on-surface-variant)', lineHeight: 1.6 }}>
                    Explore the digital library floor plan in real-time. Choose your preferred study zone—Silent Reading, Window Carrel, or Group Collab Island.
                  </p>
                </div>
                <div style={{ marginTop: 'auto', paddingTop: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--on-surface-variant)', fontSize: '12px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--tertiary)' }}>check_circle</span>
                  <span>Real-time availability sync</span>
                </div>
              </div>

              {/* Step 3 */}
              <div
                style={{
                  backgroundColor: 'var(--surface-container-lowest)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '24px',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary)',
                    color: 'var(--on-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '18px'
                  }}
                >
                  3
                </div>
                <div>
                  <h3 className="headline-sm" style={{ color: 'var(--on-surface)', marginBottom: '8px' }}>
                    Select Duration & Check In
                  </h3>
                  <p className="body-md" style={{ color: 'var(--on-surface-variant)', lineHeight: 1.6 }}>
                    Select your reservation duration (1 to 12 hours) and tap confirm. Scan your digital student pass at the entrance scanner when you arrive.
                  </p>
                </div>
                <div style={{ marginTop: 'auto', paddingTop: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--on-surface-variant)', fontSize: '12px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--tertiary)' }}>qr_code_scanner</span>
                  <span>Fast contactless confirmation</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* LIBRARY RULES & GUIDELINES SECTION */}
        <section
          id="guidelines-section"
          style={{ width: '100%', padding: 'var(--space-xl) var(--margin)' }}
        >
          <div
            style={{
              maxWidth: '1280px',
              margin: '0 auto',
              backgroundColor: 'var(--surface-container-lowest)',
              borderRadius: 'var(--radius-xl)',
              padding: '32px',
              boxShadow: 'var(--shadow-sm)',
              border: '1px solid rgba(216, 193, 194, 0.25)'
            }}
          >
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                paddingBottom: '24px',
                borderBottom: '1px solid rgba(216, 193, 194, 0.2)'
              }}
            >
              <div>
                <span className="label-md" style={{ color: 'var(--primary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Guidelines & Code of Conduct
                </span>
                <h2 className="headline-lg" style={{ color: 'var(--on-surface)', marginTop: '4px' }}>
                  Library Rules & Reservation Policies
                </h2>
              </div>
              <div
                style={{
                  backgroundColor: 'var(--surface-container-high)',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-default)',
                  color: 'var(--on-surface-variant)',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--primary)' }}>policy</span>
                <span>Dean of Academic Libraries & Student Affairs</span>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '24px',
                paddingTop: '24px'
              }}
            >
              {/* Policy 1 */}
              <div style={{ backgroundColor: 'var(--surface-container-low)', padding: '16px', borderRadius: 'var(--radius-default)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 600 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>timer</span>
                  <span>12h Max Window</span>
                </div>
                <p className="body-sm" style={{ color: 'var(--on-surface-variant)' }}>
                  Reservations are capped at 12 continuous hours per day to ensure equitable access during midterm and finals weeks.
                </p>
              </div>

              {/* Policy 2 */}
              <div style={{ backgroundColor: 'var(--surface-container-low)', padding: '16px', borderRadius: 'var(--radius-default)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 600 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>alarm</span>
                  <span>15-Minute Grace Period</span>
                </div>
                <p className="body-sm" style={{ color: 'var(--on-surface-variant)' }}>
                  Please check in within 15 minutes of your booking start time via the kiosk scanners or your seat is released back to fellow students.
                </p>
              </div>

              {/* Policy 3 */}
              <div style={{ backgroundColor: 'var(--surface-container-low)', padding: '16px', borderRadius: 'var(--radius-default)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 600 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>restart_alt</span>
                  <span>Automatic Desk Release</span>
                </div>
                <p className="body-sm" style={{ color: 'var(--on-surface-variant)' }}>
                  Leaving early? Hit "Release Seat" in your student portal so peers on the waitlist can utilize the workspace without delay.
                </p>
              </div>

              {/* Policy 4 */}
              <div style={{ backgroundColor: 'var(--surface-container-low)', padding: '16px', borderRadius: 'var(--radius-default)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 600 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>volume_off</span>
                  <span>Silent Zone Courtesy</span>
                </div>
                <p className="body-sm" style={{ color: 'var(--on-surface-variant)' }}>
                  Strict silence is upheld in Level 2 East & West bays. Phone conversations must be taken to the stairwell atrium.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* BOTTOM ACTION CALLOUT */}
        <section style={{ width: '100%', padding: 'var(--space-xl) var(--margin)' }}>
          <div
            style={{
              maxWidth: '1280px',
              margin: '0 auto',
              backgroundColor: 'var(--surface-container)',
              borderRadius: 'var(--radius-xl)',
              padding: '36px',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '24px'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '560px' }}>
              <h2 className="headline-xl" style={{ fontSize: '32px', color: 'var(--on-surface)', letterSpacing: '-0.02em' }}>
                Ready for a productive session?
              </h2>
              <p className="body-lg" style={{ color: 'var(--on-surface-variant)' }}>
                Reserve your preferred desk now and skip the morning race to find an empty outlet.
              </p>
            </div>

            <button
              type="button"
              className="btn-primary"
              onClick={() => onNavigate('book-a-seat')}
              style={{ padding: '14px 28px', fontSize: '15px', borderRadius: 'var(--radius-default)' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>event_seat</span>
              <span>Reserve My Seat Now</span>
            </button>
          </div>
        </section>

        {/* ACADEMIC FOOTER */}
        <footer
          style={{
            width: '100%',
            backgroundColor: 'var(--surface-container-lowest)',
            marginTop: 'var(--space-xl)',
            padding: '48px var(--margin)',
            color: 'var(--on-surface-variant)',
            borderTop: '1px solid rgba(216, 193, 194, 0.25)'
          }}
        >
          <div
            style={{
              maxWidth: '1280px',
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '32px'
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '32px'
              }}
            >
              <div style={{ gridColumn: 'span 2' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
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
                      fontWeight: 'bold'
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>auto_stories</span>
                  </div>
                  <span className="headline-sm" style={{ color: 'var(--on-surface)', fontWeight: 700 }}>
                    BookSpot
                  </span>
                </div>
                <p className="body-sm" style={{ color: 'var(--on-surface-variant)', maxWidth: '360px', lineHeight: 1.6 }}>
                  University Library Spatial Reservation Platform. Making academic spaces accessible, quiet, and predictable for every researcher and student.
                </p>
              </div>

              <div>
                <span className="label-sm" style={{ fontWeight: 600, textTransform: 'uppercase', color: 'var(--on-surface)', letterSpacing: '0.05em' }}>
                  Platform
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px', fontSize: '13px' }}>
                  <span style={{ cursor: 'pointer' }} onClick={() => onNavigate('book-a-seat')}>Live Floor Plan</span>
                  <span style={{ cursor: 'pointer' }} onClick={() => onNavigate('book-a-seat')}>Available Desks</span>
                  <span style={{ cursor: 'pointer' }} onClick={() => onNavigate('dashboard')}>Student Dashboard</span>
                </div>
              </div>

              <div>
                <span className="label-sm" style={{ fontWeight: 600, textTransform: 'uppercase', color: 'var(--on-surface)', letterSpacing: '0.05em' }}>
                  Resources
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px', fontSize: '13px' }}>
                  <span>Study Zones Directory</span>
                  <span>Wi-Fi & Outlets Guide</span>
                  <span>Accessibility Services</span>
                </div>
              </div>

              <div>
                <span className="label-sm" style={{ fontWeight: 600, textTransform: 'uppercase', color: 'var(--on-surface)', letterSpacing: '0.05em' }}>
                  Campus Governance
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px', fontSize: '13px' }}>
                  <span>Office of Academic Spaces</span>
                  <span>Student Code of Conduct</span>
                  <span>Help Desk & Librarians</span>
                </div>
              </div>
            </div>

            <div
              style={{
                borderTop: '1px solid rgba(216, 193, 194, 0.2)',
                paddingTop: '20px',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                fontSize: '12px',
                color: 'var(--on-surface-variant)'
              }}
            >
              <span>© 2026 Central University Library System. All rights reserved.</span>
              <span>Designed with Serene Academic Reserve Theme</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
