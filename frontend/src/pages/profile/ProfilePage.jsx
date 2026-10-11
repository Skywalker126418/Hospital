import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { authService } from '../../services/authService';
import { userService } from '../../services/userService';
import {
  User,
  KeyRound,
  Camera,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Shield,
  Stethoscope,
  Mail,
  Phone,
  Save,
  Loader2,
  Maximize2,
  X,
  Sun,
  Moon,
  Sparkles
} from 'lucide-react';

const ProfilePage = () => {
  const { user, updateCurrentUser } = useAuth();
  const { theme, isDark, setTheme } = useTheme();
  const fileInputRef = useRef(null);
  const [showFullImage, setShowFullImage] = useState(false);

  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [pwdError, setPwdError] = useState('');

  // Image upload state
  const [imgLoading, setImgLoading] = useState(false);
  const [imgSuccess, setImgSuccess] = useState('');
  const [imgError, setImgError] = useState('');

  const backendUrl = 'http://localhost:5000';
  const getAvatarUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${backendUrl}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwdSuccess('');
    setPwdError('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPwdError('New password and confirmation do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPwdError('New password must be at least 6 characters long');
      return;
    }

    setPwdLoading(true);
    try {
      const res = await authService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      if (res.success) {
        setPwdSuccess('Password changed successfully! Keep your new password safe.');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setPwdError(res.message || 'Failed to update password');
      }
    } catch (err) {
      setPwdError(err.response?.data?.message || err.message || 'Error updating password');
    } finally {
      setPwdLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setImgError('Please select a valid image file (JPG, PNG, WEBP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setImgError('Image size must be less than 5MB');
      return;
    }

    setImgLoading(true);
    setImgSuccess('');
    setImgError('');

    const formData = new FormData();
    formData.append('profile_image', file);

    try {
      const res = await userService.uploadProfileImage(formData);
      const newImg = res.data?.profile_image || res.imageUrl || res.profile_image;
      if (res.success && newImg) {
        const updatedUser = {
          ...user,
          profile_image: newImg
        };
        updateCurrentUser(updatedUser);
        setImgSuccess('Profile image updated successfully. Previous image deleted from disk.');
      } else {
        setImgError(res.message || 'Failed to upload image');
      }
    } catch (err) {
      setImgError(err.response?.data?.message || err.message || 'Error uploading profile image');
    } finally {
      setImgLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteImage = async () => {
    if (!user?.profile_image) return;
    if (!window.confirm('Are you sure you want to remove your profile picture?')) return;

    setImgLoading(true);
    setImgSuccess('');
    setImgError('');

    try {
      const res = await userService.deleteProfileImage();
      if (res.success) {
        const updatedUser = {
          ...user,
          profile_image: null
        };
        updateCurrentUser(updatedUser);
        setImgSuccess('Profile image deleted and removed from storage.');
      } else {
        setImgError(res.message || 'Failed to delete image');
      }
    } catch (err) {
      setImgError(err.response?.data?.message || err.message || 'Error deleting profile image');
    } finally {
      setImgLoading(false);
    }
  };

  const userName = user?.name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Staff User';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Full-Screen Image Viewer Modal */}
      {showFullImage && user?.profile_image && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowFullImage(false)}
        >
          <div
            className="relative max-w-3xl max-h-[90vh] bg-white dark:bg-[#0a192f] border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-2xl p-4 flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowFullImage(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-slate-900/80 hover:bg-rose-900 text-white rounded-full border border-slate-700 transition"
              title="Close image view"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={getAvatarUrl(user.profile_image)}
              alt={userName}
              className="max-h-[75vh] w-auto max-w-full rounded-xl object-contain shadow-lg"
            />
            <div className="mt-4 text-center">
              <h4 className="text-slate-900 dark:text-white font-bold text-base">{userName}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user?.role} Profile Picture</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Staff Account Profile</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Manage your personal identity, avatar image, appearance theme, and security credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Profile Card & Avatar */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white dark:bg-[#0a192f] border border-slate-200 dark:border-slate-700/60 rounded-xl p-6 shadow-md dark:shadow-xl text-center flex flex-col items-center transition-colors">
            {/* Avatar Circle */}
            <div className="relative mb-4 group">
              <div
                onClick={() => user?.profile_image && setShowFullImage(true)}
                className={`w-28 h-28 rounded-full border-4 border-emerald-500/40 overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-lg transition-transform ${
                  user?.profile_image ? 'cursor-pointer hover:scale-105 hover:ring-4 hover:ring-emerald-400/30' : ''
                }`}
                title={user?.profile_image ? 'Click to view full picture' : 'Staff Avatar'}
              >
                {user?.profile_image ? (
                  <img
                    src={getAvatarUrl(user.profile_image)}
                    alt={userName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#064e3b] to-[#0a192f] flex items-center justify-center text-white font-bold text-3xl">
                    {(user?.name || user?.first_name || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Upload Overlay Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={imgLoading}
                className="absolute bottom-0 right-0 p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-lg border-2 border-white dark:border-[#0a192f] transition-transform hover:scale-110 disabled:opacity-50"
                title="Upload new picture"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {/* Name & Role */}
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {userName}
            </h2>
            <div className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
              {user?.role}
            </div>

            {user?.specialization && (
              <div className="mt-2 text-xs text-emerald-700 dark:text-emerald-300/80 flex items-center gap-1 font-medium">
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Specialization: {user.specialization}</span>
              </div>
            )}

            {/* Avatar action messages */}
            {imgSuccess && (
              <div className="mt-4 p-2 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-500/40 rounded-lg text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-1.5 text-left">
                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{imgSuccess}</span>
              </div>
            )}
            {imgError && (
              <div className="mt-4 p-2 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-500/40 rounded-lg text-rose-800 dark:text-rose-300 text-xs flex items-center gap-1.5 text-left">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{imgError}</span>
              </div>
            )}

            {/* Actions for Photo */}
            <div className="mt-5 w-full flex flex-col gap-2">
              {user?.profile_image && (
                <button
                  type="button"
                  onClick={() => setShowFullImage(true)}
                  className="w-full py-1.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  View Full Picture
                </button>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={imgLoading}
                className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {imgLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                Change Picture
              </button>
              {user?.profile_image && (
                <button
                  type="button"
                  onClick={handleDeleteImage}
                  disabled={imgLoading}
                  className="w-full py-1.5 px-3 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove Picture
                </button>
              )}
            </div>
          </div>

          {/* Theme Preference Settings Card (Independent per user) */}
          <div className="bg-white dark:bg-[#0a192f] border border-slate-200 dark:border-slate-700/60 rounded-xl p-5 shadow-md dark:shadow-xl space-y-3 transition-colors">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                Theme Preference
              </h3>
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 capitalize">
                {theme} Mode
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Each staff member can independently choose their preferred interface style. Your selection is preserved automatically on this device.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all border ${
                  !isDark
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Sun className="w-4 h-4 text-amber-400" />
                Light
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all border ${
                  isDark
                    ? 'bg-[#064e3b] text-white border-emerald-600 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Moon className="w-4 h-4 text-slate-300" />
                Dark
              </button>
            </div>
          </div>

          {/* Quick Info Box */}
          <div className="bg-white dark:bg-[#0a192f] border border-slate-200 dark:border-slate-700/60 rounded-xl p-5 shadow-md dark:shadow-xl space-y-3 transition-colors">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Account Credentials</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <span className="truncate">{user?.email || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <span>{user?.phone || 'No phone set'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <span>Status: <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Active & Verified</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Update Password Form */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#0a192f] border border-slate-200 dark:border-slate-700/60 rounded-xl p-6 shadow-md dark:shadow-xl transition-colors">
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-500/30 rounded-lg text-emerald-700 dark:text-emerald-400">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Change Account Password</h2>
                <p className="text-slate-500 dark:text-slate-400 text-xs">
                  Update the password provided by the Administrator to your personal secure password.
                </p>
              </div>
            </div>

            {pwdSuccess && (
              <div className="mb-6 p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/50 rounded-lg text-emerald-800 dark:text-emerald-300 text-sm flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>{pwdSuccess}</span>
              </div>
            )}

            {pwdError && (
              <div className="mb-6 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/50 rounded-lg text-rose-800 dark:text-rose-300 text-sm flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600 dark:text-rose-400" />
                <span>{pwdError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Current / Temporary Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  placeholder="Enter current password given by Admin"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  New Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="At least 6 characters"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Confirm New Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder="Re-enter your new password"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={pwdLoading}
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#064e3b] hover:bg-[#047857] border border-emerald-500/50 text-white font-semibold text-sm rounded-lg shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {pwdLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Updating Password...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save New Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
