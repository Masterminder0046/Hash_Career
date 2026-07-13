import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard, User, FileText, Building2, GitCompare,
  Brain, Target, Map, Video, MessageSquare, Bell,
  Users, BarChart3, Settings, GraduationCap, Sparkles,
  ChevronLeft, ChevronRight, BookOpen, Linkedin,
} from 'lucide-react';
import { useState } from 'react';
import LogoIcon from './LogoIcon';

const studentLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/profile', icon: User, label: 'My Profile' },
  { to: '/resume', icon: FileText, label: 'Resume Analyzer' },
  { to: '/companies', icon: Building2, label: 'Companies' },
  { to: '/matching', icon: GitCompare, label: 'Company Match' },
  { to: '/prediction', icon: Brain, label: 'Prediction' },
  { to: '/skill-gap', icon: Target, label: 'Skill Gap' },
  { to: '/roadmap', icon: Map, label: 'Roadmap' },
  { to: '/interview', icon: Video, label: 'Mock Interview' },
  { to: '/face-analysis', icon: GraduationCap, label: 'Face Analysis' },
  { to: '/chatbot', icon: MessageSquare, label: 'Career Chat' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
];

const officerLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/officer/students', icon: Users, label: 'Students' },
  { to: '/officer/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/companies', icon: Building2, label: 'Companies' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
];

const adminLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/companies', icon: Building2, label: 'Companies' },
  { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
];

export default function Sidebar() {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const links = user?.role === 'admin' ? adminLinks : user?.role === 'placement_officer' ? officerLinks : studentLinks;

  return (
    <aside className={`fixed left-0 top-0 h-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-700/50 z-50 transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
      <div className="flex flex-col h-full">
        <div className="p-4 flex items-center justify-between border-b border-slate-200/50 dark:border-slate-700/50">
          <NavLink to="/dashboard" className="flex items-center gap-3">
            <LogoIcon className="w-9 h-9 text-indigo-600 dark:text-indigo-400 hover:scale-105 transition-transform duration-300" />
            {!collapsed && <span className="font-bold text-lg gradient-text">Hash Career</span>}
          </NavLink>
          <button onClick={() => setCollapsed(!collapsed)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-hide">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-600 dark:text-indigo-400 font-medium'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                }`
              }
            >
              <link.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="text-sm">{link.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200/50 dark:border-slate-700/50">
          {!collapsed && (
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                {user?.name?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-slate-400 truncate capitalize">{user?.role?.replace('_', ' ')}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
