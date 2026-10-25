'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { LayoutDashboard, FileText, AlertCircle, BookOpen, LogOut, CheckCircle2 } from 'lucide-react';
import { logoutOfficer } from '../lib/auth';
import { useRouter } from 'next/navigation';

interface SidebarProps {
  pendingCount?: number;
  highPriorityCount?: number;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({
  pendingCount = 0,
  highPriorityCount = 0,
  isOpenMobile = false,
  onCloseMobile,
}: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const isPriorityQueue = pathname === '/applications' && searchParams.get('priority') === 'high';
  const isApplications = pathname === '/applications' && searchParams.get('priority') !== 'high';
  const isDashboard = pathname === '/dashboard';
  const isManual = pathname === '/manual';

  const handleLogout = () => {
    logoutOfficer();
    router.push('/login');
  };

  const navLinks = [
    {
      label: 'முகப்புப் பலகை',
      href: '/dashboard',
      icon: LayoutDashboard,
      active: isDashboard,
    },
    {
      label: 'விண்ணப்பங்கள்',
      href: '/applications',
      icon: FileText,
      active: isApplications,
      badge: pendingCount > 0 ? pendingCount : null,
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    },
    {
      label: 'முக்கியத்துவ வரிசை',
      href: '/applications?priority=high',
      icon: AlertCircle,
      active: isPriorityQueue,
      badge: highPriorityCount > 0 ? highPriorityCount : null,
      badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
    },
    {
      label: 'பயனர் கையேடு',
      href: '/manual',
      icon: BookOpen,
      active: isManual,
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 text-slate-300 w-64">
      {/* Navigation Links */}
      <div className="p-4 space-y-1.5 flex-1">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
          முதன்மை மெனு
        </div>

        {navLinks.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                item.active
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'hover:bg-slate-800 hover:text-white text-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4.5 h-4.5 ${item.active ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== null && item.badge !== undefined && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    item.active ? 'bg-white/20 text-white' : item.badgeColor
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer Info Box */}
      <div className="p-4 border-t border-slate-800 space-y-3">
        <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs space-y-1">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>பதிவு நிலை: நேரலை</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            அனைத்து முடிவுகளும் உங்கள் உலாவியில் பாதுகாப்பாக சேமிக்கப்படுகின்றன.
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold text-rose-300 hover:bg-rose-950/40 border border-rose-800/40 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>வெளியேறு (Logout)</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop fixed sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 w-64 max-w-xs h-full bg-slate-900 shadow-xl flex flex-col">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}

