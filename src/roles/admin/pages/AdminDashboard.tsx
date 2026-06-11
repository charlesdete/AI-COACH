import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';
import Header from '../../../shared/components/Header';
import Sidebar from '../../../shared/components/Sidebar';
import StatCard from '../components/StatCard';
import { useAnalyticsStore } from '../../../store/analyticsStore';

const adminNavItems = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
  { label: 'Analytics', path: '/admin/analytics', icon: '📈' },
  { label: 'Users', path: '/admin/users', icon: '👥' },
  { label: 'Messages', path: '/admin/messages', icon: '💬' },
  { label: 'Reports', path: '/admin/reports', icon: '📋' },
];

export const AdminDashboard: React.FC = () => {
  const { analyticsData, isLoading } = useAnalyticsStore();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalSessions: 0,
    completionRate: 0,
  });

  useEffect(() => {
    // Update stats when analytics data changes
    if (analyticsData) {
      setStats({
        totalUsers: analyticsData.userMetrics.totalUsers,
        activeUsers: analyticsData.userMetrics.activeUsers,
        totalSessions: analyticsData.sessionMetrics.totalSessions,
        completionRate: analyticsData.sessionMetrics.completionRate,
      });
    }
  }, [analyticsData]);

  return (
    <div className="admin-layout">
      <Sidebar items={adminNavItems} title="AI-COACH" />
      
      <div className="admin-content">
        <Header title="Admin Dashboard" subtitle="Overview of platform metrics" />
        
        <main className="admin-main">
          <div className="stats-grid">
            <StatCard
              label="Total Users"
              value={stats.totalUsers}
              icon="👤"
              color="primary"
              trend={{ value: 12, direction: 'up' }}
            />
            <StatCard
              label="Active Users"
              value={stats.activeUsers}
              icon="✓"
              color="success"
              trend={{ value: 8, direction: 'up' }}
            />
            <StatCard
              label="Total Sessions"
              value={stats.totalSessions}
              icon="🎓"
              color="warning"
              trend={{ value: 5, direction: 'up' }}
            />
            <StatCard
              label="Completion Rate"
              value={`${stats.completionRate}%`}
              icon="✨"
              color="success"
              trend={{ value: 2, direction: 'up' }}
            />
          </div>

          <div className="dashboard-sections">
            <section className="dashboard-section">
              <h2>Quick Actions</h2>
              <div className="action-buttons">
                <button className="action-btn">
                  <span className="action-icon">➕</span>
                  <span className="action-text">Add User</span>
                </button>
                <button className="action-btn">
                  <span className="action-icon">📊</span>
                  <span className="action-text">View Reports</span>
                </button>
                <button className="action-btn">
                  <span className="action-icon">⚙️</span>
                  <span className="action-text">Settings</span>
                </button>
                <button className="action-btn">
                  <span className="action-icon">📤</span>
                  <span className="action-text">Export Data</span>
                </button>
              </div>
            </section>

            <section className="dashboard-section">
              <h2>Recent Activity</h2>
              {isLoading ? (
                <div className="loading">Loading activity...</div>
              ) : (
                <div className="activity-list">
                  <p className="no-activity">No recent activity to display</p>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
