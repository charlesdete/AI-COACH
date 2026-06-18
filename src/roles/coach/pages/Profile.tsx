import React, { useMemo } from 'react';
import './Profile.css';
import { Link } from 'react-router-dom';
import Sidebar from '../../../shared/components/Sidebar';
import {
  useAuthStore,
  getTeachersForCoach,
  COACH_PROFILES_DATA,
} from '../../../store/authStore';
import { getAllSessions } from '../../../store/sessionStore';

const coachNavItems = [
  { label: 'Dashboard', path: '/coach', icon: '🏠' },
  { label: 'My Teachers', path: '/coach/chats', icon: '💬' },
];

export const CoachProfile: React.FC = () => {
  const { user } = useAuthStore();
  const coachId = user?.id ?? '';

  const assignments = useAuthStore((s) => s.assignments);
  const profileData = COACH_PROFILES_DATA[coachId] ?? null;
  const assignedTeachers = useMemo(() => getTeachersForCoach(coachId), [coachId, assignments]);

  const totalLoops = useMemo(
    () => assignedTeachers.reduce((sum, t) => sum + getAllSessions(t.id).length, 0),
    [assignedTeachers]
  );
  const completedLoops = useMemo(
    () =>
      assignedTeachers.reduce(
        (sum, t) => sum + getAllSessions(t.id).filter((s) => s.status === 'done').length,
        0
      ),
    [assignedTeachers]
  );

  const teacherCount = assignedTeachers.length;
  const initials = user?.name?.split(' ').map((w) => w[0]).join('') ?? '?';

  return (
    <div className="coach-layout">
      <Sidebar items={coachNavItems} title="AI-COACH" accentColor="#00aa44" />

      <div className="coach-content">
        <div className="profile-topbar">
          <Link to="/coach" className="profile-back-btn">← Back</Link>
          <h1 className="profile-topbar-title">My Profile</h1>
        </div>

        <main className="profile-main">
          {/* Hero card */}
          <div className="profile-hero">
            <div className="profile-avatar-lg" style={{ background: '#00aa44' }}>{initials}</div>
            <div className="profile-hero-info">
              <h2 className="profile-name">{user?.name}</h2>
              <span className="profile-role-badge">Coach</span>
              <p className="profile-email">✉ {user?.email}</p>
              {profileData && (
                <p className="profile-joined">
                  Member since {profileData.joinedYear}
                </p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="profile-stats-row">
            <div className="profile-stat">
              <span className="ps-val">{teacherCount}</span>
              <span className="ps-label">Assigned Teachers</span>
            </div>
            <div className="profile-stat">
              <span className="ps-val">{totalLoops}</span>
              <span className="ps-label">Total Loops</span>
            </div>
            <div className="profile-stat">
              <span className="ps-val">{completedLoops}</span>
              <span className="ps-label">Loops Completed</span>
            </div>
          </div>

          <div className="profile-body-grid">
            {/* Bio */}
            <section className="profile-card">
              <h3 className="profile-card-title">About</h3>
              <p className="profile-bio">
                {profileData?.bio ?? 'No bio yet.'}
              </p>
              {profileData?.specialties && (
                <div className="profile-specialties">
                  {profileData.specialties.map((s) => (
                    <span key={s} className="specialty-chip">{s}</span>
                  ))}
                </div>
              )}
            </section>

            {/* Assigned teachers */}
            <section className="profile-card">
              <h3 className="profile-card-title">My Teachers</h3>
              {assignedTeachers.length === 0 ? (
                <p className="profile-empty">No teachers assigned yet.</p>
              ) : (
                <div className="profile-teachers-list">
                  {assignedTeachers.map((t) => {
                    const loops = getAllSessions(t.id).length;
                    const active = getAllSessions(t.id).find((s) => s.status === 'active');
                    return (
                      <Link key={t.id} to="/coach/chats" className="profile-teacher-row">
                        <div className="pt-avatar" style={{ background: '#ff660018', color: '#ff6600' }}>
                          {t.name.charAt(0)}
                        </div>
                        <div className="pt-info">
                          <p className="pt-name">{t.name}</p>
                          <p className="pt-meta">{t.topic}</p>
                        </div>
                        <div className="pt-right">
                          <span className="pt-loops">{loops} loops</span>
                          {active && <span className="pt-active-badge">Active</span>}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CoachProfile;
