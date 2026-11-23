import React, { useEffect, useMemo, useState } from 'react';
import { API_URL, api } from '../utils/api';
import './StudyHeatMap.css';

const pad = (value) => String(value).padStart(2, '0');

export default function StudyHeatMap() {
  const currentYear = new Date(Date.now() + 330 * 60 * 1000).getUTCFullYear();
  const [year, setYear] = useState(currentYear);
  const [activity, setActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let isCurrent = true;
    setLoadError('');
    setIsLoading(true);
    api.get(`${API_URL}/study-activity`, { params: { year } })
      .then(({ data }) => {
        if (!isCurrent) return;
        const rows = Array.isArray(data?.activity) ? data.activity : [];
        setActivity(rows.filter((row) => {
          const date = String(row?.activity_date || '').slice(0, 10);
          const minutes = Number(row?.total_minutes);
          return /^\d{4}-\d{2}-\d{2}$/.test(date) && date.startsWith(`${year}-`) && Number.isFinite(minutes) && minutes > 0;
        }));
      })
      .catch((error) => {
        if (isCurrent) {
          setActivity([]);
          setLoadError(error.response?.data?.msg || 'Could not load activity for this year.');
        }
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });
    return () => { isCurrent = false; };
  }, [year]);

  const { cells, totalMinutes } = useMemo(() => {
    const contributions = new Map(activity.map((row) => [
      String(row.activity_date).slice(0, 10),
      Number(row.total_minutes) || 0
    ]));

    const firstDate = new Date(Date.UTC(year, 0, 1));
    const daysInYear = (Date.UTC(year + 1, 0, 1) - Date.UTC(year, 0, 1)) / 86400000;
    const offset = firstDate.getUTCDay();
    const dates = Array.from({ length: daysInYear }, (_, index) => {
      const date = new Date(Date.UTC(year, 0, index + 1));
      const dateKey = `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
      const minutes = contributions.get(dateKey) || 0;
      return {
        dateKey,
        minutes,
        week: Math.floor((index + offset) / 7),
        weekday: date.getUTCDay(),
        month: date.getUTCMonth()
      };
    });

    return {
      cells: dates,
      totalMinutes: dates.reduce((total, cell) => total + cell.minutes, 0)
    };
  }, [activity, year]);

  const firstDayOffset = new Date(Date.UTC(year, 0, 1)).getUTCDay();
  const monthLabels = Array.from({ length: 12 }, (_, month) => {
    const dayOffset = Math.floor((Date.UTC(year, month, 1) - Date.UTC(year, 0, 1)) / 86400000);
    return {
      name: new Date(Date.UTC(year, month, 1)).toLocaleDateString('en', { month: 'short', timeZone: 'UTC' }),
      week: Math.floor((dayOffset + firstDayOffset) / 7)
    };
  });
  const weekCount = Math.ceil((cells.length + firstDayOffset) / 7);

  return (
    <section className="profile-heatmap-card">
      <div className="profile-section-heading profile-heatmap-heading">
        <div>
          <div className="profile-eyebrow">Your consistency</div>
          <h2>Activity throughout the year</h2>
          <p>{isLoading ? `Loading ${year} activity…` : `${Math.floor(totalMinutes / 60)} study hours recorded in ${year}`}</p>
          {loadError && <p className="profile-inline-error" role="alert">{loadError}</p>}
        </div>
        <label className="profile-year-select">
          <span className="sr-only">Activity year</span>
          <select value={year} onChange={(event) => setYear(Number(event.target.value))}>
            {Array.from({ length: 5 }, (_, index) => currentYear - index).map((activityYear) => (
              <option key={activityYear} value={activityYear}>{activityYear}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="profile-heatmap-scroll">
        <div className="profile-heatmap-grid" style={{ gridTemplateColumns: `30px repeat(${weekCount}, 12px)` }}>
          {monthLabels.map((month, index) => (
            <span key={month.name} className="profile-heatmap-month" style={{ gridColumn: month.week + 2, gridRow: 1 }}>
              {index % 2 === 0 ? month.name : ''}
            </span>
          ))}
          {['Mon', 'Wed', 'Fri'].map((label) => {
            const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(label);
            return <span key={label} className="profile-heatmap-weekday" style={{ gridColumn: 1, gridRow: weekday + 2 }}>{label}</span>;
          })}
          {cells.map((cell) => {
            const level = cell.minutes === 0 ? 0 : cell.minutes < 60 ? 1 : cell.minutes < 120 ? 2 : cell.minutes < 240 ? 3 : 4;
            const roundedHours = Math.round(cell.minutes / 60);
            return (
              <span
                key={cell.dateKey}
                className={`profile-heatmap-cell level-${level}`}
                style={{ gridColumn: cell.week + 2, gridRow: cell.weekday + 2 }}
                title={`${cell.dateKey}: ${roundedHours} ${roundedHours === 1 ? 'hour' : 'hours'}`}
                aria-label={`${cell.dateKey}: ${roundedHours} rounded hours`}
              />
            );
          })}
        </div>
      </div>

      <div className="profile-heatmap-legend">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((level) => <i key={level} className={`profile-heatmap-cell level-${level}`} />)}
        <span>More</span>
      </div>
    </section>
  );
}
