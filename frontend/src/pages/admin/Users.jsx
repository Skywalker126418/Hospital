import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  UserPlus,
  Search,
  Filter,
  Key,
  Power,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  Stethoscope,
  Shield
} from 'lucide-react';
import { userService } from '../../services/userService';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');

  // Create User Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'doctor',
    specialization: 'Internal Medicine',
    department: 'Outpatient Care',
    phone: '',
  });
  const [isCreating, setIsCreating] = useState(false);

  // Reset Password Modal State
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [targetUser, setTargetUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const { success, error: toastError } = useToast();

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await userService.getUsers({
        role: roleFilter,
        search,
      });
      if (res.success) setUsers(res.data);
    } catch (err) {
      toastError('Failed to load system users list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  const handleToggleStatus = async (user) => {
    try {
      const res = await userService.toggleStatus(user.id);
      success(res.message);
      loadUsers();
    } catch (err) {
      toastError(err.message || 'Failed to toggle account status.');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      await userService.createUser(newUser);
      success(`User ${newUser.name} created successfully.`);
      setIsCreateOpen(false);
      setNewUser({
        name: '',
        email: '',
        password: '',
        role: 'doctor',
        specialization: 'Internal Medicine',
        department: 'Outpatient Care',
        phone: '',
      });
      loadUsers();
    } catch (err) {
      toastError(err.message || 'Failed to create user.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toastError('Password must be at least 6 characters.');
      return;
    }

    setIsResetting(true);
    try {
      await userService.resetPassword(targetUser.id, newPassword);
      success(`Password reset for ${targetUser.name}.`);
      setIsResetOpen(false);
      setNewPassword('');
    } catch (err) {
      toastError(err.message || 'Failed to reset password.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hospital Staff & Account Administration"
        subtitle="Manage authenticated user credentials, assign role-based RBAC permissions, and audit account access."
        actions={
          <Button variant="primary" icon={UserPlus} onClick={() => setIsCreateOpen(true)}>
            Provision New Staff User
          </Button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            loadUsers();
          }}
          className="flex-1 w-full flex items-center gap-2"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search staff by full name or email address..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500"
            />
          </div>
          <Button type="submit" size="sm" variant="secondary">
            Search
          </Button>
        </form>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
        >
          <option value="">All Roles</option>
          <option value="doctor">Doctors</option>
          <option value="receptionist">Receptionists</option>
          <option value="admin">Administrators</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <LoadingSpinner size="md" text="Loading staff records..." />
        ) : users.length === 0 ? (
          <EmptyState
            title="No staff accounts match query"
            description="Create a new user account to grant system access."
            actionLabel="Create User"
            onAction={() => setIsCreateOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Staff Member</th>
                  <th className="px-5 py-3.5">Role</th>
                  <th className="px-5 py-3.5">Department / Specialty</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Last Login</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900">{u.name}</div>
                      <div className="text-xs text-slate-400 font-mono">{u.email}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
                        u.role === 'admin'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : u.role === 'doctor'
                          ? 'bg-brand-50 text-brand-700 border border-brand-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {u.role === 'admin' && <Shield className="w-3 h-3" />}
                        {u.role === 'doctor' && <Stethoscope className="w-3 h-3" />}
                        {u.role === 'receptionist' && <UserCheck className="w-3 h-3" />}
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-700">
                      {u.specialization ? (
                        <div>
                          <p className="font-medium text-slate-800">{u.specialization}</p>
                          <p className="text-slate-400">{u.department}</p>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Hospital Operations</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        u.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-600'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500">
                      {u.last_login ? new Date(u.last_login).toLocaleString() : 'Never logged in'}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          icon={Key}
                          onClick={() => {
                            setTargetUser(u);
                            setIsResetOpen(true);
                          }}
                        >
                          Reset Pass
                        </Button>
                        <Button
                          size="sm"
                          variant={u.status === 'active' ? 'ghost' : 'success'}
                          icon={Power}
                          onClick={() => handleToggleStatus(u)}
                        >
                          {u.status === 'active' ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Provision User Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Provision New Hospital Staff Account"
        subtitle="Create credentials and assign role permissions"
      >
        <form onSubmit={handleCreateUser} className="space-y-4 text-sm">
          <Input
            label="Staff Full Name"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            placeholder="e.g. Dr. Jennifer Adams"
            required
          />

          <Input
            label="Staff Email Address"
            type="email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            placeholder="e.g. j.adams@hospital.com"
            required
          />

          <Input
            label="Temporary Initial Password"
            type="password"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            placeholder="At least 6 characters"
            required
          />

          <Select
            label="Assigned System Role"
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            options={[
              { value: 'doctor', label: 'Doctor / Physician (Clinical Workstation)' },
              { value: 'receptionist', label: 'Receptionist (Front Desk Workstation)' },
              { value: 'admin', label: 'System Administrator (Full Oversight)' },
            ]}
            required
          />

          {newUser.role === 'doctor' && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                Doctor Professional Credentials
              </span>
              <Input
                label="Specialization"
                value={newUser.specialization}
                onChange={(e) => setNewUser({ ...newUser, specialization: e.target.value })}
                placeholder="e.g. Cardiology, Pediatrics, General Medicine"
                required
              />
              <Input
                label="Department"
                value={newUser.department}
                onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                placeholder="e.g. Cardiovascular Sciences"
                required
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isCreating}>
              Provision Account
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        isOpen={isResetOpen}
        onClose={() => setIsResetOpen(false)}
        title={targetUser ? `Reset Password: ${targetUser.name}` : 'Reset Password'}
        subtitle="Set a new secure access key for this staff account"
      >
        <form onSubmit={handleResetPassword} className="space-y-4 text-sm">
          <Input
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="At least 6 characters"
            required
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsResetOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isResetting}>
              Save New Password
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Users;
