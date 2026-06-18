import React, { useState, useCallback } from 'react';
import './Users.css';
import Header from '../../../shared/components/Header';
import Sidebar from '../../../shared/components/Sidebar';
import { addUser, editDynamicUser, deleteDynamicUser, getDynamicCoaches } from '../../../store/authStore';
import type { User, UserRole } from '../../../shared/types/user';

const adminNavItems = [
  { label: 'Dashboard', path: '/admin', icon: '📊' },
  { label: 'Analytics', path: '/admin/analytics', icon: '📈' },
  { label: 'Users', path: '/admin/users', icon: '👥' },
  { label: 'Assignments', path: '/admin/assignments', icon: '🔗' },
  { label: 'Loops', path: '/admin/loops', icon: '🎓' },
  { label: 'Messages', path: '/admin/messages', icon: '💬' },
];

// ─── Seed users (cannot be edited/deleted) ────────────────────────────────────
const SEED_USERS = [
  { id: 'admin-1',   name: 'Admin User',    email: 'admin@school.com',    role: 'admin'   as UserRole, roles: undefined,           status: 'active'   as const, joined: 'Jan 1, 2025',  loops: 0,  isDynamic: false },
  { id: 'coach-1',   name: 'Coach Sarah',   email: 'coach@school.com',    role: 'coach'   as UserRole, roles: undefined,           status: 'active'   as const, joined: 'Jan 5, 2025',  loops: 24, isDynamic: false },
  { id: 'coach-2',   name: 'Coach Michael', email: 'coach2@school.com',   role: 'coach'   as UserRole, roles: undefined,           status: 'active'   as const, joined: 'Jan 10, 2025', loops: 18, isDynamic: false },
  { id: 'teacher-1', name: 'Mr. Johnson',   email: 'teacher@school.com',  role: 'teacher' as UserRole, roles: undefined,           status: 'active'   as const, joined: 'Jan 15, 2025', loops: 12, isDynamic: false },
  { id: 'teacher-2', name: 'Ms. Williams',  email: 'teacher2@school.com', role: 'teacher' as UserRole, roles: undefined,           status: 'active'   as const, joined: 'Jan 18, 2025', loops: 10, isDynamic: false },
  { id: 'teacher-3', name: 'Mr. Davis',     email: 'teacher3@school.com', role: 'teacher' as UserRole, roles: undefined,           status: 'active'   as const, joined: 'Jan 20, 2025', loops: 8,  isDynamic: false },
  { id: 'teacher-4', name: 'Ms. Brown',     email: 'teacher4@school.com', role: 'teacher' as UserRole, roles: undefined,           status: 'active'   as const, joined: 'Feb 1, 2025',  loops: 6,  isDynamic: false },
  { id: 'teacher-5', name: 'Mr. Wilson',    email: 'teacher5@school.com', role: 'teacher' as UserRole, roles: undefined,           status: 'inactive' as const, joined: 'Feb 5, 2025',  loops: 2,  isDynamic: false },
];

const ROLE_COLORS: Record<string, string> = {
  admin: '#0066cc',
  coach: '#00aa44',
  teacher: '#ff6600',
};

type Filter = 'all' | 'admin' | 'coach' | 'teacher';

type RowUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roles?: UserRole[];
  status: 'active' | 'inactive';
  joined: string;
  loops: number;
  isDynamic: boolean;
};

function roleLabel(row: RowUser): string {
  if (row.roles && row.roles.length > 1) return row.roles.join(' / ');
  return row.role;
}

function roleBadgeColor(row: RowUser): string {
  if (row.roles && row.roles.length > 1) return '#7c3aed';
  return ROLE_COLORS[row.role] ?? '#6b6375';
}

function buildRows(dynamicUsers: User[]): RowUser[] {
  const dyn: RowUser[] = dynamicUsers.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    roles: u.roles,
    status: 'active' as const,
    joined: new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    loops: 0,
    isDynamic: true,
  }));
  return [...SEED_USERS, ...dyn];
}

// ─── Modal state ──────────────────────────────────────────────────────────────

interface FormState {
  name: string;
  email: string;
  role: UserRole;
  isAlsoAdmin: boolean;
  password: string;
  confirm: string;
  error: string;
  submitting: boolean;
}

const EMPTY_FORM: FormState = {
  name: '', email: '', role: 'teacher', isAlsoAdmin: false,
  password: '', confirm: '', error: '', submitting: false,
};

type ModalMode = 'add' | 'edit' | null;

