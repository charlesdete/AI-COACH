import React from 'react';
import './StatCard.css';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  color?: 'primary' | 'success' | 'warning' | 'danger';
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  trend,
  color = 'primary',
}) => {
  return (
    <div className={`stat-card stat-card-${color}`}>
      <div className="stat-header">
        <h3 className="stat-label">{label}</h3>
        {icon && <span className="stat-icon">{icon}</span>}
      </div>

      <div className="stat-content">
        <p className="stat-value">{value}</p>
        {trend && (
          <div className={`stat-trend trend-${trend.direction}`}>
            <span className="trend-icon">
              {trend.direction === 'up' ? '↑' : '↓'}
            </span>
            <span className="trend-value">{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
