import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Sidebar.css';
import { useAuthStore } from '../../store/authStore';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

interface SidebarProps {
  items: NavItem[];
  title?: string;
  accentColor?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ items, title = 'AI-COACH', accentColor }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuthStore();

  const roleColor = accentColor || (
    user?.role === 'admin' ? '#0066cc' :
    user?.role === 'coach' ? '#00aa44' :
    '#ff6600'
  );

  const roleLabel = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : '';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`} style={{ '--role-color': roleColor } as React.CSSProperties}>
      <div className="sidebar-header">
        <div className="sidebar-branding">
          <div className="sidebar-logo">🎓</div>
          {!isCollapsed && (
            <div>
              <h2 className="sidebar-title">{title}</h2>
              {user && <p className="sidebar-role-badge" style={{ color: roleColor }}>{roleLabel}</p>}
            </div>
          )}
        </div>
        <button
          className="sidebar-toggle"
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label="Toggle sidebar"
        >
          {isCollapsed ? '›' : '‹'}
        </button>
      </div>

      {user && !isCollapsed && (
        <div className="sidebar-user">
          <div className="sidebar-avatar" style={{ background: roleColor }}>
            {user.name.charAt(0)}
          </div>
          <div className="sidebar-user-info">
            <p className="sidebar-user-name">{user.name}</p>
            <p className="sidebar-user-email">{user.email}</p>
          </div>
        </div>
      )}

      <nav className="sidebar-nav">
        <ul className="nav-list">
          {items.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`nav-link ${isActive ? 'active' : ''}`}
                  title={item.label}
                  style={isActive ? { color: roleColor, borderLeftColor: roleColor, background: `${roleColor}18` } : {}}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {!isCollapsed && <span className="nav-label">{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-logout-btn" onClick={handleLogout} title="Logout">
          <span className="nav-icon">🚪</span>
          {!isCollapsed && <span>Logout</span>}
        </button>
        {!isCollapsed && <p className="sidebar-version">v1.0.0</p>}
      </div>
    </aside>
  );
};

export default Sidebar;
