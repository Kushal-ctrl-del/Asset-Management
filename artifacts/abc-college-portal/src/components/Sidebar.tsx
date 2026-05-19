import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  GraduationCap, 
  CalendarCheck, 
  CreditCard, 
  Clock, 
  FileText, 
  Library, 
  Bell, 
  UserCircle,
  ChevronLeft,
  ChevronRight,
  GraduationCap as LogoIcon
} from 'lucide-react';
import { useAuthContext } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { getSessionItem, setSessionItem } from '../lib/storage';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const { currentUser } = useAuthContext();
  const [collapsed, setCollapsed] = React.useState(() => getSessionItem<boolean>('abc_sidebar_collapsed') || false);

  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    setSessionItem('abc_sidebar_collapsed', next);
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Student', 'Faculty', 'Admin'] },
    { path: '/academics', label: 'Academics', icon: GraduationCap, roles: ['Student', 'Admin'] },
    { path: '/attendance', label: 'Attendance', icon: CalendarCheck, roles: ['Student', 'Faculty', 'Admin'] },
    { path: '/fees', label: 'Fees', icon: CreditCard, roles: ['Student', 'Admin'] },
    { path: '/timetable', label: 'Timetable', icon: Clock, roles: ['Student', 'Faculty', 'Admin'] },
    { path: '/assignments', label: 'Assignments', icon: FileText, roles: ['Student', 'Faculty', 'Admin'] },
    { path: '/library', label: 'Library', icon: Library, roles: ['Student', 'Admin'] },
    { path: '/notifications', label: 'Notifications', icon: Bell, roles: ['Student', 'Faculty', 'Admin'] },
    { path: '/profile', label: 'Profile', icon: UserCircle, roles: ['Student', 'Faculty', 'Admin'] },
  ];

  const filteredNav = navItems.filter(item => item.roles.includes(currentUser?.role || ''));

  const DesktopSidebar = () => (
    <aside className={cn(
      "hidden lg:flex flex-col h-screen fixed left-0 top-0 border-r border-border bg-card transition-all duration-300 z-40",
      collapsed ? "w-20" : "w-64"
    )}>
      <div className="h-16 flex items-center px-4 border-b border-border justify-between">
        <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <LogoIcon className="w-5 h-5 text-white" />
          </div>
          {!collapsed && <span className="font-bold text-lg text-slate-900 dark:text-white">ABC Portal</span>}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 px-3">
        {filteredNav.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group relative",
              isActive 
                ? "bg-primary text-white" 
                : "text-slate-600 dark:text-slate-400 hover:bg-muted hover:text-slate-900 dark:hover:text-white"
            )}
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {!collapsed && <span className="font-medium text-sm">{item.label}</span>}
          </NavLink>
        ))}
      </div>

      <div className="p-4 border-t border-border">
        <button 
          onClick={toggleCollapse}
          className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-muted text-slate-500 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>
    </aside>
  );

  const MobileDrawer = () => (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Drawer */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-64 bg-card border-r border-border z-50 transform transition-transform duration-300 lg:hidden flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-16 flex items-center px-4 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0 mr-3">
            <LogoIcon className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg">ABC Portal</span>
        </div>
        <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 px-3">
          {filteredNav.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                isActive 
                  ? "bg-primary text-white" 
                  : "text-slate-600 dark:text-slate-400 hover:bg-muted hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <span className="font-medium text-sm">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </aside>
    </>
  );

  return (
    <>
      <DesktopSidebar />
      <MobileDrawer />
    </>
  );
}
