import React, { useState } from 'react';
import './Users.css';
import Header from '../../../shared/components/Header';
import Sidebar from '../../../shared/components/Sidebar';

const adminNavItems = [
  { label: 'Dashboard', path: '/admin', icon: '📊' },
  { label: 'Analytics', path: '/admin/analytics', icon: '📈' },
  { label: 'Users', path: '/admin/users', icon: '👥' },
  { label: 'Messages', path: '/admin/messages', icon: '💬' },
];

const USERS = [
  { id: 'admin-1', name: 'Admin User', email: 'admin@school.com', role: 'admin' as const, status: 'active', joined: 'Jan 1, 2025', sessions: 0 },
  { id: 'coach-1', name: 'Coach Sarah', email: 'coach@school.com', role: 'coach' as const, status: 'active', joined: 'Jan 5, 2025', sessions: 24 },
  { id: 'coach-2', name: 'Coach Michael', email: 'coach2@school.com', role: 'coach' as const, status: 'active', joined: 'Jan 10, 2025', sessions: 18 },
  { id: 'teacher-1', name: 'Mr. Johnson', email: 'teacher@school.com', role: 'teacher' as const, status: 'active', joined: 'Jan 15, 2025', sessions: 12 },
  { id: 'teacher-2', name: 'Ms. Williams', email: 'teacher2@school.com', role: 'teacher' as const, status: 'active', joined: 'Jan 18, 2025', sessions: 10 },
  { id: 'teacher-3', name: 'Mr. Davis', email: 'teacher3@school.com', role: 'teacher' as const, status: 'active', joined: 'Jan 20, 2025', sessions: 8 },
  { id: 'teacher-4', name: 'Ms. Brown', email: 'teacher4@school.com', role: 'teacher' as const, status: 'active', joined: 'Feb 1, 2025', sessions: 6 },
  { id: 'teacher-5', name: 'Mr. Wilson', email: 'teacher5@school.com', role: 'teacher' as const, status: 'inactive', joined: 'Feb 5, 2025', sessions: 2 },
];

const ROLE_COLORS: Record<string, string> = {
  admin: '#0066cc',
  coach: '#00aa44',
  teacher: '#ff6600',
};

type Filter = 'all' | 'admin' | 'coach' | 'teacher';

export const Users: React.FC = () => {
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');

  const filtered = USERS.filter((u) => {
    const matchRole = filter === 'all' || u.role === filter;
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const counts = {
    all: USERS.length,
    admin: USERS.filter(u => u.role === 'admin').length,
    coach: USERS.filter(u => u.role === 'coach').length,
    teacher: USERS.filter(u => u.role === 'teacher').length,
  };

  return (
    <div className="admin-layout">
      <Sidebar items={adminNavItems} title="AI-COACH" accentColor="#0066cc" />

      <div className="admin-content">
        <Header title="Users" subtitle="Manage platform users and roles" />

        <main className="admin-main">
          <div className="users-toolbar">
            <div className="users-filters">
              {(['all', 'admin', 'coach', 'teacher'] as Filter[]).map((f) => (
                <button
                  key={f}
                  className={`filter-btn ${filter === f ? 'active' : ''}`}
                  onClick={() => setFilter(f)}
                  style={filter === f && f !== 'all' ? { background: ROLE_COLORS[f], borderColor: ROLE_COLORS[f] } : {}}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                  <span className="filter-count">{counts[f]}</span>
                </button>
              ))}
            </div>
            <div className="users-search">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="users-table-wrap">
            <table className="users-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Sessions</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-cell">
                        <div className="user-cell-avatar" style={{ background: `${ROLE_COLORS[user.role]}22`, color: ROLE_COLORS[user.role] }}>
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="user-cell-name">{user.name}</p>
                          <p className="user-cell-email">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="role-badge" style={{ background: `${ROLE_COLORS[user.role]}18`, color: ROLE_COLORS[user.role] }}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge status-${user.status}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="sessions-cell">{user.sessions}</td>
                    <td className="joined-cell">{user.joined}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="users-empty">
                <p>No users found matching your search.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Users;
