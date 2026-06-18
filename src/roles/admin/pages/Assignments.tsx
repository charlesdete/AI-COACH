import React, { useState, useEffect } from 'react';
import './Assignments.css';
import Header from '../../../shared/components/Header';
import Sidebar from '../../../shared/components/Sidebar';
import {
  useAuthStore,
  TEACHER_PROFILES,
  getAllCoaches,
  getCoachIdForTeacher,
  type CoachInfo,
} from '../../../store/authStore';

const adminNavItems = [
  { label: 'Dashboard', path: '/admin', icon: '📊' },
  { label: 'Analytics', path: '/admin/analytics', icon: '📈' },
  { label: 'Users', path: '/admin/users', icon: '👥' },
  { label: 'Assignments', path: '/admin/assignments', icon: '🔗' },
  { label: 'Loops', path: '/admin/loops', icon: '🎓' },
  { label: 'Messages', path: '/admin/messages', icon: '💬' },
];

export const AdminAssignments: React.FC = () => {
  const { setAssignment, removeAssignment, assignments } = useAuthStore();
  const [coaches, setCoaches] = useState<CoachInfo[]>([]);
  const [savedId, setSavedId] = useState<string | null>(null);

  useEffect(() => {
    setCoaches(getAllCoaches());
  }, []);

  const teachers = Object.values(TEACHER_PROFILES);

  function handleChange(teacherId: string, coachId: string) {
    if (coachId === '') {
      removeAssignment(teacherId);
    } else {
      setAssignment(teacherId, coachId);
    }
    setSavedId(teacherId);
    setTimeout(() => setSavedId(null), 1800);
  }

  const assigned = teachers.filter((t) => getCoachIdForTeacher(t.id));
  const unassigned = teachers.filter((t) => !getCoachIdForTeacher(t.id));

  return (
    <div className="admin-layout">
      <Sidebar items={adminNavItems} title="AI-COACH" accentColor="#0066cc" />

      <div className="admin-content">
        <Header
          title="Assignments"
          subtitle="Assign coaches to teachers to supervise their journey"
        />

        <main className="admin-main">
          {/* Stats */}
          <div className="assign-stats-row">
            <div className="assign-stat">
              <span className="assign-stat-val">{teachers.length}</span>
              <span className="assign-stat-label">Teachers</span>
            </div>
            <div className="assign-stat assign-stat--ok">
              <span className="assign-stat-val">{assigned.length}</span>
              <span className="assign-stat-label">Assigned</span>
            </div>
            <div className="assign-stat assign-stat--warn">
              <span className="assign-stat-val">{unassigned.length}</span>
              <span className="assign-stat-label">Unassigned</span>
            </div>
            <div className="assign-stat">
              <span className="assign-stat-val">{coaches.length}</span>
              <span className="assign-stat-label">Coaches</span>
            </div>
          </div>

          {/* Table */}
          <div className="assign-card">
            <table className="assign-table">
              <thead>
                <tr>
                  <th>Teacher</th>
                  <th>Focus Topic</th>
                  <th>Assigned Coach</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((teacher) => {
                  const currentCoachId = getCoachIdForTeacher(teacher.id) ?? '';
                  const currentCoach = coaches.find((c) => c.id === currentCoachId);
                  const isSaved = savedId === teacher.id;

                  return (
                    <tr key={teacher.id} className={isSaved ? 'assign-row--saved' : ''}>
                      <td>
                        <div className="assign-teacher-cell">
                          <div className="assign-avatar">
                            {teacher.name.charAt(0)}
                          </div>
                          <span className="assign-teacher-name">{teacher.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className="assign-topic">{teacher.topic}</span>
                      </td>
                      <td>
                        <select
                          className="assign-select"
                          value={currentCoachId}
                          onChange={(e) => handleChange(teacher.id, e.target.value)}
                        >
                          <option value="">— Unassigned —</option>
                          {coaches.map((coach) => (
                            <option key={coach.id} value={coach.id}>
                              {coach.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="assign-status-cell">
                        {isSaved && <span className="assign-saved-badge">✓ Saved</span>}
                        {!isSaved && !currentCoach && (
                          <span className="assign-warn-badge">Unassigned</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className="assign-hint">
            Changes are saved automatically. Teachers will see their new coach on next login.
          </p>
        </main>
      </div>
    </div>
  );
};

export default AdminAssignments;
