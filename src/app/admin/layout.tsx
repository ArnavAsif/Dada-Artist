'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Image as ImageIcon,
  Crosshair,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ShieldCheck,
  Database,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [isSupabaseLive, setIsSupabaseLive] = useState<boolean | null>(null);

  // If on login page, render children directly without dashboard shell
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Check connection status
  useEffect(() => {
    fetch('/api/admin/status')
      .then((res) => res.json())
      .then((data) => {
        setIsSupabaseLive(data?.status?.connected === true);
      })
      .catch(() => setIsSupabaseLive(false));
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch {
      router.push('/admin/login');
    }
  };

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Products', href: '/admin/products', icon: Package },
    { label: 'Hero Image', href: '/admin/hero', icon: ImageIcon },
    { label: 'Hotspot Editor', href: '/admin/hotspots', icon: Crosshair },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#0d0c0a] text-[#f4efe6] flex flex-col md:flex-row antialiased selection:bg-amber-500/30 selection:text-amber-200">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-stone-950 border-b border-white/10 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full border border-amber-400/40 bg-amber-400/10 flex items-center justify-center">
            <span className="text-xs font-bold text-amber-300">F</span>
          </div>
          <span className="text-xs tracking-[0.2em] font-light uppercase text-white">
            Fea <strong className="text-amber-300 font-medium">Admin</strong>
          </span>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-stone-900 border border-white/10 text-stone-300"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Desktop Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-stone-950 border-r border-white/10 flex flex-col justify-between transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full border border-amber-400/40 bg-amber-400/10 flex items-center justify-center">
                <ShieldCheck size={18} className="text-amber-300" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-light tracking-[0.25em] text-white uppercase">
                  FEA <span className="text-amber-300 font-normal">ATELIER</span>
                </span>
                <span className="text-[10px] tracking-wider uppercase text-stone-400 font-mono">
                  Control Center
                </span>
              </div>
            </div>

            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden p-1 text-stone-400 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          {/* Connection Status Badge */}
          <div className="px-6 py-3 border-b border-white/5 bg-white/[0.02]">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="flex items-center gap-1.5 text-stone-400">
                <Database size={12} className="text-stone-400" />
                <span>Backend</span>
              </span>
              {isSupabaseLive ? (
                <span className="flex items-center gap-1 text-emerald-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Supabase Live</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-amber-300 font-medium" title="Operating with local store fallback">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>Local Store</span>
                </span>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/admin'
                  ? pathname === '/admin'
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium tracking-wide transition-all duration-200 ${
                    isActive
                      ? 'bg-amber-400/15 text-amber-300 border border-amber-400/30'
                      : 'text-stone-400 hover:text-stone-100 hover:bg-white/[0.04]'
                  }`}
                >
                  <Icon size={16} className={isActive ? 'text-amber-300' : 'text-stone-400'} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl text-xs text-stone-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 transition-colors group"
          >
            <span className="flex items-center gap-2">
              <ExternalLink size={14} className="text-amber-400" />
              <span>Public Showroom</span>
            </span>
            <span className="text-[10px] text-stone-500 font-mono group-hover:text-stone-300">↗</span>
          </Link>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-2.5 w-full px-3.5 py-2.5 rounded-xl text-xs text-red-400 hover:text-red-300 hover:bg-red-950/30 border border-transparent hover:border-red-500/20 transition-colors"
          >
            <LogOut size={15} />
            <span>{loggingOut ? 'Signing out...' : 'Sign Out'}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-h-screen overflow-y-auto p-4 sm:p-8 lg:p-10">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
