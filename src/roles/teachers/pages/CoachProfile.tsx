import React from 'react';
import './CoachProfile.css';
import { useNavigate, Link } from 'react-router-dom';
import {
  useAuthStore,
  getCoachName,
  getCoachIdForTeacher,
  getTeachersForCoach,
  COACH_PROFILES_DATA,
} from '../../../store/authStore';
import { getAllSessions } from '../../../store/sessionStore';

function getCoachEmail(coachId: string): string {
  const emailMap: Record<string, string> = {
    'coach-1': 'coach@school.com',
    'coach-2': 'coach2@school.com',
  };
  return emailMap[coachId] ?? '—';
}

export default function CoachProfile() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const teacherId = user?.id ?? '';
  const coachId = getCoachIdForTeacher(teacherId) ?? '';
  const coachName = getCoachName(teacherId);
  const coachInitials = coachName.split(' ').map((w) => w[0]).join('');
  const profileData = COACH_PROFILES_DATA[coachId] ?? null;

  const coachTeachers = getTeachersForCoach(coachId);
  const teacherCount = coachTeachers.length;

  const completedLoops = coachTeachers.map((t) => t.id).reduce(
    (sum, tId) => sum + getAllSessions(tId).filter((s) => s.status === 'done').length,
    0
  );

  return (
    <div className="coach-profile-page">
      {/* Navbar */}
      <nav className="cp-navbar">
        <button className="cp-back-btn" onClick={() => navigate(-1)} aria-label="Go back">
          ←
        </button>
        <div className="cp-navbar-title">Your Coach</div>
        <Link to="/teacher/messages" className="cp-msg-btn">
          💬 Message
        </Link>
      </nav>

      <div className="cp-body">
        {/* Hero */}
        <div className="cp-hero">
          <div className="cp-avatar-lg">
            {coachInitials}
          </div>
          <h1 className="cp-name">{coachName}</h1>
          <span className="cp-badge">Your Assigned Coach</span>
          {profileData && (
            <p className="cp-joined">Coaching since {profileData.joinedYear}</p>
          )}
          <p className="cp-email">✉ {getCoachEmail(coachId)}</p>
        </div>

        {/* Stats row */}
        <div className="cp-stats-row">
          <div className="cp-stat">
            <span className="cp-stat-val">{teacherCount}</span>
            <span className="cp-stat-label">Teachers</span>
          </div>
          <div className="cp-stat">
            <span className="cp-stat-val">{completedLoops}</span>
            <span className="cp-stat-label">Loops closed</span>
          </div>
        </div>

        {/* Bio */}
        {profileData && (
          <div className="cp-card">
            <h3 className="cp-card-title">About</h3>
            <p className="cp-bio">{profileData.bio}</p>
          </div>
        )}

        {/* Specialties */}
        {profileData?.specialties && (
          <div className="cp-card">
            <h3 className="cp-card-title">Focus areas</h3>
            <div className="cp-specialties">
              {profileData.specialties.map((s) => (
                <span key={s} className="cp-chip">{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <Link to="/teacher/messages" className="cp-cta-btn">
          Send a message to {coachName.split(' ')[1] ?? coachName} →
        </Link>
      </div>
    </div>
  );
}
