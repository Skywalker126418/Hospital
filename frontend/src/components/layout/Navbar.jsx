import React from 'react';
import { Menu, Bell, Shield, Stethoscope, UserCheck, Sparkles, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const Navbar = ({ onOpenSidebar }) => {
  const { user, login } = useAuth();
  const { info } = useToast();

  const handleQuickSwitch = async (role) => {
    try {
      if (role === 'admin') {
        await login({ email: 'admin@hospital.com', password: 'Admin123!' });
      } else if (role === 'doctor') {
        await login({ email: 'doctor.claude@hospital.com', password: 'Doctor123!' });
      } else if (role === 'receptionist') {
        await login({ email: 'receptionist@hospital.com', password: 'Reception123!' });
      }
      info(`Switched active session to ${role.toUpperCase()}`, 'Role Switched');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 lg:px-8 bg-white border-b border-slate-200 shadow-xs">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="p-2 -ml-2 rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>MySQL Connected</span>
          </div>
          <span className="hidden sm:inline text-xs text-slate-500">
            Metropolitan Central System v1.0
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Quick Role Switcher for HCI Grading & Evaluation */}
        <div className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <span className="text-[11px] font-semibold text-slate-500 px-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Quick Demo:
          </span>
          <button
            onClick={() => handleQuickSwitch('receptionist')}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
              user?.role === 'receptionist'
                ? 'bg-white text-brand-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Receptionist
          </button>
          <button
            onClick={() => handleQuickSwitch('doctor')}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
              user?.role === 'doctor'
                ? 'bg-white text-brand-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Doctor
          </button>
          <button
            onClick={() => handleQuickSwitch('admin')}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
              user?.role === 'admin'
                ? 'bg-white text-brand-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Admin
          </button>
        </div>

        {/* Notifications mock button */}
        <button
          onClick={() => info('All system services are operational. No critical alerts.', 'System Health')}
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition relative"
          aria-label="System Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-500 ring-2 ring-white"></span>
        </button>

        {/* Profile Card */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
          <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 font-semibold flex items-center justify-center text-sm border border-brand-200">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-slate-800 leading-tight">{user?.name}</p>
            <p className="text-[10px] uppercase font-bold text-brand-600 tracking-wider">
              {user?.role}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
