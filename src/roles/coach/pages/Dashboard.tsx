import React, { useState, useEffect, useMemo } from 'react';
import './Dashboard.css';
import { Link } from 'react-router-dom';
import Header from '../../../shared/components/Header';
import Sidebar from '../../../shared/components/Sidebar';
import { useAuthStore, getTeachersForCoach } from '../../../store/authStore';
import type { TeacherProfile } from '../../../store/authStore';
import { useMessagingStore } from '../../../store/messagingStore';
import { getAllSessions, closeSessionWithCongrats, formatSessionDate } from '../../../store/sessionStore';
import type { Session } from '../../../store/sessionStore';

const coachNavItems = [
  { label: 'Dashboard', path: '/coach', icon: '🏠' },
  { label: 'My Teachers', path: '/coach/chats', icon: '💬' },
];

type TeacherWithStats = TeacherProfile & { loops: number; lastActive: string };

export const CoachDashboard: React.FC = () => {
  const { user, assignments } = useAuthStore();
  const { conversations, getTotalUnread } = useMessagingStore();
  const totalUnread = getTotalUnread();

  const assignedTeachers = useMemo(
    () => getTeachersForCoach(user?.id ?? ''),
    [user?.id, assignments]
  );

  const teachersWithStats: TeacherWithStats[] = useMemo(
    () =>
      assignedTeachers.map((t) => {
        const sessions = getAllSessions(t.id);
        const latest = [...sessions].sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )[0];
        return {
          ...t,
          loops: sessions.length,
          lastActive: latest ? formatSessionDate(latest.updatedAt) : 'No activity',
        };
      }),
    [assignedTeachers]
  );

  // Load active loops for each assigned teacher
  const [teacherSessions, setTeacherSessions] = useState<
    { teacher: TeacherWithStats; session: Session }[]
  >([]);

  useEffect(() => {
    const active = teachersWithStats.flatMap((t) =>
      getAllSessions(t.id)
        .filter((s) => s.status === 'active')
        .map((s) => ({ teacher: t, session: s }))
    );
    setTeacherSessions(active);
  }, [teachersWithStats]);

  function handleCloseSession(teacherId: string, sessionId: string) {
    closeSessionWithCongrats(teacherId, sessionId);
    setTeacherSessions((prev) =>
      prev.filter((item) => item.session.id !== sessionId)
    );
  }

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="coach-layout">
      <Sidebar items={coachNavItems} title="AI-COACH" accentColor="#00aa44" />

      <div className="coach-content">
        <Header title={`Welcome, ${user?.name ?? 'Coach'}`} subtitle={today} />

        <main className="coach-main">
          <div className="coach-stats-row">
            <div className="coach-stat" style={{ borderTopColor: '#00aa44' }}>
              <span className="cstat-icon">👥</span>
              <div>
                <p className="cstat-val">{assignedTeachers.length}</p>
                <p className="cstat-label">My Teachers</p>
              </div>
            </div>
            <div className="coach-stat" style={{ borderTopColor: '#0066cc' }}>
              <span className="cstat-icon">💬</span>
              <div>
                <p className="cstat-val">{conversations.length}</p>
                <p className="cstat-label">Conversations</p>
              </div>
            </div>
            <div className="coach-stat" style={{ borderTopColor: totalUnread > 0 ? '#ff3333' : '#00aa44' }}>
              <span className="cstat-icon">📬</span>
              <div>
                <p className="cstat-val" style={{ color: totalUnread > 0 ? '#ff3333' : 'inherit' }}>{totalUnread}</p>
                <p className="cstat-label">Unread</p>
              </div>
            </div>
            <div className="coach-stat" style={{ borderTopColor: '#000080' }}>
              <span className="cstat-icon">🎓</span>
              <div>
                <p className="cstat-val">{teachersWithStats.reduce((sum, t) => sum + t.loops, 0)}</p>
                <p className="cstat-label">Total Loops</p>
              </div>
            </div>
          </div>

          {/* ── Active teacher sessions ── */}
          {teacherSessions.length > 0 && (
            <section className="coach-card coach-sessions-card">
              <div className="coach-card-header">
                <h2>Active Loops</h2>
                <span className="coach-sessions-count">{teacherSessions.length} active</span>
              </div>
              <div className="coach-sessions-list">
                {teacherSessions.map(({ teacher, session }) => (
                  <div key={session.id} className="coach-session-row">
                    <div className="csr-avatar" style={{ background: '#e6f7f6', color: '#3b9e98' }}>
                      {teacher.name.split(' ').map((w: string) => w[0]).join('')}
                    </div>
                    <div className="csr-info">
                      <p className="csr-name">{teacher.name}</p>
                      <p className="csr-topic">{session.topic} · {session.title}</p>
                    </div>
                    <button
                      className="csr-close-btn"
                      onClick={() => handleCloseSession(teacher.id, session.id)}
                      title="Close this loop"
                    >
                      Close loop
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="coach-body-grid">
            <section className="coach-card coach-teachers-card">
              <div className="coach-card-header">
                <h2>My Teachers</h2>
                <Link to="/coach/chats" className="view-all-link">View all →</Link>
              </div>
              <div className="teacher-cards">
                {teachersWithStats.map((teacher) => (
                  <Link key={teacher.id} to={`/coach/chats/${teacher.id}`} className="teacher-card">
                    <div className="tc-avatar" style={{ background: '#ff660018', color: '#ff6600' }}>
                      {teacher.name.split(' ').map((w: string) => w[0]).join('')}
                    </div>
                    <div className="tc-info">
                      <p className="tc-name">{teacher.name}</p>
                      <p className="tc-topic">{teacher.topic}</p>
                      <div className="tc-progress-wrap">
                        <div className="tc-progress-bar" style={{ width: `${teacher.progress}%` }} />
                      </div>
                    </div>
                    <div className="tc-meta">
                      <p className="tc-sessions">{teacher.loops} loops</p>
                      <p className="tc-active">{teacher.lastActive}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            <section className="coach-card coach-tips-card">
              <div className="coach-card-header">
                <h2>Coaching Tips</h2>
              </div>
              <div className="tips-list">
                {[
                  { icon: '🎯', tip: 'Ask open-ended questions to help teachers reflect on their practice.' },
                  { icon: '✅', tip: 'Celebrate small wins — progress compounds over time.' },
                  { icon: '📖', tip: 'Reference specific lessons when giving feedback for context.' },
                  { icon: '🔄', tip: 'Follow up on strategies you\'ve suggested in previous loops.' },
                ].map((t, i) => (
                  <div key={i} className="tip-item">
                    <span className="tip-icon">{t.icon}</span>
                    <p className="tip-text">{t.tip}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CoachDashboard;
