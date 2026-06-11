import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';
import { useAuthStore } from '../../store/authStore';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

interface SidebarProps {
  items: NavItem[];
  title: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ items, title }) => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useAuthStore();

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-branding">
          <h2 className="sidebar-title">{title}</h2>
          {user && <p className="sidebar-role">{user.role}</p>}
        </div>
        <button
          className="sidebar-toggle"
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label="Toggle sidebar"
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-list">
          {items.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                title={item.label}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <p className="sidebar-version">v1.0.0</p>
      </div>
    </aside>
  );
};

export default Sidebar;
