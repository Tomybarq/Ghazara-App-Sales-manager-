import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, ShoppingCart, Target, FileText, 
  Settings, ChevronRight, ChevronLeft, LogOut, BotMessageSquare
} from 'lucide-react';
import { base44 } from '@/api/base44Client';

const LOGO_URL = "https://media.base44.com/images/public/user_692882eb18328ed5665de090/f4bb25d3f_file_00000000379471f881bd181baeddbd2c.png";

const navItems = [
  { path: '/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
  { path: '/employees', label: 'الموظفون', icon: Users },
  { path: '/sales', label: 'المبيعات', icon: ShoppingCart },
  { path: '/targets', label: 'الأهداف', icon: Target },
  { path: '/reports', label: 'التقارير', icon: FileText },
  { path: '/reports-agent', label: 'مساعد التقارير', icon: BotMessageSquare },
  { path: '/settings', label: 'الإعدادات', icon: Settings },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside className={`fixed top-0 right-0 h-screen bg-sidebar text-sidebar-foreground z-40 transition-all duration-300 flex flex-col ${collapsed ? 'w-20' : 'w-64'}`}>
      {/* Logo */}
      <div className="flex items-center justify-center py-6 px-4 border-b border-sidebar-border">
        <img src={LOGO_URL} alt="Ghazara" className={`transition-all duration-300 ${collapsed ? 'w-10 h-10' : 'w-12 h-12'} object-contain`} />
        {!collapsed && (
          <div className="mr-3">
            <p className="text-sm font-bold leading-tight">غزارة للتجارة والتسويق</p>
            <p className="text-xs text-sidebar-foreground/70 leading-tight">نظام إدارة المبيعات</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                isActive 
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-md' 
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
              }`}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-accent' : ''}`} />
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse & Logout */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        <button
          onClick={() => base44.auth.logout()}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-sidebar-foreground/70 hover:bg-sidebar-accent/50 transition-colors"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm">تسجيل الخروج</span>}
        </button>
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full py-2 rounded-lg hover:bg-sidebar-accent/50 transition-colors"
        >
          {collapsed ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      </div>
    </aside>
  );
}