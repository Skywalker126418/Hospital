import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  KeyRound,
  ShieldAlert,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const RegisterPage = () => {
  // Gate authentication state
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [authMode, setAuthMode] = useState('pin'); // 'pin' or 'password'
  const [gateInput, setGateInput] = useState('');
  const [gateError, setGateError] = useState('');
  const [showGateSecret, setShowGateSecret] = useState(false);

  // Administrator Account registration form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'admin', // Fixed to admin only as required
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  // Validate Admin Security PIN or Master Password
  const handleUnlockGate = (e) => {
    e.preventDefault();
    setGateError('');

    const trimmed = gateInput.trim();

    if (authMode === 'pin') {
      // PIN: 1 to 8 (i.e. '12345678')
      if (trimmed === '12345678') {
        setIsUnlocked(true);
        success('Admin security clearance verified via PIN.');
      } else {
        setGateError('Invalid Admin PIN code. Please enter the authorized 8-digit PIN.');
      }
    } else {
      // Password: 'admin12'
      if (trimmed === 'admin12') {
        setIsUnlocked(true);
        success('Admin master authorization password accepted.');
      } else {
        setGateError('Invalid Administrator Password. Authorization denied.');
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required.';
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please provide a valid email format.';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const res = await register({
        ...formData,
        role: 'admin',
      });
      success('System Administrator account provisioned successfully!');
      navigate('/admin/dashboard');
    } catch (err) {
      toastError(err.message || 'Registration failed.');
      if (err.errors) {
        const backendErrors = {};
        err.errors.forEach((e) => {
          backendErrors[e.field] = e.message;
        });
        setErrors(backendErrors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a192f] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background radial gradient glow for Dark-Navy (60%) + Dark-Green (30%) ambient depth */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#064e3b]/30 rounded-full blur-3xl pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#0f2441]/60 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-slate-200/90 p-8 sm:p-10 relative z-10 animate-fade-in-up">
        {/* Step 1: Security PIN / Password Clearance Gate */}
        {!isUnlocked ? (
          <div>
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-[#0a192f] text-[#34d399] flex items-center justify-center font-bold text-2xl mx-auto mb-4 shadow-lg shadow-slate-900/40 border border-[#064e3b]">
                <ShieldAlert className="w-7 h-7 text-[#34d399] animate-bounce" />
              </div>
              <h2 className="text-2xl font-black text-[#0a192f]">Admin Verification Required</h2>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Direct registration is restricted to <strong>System Administrators</strong> only.
                Doctors and Receptionists must be provisioned inside the Admin Portal.
              </p>
            </div>

            {/* Mode Selector Tabs: PIN vs Password */}
            <div className="flex p-1 bg-slate-100 rounded-2xl mb-5 border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('pin');
                  setGateInput('');
                  setGateError('');
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer ${
                  authMode === 'pin'
                    ? 'bg-[#064e3b] text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Security PIN Code
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('password');
                  setGateInput('');
                  setGateError('');
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer ${
                  authMode === 'password'
                    ? 'bg-[#064e3b] text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Master Password
              </button>
            </div>

            {gateError && (
              <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2 animate-slide-down">
                <ShieldAlert className="w-4 h-4 flex-shrink-0 text-rose-600" />
                <span>{gateError}</span>
              </div>
            )}

            <form onSubmit={handleUnlockGate} className="space-y-4">
              <Input
                label={authMode === 'pin' ? 'Admin 8-Digit Security PIN' : 'Admin Master Password'}
                type={showGateSecret ? 'text' : 'password'}
                value={gateInput}
                onChange={(e) => setGateInput(e.target.value)}
                placeholder={authMode === 'pin' ? 'Enter 8-digit security PIN' : 'Enter administrator master password'}
                icon={authMode === 'pin' ? KeyRound : Lock}
                required
                autoFocus
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowGateSecret(!showGateSecret)}
                    className="text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showGateSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-2 font-bold"
              >
                Verify & Unlock Form
              </Button>
            </form>

            <div className="mt-6 text-center text-xs text-slate-500">
              Already have staff credentials?{' '}
              <Link to="/login" className="font-bold text-[#064e3b] hover:text-[#047857] hover:underline">
                Sign In to Workstation
              </Link>
            </div>
          </div>
        ) : (
          /* Step 2: Unlocked Administrator Creation Form */
          <div>
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0a192f] to-[#064e3b] text-white flex items-center justify-center font-bold text-xl mx-auto mb-3 shadow-md">
                <ShieldCheck className="w-6 h-6 text-[#34d399]" />
              </div>
              <h2 className="text-2xl font-black text-[#0a192f]">System Administrator Registration</h2>
              <div className="inline-flex items-center gap-1 px-3 py-1 mt-1 rounded-full bg-[#ecfdf5] border border-[#a7f3d0] text-[#065f46] text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
                <span>Security Clearance Granted (ADMIN)</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Administrator Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Dr. Arthur Vance"
                icon={User}
                error={errors.name}
                required
              />

              <Input
                label="Official Admin Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. admin@hospital.com"
                icon={Mail}
                error={errors.email}
                required
              />

              {/* Locked to Administrator */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Assigned Authority Role
                </label>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-extrabold text-[#0a192f] flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#064e3b]" />
                    System Administrator (Full Oversight)
                  </span>
                  <span className="text-[10px] bg-[#064e3b] text-white px-2 py-0.5 rounded font-bold uppercase">
                    Root Role
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Doctors & Receptionists must be created through this Admin profile once logged in.
                </p>
              </div>

              <Input
                label="Master Account Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                icon={Lock}
                error={errors.password}
                required
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />

              <Input
                label="Confirm Master Password"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
                icon={Lock}
                error={errors.confirmPassword}
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full mt-4 font-bold"
              >
                Create Administrator Profile
              </Button>
            </form>

            <div className="mt-6 text-center text-xs text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-[#064e3b] hover:text-[#047857] hover:underline">
                Sign In here
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;
