'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthSession } from '../lib/types';
import { logoutOfficer } from '../lib/auth';
import { ResetConfirmModal } from './ResetConfirmModal';
import { resetToInitialData } from '../lib/storage';
import { LogOut, RotateCcw, User, Menu, X, Landmark, Shield } from 'lucide-react';

interface NavbarProps {
  session: AuthSession | null;
  onDataReset?: () => void;
  toggleSidebar?: () => void;
}

export function Navbar({ session, onDataReset, toggleSidebar }: NavbarProps) {
  const router = useRouter();
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isMobileUserMenuOpen, setIsMobileUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logoutOfficer();
    router.push('/login');
  };

  const handleResetConfirm = () => {
    resetToInitialData();
    if (onDataReset) {
      onDataReset();
    } else {
      router.refresh();
    }
  };

  return (
    <>
      <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left branding */}
            <div className="flex items-center gap-3">
              {toggleSidebar && (
                <button
                  type="button"
                  onClick={toggleSidebar}
                  className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none"
                  aria-label="Toggle menu"
                >
                  <Menu className="w-5 h-5" />
                </button>
              )}

              <Link href="/dashboard" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white shadow-xs group-hover:bg-emerald-500 transition-colors">
                  <Landmark className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-400 tracking-wider uppercase">
                      தமிழ்நாடு அரசு • போக்குவரத்துத் துறை
                    </span>
                    <span className="hidden md:inline-flex px-1.5 py-0.2 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                      RTO Review Portal
                    </span>
                  </div>
                  <h1 className="text-sm md:text-base font-extrabold text-white tracking-tight">
                    ஓட்டுநர் உரிம விண்ணப்ப மறுஆய்வு முறைமை
                  </h1>
                </div>
              </Link>
            </div>

            {/* Right actions (Desktop) */}
            <div className="hidden md:flex items-center gap-3">
              {/* Reset Data Button */}
              <button
                type="button"
                onClick={() => setIsResetModalOpen(true)}
                title="மாதிரி தரவை தொடக்க நிலைக்கு மீட்டமைக்க"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                <span>மாதிரித் தரவை மீட்டமை</span>
              </button>

              {/* Officer profile info */}
              {session && (
                <div className="flex items-center gap-2 pl-3 border-l border-slate-700">
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-200">
                      {session.officer.name}
                    </div>
                    <div className="text-[11px] text-emerald-400">
                      {session.officer.designation}
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-emerald-800/60 border border-emerald-500/50 flex items-center justify-center text-xs font-bold text-emerald-200">
                    <User className="w-4 h-4" />
                  </div>
                </div>
              )}

              {/* Logout Button */}
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:text-white hover:bg-rose-900/40 border border-rose-800/60 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>வெளியேறு</span>
              </button>
            </div>

            {/* Mobile actions trigger */}
            <div className="flex md:hidden items-center gap-2">
              <button
                type="button"
                onClick={() => setIsResetModalOpen(true)}
                className="p-2 text-slate-300 hover:text-white"
                title="மாதிரி தரவு மீட்டமை"
              >
                <RotateCcw className="w-4 h-4 text-amber-400" />
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="p-2 text-rose-400 hover:text-rose-300"
                title="வெளியேறு"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Confirmation modal for reset */}
      <ResetConfirmModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleResetConfirm}
      />
    </>
  );
}

