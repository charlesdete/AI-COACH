import React from 'react';
import './Header.css';
import { useAuthStore } from '../../store/authStore';
import { useMessagingStore } from '../../store/messagingStore';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  const { user, logout } = useAuthStore();
  const { getTotalUnread } = useMessagingStore();
  const unreadCount = getTotalUnread();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-title">
          {title && <h1 className="header-main-title">{title}</h1>}
          {subtitle && <p className="header-subtitle">{subtitle}</p>}
        </div>
        
        <div className="header-actions">
          {unreadCount > 0 && (
            <div className="notification-badge">
              <span className="badge-count">{unreadCount}</span>
              <p className="badge-label">Messages</p>
            </div>
          )}
          
          <div className="user-menu">
            {user && (
              <>
                <div className="user-info">
                  <p className="user-name">{user.name}</p>
                  <span className="user-role">{user.role}</span>
                </div>
                {user.avatar && (
                  <img src={user.avatar} alt={user.name} className="user-avatar" />
                )}
              </>
            )}
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
