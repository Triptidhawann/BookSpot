import React, { useState } from 'react';
import { API_URL, api } from '../utils/api';

export default function CheckInView({ onNavigate }) {
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('Sign in to check in to your reservation.');
  const [details, setDetails] = useState(null);

  const handleCheckIn = async (event) => {
    event.preventDefault();
    if (!localStorage.getItem('token')) {
      setStatus('error');
      setMessage('Sign in with your student account before checking in.');
      return;
    }

    setStatus('loading');
    setMessage('Verifying your reservation...');
    try {
      const response = await api.post(`${API_URL}/check-in`, {});
      setDetails(response.data);
      setStatus('success');
      setMessage(response.data.msg || 'Check-in successful');
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.msg || 'Unable to complete check-in.');
    }
  };

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'var(--surface)' }}>
      <section style={{ width: '100%', maxWidth: '440px', borderRadius: '24px', background: 'var(--surface-container-lowest)', boxShadow: 'var(--shadow-md)', padding: '32px', textAlign: 'center' }}>
        <div style={{ width: '72px', height: '72px', margin: '0 auto 16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: status === 'success' ? 'var(--tertiary-fixed)' : status === 'error' ? 'var(--error-container)' : 'var(--surface-container)' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '38px', color: status === 'success' ? 'var(--tertiary)' : status === 'error' ? 'var(--error)' : 'var(--primary)' }}>
            {status === 'success' ? 'task_alt' : status === 'error' ? 'error' : 'sync'}
          </span>
        </div>
        <h1 className="headline-lg" style={{ margin: '0 0 8px', color: 'var(--on-surface)' }}>
          {status === 'success' ? 'You are checked in' : status === 'error' ? 'Check-in unsuccessful' : 'Checking in'}
        </h1>
        <p className="body-md" style={{ margin: 0, color: 'var(--on-surface-variant)' }}>{message}</p>
        {details?.seatNo && (
          <p className="label-lg" style={{ marginTop: '16px', color: 'var(--primary)' }}>Seat {details.seatNo}</p>
        )}
        {status === 'idle' || status === 'error' || status === 'loading' ? (
          <form onSubmit={handleCheckIn} style={{ marginTop: '20px', textAlign: 'left' }}>
            <button type="submit" className="btn-primary" disabled={status === 'loading'} style={{ width: '100%', marginTop: '12px' }}>
              {status === 'loading' ? 'Verifying...' : 'Check In'}
            </button>
            {!localStorage.getItem('token') && (
              <button type="button" onClick={() => onNavigate('signin')} style={{ width: '100%', marginTop: '12px' }}>
                Sign In
              </button>
            )}
          </form>
        ) : null}
        {status === 'success' && (
          <button type="button" className="btn-primary" onClick={() => onNavigate('dashboard')} style={{ width: '100%', marginTop: '24px' }}>
            Open My Dashboard
          </button>
        )}
      </section>
    </main>
  );
}
