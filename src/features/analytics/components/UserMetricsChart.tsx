import React from 'react';
import './UserMetricsChart.css';
import { UserMetrics } from '../../../shared/types/analytics';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface UserMetricsChartProps {
  data: UserMetrics;
}

export const UserMetricsChart: React.FC<UserMetricsChartProps> = ({ data }) => {
  const roleDistributionData = [
    { name: 'Teachers', value: data.roleDistribution.teachers, color: '#ff6600' },
    { name: 'Coaches', value: data.roleDistribution.coaches, color: '#00aa44' },
    { name: 'Admins', value: data.roleDistribution.admins, color: '#0066cc' },
  ];

  return (
    <div className="user-metrics-chart">
      <div className="chart-header">
        <h3>User Metrics</h3>
      </div>

      <div className="metrics-grid">
        <div className="metric-box">
          <div className="metric-label">Total Users</div>
          <div className="metric-value">{data.totalUsers}</div>
        </div>
        <div className="metric-box">
          <div className="metric-label">Active Users</div>
          <div className="metric-value">{data.activeUsers}</div>
        </div>
        <div className="metric-box">
          <div className="metric-label">New This Month</div>
          <div className="metric-value">{data.newUsersThisMonth}</div>
        </div>
      </div>

      <div className="charts-container">
        <div className="chart">
          <h4>User Growth</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.userGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" stroke="var(--text)" />
              <YAxis stroke="var(--text)" />
              <Tooltip
                contentStyle={{
                  background: 'var(--bg)',
                  border: `1px solid var(--border)`,
                  color: 'var(--text-h)',
                }}
              />
              <Bar dataKey="count" fill="var(--accent)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart">
          <h4>Role Distribution</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={roleDistributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {roleDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'var(--bg)',
                  border: `1px solid var(--border)`,
                  color: 'var(--text-h)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default UserMetricsChart;
