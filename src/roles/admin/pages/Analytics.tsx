import React, { useState } from 'react';
import './Analytics.css';
import Header from '../../../shared/components/Header';
import Sidebar from '../../../shared/components/Sidebar';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const adminNavItems = [
  { label: 'Dashboard', path: '/admin', icon: '📊' },
  { label: 'Analytics', path: '/admin/analytics', icon: '📈' },
  { label: 'Users', path: '/admin/users', icon: '👥' },
  { label: 'Assignments', path: '/admin/assignments', icon: '🔗' },
  { label: 'Loops', path: '/admin/loops', icon: '🎓' },
  { label: 'Messages', path: '/admin/messages', icon: '💬' },
];

const sessionData = [
  { week: 'Wk 1', loops: 8, completed: 6 },
  { week: 'Wk 2', loops: 12, completed: 10 },
  { week: 'Wk 3', loops: 10, completed: 9 },
  { week: 'Wk 4', loops: 16, completed: 14 },
  { week: 'Wk 5', loops: 14, completed: 12 },
  { week: 'Wk 6', loops: 20, completed: 18 },
];

const topicData = [
  { topic: 'Engaging students', count: 28 },
  { topic: 'Behavior mgmt', count: 22 },
  { topic: 'Bible lessons', count: 18 },
  { topic: 'Checking understanding', count: 15 },
  { topic: 'Struggling learners', count: 12 },
  { topic: 'Other', count: 7 },
];

const engagementData = [
  { month: 'Jan', messages: 45, loops: 20 },
  { month: 'Feb', messages: 62, loops: 28 },
  { month: 'Mar', messages: 55, loops: 24 },
  { month: 'Apr', messages: 78, loops: 34 },
  { month: 'May', messages: 90, loops: 38 },
  { month: 'Jun', messages: 102, loops: 46 },
];

const METRIC_CARDS = [
  { label: 'Avg Loop Length', value: '18 min', sub: '+3 min vs last month', color: '#0066cc' },
  { label: 'Avg Messages / Convo', value: '6.4', sub: '+1.2 vs last month', color: '#00aa44' },
  { label: 'Completion Rate', value: '82%', sub: '+5% vs last month', color: '#000080' },
  { label: 'Active Teachers', value: '16 / 18', sub: '89% engagement', color: '#ff6600' },
];

export const Analytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'loops' | 'topics' | 'engagement'>('loops');

  return (
    <div className="admin-layout">
      <Sidebar items={adminNavItems} title="AI-COACH" accentColor="#0066cc" />

      <div className="admin-content">
        <Header title="Analytics" subtitle="Platform performance and engagement metrics" />

        <main className="admin-main">
          <div className="analytics-metrics-grid">
            {METRIC_CARDS.map((m) => (
              <div key={m.label} className="analytics-metric-card" style={{ borderTopColor: m.color }}>
                <p className="am-label">{m.label}</p>
                <p className="am-value" style={{ color: m.color }}>{m.value}</p>
                <p className="am-sub">↑ {m.sub}</p>
              </div>
            ))}
          </div>

          <div className="analytics-chart-card">
            <div className="chart-tabs">
              {(['loops', 'topics', 'engagement'] as const).map((tab) => (
                <button
                  key={tab}
                  className={`chart-tab ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {activeTab === 'loops' && (
              <div className="chart-wrap">
                <h3 className="chart-title">Weekly Loops — Started vs Completed</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={sessionData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0efef" />
                    <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#6b6375' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#6b6375' }} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e4e7', fontSize: 13 }} />
                    <Legend />
                    <Line type="monotone" dataKey="loops" stroke="#0066cc" strokeWidth={2.5} dot={{ r: 4 }} name="Started" />
                    <Line type="monotone" dataKey="completed" stroke="#00aa44" strokeWidth={2.5} dot={{ r: 4 }} name="Completed" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {activeTab === 'topics' && (
              <div className="chart-wrap">
                <h3 className="chart-title">Topic Popularity — Loops by Focus Area</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={topicData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0efef" />
                    <XAxis dataKey="topic" tick={{ fontSize: 11, fill: '#6b6375' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#6b6375' }} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e4e7', fontSize: 13 }} />
                    <Bar dataKey="count" fill="#000080" radius={[4, 4, 0, 0]} name="Loops" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {activeTab === 'engagement' && (
              <div className="chart-wrap">
                <h3 className="chart-title">Monthly Engagement — Messages & Loops</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={engagementData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="msgGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0066cc" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#0066cc" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="sessGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00aa44" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#00aa44" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0efef" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b6375' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#6b6375' }} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e4e7', fontSize: 13 }} />
                    <Legend />
                    <Area type="monotone" dataKey="messages" stroke="#0066cc" fill="url(#msgGrad)" strokeWidth={2} name="Messages" />
                    <Area type="monotone" dataKey="loops" stroke="#00aa44" fill="url(#sessGrad)" strokeWidth={2} name="Loops" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="analytics-bottom-grid">
            <div className="analytics-card">
              <h3>Teacher Performance</h3>
              <div className="teacher-perf-list">
                {[
                  { name: 'Mr. Johnson', loops: 12, rate: 92 },
                  { name: 'Ms. Williams', loops: 10, rate: 88 },
                  { name: 'Mr. Davis', loops: 8, rate: 75 },
                  { name: 'Ms. Brown', loops: 6, rate: 83 },
                ].map((t) => (
                  <div key={t.name} className="perf-row">
                    <div className="perf-avatar" style={{ background: '#ff660022', color: '#ff6600' }}>{t.name.split(' ')[1][0]}</div>
                    <div className="perf-info">
                      <p className="perf-name">{t.name}</p>
                      <div className="perf-bar-wrap">
                        <div className="perf-bar" style={{ width: `${t.rate}%`, background: t.rate >= 88 ? '#00aa44' : t.rate >= 80 ? '#ff9900' : '#ff6600' }} />
                      </div>
                    </div>
                    <div className="perf-stats">
                      <span className="perf-pct">{t.rate}%</span>
                      <span className="perf-sess">{t.loops} loops</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="analytics-card">
              <h3>Key Insights</h3>
              <div className="insights-list">
                {[
                  { icon: '🔥', text: '"Engaging students" is the most popular topic — 28 loops', color: '#ff6600' },
                  { icon: '📈', text: 'Loop completion rate improved 5% this month', color: '#00aa44' },
                  { icon: '💬', text: '3 conversations have unread messages from teachers', color: '#0066cc' },
                  { icon: '⚠️', text: '2 teachers have not started a loop this week', color: '#ff9900' },
                  { icon: '🌟', text: 'Coach Sarah achieved the highest engagement rate', color: '#000080' },
                ].map((ins, i) => (
                  <div key={i} className="insight-item">
                    <div className="insight-icon" style={{ background: `${ins.color}18` }}>{ins.icon}</div>
                    <p className="insight-text">{ins.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Analytics;
