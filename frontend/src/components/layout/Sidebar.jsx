import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { messageService } from '../../services/messageService';
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
  UserCheck,
  MessageSquare
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetchUnread = async () => {
      try {
        const res = await messageService.getUnreadCount();
        if (res.success && typeof res.count === 'number') {
          setUnreadCount(res.count);
        }
      } catch (e) {}
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 4000);
    return () => clearInterval(interval);
  }, [user]);

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

  // Staff Coordination links (Universal for all roles)
  const staffLinks = [
    { to: '/chat', label: 'Staff Messaging', icon: MessageSquare },
    { to: '/profile', label: 'Account & Password', icon: UserCheck },
  ];

  // HCI Academic & Prototype links
  const academicLinks = [
    { to: '/prototype', label: 'Low-Fi Prototype', icon: Layers },
    { to: '/evaluation', label: 'HCI Usability Audit', icon: Compass },
  ];

  const role = user?.role;
  const avatarUrl = user?.profile_image
    ? user.profile_image.startsWith('http')
      ? user.profile_image
      : `http://localhost:5000${user.profile_image.startsWith('/') ? '' : '/'}${user.profile_image}`
    : null;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#0a192f]/70 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#0a192f] text-slate-300 flex flex-col transition-all duration-300 ease-in-out border-r border-[#1b3353] shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header (Dark-Navy 60% + Dark-Green 30% + White 10%) */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-[#1b3353] bg-[#071120]">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#064e3b] to-[#10b981] flex items-center justify-center text-white shadow-lg shadow-emerald-900/30 font-bold text-lg transition-transform hover:scale-105">
            M
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-white tracking-wider">METROPOLITAN</h1>
            <p className="text-[11px] text-[#34d399] font-semibold tracking-widest uppercase">Health System</p>
          </div>
        </div>

        {/* User Card */}
        <div className="px-5 py-4 border-b border-[#1b3353] bg-[#0e223d]/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#064e3b] text-[#a7f3d0] border border-[#047857] flex items-center justify-center font-bold text-sm shadow-sm overflow-hidden flex-shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt={user?.first_name || 'Staff User'} className="w-full h-full object-cover" />
              ) : (
                <span>{(user?.first_name || user?.name || 'U').charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.name || 'Staff User'}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[11px] uppercase tracking-wider font-bold text-[#a7f3d0]">
                  {role || 'Authorized'}
                </span>
                {user?.specialization && (
                  <span className="text-[10px] text-emerald-300/80 truncate">
                    • {user.specialization}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
          {/* Main Role Section */}
          <div>
            <div className="px-2 mb-2 text-[10px] font-bold uppercase tracking-wider text-[#9fb3c8]">
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
                    `group flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-[#064e3b] text-white shadow-md shadow-emerald-950/40 translate-x-1'
                        : 'text-slate-300 hover:bg-[#132846] hover:text-white hover:translate-x-1'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <link.icon className="w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110" />
                    <span>{link.label}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-40 transition-transform group-hover:translate-x-0.5" />
                </NavLink>
              ))}
            </div>
          </div>

          {/* Staff Coordination & Messaging */}
          <div>
            <div className="px-2 mb-2 text-[10px] font-bold uppercase tracking-wider text-[#9fb3c8]">
              Staff Coordination
            </div>
            <div className="space-y-1">
              {staffLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `group flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-[#064e3b] text-white shadow-md shadow-emerald-950/40 translate-x-1'
                        : 'text-slate-300 hover:bg-[#132846] hover:text-white hover:translate-x-1'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <link.icon className="w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110" />
                    <span>{link.label}</span>
                  </div>
                  {link.to === '/chat' && unreadCount > 0 ? (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-emerald-400 text-black shadow-md border border-emerald-300">
                      {unreadCount}
                    </span>
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 opacity-40 transition-transform group-hover:translate-x-0.5" />
                  )}
                </NavLink>
              ))}
            </div>
          </div>

          {/* Academic Modules */}
          <div>
            <div className="px-2 mb-2 text-[10px] font-bold uppercase tracking-wider text-[#9fb3c8]">
              Academic & HCI Artifacts
            </div>
            <div className="space-y-1">
              {academicLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `group flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-[#064e3b]/80 text-[#a7f3d0] border border-[#047857]'
                        : 'text-slate-400 hover:bg-[#132846] hover:text-slate-200 hover:translate-x-1'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <link.icon className="w-4 h-4 flex-shrink-0 text-[#34d399] transition-transform group-hover:scale-110" />
                    <span>{link.label}</span>
                  </div>
                  <span className="text-[10px] bg-[#071120] px-1.5 py-0.5 rounded text-[#a7f3d0] border border-[#1b3353]">HCI</span>
                </NavLink>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Logout */}
        <div className="p-4 border-t border-[#1b3353] bg-[#071120]">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-rose-300 hover:bg-rose-500/15 hover:text-rose-200 transition-all duration-200 hover:translate-x-1 cursor-pointer"
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
