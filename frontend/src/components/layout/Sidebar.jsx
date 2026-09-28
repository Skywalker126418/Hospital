import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  UserPlus,
  Users,
  Calendar,
  CalendarPlus,
  Stethoscope,
  FileText,
  FlaskConical,
  Receipt,
  BarChart3,
  Settings,
  LogOut,
  Layers,
  Compass,
  ChevronRight,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Receptionist Links
  const receptionistLinks = [
    { to: '/receptionist/dashboard', label: 'Reception Dashboard', icon: LayoutDashboard },
    { to: '/receptionist/patients/register', label: 'Register Patient', icon: UserPlus },
    { to: '/receptionist/patients', label: 'Patient Directory', icon: Users },
    { to: '/receptionist/appointments/book', label: 'Book Appointment', icon: CalendarPlus },
    { to: '/receptionist/appointments', label: 'All Appointments', icon: Calendar },
  ];

  // Doctor Links
  const doctorLinks = [
    { to: '/doctor/dashboard', label: 'Doctor Dashboard', icon: LayoutDashboard },
    { to: '/doctor/patients', label: 'Patient Records', icon: Users },
    { to: '/doctor/consultation', label: 'Consultations', icon: Stethoscope },
    { to: '/doctor/prescriptions', label: 'Prescriptions', icon: FileText },
    { to: '/doctor/lab-results', label: 'Lab Results', icon: FlaskConical },
  ];

  // Admin Links
  const adminLinks = [
    { to: '/admin/dashboard', label: 'Admin Overview', icon: LayoutDashboard },
    { to: '/admin/users', label: 'User Management', icon: ShieldCheck },
    { to: '/admin/billing', label: 'Billing & Invoices', icon: Receipt },
    { to: '/admin/reports', label: 'Reports & Analytics', icon: BarChart3 },
    { to: '/admin/settings', label: 'Hospital Settings', icon: Settings },
  ];

  // HCI Academic & Prototype links
  const academicLinks = [
    { to: '/prototype', label: 'Low-Fi Prototype', icon: Layers },
    { to: '/evaluation', label: 'HCI Usability Audit', icon: Compass },
  ];

  const role = user?.role;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out border-r border-slate-800 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800 bg-slate-950/40">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-md font-bold text-lg">
            M
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide">METROPOLITAN</h1>
            <p className="text-[11px] text-brand-400 font-medium tracking-wider uppercase">Health System</p>
          </div>
        </div>

        {/* User Card */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 flex items-center justify-center font-semibold text-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name || 'Authorized User'}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                  {role || 'Staff'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {/* Main Role Section */}
          <div>
            <div className="px-2 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {role === 'admin' ? 'Administration' : role === 'doctor' ? 'Clinical Portal' : 'Reception Desk'}
            </div>
            <div className="space-y-1">
              {(role === 'admin'
                ? adminLinks
                : role === 'doctor'
                ? doctorLinks
                : receptionistLinks
              ).map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-brand-600 text-white shadow-md'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <link.icon className="w-4 h-4 flex-shrink-0" />
                    <span>{link.label}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                </NavLink>
              ))}
            </div>
          </div>

          {/* Quick Cross-Role Access (Demonstration & HCI Inspection) */}
          <div>
            <div className="px-2 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Cross-Role Portals
            </div>
            <div className="space-y-1 text-xs">
              {role !== 'receptionist' && (
                <NavLink
                  to="/receptionist/dashboard"
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Reception View</span>
                </NavLink>
              )}
              {role !== 'doctor' && (
                <NavLink
                  to="/doctor/dashboard"
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <Stethoscope className="w-4 h-4" />
                  <span>Doctor View</span>
                </NavLink>
              )}
              {role !== 'admin' && (
                <NavLink
                  to="/admin/dashboard"
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Admin View</span>
                </NavLink>
              )}
            </div>
          </div>

          {/* HCI & Academic Modules */}
          <div>
            <div className="px-2 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              HCI Project Modules
            </div>
            <div className="space-y-1">
              {academicLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-slate-800 text-brand-300 border border-brand-500/30'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <link.icon className="w-4 h-4 flex-shrink-0 text-brand-400" />
                    <span>{link.label}</span>
                  </div>
                  <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 border border-slate-700">HCI</span>
                </NavLink>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Logout */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-rose-300 hover:bg-rose-500/10 hover:text-rose-200 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
