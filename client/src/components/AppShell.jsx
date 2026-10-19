import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, GraduationCap, Award, Bell, User, LogOut,
  Users, ClipboardList, ShieldCheck, BarChart3, Settings, PlusCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';

const studentNav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/courses', label: 'Courses', icon: BookOpen },
  { to: '/progress', label: 'Progress', icon: GraduationCap },
  { to: '/certificates', label: 'Certificates', icon: Award },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/profile', label: 'Profile', icon: User },
];

const adminNav = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/users', label: 'Students', icon: Users },
  { to: '/admin/courses', label: 'Courses', icon: BookOpen },
  { to: '/admin/enrollments', label: 'Enrollments', icon: ClipboardList },
  { to: '/admin/proctoring', label: 'Proctoring', icon: ShieldCheck },
  { to: '/admin/certificates', label: 'Certificates', icon: Award },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AppShell({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const nav = user?.role === 'admin' ? adminNav : studentNav;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-surface">
      <aside className="w-64 shrink-0 bg-white border-r border-slate-100 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <span className="font-display font-semibold text-lg text-ink">SmartLearn <span className="text-indigo">Pro</span></span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? 'bg-indigo-50 text-indigo' : 'text-slate-600 hover:bg-slate-50'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
          {user?.role === 'admin' && (
            <NavLink
              to="/admin/courses/create"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-cyan hover:bg-cyan-50 mt-2"
            >
              <PlusCircle size={18} />
              New Course
            </NavLink>
          )}
        </nav>
        <div className="p-3 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-50 w-full"
          >
            <LogOut size={18} />
            Log out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 shrink-0">
          <div />
          <div className="flex items-center gap-4">
            <NotificationDropdown />
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-full bg-indigo text-white flex items-center justify-center font-display text-sm font-semibold">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <span className="text-sm font-medium text-ink hidden sm:block">{user?.name}</span>
            </div>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
