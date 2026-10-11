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
  Shield,
  Copy,
  Check,
  Edit2,
  Trash2
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
    specialization: 'General Medicine',
    department: 'Outpatient Care',
    phone: '',
  });
  const [isCreating, setIsCreating] = useState(false);
  const [createdStaffCreds, setCreatedStaffCreds] = useState(null);
  const [copied, setCopied] = useState(false);

  // Edit User Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete User Modal State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
      success(`Staff member ${newUser.name} created successfully.`);
      setCreatedStaffCreds({
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        role: newUser.role,
      });
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
      success(`Password updated for ${targetUser.name}. Inform staff of new password.`);
      setIsResetOpen(false);
      setNewPassword('');
    } catch (err) {
      toastError(err.message || 'Failed to reset password.');
    } finally {
      setIsResetting(false);
    }
  };

  const handleOpenEdit = (user) => {
    setEditingUser({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      specialization: user.specialization || '',
      department: user.department || '',
      phone: user.phone || '',
    });
    setIsEditOpen(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsUpdating(true);
    try {
      await userService.updateUser(editingUser.id, editingUser);
      success(`Staff account for ${editingUser.name} updated successfully.`);
      setIsEditOpen(false);
      setEditingUser(null);
      loadUsers();
    } catch (err) {
      toastError(err.message || 'Failed to update user.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOpenDelete = (user) => {
    setUserToDelete(user);
    setIsDeleteOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      await userService.deleteUser(userToDelete.id);
      success(`Account for ${userToDelete.name} deleted permanently.`);
      setIsDeleteOpen(false);
      setUserToDelete(null);
      loadUsers();
    } catch (err) {
      toastError(err.message || 'Failed to delete user.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!createdStaffCreds) return;
    const credText = `Hospital Portal Staff Credentials\nName: ${createdStaffCreds.name}\nRole: ${createdStaffCreds.role.toUpperCase()}\nEmail: ${createdStaffCreds.email}\nPassword: ${createdStaffCreds.password}\nLogin URL: ${window.location.origin}/login`;
    navigator.clipboard.writeText(credText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title="Hospital Staff & Account Administration"
        subtitle="Provision staff accounts (Doctors & Receptionists), assign role permissions, and issue portal passwords."
        actions={
          <Button variant="primary" icon={UserPlus} onClick={() => setIsCreateOpen(true)} className="font-bold">
            Create Staff Account
          </Button>
        }
      />

      {/* Staff Provisioning Notice Card (Admin is the only one who creates accounts) */}
      <div className="p-5 rounded-2xl bg-[#0a192f] text-white border border-[#1b3353] shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#064e3b] text-[#34d399] flex items-center justify-center flex-shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-white">Centralized Administrator Account Provisioning</h4>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Public self-registration for non-admins is disabled. As System Administrator, create accounts for Doctors and Receptionists here and distribute their assigned login email and password directly to them.
            </p>
          </div>
        </div>
        <Button
          variant="success"
          size="sm"
          icon={UserPlus}
          onClick={() => setIsCreateOpen(true)}
          className="whitespace-nowrap font-bold"
        >
          Add Staff Member
        </Button>
      </div>

      {/* Success banner when a staff account has just been created with credential copy button */}
      {createdStaffCreds && (
        <div className="p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-300 shadow-md animate-fade-in space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h4 className="text-sm font-bold text-emerald-950">
                Staff Credentials Issued — Ready to Distribute
              </h4>
            </div>
            <button
              onClick={() => setCreatedStaffCreds(null)}
              className="text-xs text-emerald-700 hover:text-emerald-900 font-bold cursor-pointer"
            >
              Dismiss
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white p-3.5 rounded-xl border border-emerald-200 text-xs">
            <div>
              <span className="text-slate-500 block">Staff Name</span>
              <span className="font-bold text-slate-900">{createdStaffCreds.name}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Portal Role</span>
              <span className="font-bold text-[#064e3b] uppercase">{createdStaffCreds.role}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Login Email</span>
              <span className="font-mono font-bold text-slate-900">{createdStaffCreds.email}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Temporary Password</span>
              <span className="font-mono font-bold text-[#064e3b] bg-emerald-50 px-2 py-0.5 rounded">
                {createdStaffCreds.password}
              </span>
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              size="sm"
              variant="outline"
              icon={copied ? Check : Copy}
              onClick={handleCopyCredentials}
              className="text-xs font-bold"
            >
              {copied ? 'Credentials Copied!' : 'Copy Staff Credentials to Clipboard'}
            </Button>
          </div>
        </div>
      )}

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
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#064e3b] transition-colors"
            />
          </div>
          <Button type="submit" size="sm" variant="secondary" className="font-bold">
            Search
          </Button>
        </form>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold cursor-pointer"
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
            actionLabel="Create Staff User"
            onAction={() => setIsCreateOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-[#0a192f] text-white text-xs uppercase font-semibold border-b border-slate-200">
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
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold text-[#0a192f]">{u.name}</div>
                      <div className="text-xs text-slate-400 font-mono">{u.email}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                        u.role === 'admin'
                          ? 'bg-[#0a192f]/10 text-[#0a192f] border border-[#0a192f]/20'
                          : u.role === 'doctor'
                          ? 'bg-[#ecfdf5] text-[#064e3b] border border-[#a7f3d0]'
                          : 'bg-blue-50 text-blue-800 border border-blue-200'
                      }`}>
                        {u.role === 'admin' && <Shield className="w-3 h-3 text-[#0a192f]" />}
                        {u.role === 'doctor' && <Stethoscope className="w-3 h-3 text-[#064e3b]" />}
                        {u.role === 'receptionist' && <UserCheck className="w-3 h-3 text-blue-700" />}
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-700">
                      {u.specialization ? (
                        <div>
                          <p className="font-semibold text-slate-800">{u.specialization}</p>
                          <p className="text-slate-400">{u.department}</p>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Hospital Operations</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
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
                          icon={Edit2}
                          onClick={() => handleOpenEdit(u)}
                          title="Edit staff details"
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          icon={Key}
                          onClick={() => {
                            setTargetUser(u);
                            setIsResetOpen(true);
                          }}
                          title="Reset temporary password"
                        >
                          Pass
                        </Button>
                        <Button
                          size="sm"
                          variant={u.status === 'active' ? 'ghost' : 'success'}
                          icon={Power}
                          onClick={() => handleToggleStatus(u)}
                          title={u.status === 'active' ? 'Block / Deactivate Account' : 'Activate Account'}
                        >
                          {u.status === 'active' ? 'Block' : 'Activate'}
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          icon={Trash2}
                          onClick={() => handleOpenDelete(u)}
                          title="Delete staff account permanently"
                        >
                          Delete
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

      {/* Provision Staff Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Provision Hospital Staff Account"
        subtitle="Create credentials and grant workstation permissions"
      >
        <form onSubmit={handleCreateUser} className="space-y-4 text-sm">
          <Input
            label="Staff Full Name"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            placeholder="e.g. Dr. Jennifer Adams or Sarah Jenkins"
            required
          />

          <Input
            label="Staff Login Email Address"
            type="email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            placeholder="e.g. j.adams@hospital.com"
            required
          />

          <Input
            label="Initial Assigned Password"
            type="text"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            placeholder="Set password for this staff member (at least 6 chars)"
            helperText="Give this password to the staff member so they can log in to their portal."
            required
          />

          <Select
            label="Designated Workstation Role"
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
              <span className="text-xs font-bold uppercase tracking-wider text-[#064e3b] block">
                Doctor Professional Specialization & Dept
              </span>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Medical Specialization (for Triage Matching)
                </label>
                <select
                  value={newUser.specialization}
                  onChange={(e) => setNewUser({ ...newUser, specialization: e.target.value })}
                  className="w-full text-xs py-2 px-3 bg-white border border-slate-300 rounded-lg text-slate-800"
                  required
                >
                  <option value="General Medicine">General Medicine / Internal (Fever, Flu, Infections)</option>
                  <option value="Cardiology">Cardiology (Heart, Blood Pressure, Chest)</option>
                  <option value="Pediatrics">Pediatrics (Child & Infant Health)</option>
                  <option value="Orthopedics">Orthopedics (Bones, Joints, Fractures)</option>
                  <option value="Dermatology">Dermatology (Skin Rash, Allergies, Eczema)</option>
                  <option value="Neurology">Neurology (Brain, Nerves, Headaches)</option>
                  <option value="ENT">ENT (Ear, Nose & Throat)</option>
                  <option value="Gynecology">Gynecology & Obstetrics (Women's Health)</option>
                  <option value="General Surgery">General Surgery (Surgical Evaluation)</option>
                  <option value="Ophthalmology">Ophthalmology (Eye Care & Vision)</option>
                </select>
              </div>

              <Input
                label="Department"
                value={newUser.department}
                onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                placeholder="e.g. Cardiovascular Sciences or Outpatient Clinic"
                required
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isCreating} className="font-bold">
              Provision & Assign Password
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Staff Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={editingUser ? `Edit Staff: ${editingUser.name}` : 'Edit Staff Account'}
        subtitle="Update profile details and medical department information"
      >
        {editingUser && (
          <form onSubmit={handleUpdateUser} className="space-y-4 text-sm">
            <Input
              label="Staff Full Name"
              value={editingUser.name}
              onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
              required
            />

            <Input
              label="Email Address"
              type="email"
              value={editingUser.email}
              onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
              required
            />

            <Input
              label="Phone Number"
              value={editingUser.phone}
              onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
              placeholder="e.g. +1 555-0199"
            />

            {editingUser.role === 'doctor' && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#064e3b] block">
                  Physician Specialization & Triage Matching
                </span>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Specialization
                  </label>
                  <select
                    value={editingUser.specialization}
                    onChange={(e) => setEditingUser({ ...editingUser, specialization: e.target.value })}
                    className="w-full text-xs py-2 px-3 bg-white border border-slate-300 rounded-lg text-slate-800"
                  >
                    <option value="General Medicine">General Medicine / Internal</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="ENT">ENT</option>
                    <option value="Gynecology">Gynecology</option>
                    <option value="General Surgery">General Surgery</option>
                    <option value="Ophthalmology">Ophthalmology</option>
                  </select>
                </div>

                <Input
                  label="Department"
                  value={editingUser.department}
                  onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <Button variant="outline" type="button" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" isLoading={isUpdating} className="font-bold">
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete User Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Confirm Permanent Deletion"
        subtitle="This action will permanently delete the staff account"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to permanently delete the account of{' '}
            <strong className="text-slate-900">{userToDelete?.name}</strong> (
            <span className="font-mono text-xs text-rose-600">{userToDelete?.email}</span>)?
          </p>
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 space-y-1">
            <p className="font-bold">Important Notice:</p>
            <p>• All profile pictures stored on the filesystem will be deleted from disk storage.</p>
            <p>• The user will immediately lose access to the portal.</p>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              type="button"
              isLoading={isDeleting}
              onClick={handleDeleteUser}
              className="font-bold"
            >
              Permanently Delete Account
            </Button>
          </div>
        </div>
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
            label="New Assigned Password"
            type="text"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="At least 6 characters"
            helperText="Provide this new password to the staff member."
            required
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsResetOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isResetting} className="font-bold">
              Save & Update Password
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Users;
