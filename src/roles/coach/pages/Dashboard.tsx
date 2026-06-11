import React from 'react';
import './Dashboard.css';
import { Link } from 'react-router-dom';
import Header from '../../../shared/components/Header';
import Sidebar from '../../../shared/components/Sidebar';
import { useAuthStore } from '../../../store/authStore';
import { useMessagingStore } from '../../../store/messagingStore';

const coachNavItems = [
  { label: 'Dashboard', path: '/coach', icon: '🏠' },
  { label: 'My Teachers', path: '/coach/chats', icon: '💬' },
];

const ASSIGNED_TEACHERS = [
  { id: 'teacher-1', name: 'Mr. Johnson', topic: 'Engaging students', sessions: 12, lastActive: '25 min ago', progress: 75 },
  { id: 'teacher-2', name: 'Ms. Williams', topic: 'Managing behavior', sessions: 10, lastActive: '2 hrs ago', progress: 82 },
  { id: 'teacher-3', name: 'Mr. Davis', topic: 'Bible lessons', sessions: 8, lastActive: '5 hrs ago', progress: 60 },
];

export const CoachDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { conversations, getTotalUnread } = useMessagingStore();
  const totalUnread = getTotalUnread();

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
                <p className="cstat-val">{ASSIGNED_TEACHERS.length}</p>
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
            <div className="coach-stat" style={{ borderTopColor: '#aa3bff' }}>
              <span className="cstat-icon">🎓</span>
              <div>
                <p className="cstat-val">30</p>
                <p className="cstat-label">Total Sessions</p>
              </div>
            </div>
          </div>

          <div className="coach-body-grid">
            <section className="coach-card coach-teachers-card">
              <div className="coach-card-header">
                <h2>My Teachers</h2>
                <Link to="/coach/chats" className="view-all-link">View all →</Link>
              </div>
              <div className="teacher-cards">
                {ASSIGNED_TEACHERS.map((teacher) => (
                  <Link key={teacher.id} to={`/coach/chats/${teacher.id}`} className="teacher-card">
                    <div className="tc-avatar" style={{ background: '#ff660018', color: '#ff6600' }}>
                      {teacher.name.split(' ').map(w => w[0]).join('')}
                    </div>
                    <div className="tc-info">
                      <p className="tc-name">{teacher.name}</p>
                      <p className="tc-topic">{teacher.topic}</p>
                      <div className="tc-progress-wrap">
                        <div className="tc-progress-bar" style={{ width: `${teacher.progress}%` }} />
                      </div>
                    </div>
                    <div className="tc-meta">
                      <p className="tc-sessions">{teacher.sessions} sessions</p>
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
                  { icon: '🔄', tip: 'Follow up on strategies you\'ve suggested in previous sessions.' },
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
