import React from 'react';
import './TeamPerformanceCard.css';
import { TeamPerformance } from '../../../shared/types/analytics';

interface TeamPerformanceCardProps {
  data: TeamPerformance;
}

export const TeamPerformanceCard: React.FC<TeamPerformanceCardProps> = ({ data }) => {
  return (
    <div className="team-performance-card">
      <div className="card-header">
        <h3>Team Performance</h3>
      </div>

      <div className="performance-grid">
        <div className="performance-section">
          <div className="section-title">Team Overview</div>
          <div className="overview-stats">
            <div className="stat">
              <span className="stat-label">Total Coaches</span>
              <span className="stat-value">{data.totalCoaches}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Total Teachers</span>
              <span className="stat-value">{data.totalTeachers}</span>
            </div>
          </div>
        </div>

        <div className="performance-section">
          <div className="section-title">Coach Effectiveness</div>
          <div className="coach-list">
            {data.coachEffectiveness.map((coach) => (
              <div key={coach.coachId} className="coach-item">
                <div className="coach-info">
                  <p className="coach-name">{coach.coachName}</p>
                  <p className="coach-meta">
                    {coach.teacherCount} teachers • {coach.sessionCount} sessions
                  </p>
                </div>
                <div className="coach-rating">
                  <div className="rating-stars">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`star ${i < Math.round(coach.averageRating) ? 'filled' : ''}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="rating-value">{coach.averageRating.toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="performance-section">
          <div className="section-title">Teacher Progress</div>
          <div className="teacher-list">
            {data.teacherProgress.slice(0, 5).map((teacher) => (
              <div key={teacher.teacherId} className="teacher-item">
                <div className="teacher-info">
                  <p className="teacher-name">{teacher.teacherName}</p>
                  <p className="teacher-meta">{teacher.sessionsCompleted} sessions completed</p>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${teacher.progress}%` }}></div>
                </div>
                <span className="progress-value">{teacher.progress}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="performance-section">
          <div className="section-title">Engagement Scores</div>
          <div className="engagement-list">
            {data.engagementScore.slice(0, 5).map((user) => (
              <div key={user.userId} className="engagement-item">
                <div className="engagement-name">{user.userName}</div>
                <div className="engagement-score-bar">
                  <div
                    className="score-fill"
                    style={{
                      width: `${user.score}%`,
                      backgroundColor: `hsl(${(user.score / 100) * 120}, 70%, 50%)`,
                    }}
                  ></div>
                </div>
                <span className="score-value">{user.score}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamPerformanceCard;
