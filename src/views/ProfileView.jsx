import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import StudyHeatMap from '../components/StudyHeatMap';
import { currentUser } from '../data/mockData';
import { API_URL, api } from '../utils/api';
import starterBadge from '../assets/badge-study-starter.png';
import focusedBadge from '../assets/badge-focused-learner.png';
import streakerBadge from '../assets/badge-study-streaker.png';
import championBadge from '../assets/badge-library-champion.png';
import './ProfileView.css';

const badgeDefinitions = [
  { id: 'starter', name: 'Study Starter', threshold: 5, image: starterBadge },
  { id: 'focused', name: 'Focused Learner', threshold: 10, image: focusedBadge },
  { id: 'streaker', name: 'Study Streaker', threshold: 25, image: streakerBadge },
  { id: 'champion', name: 'Library Champion', threshold: 50, image: championBadge }
];

const departmentFromRollNo = (rollNo) => {
  const code = String(rollNo || '').split(/[-_/]/)[0].toUpperCase();
  const departments = {
    CS: 'Computer Science & Engineering',
    CSE: 'Computer Science & Engineering',
    IT: 'Information Technology',
    ECE: 'Electronics & Communication',
    EE: 'Electrical Engineering',
    ME: 'Mechanical Engineering',
    CE: 'Civil Engineering'
  };
  return departments[code] || 'Department not provided';
};

const formatHours = (minutes) => {
  const hours = minutes / 60;
  return Number.isInteger(hours) ? String(hours) : hours.toFixed(1);
};

