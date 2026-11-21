import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../utils/api';

export default function CheckInView({ onNavigate }) {
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('Validating your check-in...');
  const [details, setDetails] = useState(null);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token');
    if (!token) {
      setStatus('error');
      setMessage('No check-in token was found in this QR code.');
      return;
    }

    const checkIn = async () => {
      try {
        const response = await axios.post(`${API_URL}/check-in`, { token });
        setDetails(response.data);
        setStatus('success');
        setMessage(response.data.msg || 'Check-in successful');
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.msg || 'Unable to complete check-in.');
      }
    };

    checkIn();
  }, []);

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
        {status !== 'loading' && (
          <button type="button" className="btn-primary" onClick={() => onNavigate('dashboard')} style={{ width: '100%', marginTop: '24px' }}>
            Open My Dashboard
          </button>
        )}
      </section>
    </main>
  );
}
