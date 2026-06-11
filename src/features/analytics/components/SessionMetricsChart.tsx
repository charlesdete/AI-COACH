import React from 'react';
import './SessionMetricsChart.css';
import { SessionMetrics } from '../../../shared/types/analytics';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

interface SessionMetricsChartProps {
  data: SessionMetrics;
}

export const SessionMetricsChart: React.FC<SessionMetricsChartProps> = ({ data }) => {
  return (
    <div className="session-metrics-chart">
      <div className="chart-header">
        <h3>Session Metrics</h3>
      </div>

      <div className="key-metrics">
        <div className="metric-pill">
          <span className="metric-title">Total Sessions</span>
          <span className="metric-num">{data.totalSessions}</span>
        </div>
        <div className="metric-pill">
          <span className="metric-title">Completed</span>
          <span className="metric-num">{data.completedSessions}</span>
        </div>
        <div className="metric-pill">
          <span className="metric-title">Avg Duration</span>
          <span className="metric-num">{data.averageDuration}m</span>
        </div>
        <div className="metric-pill">
          <span className="metric-title">Completion Rate</span>
          <span className="metric-num">{data.completionRate}%</span>
        </div>
        <div className="metric-pill">
          <span className="metric-title">Topics</span>
          <span className="metric-num">{data.topicsCount}</span>
        </div>
      </div>

      <div className="charts-container">
        <div className="chart full-width">
          <h4>Sessions Over Time</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.sessionsPerDay}>
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
              <Line
                type="monotone"
                dataKey="count"
                stroke="var(--accent)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart">
          <h4>Top Topics</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.topTopics}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="topic" stroke="var(--text)" angle={-45} textAnchor="end" />
              <YAxis stroke="var(--text)" />
              <Tooltip
                contentStyle={{
                  background: 'var(--bg)',
                  border: `1px solid var(--border)`,
                  color: 'var(--text-h)',
                }}
              />
              <Bar dataKey="count" fill="#00aa44" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default SessionMetricsChart;
