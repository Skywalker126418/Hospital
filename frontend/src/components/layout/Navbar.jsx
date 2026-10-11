import React, { useState, useEffect } from 'react';
import { Menu, Bell, MessageSquare, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import { messageService } from '../../services/messageService';

import { useNavigate } from 'react-router-dom';

const Navbar = ({ onOpenSidebar }) => {
  const { user } = useAuth();
  const { info } = useToast();
  const { theme, isDark, toggleTheme } = useTheme();
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

  const avatarUrl = user?.profile_image
    ? user.profile_image.startsWith('http')
      ? user.profile_image
      : `http://localhost:5000${user.profile_image.startsWith('/') ? '' : '/'}${user.profile_image}`
    : null;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 lg:px-8 bg-white dark:bg-[#0a192f] border-b border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-white transition-colors duration-200 shadow-xs">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="p-2 -ml-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 hover:scale-105 active:scale-95 lg:hidden"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-[#0a192f] dark:text-white tracking-tight">
            Metropolitan Health System
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Light / Dark Mode Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-500 hover:text-amber-500 dark:text-slate-400 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer relative"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label="Toggle Light or Dark Mode"
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-amber-400 animate-fade-in" />
          ) : (
            <Moon className="w-5 h-5 text-slate-600 animate-fade-in" />
          )}
        </button>

        {/* Direct Staff Chat Button with unread counter */}
        <button
          onClick={() => navigate('/chat')}
          className="p-2 text-slate-500 hover:text-[#064e3b] dark:text-slate-400 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 relative cursor-pointer"
          aria-label="Staff Direct Messaging"
          title={unreadCount > 0 ? `${unreadCount} unread staff messages` : 'Staff Direct Messaging'}
        >
          <MessageSquare className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-emerald-500 text-black text-[10px] font-black flex items-center justify-center ring-2 ring-white dark:ring-[#0a192f] shadow-sm">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Notifications button (without pulsing ping dot) */}
        <button
          onClick={() => info('All clinical and administrative services operational.', 'System Status')}
          className="p-2 text-slate-500 hover:text-[#064e3b] dark:text-slate-400 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 relative cursor-pointer"
          aria-label="System Notifications"
        >
          <Bell className="w-5 h-5" />
        </button>

        {/* Profile Card -> Click to go to Profile & Password management */}
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2.5 pl-3 border-l border-slate-200 dark:border-slate-800 hover:opacity-85 transition-opacity text-left cursor-pointer"
          title="Manage Account Profile & Password"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0a192f] to-[#064e3b] text-white font-bold flex items-center justify-center text-sm shadow-sm overflow-hidden flex-shrink-0">
            {avatarUrl ? (
              <img src={avatarUrl} alt={user?.name || 'Staff User'} className="w-full h-full object-cover" />
            ) : (
              <span>{(user?.name || user?.first_name || 'U').charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
              {user?.name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Staff User'}
            </p>
            <p className="text-[10px] uppercase font-bold text-[#047857] dark:text-emerald-400 tracking-wider">
              {user?.role}
            </p>
          </div>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
