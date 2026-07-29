'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/store';
import { USER_ROLES, ROLE_LABELS, UserRole } from '@/config/constants';
import { 
  FileText, 
  PlusCircle, 
  CheckSquare, 
  Users, 
  ShieldAlert, 
  BarChart3, 
  LogOut, 
  Activity,
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
    label: 'My Claims',
    href: '/provider/dashboard',
    icon: <FileText className="w-4 h-4" />,
    roles: [USER_ROLES.PROVIDER],
  },
  // Reviewer Navigation
  {
    label: 'Review Queue',
    href: '/reviewer/dashboard',
    icon: <CheckSquare className="w-4 h-4" />,
    roles: [USER_ROLES.REVIEWER],
  },
  // Admin Navigation
  {
    label: 'Platform Overview',
    href: '/admin/dashboard',
    icon: <BarChart3 className="w-4 h-4" />,
    roles: [USER_ROLES.ADMIN],
  },
  {
    label: 'User Management',
    href: '/admin/users',
    icon: <Users className="w-4 h-4" />,
    roles: [USER_ROLES.ADMIN],
  },
  {
    label: 'All Claims Audit',
    href: '/admin/claims',
    icon: <ShieldAlert className="w-4 h-4" />,
    roles: [USER_ROLES.ADMIN],
  },
];

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, token, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
    <div className="h-screen w-screen overflow-hidden flex bg-[var(--bg)]">
      {/* Fixed 240px Production Sidebar */}
      <aside className="w-60 bg-[var(--surface)] border-r border-[var(--border)] flex flex-col justify-between fixed inset-y-0 left-0 z-30">
        <div>
          {/* Brand Header */}
          <div className="h-16 flex items-center gap-2.5 px-6 border-b border-[var(--border)]">
            <div className="w-8 h-8 rounded-lg bg-[var(--brand-500)] text-white flex items-center justify-center font-bold shadow-sm">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-semibold text-sm leading-tight text-[var(--text-primary)]">ClaimCare</h1>
              <p className="text-[10px] text-[var(--text-muted)] font-medium">Health Claims Platform</p>
            </div>
          </div>

          {/* Navigation Section */}
          <div className="p-3">
            <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              {mounted && currentRole && ROLE_LABELS[currentRole] ? ROLE_LABELS[currentRole] : 'Navigation'}
            </div>
            <nav className="mt-1 space-y-1">
              {mounted &&
                filteredNav.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-[var(--brand-50)] text-[var(--brand-700)] font-semibold shadow-xs'
                          : 'text-[var(--text-secondary)] hover:bg-gray-100 hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
            </nav>
          </div>
        </div>

        {/* Logged-In User Profile Footer */}
        <div className="p-4 border-t border-[var(--border)] bg-gray-50 flex items-center justify-between">
          {mounted && token && user ? (
            <>
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-[var(--brand-50)] border border-[var(--brand-500)] text-[var(--brand-700)] font-bold text-xs flex items-center justify-center shrink-0">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="truncate">
                  <p className="text-xs font-semibold text-[var(--text-primary)] truncate">{user.name}</p>
                  <div className="flex items-center gap-1">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
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
          ) : (
            <div className="w-full text-center">
              <Link
                href="/login"
                className="text-xs text-[var(--brand-500)] font-semibold hover:underline"
              >
                Sign In to Platform
              </Link>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="pl-60 flex-1 h-screen overflow-hidden flex flex-col">
        <div className="max-w-7xl w-full mx-auto px-6 py-6 h-full flex flex-col overflow-hidden">{children}</div>
      </main>
    </div>
  );
};
