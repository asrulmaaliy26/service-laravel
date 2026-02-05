
import React from 'react';
import { User, UserRole } from '../types';
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  Library,
  Monitor,
  LogOut,
  Settings
} from 'lucide-react';

interface SidebarProps {
  user: User;
  onLogout: () => void;
  activeMenu: string;
  onMenuChange: (label: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, onLogout, activeMenu, onMenuChange }) => {
  const menuItems = {
    [UserRole.PENGAWAS]: [
      { icon: <Monitor size={20} />, label: 'Live Monitoring' },
      { icon: <ClipboardList size={20} />, label: 'Kontrol Ujian' },
    ],
    [UserRole.SISWA]: [
      { icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    ],
  };

  const currentItems = menuItems[user.role];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col hidden md:flex h-full border-r border-slate-800">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-900/50">E</div>
          <span className="text-xl font-bold text-white tracking-tight">EduSmart</span>
        </div>

        <nav className="space-y-1">
          {currentItems.map((item, idx) => (
            <button
              key={idx}
              onClick={() => onMenuChange(item.label)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${activeMenu === item.label
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20'
                : 'hover:bg-slate-800 hover:text-white text-slate-400'
                }`}
            >
              <span className={activeMenu === item.label ? 'text-white' : 'text-slate-500 group-hover:text-white'}>
                {item.icon}
              </span>
              <span className="font-semibold text-sm">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
