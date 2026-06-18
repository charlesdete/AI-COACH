import React, { useState, useMemo } from 'react';
import './Loops.css';
import Header from '../../../shared/components/Header';
import Sidebar from '../../../shared/components/Sidebar';
import { getAllSessions, formatSessionDate } from '../../../store/sessionStore';
import type { Session } from '../../../store/sessionStore';
import { useAuthStore, TEACHER_PROFILES, getCoachName } from '../../../store/authStore';

const adminNavItems = [
  { label: 'Dashboard', path: '/admin', icon: '📊' },
  { label: 'Analytics', path: '/admin/analytics', icon: '📈' },
  { label: 'Users', path: '/admin/users', icon: '👥' },
  { label: 'Assignments', path: '/admin/assignments', icon: '🔗' },
  { label: 'Loops', path: '/admin/loops', icon: '🎓' },
  { label: 'Messages', path: '/admin/messages', icon: '💬' },
];

type StatusFilter = 'all' | 'active' | 'done';

interface LoopRow {
  session: Session;
  teacherName: string;
  teacherId: string;
  coachName: string;
}

function formatTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString();
}

export const AdminLoops: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const assignments = useAuthStore((s) => s.assignments);

  const allLoops: LoopRow[] = useMemo(() => {
    return Object.values(TEACHER_PROFILES).flatMap((teacher) => {
      const coachName = getCoachName(teacher.id) || 'Unassigned';
      return getAllSessions(teacher.id).map((session) => ({
        session,
        teacherName: teacher.name,
        teacherId: teacher.id,
        coachName,
      }));
    }).sort(
      (a, b) => new Date(b.session.updatedAt).getTime() - new Date(a.session.updatedAt).getTime()
    );
  }, [assignments]);

  const filtered = useMemo(() => {
    return allLoops.filter((row) => {
      const matchStatus = statusFilter === 'all' || row.session.status === statusFilter;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        row.teacherName.toLowerCase().includes(q) ||
        row.session.topic.toLowerCase().includes(q) ||
        row.session.title.toLowerCase().includes(q) ||
        row.coachName.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [allLoops, statusFilter, search]);

  const counts = {
    all: allLoops.length,
    active: allLoops.filter((r) => r.session.status === 'active').length,
    done: allLoops.filter((r) => r.session.status === 'done').length,
  };

  return (
    <div className="admin-layout">
      <Sidebar items={adminNavItems} title="AI-COACH" accentColor="#0066cc" />

      <div className="admin-content">
        <Header title="Loops" subtitle="All teacher coaching loops across the platform" />

        <main className="admin-main">
          {/* Stats row */}
          <div className="loops-stats-row">
            <div className="loops-stat">
              <span className="loops-stat-val">{counts.all}</span>
              <span className="loops-stat-label">Total Loops</span>
            </div>
            <div className="loops-stat loops-stat--active">
              <span className="loops-stat-val">{counts.active}</span>
              <span className="loops-stat-label">Active</span>
            </div>
            <div className="loops-stat loops-stat--done">
              <span className="loops-stat-val">{counts.done}</span>
              <span className="loops-stat-label">Completed</span>
            </div>
          </div>

          {/* Toolbar */}
          <div className="loops-toolbar">
            <div className="loops-filters">
              {(['all', 'active', 'done'] as StatusFilter[]).map((f) => (
                <button
                  key={f}
                  className={`loops-filter-btn${statusFilter === f ? ' active' : ''}`}
                  onClick={() => setStatusFilter(f)}
                >
                  {f === 'all' ? 'All' : f === 'active' ? 'Active' : 'Completed'}
                  <span className="loops-filter-count">{counts[f]}</span>
                </button>
              ))}
            </div>
            <div className="loops-search">
              <span className="loops-search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search by teacher, coach, or topic…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Loop cards */}
          {filtered.length === 0 ? (
            <div className="loops-empty">
              <p>No loops match your filters.</p>
            </div>
          ) : (
            <div className="loops-list">
              {filtered.map(({ session, teacherName, coachName }) => {
                const isOpen = expandedId === session.id;
                return (
                  <div key={session.id} className={`loop-card${isOpen ? ' open' : ''}`}>
                    <button
                      className="loop-card-header"
                      onClick={() => setExpandedId(isOpen ? null : session.id)}
                    >
                      <div className="lc-left">
                        <span className={`lc-status-badge lc-status--${session.status}`}>
                          {session.status === 'active' ? 'Active' : 'Completed'}
                        </span>
                        <p className="lc-title">{session.title}</p>
                        <p className="lc-topic">{session.topic}</p>
                      </div>
                      <div className="lc-right">
                        <div className="lc-people">
                          <span className="lc-person">👤 {teacherName}</span>
                          <span className="lc-person">🎓 {coachName}</span>
                        </div>
                        <div className="lc-meta">
                          <span>{session.messages.length} msg{session.messages.length !== 1 ? 's' : ''}</span>
                          <span>{formatSessionDate(session.updatedAt)}</span>
                        </div>
                        <span className="lc-chevron">{isOpen ? '▲' : '▼'}</span>
                      </div>
                    </button>

                    {isOpen && (
                      <div className="loop-card-body">
                        <div className="lc-conversation-label">Conversation</div>
                        {session.messages.length === 0 ? (
                          <p className="lc-no-msgs">No messages in this loop yet.</p>
                        ) : (
                          <div className="lc-messages">
                            {session.messages.map((msg) => (
                              <div key={msg.id} className={`lc-msg lc-msg--${msg.role}`}>
                                <span className="lc-msg-role">
                                  {msg.role === 'coach' ? 'AI Coach' : teacherName}
                                </span>
                                <p className="lc-msg-text">{msg.text}</p>
                                <span className="lc-msg-time">{formatTime(msg.timestamp)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminLoops;
