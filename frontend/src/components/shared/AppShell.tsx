'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/store';
import { USER_ROLES, ROLE_LABELS, UserRole } from '@/config/constants';
import { 
  FileText, 
  PlusCircle, 
  Users, 
  ShieldAlert, 
  BarChart3, 
  LogOut, 
  Activity,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  LayoutDashboard,
  User as UserIcon
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  // Provider Navigation
  {
    label: 'Dashboard',
    href: '/provider/dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
    roles: [USER_ROLES.PROVIDER],
  },
  {
    label: 'My Claims',
    href: '/provider/claims',
    icon: <FileText className="w-5 h-5" />,
    roles: [USER_ROLES.PROVIDER],
  },
  {
    label: 'Submit Claim',
    href: '/provider/claims/new',
    icon: <PlusCircle className="w-5 h-5" />,
    roles: [USER_ROLES.PROVIDER],
  },
  // Reviewer Navigation
  {
    label: 'Dashboard',
    href: '/reviewer/dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
    roles: [USER_ROLES.REVIEWER],
  },
  {
    label: 'All Claims',
    href: '/reviewer/claims',
    icon: <FileText className="w-5 h-5" />,
    roles: [USER_ROLES.REVIEWER],
  },
  // Admin Navigation
  {
    label: 'Platform Overview',
    href: '/admin/dashboard',
    icon: <BarChart3 className="w-5 h-5" />,
    roles: [USER_ROLES.ADMIN],
  },
  {
    label: 'User Management',
    href: '/admin/users',
    icon: <Users className="w-5 h-5" />,
    roles: [USER_ROLES.ADMIN],
  },
  {
    label: 'All Claims Audit',
    href: '/admin/claims',
    icon: <ShieldAlert className="w-5 h-5" />,
    roles: [USER_ROLES.ADMIN],
  },
];

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, token, logout } = useAuthStore();

  const [mounted, setMounted] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const isAuthPage = pathname === '/login' || pathname === '/register';

  const currentRole = mounted ? (user?.role as UserRole) : undefined;
  const filteredNav = navItems.filter((item) => currentRole && item.roles.includes(currentRole));

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (isAuthPage) {
    return <div className="min-h-screen bg-[var(--bg)]">{children}</div>;
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col md:flex-row bg-[var(--bg)]">
      {/* Mobile Top Header Navigation Bar */}
      <header className="h-14 bg-white border-b border-[var(--border)] flex items-center justify-between px-4 shrink-0 md:hidden z-20">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-1.5 rounded-lg border border-[var(--border)] text-[var(--text-primary)] hover:bg-gray-100"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[var(--brand-500)] text-white flex items-center justify-center font-bold">
              <Activity className="w-4 h-4" />
            </div>
            <span className="font-semibold text-sm text-[var(--text-primary)]">ClaimCare</span>
          </div>
        </div>

        {mounted && user && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-[var(--brand-50)] text-[var(--brand-700)] px-2 py-0.5 rounded">
              {user.role}
            </span>
          </div>
        )}
      </header>

      {/* Mobile Slide-Over Drawer Overlay Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Desktop & Mobile Responsive Collapsible Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-[var(--surface)] border-r border-[var(--border)] flex flex-col justify-between transition-all duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'
        } ${isCollapsed ? 'md:w-20' : 'md:w-60'}`}
      >
        {/* Floating Desktop Toggle Button (50% inside, 50% outside sidebar border) */}
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex items-center justify-center w-6 h-6 rounded-full border border-[var(--border)] bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50 shadow-xs absolute -right-3 top-5 z-50 transition-transform hover:scale-110 cursor-pointer"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>

        <div>
          {/* Sidebar Brand Header */}
          <div className={`h-16 flex items-center px-4 border-b border-[var(--border)] ${isCollapsed ? 'md:justify-center' : 'justify-between'}`}>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[var(--brand-500)] text-white flex items-center justify-center font-bold shadow-sm shrink-0">
                <Activity className="w-5 h-5" />
              </div>
              {(!isCollapsed || isMobileOpen) && (
                <div className="truncate">
                  <h1 className="font-semibold text-sm leading-tight text-[var(--text-primary)]">ClaimCare</h1>
                  <p className="text-[10px] text-[var(--text-muted)] font-medium">Health Claims Platform</p>
                </div>
              )}
            </div>

            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={() => setIsMobileOpen(false)}
              className="flex md:hidden items-center justify-center w-7 h-7 rounded-lg text-gray-500 hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Section */}
          <div className="p-3">
            {(!isCollapsed || isMobileOpen) && (
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                {mounted && currentRole && ROLE_LABELS[currentRole] ? ROLE_LABELS[currentRole] : 'Navigation'}
              </div>
            )}

            <nav className="mt-1 space-y-1">
              {mounted &&
                filteredNav.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={isCollapsed ? item.label : undefined}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        isCollapsed ? 'md:justify-center md:px-0' : ''
                      } ${
                        isActive
                          ? 'bg-[var(--brand-50)] text-[var(--brand-700)] font-semibold shadow-xs'
                          : 'text-[var(--text-secondary)] hover:bg-gray-100 hover:text-[var(--text-primary)]'
                      }`}
                    >
                      <span className="shrink-0">{item.icon}</span>
                      {(!isCollapsed || isMobileOpen) && (
                        <span className="truncate">{item.label}</span>
                      )}
                    </Link>
                  );
                })}
            </nav>
          </div>
        </div>

        {/* Logged-In User Profile Footer */}
        <div className="p-3 border-t border-[var(--border)] bg-gray-50 flex items-center justify-between">
          {mounted && token && user ? (
            <>
              {isCollapsed && !isMobileOpen ? (
                <div className="w-full flex flex-col items-center gap-2">
                  <div
                    className="w-9 h-9 rounded-full bg-[var(--brand-50)] border border-[var(--brand-500)] text-[var(--brand-700)] font-bold text-xs flex items-center justify-center shrink-0 cursor-pointer"
                    title={`${user.name} (${user.role})`}
                  >
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-[var(--text-muted)] hover:text-red-600 transition-colors p-1.5 rounded-lg hover:bg-white"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[var(--brand-50)] border border-[var(--brand-500)] text-[var(--brand-700)] font-bold text-xs flex items-center justify-center shrink-0">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-semibold text-[var(--text-primary)] truncate">{user.name}</p>
                      <div className="flex items-center gap-1">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        <span className="text-[10px] text-[var(--text-secondary)] font-medium truncate">
                          {ROLE_LABELS[user.role as UserRole] || user.role}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-[var(--text-muted)] hover:text-red-600 transition-colors p-1.5 rounded-lg hover:bg-white shrink-0"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              )}
            </>
          ) : (
            <div className="w-full text-center">
              <Link
                href="/login"
                className="text-xs text-[var(--brand-500)] font-semibold hover:underline"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </aside>

      {/* Main Page Layout Wrapper */}
      <main
        className={`flex-1 h-[calc(100vh-3.5rem)] md:h-screen overflow-hidden flex flex-col transition-all duration-300 ${
          isCollapsed ? 'md:pl-20' : 'md:pl-60'
        }`}
      >
        <div className="max-w-7xl w-full mx-auto px-3 sm:px-6 py-3 sm:py-6 h-full flex flex-col overflow-hidden">
          {children}
        </div>
      </main>
    </div>
  );
};
