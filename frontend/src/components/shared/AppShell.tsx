'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore, UserRole } from '@/features/auth/store';
import { 
  FileText, 
  PlusCircle, 
  CheckSquare, 
  Users, 
  ShieldAlert, 
  BarChart3, 
  LogOut, 
  Activity 
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  // Provider Nav
  {
    label: 'My Claims',
    href: '/provider/dashboard',
    icon: <FileText className="w-4 h-4" />,
    roles: ['provider'],
  },
  {
    label: 'Submit Claim',
    href: '/provider/claims/new',
    icon: <PlusCircle className="w-4 h-4" />,
    roles: ['provider'],
  },
  // Reviewer Nav
  {
    label: 'Review Queue',
    href: '/reviewer/dashboard',
    icon: <CheckSquare className="w-4 h-4" />,
    roles: ['reviewer'],
  },
  // Admin Nav
  {
    label: 'Platform Overview',
    href: '/admin/dashboard',
    icon: <BarChart3 className="w-4 h-4" />,
    roles: ['admin'],
  },
  {
    label: 'User Management',
    href: '/admin/users',
    icon: <Users className="w-4 h-4" />,
    roles: ['admin'],
  },
  {
    label: 'All Claims Audit',
    href: '/admin/claims',
    icon: <ShieldAlert className="w-4 h-4" />,
    roles: ['admin'],
  },
];

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const { user, setUser } = useAuthStore();
  const currentRole = user?.role || 'provider';

  const filteredNav = navItems.filter((item) => item.roles.includes(currentRole));

  const handleRoleSwitch = (role: UserRole) => {
    if (user) {
      setUser({ ...user, role });
    } else {
      setUser({
        id: 'demo-user-1',
        name: `Demo ${role.toUpperCase()}`,
        email: `${role}@claims.com`,
        role,
        status: 'active',
      });
    }
  };

  return (
    <div className="min-h-screen flex bg-[var(--bg)]">
      {/* Fixed 240px Sidebar */}
      <aside className="w-60 bg-[var(--surface)] border-r border-[var(--border)] flex flex-col justify-between fixed inset-y-0 left-0 z-30">
        <div>
          {/* Header Branding */}
          <div className="h-16 flex items-center gap-2.5 px-6 border-b border-[var(--border)]">
            <div className="w-8 h-8 rounded-lg bg-[var(--brand-500)] text-white flex items-center justify-center font-bold shadow-sm">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-semibold text-sm leading-tight text-[var(--text-primary)]">ClaimCare</h1>
              <p className="text-[10px] text-[var(--text-muted)] font-medium">Health Claims Platform</p>
            </div>
          </div>

          {/* Role Quick Switcher (Development Helper) */}
          <div className="p-3 m-3 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
            <div className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
              Role Simulator
            </div>
            <div className="grid grid-cols-3 gap-1">
              {(['provider', 'reviewer', 'admin'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => handleRoleSwitch(r)}
                  className={`text-[11px] py-1 px-1.5 rounded font-medium capitalize transition-colors ${
                    currentRole === r
                      ? 'bg-[var(--brand-500)] text-white shadow-xs'
                      : 'text-[var(--text-secondary)] hover:bg-gray-200'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Nav Items */}
          <nav className="px-3 py-2 space-y-1">
            {filteredNav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[var(--brand-50)] text-[var(--brand-700)] font-semibold'
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

        {/* User Footer Profile */}
        <div className="p-4 border-t border-[var(--border)] flex items-center justify-between">
          <div className="truncate">
            <p className="text-xs font-semibold text-[var(--text-primary)] truncate">{user?.name || 'Guest'}</p>
            <p className="text-[11px] text-[var(--text-muted)] capitalize truncate">{currentRole} account</p>
          </div>
          <Link href="/login" className="text-[var(--text-muted)] hover:text-red-600 transition-colors p-1" title="Log Out">
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="pl-60 flex-1 min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  );
};