function calculateStreak(activityDates) {
  const now = new Date(Date.now() + 330 * 60 * 1000);
  const activeDates = new Set(activityDates);
  const todayDate = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`;
  const dateOrdinal = (date) => Date.UTC(...date.split('-').map(Number).map((value, index) => index === 1 ? value - 1 : value)) / 86400000;
  let streak = 0;
  if (activeDates.size) {
    let cursor = dateOrdinal(todayDate);
    if (!activeDates.has(todayDate)) cursor -= 1;
    while (activeDates.has(new Date(cursor * 86400000).toISOString().slice(0, 10))) {
      streak += 1;
      cursor -= 1;
    }
  }

  return streak;
}

export default function ProfileView({ onNavigate, onSignOut, user, onProfileUpdated }) {
  const [stats, setStats] = useState({ totalMinutes: 0, activeDays: 0, streak: 0, visits: 0, activityDates: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');
  const [editedDepartment, setEditedDepartment] = useState(user?.department || departmentFromRollNo(user?.roll_no));
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const rollNo = user?.roll_no || user?.rollNo || 'Roll number unavailable';
  const department = user?.department || departmentFromRollNo(rollNo);
  const initials = String(user?.name || 'Student').trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  const totalHours = stats.totalMinutes / 60;

  useEffect(() => {
    let isCurrent = true;
    setIsLoading(true);
    setLoadError('');
    api.get(`${API_URL}/study-statistics`)
      .then(({ data }) => {
        if (!isCurrent) return;
        const statistics = data?.statistics || {};
        const activityDates = Array.isArray(statistics.activity_dates)
          ? statistics.activity_dates.map((date) => String(date).slice(0, 10))
          : [];
        setStats({
          totalMinutes: Number(statistics.total_minutes) || 0,
          activeDays: Number(statistics.active_days) || 0,
          streak: calculateStreak(activityDates),
          visits: Number(statistics.library_visits) || 0,
          activityDates
        });
      })
      .catch((error) => {
        if (isCurrent) {
          setStats({ totalMinutes: 0, activeDays: 0, streak: 0, visits: 0, activityDates: [] });
          setLoadError(error.response?.data?.msg || 'Could not load your study statistics.');
        }
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });
    return () => { isCurrent = false; };
  }, [user?.roll_no]);

  const saveProfile = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setSaveError('');
    try {
      const updatedUser = { ...user, name: editedName.trim(), department: editedDepartment.trim() };
      localStorage.setItem('bookspot_profile', JSON.stringify(updatedUser));
      localStorage.setItem('bookspot_user', JSON.stringify(updatedUser));
      onProfileUpdated?.(updatedUser);
      setIsEditing(false);
    } catch {
      setSaveError('Could not save profile changes in this browser.');
    } finally {
      setIsSaving(false);
    }
  };

  const statCards = [
    { label: 'Study hours', value: formatHours(stats.totalMinutes), suffix: 'hrs', icon: 'schedule', tint: '#faecec' },
    { label: 'Active days', value: stats.activeDays, suffix: 'days', icon: 'calendar_month', tint: '#f4edf8' },
    { label: 'Current streak', value: stats.streak, suffix: stats.streak === 1 ? 'day' : 'days', icon: 'local_fire_department', tint: '#fff1e5' },
    { label: 'Library visits', value: stats.visits, suffix: 'visits', icon: 'meeting_room', tint: '#eaf4f1' }
  ];

  return (
    <div className="profile-app-layout">
      <Sidebar activeView="profile" onNavigate={onNavigate} onSignOut={onSignOut} />
      <div className="profile-main-layout">
        <Header onNavigate={onNavigate} user={{ ...currentUser, ...user, name: user?.name || 'Student', rollNo, role: 'Student' }} />
        <main className="profile-page">
          <div className="profile-page-inner">
            <div className="profile-page-heading">
              <div>
                <div className="profile-eyebrow">Your BookSpot account</div>
                <h1>My profile</h1>
              </div>
              <button type="button" className="profile-book-button" onClick={() => onNavigate('book-a-seat')}>
                <span className="material-symbols-outlined">event_seat</span> Book a seat
              </button>
            </div>

            <section className="profile-overview-card">
              <div className="profile-avatar" aria-label={`${user?.name || 'Student'} avatar`}>{initials}</div>
              <div className="profile-identity">
                <span className="profile-member-pill"><span /> Student profile</span>
                <h2>{user?.name || 'Student'}</h2>
                <div className="profile-identity-details">
                  <span><span className="material-symbols-outlined">badge</span>{rollNo}</span>
                  <span><span className="material-symbols-outlined">school</span>{department}</span>
                </div>
              </div>
              <button type="button" className="profile-edit-button" onClick={() => { setEditedName(user?.name || ''); setEditedDepartment(department); setSaveError(''); setIsEditing(true); }}>
                <span className="material-symbols-outlined">edit</span> Edit profile
              </button>
            </section>

            <section className="profile-stats-section">
              <div className="profile-section-heading">
                <div><div className="profile-eyebrow">Your progress</div><h2>Study statistics</h2></div>
                {isLoading && <span className="profile-loading-note">Updating…</span>}
              </div>
              {loadError && <p className="profile-inline-error" role="alert">{loadError}</p>}
              <div className="profile-stats-grid">
                {statCards.map((stat) => (
                  <article className="profile-stat-card" key={stat.label}>
                    <span className="profile-stat-icon" style={{ background: stat.tint }}><span className="material-symbols-outlined">{stat.icon}</span></span>
                    <div className="profile-stat-label">{stat.label}</div>
                    <div className="profile-stat-value">{isLoading ? '—' : stat.value}<span>{stat.suffix}</span></div>
                  </article>
                ))}
              </div>
            </section>

            <StudyHeatMap />

            <section className="profile-achievements-section">
              <div className="profile-section-heading">
                <div>
                  <div className="profile-eyebrow">Little wins add up</div>
                  <h2>Achievements</h2>
                  <p className="profile-section-copy">Earn badges as your checked-in study hours grow.</p>
                </div>
                <span className="profile-badge-count">{badgeDefinitions.filter((badge) => totalHours >= badge.threshold).length} / {badgeDefinitions.length} earned</span>
              </div>
              <div className="profile-achievements-grid">
                {badgeDefinitions.map((badge) => {
                  const earned = totalHours >= badge.threshold;
                  return (
                    <article className={`profile-achievement-card ${earned ? 'earned' : 'locked'}`} key={badge.id}>
                      <div className="profile-badge-image-wrap">
                        <img className={`achievement-art ${earned ? '' : 'achievement-art-locked'}`} src={badge.image} alt={`${badge.name}, ${badge.threshold}+ hours`} />
                      </div>
                      <div className="profile-achievement-name">{badge.name}</div>
                      <div className={`profile-achievement-status ${earned ? 'earned' : ''}`}>
                        {earned ? 'Earned' : `${Math.max(0, badge.threshold - totalHours).toFixed(totalHours % 1 ? 1 : 0)} more hours to unlock`}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          </div>
        </main>
      </div>

      {isEditing && (
        <div className="profile-modal-backdrop" onClick={() => setIsEditing(false)}>
          <section className="profile-edit-modal" role="dialog" aria-modal="true" aria-labelledby="profile-edit-title" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="profile-modal-close" aria-label="Close edit profile" onClick={() => setIsEditing(false)}>×</button>
            <div className="profile-eyebrow">Account details</div>
            <h2 id="profile-edit-title">Edit profile</h2>
            <form onSubmit={saveProfile}>
              <label htmlFor="profile-name">Name</label>
              <input id="profile-name" value={editedName} onChange={(event) => setEditedName(event.target.value)} maxLength={120} required autoFocus />
              <label htmlFor="profile-roll">Roll number</label>
              <input id="profile-roll" value={rollNo} readOnly />
              <label htmlFor="profile-department">Department</label>
              <input id="profile-department" value={editedDepartment} onChange={(event) => setEditedDepartment(event.target.value)} maxLength={120} />
              {saveError && <p className="profile-inline-error" role="alert">{saveError}</p>}
              <div className="profile-modal-actions">
                <button type="button" className="profile-cancel-button" onClick={() => setIsEditing(false)}>Cancel</button>
                <button type="submit" className="profile-save-button" disabled={isSaving}>{isSaving ? 'Saving…' : 'Save changes'}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
