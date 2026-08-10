import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Package,
  Boxes,
  FileText,
  Receipt,
  BarChart3,
  UserCog,
  ChevronLeft,
  ChevronRight,
  Building2,
} from 'lucide-react';
import { Role } from '../types';

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: Role[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Customers CRM', path: '/customers', icon: Users, roles: ['ADMIN', 'SALES', 'ACCOUNTS'] },
  { label: 'Products', path: '/products', icon: Package, roles: ['ADMIN', 'SALES', 'WAREHOUSE'] },
  { label: 'Inventory & Movements', path: '/inventory', icon: Boxes, roles: ['ADMIN', 'WAREHOUSE'] },
  { label: 'Sales Challans', path: '/challans', icon: FileText, roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] },
  { label: 'Invoices & Billing', path: '/invoices', icon: Receipt, roles: ['ADMIN', 'ACCOUNTS'] },
  { label: 'Reports', path: '/reports', icon: BarChart3, roles: ['ADMIN', 'ACCOUNTS'] },
  { label: 'Users Management', path: '/users', icon: UserCog, roles: ['ADMIN'] },
];

export const Sidebar: React.FC = () => {
  const { hasRole } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const filteredItems = navItems.filter(
    (item) => !item.roles || item.roles.some((r) => hasRole(r))
  );

  return (
    <aside
      className={`no-print bg-slate-900 text-slate-300 min-h-screen border-r border-slate-800 transition-all duration-300 flex flex-col sticky top-0 h-screen z-40 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-600 text-white rounded-lg">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-white tracking-wide uppercase">Mini ERP</h2>
              <p className="text-[10px] text-slate-400 font-medium">Operations Portal</p>
            </div>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors mx-auto"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-950/50'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`
              }
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer info */}
      {!collapsed && (
        <div className="p-4 border-t border-slate-800 text-[11px] text-slate-500 text-center">
          <p>© 2026 Wholesale ERP Portal</p>
        </div>
      )}
    </aside>
  );
};
