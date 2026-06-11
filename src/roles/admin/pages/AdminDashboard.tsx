import React from 'react';
import './AdminDashboard.css';
import { Link } from 'react-router-dom';
import Header from '../../../shared/components/Header';
import Sidebar from '../../../shared/components/Sidebar';
import StatCard from '../components/StatCard';
import { useMessagingStore } from '../../../store/messagingStore';

const adminNavItems = [
  { label: 'Dashboard', path: '/admin', icon: '📊' },
  { label: 'Analytics', path: '/admin/analytics', icon: '📈' },
  { label: 'Users', path: '/admin/users', icon: '👥' },
  { label: 'Messages', path: '/admin/messages', icon: '💬' },
];

const recentActivity = [
  { id: 1, icon: '💬', text: 'Mr. Johnson sent a message to Coach Sarah', time: '25 min ago', color: '#0066cc' },
  { id: 2, icon: '✅', text: 'Ms. Williams completed a coaching session', time: '2 hrs ago', color: '#00aa44' },
  { id: 3, icon: '👤', text: 'Mr. Davis joined the platform', time: '5 hrs ago', color: '#ff6600' },
  { id: 4, icon: '📈', text: 'Weekly analytics report generated', time: 'Yesterday', color: '#aa3bff' },
  { id: 5, icon: '💬', text: 'Mr. Davis sent a message to Coach Sarah', time: 'Yesterday', color: '#0066cc' },
];

export const AdminDashboard: React.FC = () => {
  const { conversations, getTotalUnread } = useMessagingStore();
  const totalUnread = getTotalUnread();

  return (
    <div className="admin-layout">
      <Sidebar items={adminNavItems} title="AI-COACH" accentColor="#0066cc" />

      <div className="admin-content">
        <Header title="Admin Dashboard" subtitle="Platform overview and quick actions" />

        <main className="admin-main">
          <div className="stats-grid">
            <StatCard label="Total Users" value="24" icon="👤" color="primary" trend={{ value: 12, direction: 'up' }} />
            <StatCard label="Active Sessions" value="8" icon="🎓" color="success" trend={{ value: 5, direction: 'up' }} />
            <StatCard label="Conversations" value={conversations.length} icon="💬" color="warning" trend={{ value: 3, direction: 'up' }} />
            <StatCard label="Unread Messages" value={totalUnread} icon="📬" color={totalUnread > 0 ? 'danger' : 'success'} />
          </div>

          <div className="admin-dashboard-grid">
            <section className="admin-card">
              <div className="admin-card-header">
                <h2>Quick Actions</h2>
              </div>
              <div className="quick-actions-grid">
                <Link to="/admin/users" className="quick-action">
                  <span className="quick-action-icon">👥</span>
                  <span>Manage Users</span>
                </Link>
                <Link to="/admin/messages" className="quick-action">
                  <span className="quick-action-icon">💬</span>
                  <span>View Messages</span>
                  {totalUnread > 0 && <span className="qa-badge">{totalUnread}</span>}
                </Link>
                <Link to="/admin/analytics" className="quick-action">
                  <span className="quick-action-icon">📈</span>
                  <span>Analytics</span>
                </Link>
                <button className="quick-action">
                  <span className="quick-action-icon">📤</span>
                  <span>Export Data</span>
                </button>
              </div>
            </section>

            <section className="admin-card">
              <div className="admin-card-header">
                <h2>Recent Activity</h2>
              </div>
              <div className="activity-feed">
                {recentActivity.map((item) => (
                  <div key={item.id} className="activity-item">
                    <div className="activity-icon-wrap" style={{ background: `${item.color}18`, color: item.color }}>
                      {item.icon}
                    </div>
                    <div className="activity-text-wrap">
                      <p className="activity-text">{item.text}</p>
                      <span className="activity-time">{item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="admin-card">
              <div className="admin-card-header">
                <h2>Platform Overview</h2>
              </div>
              <div className="overview-list">
                <div className="overview-row">
                  <span className="overview-label">Teachers</span>
                  <div className="overview-bar-wrap">
                    <div className="overview-bar" style={{ width: '75%', background: '#ff6600' }} />
                  </div>
                  <span className="overview-val">18</span>
                </div>
                <div className="overview-row">
                  <span className="overview-label">Coaches</span>
                  <div className="overview-bar-wrap">
                    <div className="overview-bar" style={{ width: '25%', background: '#00aa44' }} />
                  </div>
                  <span className="overview-val">5</span>
                </div>
                <div className="overview-row">
                  <span className="overview-label">Admins</span>
                  <div className="overview-bar-wrap">
                    <div className="overview-bar" style={{ width: '5%', background: '#0066cc' }} />
                  </div>
                  <span className="overview-val">1</span>
                </div>
                <div className="overview-row">
                  <span className="overview-label">Sessions this week</span>
                  <div className="overview-bar-wrap">
                    <div className="overview-bar" style={{ width: '60%', background: '#aa3bff' }} />
                  </div>
                  <span className="overview-val">14</span>
                </div>
                <div className="overview-row">
                  <span className="overview-label">Completion rate</span>
                  <div className="overview-bar-wrap">
                    <div className="overview-bar" style={{ width: '82%', background: '#00aa44' }} />
                  </div>
                  <span className="overview-val">82%</span>
                </div>
              </div>
            </section>

            <section className="admin-card">
              <div className="admin-card-header">
                <h2>Top Coaches</h2>
              </div>
              <div className="coaches-list">
                {[
                  { name: 'Coach Sarah', sessions: 24, teachers: 3, rate: 94 },
                  { name: 'Coach Michael', sessions: 18, teachers: 2, rate: 87 },
                ].map((coach) => (
                  <div key={coach.name} className="coach-row">
                    <div className="coach-avatar" style={{ background: '#00aa44' }}>{coach.name.charAt(6)}</div>
                    <div className="coach-info">
                      <p className="coach-name">{coach.name}</p>
                      <p className="coach-meta">{coach.teachers} teachers · {coach.sessions} sessions</p>
                    </div>
                    <div className="coach-rate" style={{ color: '#00aa44' }}>{coach.rate}%</div>
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

export default AdminDashboard;
