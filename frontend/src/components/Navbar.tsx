import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, Shield, Bell } from 'lucide-react';
import { Badge } from './Badge';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  const roleVariantMap = {
    ADMIN: 'purple' as const,
    SALES: 'info' as const,
    WAREHOUSE: 'warning' as const,
    ACCOUNTS: 'success' as const,
  };

  return (
    <header className="no-print h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-6 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold text-slate-800 tracking-tight hidden sm:block">
          Operations Portal
        </h1>
        <span className="text-xs text-slate-400 font-mono hidden md:inline-block">v1.0</span>
      </div>

      <div className="flex items-center gap-4">
        {/* User Info */}
        {user && (
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full">
            <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs">
              {user.name.charAt(0)}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-slate-800 leading-tight">{user.name}</span>
              <span className="text-[10px] text-slate-500">{user.email}</span>
            </div>
            <Badge variant={roleVariantMap[user.role] || 'neutral'} className="ml-1 text-[10px]">
              {user.role}
            </Badge>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={logout}
          title="Sign out of system"
          className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