export const Users: React.FC = () => {
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [dynamicUsers, setDynamicUsers] = useState<User[]>(() => getDynamicCoaches());
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editTargetId, setEditTargetId] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const rows = buildRows(dynamicUsers);

  const refresh = () => setDynamicUsers(getDynamicCoaches());

  const filtered = rows.filter((u) => {
    const matchRole =
      filter === 'all' ||
      u.role === filter ||
      u.roles?.includes(filter as UserRole);
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q);
    return matchRole && matchSearch;
  });

  const counts = {
    all: rows.length,
    admin: rows.filter((u) => u.role === 'admin' || u.roles?.includes('admin')).length,
    coach: rows.filter((u) => u.role === 'coach' || u.roles?.includes('coach')).length,
    teacher: rows.filter((u) => u.role === 'teacher').length,
  };

  // ── Open Add modal ──────────────────────────────────────────────────────────
  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditTargetId(null);
    setModalMode('add');
  };

  // ── Open Edit modal ─────────────────────────────────────────────────────────
  const openEdit = (row: RowUser) => {
    const isAdminCoach = row.roles?.includes('admin') && row.roles?.includes('coach');
    setForm({
      name: row.name,
      email: row.email,
      role: row.roles?.includes('coach') ? 'coach' : row.role,
      isAlsoAdmin: !!isAdminCoach,
      password: '',
      confirm: '',
      error: '',
      submitting: false,
    });
    setEditTargetId(row.id);
    setModalMode('edit');
  };

  const closeModal = () => { setModalMode(null); setEditTargetId(null); };

  const setField = useCallback((field: keyof FormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value, error: '' }));
  }, []);

  // ── Submit Add ──────────────────────────────────────────────────────────────
  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const { name, email, role, isAlsoAdmin, password, confirm } = form;
    if (!name.trim()) return setForm((p) => ({ ...p, error: 'Name is required.' }));
    if (!email.trim()) return setForm((p) => ({ ...p, error: 'Email is required.' }));
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return setForm((p) => ({ ...p, error: 'Enter a valid email address.' }));
    if (password.length < 6)
      return setForm((p) => ({ ...p, error: 'Password must be at least 6 characters.' }));
    if (password !== confirm)
      return setForm((p) => ({ ...p, error: 'Passwords do not match.' }));

    setForm((p) => ({ ...p, submitting: true }));
    const result = addUser(name, email, password, role, isAlsoAdmin);
    if (!result.success) {
      return setForm((p) => ({ ...p, submitting: false, error: result.error ?? 'Failed to create user.' }));
    }
    refresh();
    closeModal();
  };

  // ── Submit Edit ─────────────────────────────────────────────────────────────
  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTargetId) return;
    const { name, email, role, isAlsoAdmin, password, confirm } = form;
    if (!name.trim()) return setForm((p) => ({ ...p, error: 'Name is required.' }));
    if (!email.trim()) return setForm((p) => ({ ...p, error: 'Email is required.' }));
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return setForm((p) => ({ ...p, error: 'Enter a valid email address.' }));
    if (password && password.length < 6)
      return setForm((p) => ({ ...p, error: 'New password must be at least 6 characters.' }));
    if (password && password !== confirm)
      return setForm((p) => ({ ...p, error: 'Passwords do not match.' }));

    setForm((p) => ({ ...p, submitting: true }));
    const result = editDynamicUser(editTargetId, {
      name,
      email,
      role,
      isAlsoAdmin,
      password: password || undefined,
    });
    if (!result.success) {
      return setForm((p) => ({ ...p, submitting: false, error: result.error ?? 'Failed to update user.' }));
    }
    refresh();
    closeModal();
  };

  // ── Confirm Delete ──────────────────────────────────────────────────────────
  const handleDelete = () => {
    if (!deleteTargetId) return;
    deleteDynamicUser(deleteTargetId);
    refresh();
    setDeleteTargetId(null);
  };

  const deleteTarget = rows.find((r) => r.id === deleteTargetId);

  return (
    <div className="admin-layout">
      <Sidebar items={adminNavItems} title="AI-COACH" accentColor="#0066cc" />

      <div className="admin-content">
        <Header title="Users" subtitle="Manage platform users and roles" />

        <main className="admin-main">
          <div className="users-toolbar">
            <div className="users-filters">
              {(['all', 'admin', 'coach', 'teacher'] as Filter[]).map((f) => (
                <button
                  key={f}
                  className={`filter-btn ${filter === f ? 'active' : ''}`}
                  onClick={() => setFilter(f)}
                  style={
                    filter === f && f !== 'all'
                      ? { background: ROLE_COLORS[f] ?? '#0066cc', borderColor: ROLE_COLORS[f] ?? '#0066cc' }
                      : {}
                  }
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                  <span className="filter-count">{counts[f]}</span>
                </button>
              ))}
            </div>

            <div className="users-toolbar-right">
              <div className="users-search">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button className="add-coach-btn" onClick={openAdd}>
                + Add User
              </button>
            </div>
          </div>

          <div className="users-table-wrap">
            <table className="users-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Loops</th>
                  <th>Joined</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <div className="user-cell">
                        <div
                          className="user-cell-avatar"
                          style={{
                            background: `${roleBadgeColor(row)}22`,
                            color: roleBadgeColor(row),
                          }}
                        >
                          {row.name.charAt(0)}
                        </div>
                        <div>
                          <p className="user-cell-name">{row.name}</p>
                          <p className="user-cell-email">{row.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        className="role-badge"
                        style={{
                          background: `${roleBadgeColor(row)}18`,
                          color: roleBadgeColor(row),
                        }}
                      >
                        {roleLabel(row)}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge status-${row.status}`}>{row.status}</span>
                    </td>
                    <td className="sessions-cell">{row.loops}</td>
                    <td className="joined-cell">{row.joined}</td>
                    <td className="actions-cell">
                      {row.isDynamic ? (
                        <div className="row-actions">
                          <button
                            className="row-btn row-btn--edit"
                            onClick={() => openEdit(row)}
                            title="Edit user"
                          >
                            Edit
                          </button>
                          <button
                            className="row-btn row-btn--delete"
                            onClick={() => setDeleteTargetId(row.id)}
                            title="Delete user"
                          >
                            Delete
                          </button>
                        </div>
                      ) : (
                        <span className="row-seed-label">System</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="users-empty">
                <p>No users found matching your search.</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ── Add / Edit Modal ── */}
      {modalMode !== null && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modalMode === 'add' ? 'Add New User' : 'Edit User'}</h2>
              <button className="modal-close" onClick={closeModal} aria-label="Close">✕</button>
            </div>

            <form
              className="modal-form"
              onSubmit={modalMode === 'add' ? handleAdd : handleEdit}
              noValidate
            >
              <div className="modal-field">
                <label>Full name</label>
                <input
                  type="text"
                  placeholder="e.g. Ms. Grace"
                  value={form.name}
                  onChange={(e) => setField('name', e.target.value)}
                  autoFocus
                />
              </div>

              <div className="modal-field">
                <label>Email address</label>
                <input
                  type="email"
                  placeholder="user@school.com"
                  value={form.email}
                  onChange={(e) => setField('email', e.target.value)}
                />
              </div>

              <div className="modal-field">
                <label>Role</label>
                <select
                  className="modal-select"
                  value={form.role}
                  onChange={(e) => setField('role', e.target.value as UserRole)}
                >
                  <option value="teacher">Teacher</option>
                  <option value="coach">Coach</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {form.role === 'coach' && (
                <label className="modal-checkbox-row">
                  <input
                    type="checkbox"
                    checked={form.isAlsoAdmin}
                    onChange={(e) => setField('isAlsoAdmin', e.target.checked)}
                  />
                  <span>
                    <strong>Grant Admin role</strong> — this coach will also have Admin access
                  </span>
                </label>
              )}

              <div className="modal-field">
                <label>{modalMode === 'edit' ? 'New password (leave blank to keep current)' : 'Password'}</label>
                <input
                  type="password"
                  placeholder={modalMode === 'edit' ? 'Leave blank to keep current' : 'At least 6 characters'}
                  value={form.password}
                  onChange={(e) => setField('password', e.target.value)}
                />
              </div>

              {(modalMode === 'add' || form.password) && (
                <div className="modal-field">
                  <label>Confirm password</label>
                  <input
                    type="password"
                    placeholder="Repeat password"
                    value={form.confirm}
                    onChange={(e) => setField('confirm', e.target.value)}
                  />
                </div>
              )}

              {form.error && <p className="modal-error">{form.error}</p>}

              <div className="modal-actions">
                <button type="button" className="modal-cancel-btn" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="modal-submit-btn" disabled={form.submitting}>
                  {form.submitting
                    ? modalMode === 'add' ? 'Creating…' : 'Saving…'
                    : modalMode === 'add' ? 'Create User' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation ── */}
      {deleteTargetId && (
        <div className="modal-overlay" onClick={() => setDeleteTargetId(null)}>
          <div className="modal-card modal-card--sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete User</h2>
              <button className="modal-close" onClick={() => setDeleteTargetId(null)} aria-label="Close">✕</button>
            </div>
            <div className="delete-confirm-body">
              <div className="delete-confirm-icon">🗑️</div>
              <p className="delete-confirm-text">
                Are you sure you want to delete <strong>{deleteTarget?.name}</strong>?
                <br />
                <span className="delete-confirm-sub">This action cannot be undone.</span>
              </p>
              <div className="modal-actions">
                <button className="modal-cancel-btn" onClick={() => setDeleteTargetId(null)}>
                  Cancel
                </button>
                <button className="modal-delete-btn" onClick={handleDelete}>
                  Delete User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
