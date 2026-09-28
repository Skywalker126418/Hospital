import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, Shield, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import MedicalObjectViewer from '../../components/3d/MedicalObjectViewer';
import HeartModel from '../../components/3d/HeartModel';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const { login, googleLogin } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const wasSessionExpired = queryParams.get('expired') === 'true';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!email || !password) {
      setFormError('Please fill in both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await login({ email, password });
      success(`Welcome back, ${res.user.name}!`);

      if (res.user.role === 'admin') navigate('/admin/dashboard');
      else if (res.user.role === 'doctor') navigate('/doctor/dashboard');
      else navigate('/receptionist/dashboard');
    } catch (err) {
      setFormError(err.message || 'Login failed. Please verify your credentials.');
      toastError(err.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (roleEmail, rolePass) => {
    setEmail(roleEmail);
    setPassword(rolePass);
  };

  const handleGoogleMock = async () => {
    setIsLoading(true);
    try {
      const res = await googleLogin({
        email: 'staff.google@metropolitan-hospital.org',
        name: 'Dr. Google User (SSO)',
        googleId: 'g_auth_mock_12345',
      });
      success(`Signed in via Google SSO as ${res.user.name}`);
      navigate('/receptionist/dashboard');
    } catch (err) {
      toastError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl w-full bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        {/* Left Form Column */}
        <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-between">
          <div>
            {/* Header Brand */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-md font-bold text-xl">
                M
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 leading-tight">METROPOLITAN</h1>
                <p className="text-xs text-brand-600 font-semibold uppercase tracking-wider">Health Management System</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-900">Hospital Portal Sign In</h2>
            <p className="text-sm text-slate-500 mt-1 mb-6">
              Access the clinical, administrative, or receptionist workstations.
            </p>

            {wasSessionExpired && (
              <div className="p-3 mb-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>Your previous session expired. Please sign in again.</span>
              </div>
            )}

            {formError && (
              <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Staff Email Address"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. doctor.claude@hospital.com"
                icon={Mail}
                required
              />

              <Input
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter account password"
                icon={Lock}
                required
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-600 focus:outline-none"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span>Remember my workstation</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="font-medium text-brand-600 hover:text-brand-700 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full mt-2"
              >
                Sign In to Workstation
              </Button>
            </form>

            {/* Google OAuth & Alternate Options */}
            <div className="mt-5">
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-4 text-xs font-medium text-slate-400 uppercase">Or continue with</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <button
                type="button"
                onClick={handleGoogleMock}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-slate-300 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm transition shadow-2xs"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>

            {/* Quick Demo Fill Buttons (HCI Evaluation Shortcut) */}
            <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>HCI One-Click Demo Credentials:</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin@hospital.com', 'Admin123!')}
                  className="px-2 py-1.5 bg-white border border-slate-200 hover:border-brand-500 rounded-lg text-slate-700 font-medium text-center hover:bg-brand-50 transition"
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('doctor.claude@hospital.com', 'Doctor123!')}
                  className="px-2 py-1.5 bg-white border border-slate-200 hover:border-brand-500 rounded-lg text-slate-700 font-medium text-center hover:bg-brand-50 transition"
                >
                  Doctor
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('receptionist@hospital.com', 'Reception123!')}
                  className="px-2 py-1.5 bg-white border border-slate-200 hover:border-brand-500 rounded-lg text-slate-700 font-medium text-center hover:bg-brand-50 transition"
                >
                  Receptionist
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>New hospital staff?</span>
            <Link to="/register" className="font-semibold text-brand-600 hover:underline flex items-center gap-1">
              Create an account <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Right 3D Visual Column */}
        <div className="hidden lg:flex lg:col-span-6 bg-gradient-to-br from-slate-900 via-slate-950 to-brand-950 p-8 flex-col justify-between text-white relative">
          <div className="z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse"></span>
              3D Medical Visualization Core
            </span>
            <h3 className="text-xl font-bold text-white mt-3">Cardiovascular Real-Time Monitor</h3>
            <p className="text-xs text-slate-300 mt-1 max-w-sm">
              Demonstrating 3D/4D biomorphic rendering and HCI visibility of clinical parameters.
            </p>
          </div>

          {/* Interactive 3D Cardiac Ventricle */}
          <div className="w-full h-80 my-4 z-10">
            <MedicalObjectViewer
              title="4D Cardiac Simulation"
              badge="72 BPM Active"
              height="h-full"
            >
              <HeartModel wireframe={false} isPulsing={true} bpm={72} />
            </MedicalObjectViewer>
          </div>

          <div className="z-10 pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Secured with JWT & bcrypt</span>
            <span>Three.js + R3F Powered</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
