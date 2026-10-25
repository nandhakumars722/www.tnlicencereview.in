'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentSession } from '../lib/auth';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const session = getCurrentSession();
    if (session) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-300">ஏற்றப்படுகிறது... தயவுசெய்து காத்திருக்கவும்</p>
      </div>
    </div>
  );
}
