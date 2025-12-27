'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Users, Settings, CreditCard, Building2, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth';

const navItems = [
  { href: '/portal', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/portal/leads', label: 'Leads', icon: Users },
  { href: '/portal/profile', label: 'Profile', icon: Building2 },
  { href: '/portal/subscription', label: 'Subscription', icon: CreditCard },
];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { token, businessName, subscriptionTier, logout } = useAuth();

  // Skip auth check for login page
  const isLoginPage = pathname === '/portal/login';

  useEffect(() => {
    if (!isLoginPage && !token) {
      router.push('/portal/login');
    }
  }, [token, isLoginPage, router]);

  // Render login page without layout
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Show nothing while checking auth
  if (!token) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      {/* Top Nav */}
      <nav className="bg-white border-b border-[var(--color-cream-dark)] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-display text-2xl font-semibold text-[var(--color-teal)]">
              Parent<span className="text-[var(--color-coral)]">Glue</span>
            </Link>
            <span className="text-sm text-[var(--color-charcoal-light)]">Provider Portal</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-[var(--color-charcoal)]">{businessName}</span>
            <span className="px-2 py-1 text-xs font-semibold rounded-lg bg-[var(--color-teal)]/10 text-[var(--color-teal-dark)] capitalize">
              {subscriptionTier}
            </span>
            <button
              onClick={handleLogout}
              className="p-2 text-[var(--color-charcoal-light)] hover:text-[var(--color-charcoal)] transition-colors"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-56 flex-shrink-0 hidden md:block">
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[var(--color-teal)] text-white'
                        : 'text-[var(--color-charcoal-light)] hover:bg-[var(--color-cream-dark)] hover:text-[var(--color-charcoal)]'
                    }`}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>

        {/* Mobile Bottom Nav */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--color-cream-dark)] md:hidden z-50">
          <div className="flex justify-around py-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center gap-1 px-3 py-2 text-xs ${
                    isActive
                      ? 'text-[var(--color-teal)]'
                      : 'text-[var(--color-charcoal-light)]'
                  }`}
                >
                  <item.icon size={20} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
