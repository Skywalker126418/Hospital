import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
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

  const { login } = useAuth();
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

  return (
    <div className="min-h-screen bg-[#0a192f] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background ambient lighting for Dark-Navy (60%) + Dark-Green (30%) */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#064e3b]/25 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#0f2441]/50 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-5xl w-full bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[600px] relative z-10 transition-all duration-300">
        {/* Left Form Column (White 10% workspace with rich navy/green accents) */}
        <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-between">
          <div>
            {/* Header Brand */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0a192f] via-[#064e3b] to-[#10b981] flex items-center justify-center text-white shadow-lg shadow-emerald-950/20 font-black text-xl transition-transform hover:scale-105">
                M
              </div>
              <div>
                <h1 className="text-lg font-black text-[#0a192f] tracking-wide leading-tight">METROPOLITAN</h1>
                <p className="text-xs text-[#064e3b] font-bold uppercase tracking-wider">Health Management System</p>
              </div>
            </div>

            <h2 className="text-2xl font-black text-[#0a192f]">Hospital Portal Sign In</h2>
            <p className="text-sm text-slate-500 mt-1 mb-6">
              Access clinical, administrative, or receptionist workstations.
            </p>

            {wasSessionExpired && (
              <div className="p-3 mb-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2 animate-slide-down">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600" />
                <span>Your previous session expired. Please sign in again.</span>
              </div>
            )}

            {formError && (
              <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2 animate-slide-down">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
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
                placeholder="e.g. staff@hospital.com"
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
                    className="text-slate-400 hover:text-slate-600 focus:outline-none transition-colors cursor-pointer"
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
                    className="w-4 h-4 rounded border-slate-300 text-[#064e3b] focus:ring-[#064e3b]"
                  />
                  <span>Remember my workstation</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="font-semibold text-[#064e3b] hover:text-[#047857] hover:underline transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full mt-3 font-bold"
              >
                Sign In to Workstation
              </Button>
            </form>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Administrator account setup?</span>
            <Link
              to="/register"
              className="font-bold text-[#064e3b] hover:text-[#047857] hover:underline flex items-center gap-1 transition-colors group"
            >
              <span>Admin Access Portal</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Right Visual Column (Dark-Blue 60% + Dark-Green 30%) */}
        <div className="hidden lg:flex lg:col-span-6 bg-gradient-to-br from-[#0a192f] via-[#0f2441] to-[#064e3b] p-8 flex-col justify-between text-white relative">
          <div className="z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10b981]/20 text-[#a7f3d0] border border-[#10b981]/40 text-xs font-semibold backdrop-blur-md">
              Medical Visualization Core
            </span>
            <h3 className="text-xl font-black text-white mt-3">Cardiovascular Real-Time Monitor</h3>
            <p className="text-xs text-slate-300 mt-1 max-w-sm leading-relaxed">
              Biomorphic rendering and real-time clinical telemetry parameters.
            </p>
          </div>

          {/* Interactive Cardiac Ventricle */}
          <div className="w-full h-80 my-4 z-10 transition-transform duration-500 hover:scale-[1.02]">
            <MedicalObjectViewer
              title="Cardiac Simulation"
              badge="72 BPM Active"
              height="h-full"
            >
              <HeartModel wireframe={false} isPulsing={true} bpm={72} />
            </MedicalObjectViewer>
          </div>

          <div className="z-10 pt-4 border-t border-white/10 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[#a7f3d0]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#34d399]" />
              Secured with JWT & bcrypt
            </span>
            <span>Clinical Workspace</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
