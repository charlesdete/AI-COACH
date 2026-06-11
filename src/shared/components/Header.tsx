import React from 'react';
import './Header.css';
import { useAuthStore } from '../../store/authStore';
import { useMessagingStore } from '../../store/messagingStore';
import { Link } from 'react-router-dom';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  const { user } = useAuthStore();
  const { getTotalUnread } = useMessagingStore();
  const unreadCount = getTotalUnread();

  const roleColor =
    user?.role === 'admin' ? '#0066cc' :
    user?.role === 'coach' ? '#00aa44' :
    '#ff6600';

  const messagesPath =
    user?.role === 'admin' ? '/admin/messages' :
    user?.role === 'coach' ? '/coach/chats' :
    '/teacher/messages';

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-title">
          {title && <h1 className="header-main-title">{title}</h1>}
          {subtitle && <p className="header-subtitle">{subtitle}</p>}
        </div>

        <div className="header-actions">
          {unreadCount > 0 && (
            <Link to={messagesPath} className="header-notif" style={{ borderColor: `${roleColor}44`, background: `${roleColor}10` }}>
              <span className="notif-icon">💬</span>
              <span className="notif-count" style={{ background: roleColor }}>{unreadCount}</span>
              <span className="notif-label">unread</span>
            </Link>
          )}

          <div className="header-user">
            <div className="header-avatar" style={{ background: roleColor }}>
              {user?.name?.charAt(0) ?? '?'}
            </div>
            <div className="header-user-info">
              <p className="header-user-name">{user?.name}</p>
              <span className="header-user-role" style={{ color: roleColor }}>{user?.role}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
