'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loginOfficer, getCurrentSession } from '../../lib/auth';
import { Landmark, Shield, KeyRound, User, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // If already logged in, redirect to dashboard
    const session = getCurrentSession();
    if (session) {
      router.replace('/dashboard');
    }
  }, [router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    const result = loginOfficer(username, password);

    if (result.success) {
      router.push('/dashboard');
    } else {
      setErrorMessage(result.error || 'உள்நுழைவு தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்.');
      setIsLoading(false);
    }
  };

  const handleQuickFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between text-slate-400 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>அலுவலர் உள்நுழைவு பாதுகாப்பு போர்ட்டல்</span>
        </div>
        <div>
          <span>தமிழ்நாடு அரசு • RTO போர்ட்டல் v2.6</span>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto my-8">
        <div className="bg-slate-800/90 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden backdrop-blur-md">
          {/* Header */}
          <div className="bg-gradient-to-b from-slate-800 to-slate-850 p-6 sm:p-8 text-center border-b border-slate-700">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-950/60 border border-emerald-400/30">
              <Landmark className="w-8 h-8 text-white" />
            </div>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800 mb-2">
              தமிழ்நாடு அரசு • போக்குவரத்துத் துறை
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              ஓட்டுநர் உரிம விண்ணப்ப மறுஆய்வு
            </h2>
            <p className="text-xs text-slate-400 mt-1.5">
              மோட்டார் வாகன ஆய்வாளர் (MVI) மற்றும் RTO அலுவலர் உள்நுழைவு
            </p>
          </div>

          {/* Form */}
          <div className="p-6 sm:p-8 space-y-6">
            {errorMessage && (
              <div className="p-3.5 rounded-lg bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs font-medium flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  அலுவலர் பயனர்பெயர் (Username) <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="எ.கா: officer_chennai"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-lg bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  கடவுச்சொல் (Password) <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="கடவுச்சொல்லை உள்ளிடவும்"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-lg bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-950/40 transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span>உள்நுழைகிறது...</span>
                ) : (
                  <>
                    <span>உள்நுழைக</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Credentials Autofill */}
            <div className="pt-4 border-t border-slate-700/80">
              <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                சோதனை மாதிரி கணக்குகள் (Demo Credentials):
              </span>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => handleQuickFill('officer_chennai', 'tn_rto_2026')}
                  className="w-full text-left p-2.5 rounded-lg bg-slate-900/60 hover:bg-slate-900 border border-slate-700/80 text-xs text-slate-300 transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <div>
                    <div className="font-semibold text-white group-hover:text-emerald-400 transition-colors">
                      சென்னை RTO அலுவலர் (MVI)
                    </div>
                    <div className="text-[11px] text-slate-400">
                      பயனர்பெயர்: <code className="text-emerald-400 font-mono">officer_chennai</code> | கடவுச்சொல்: <code className="text-emerald-400 font-mono">tn_rto_2026</code>
                    </div>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickFill('officer_kovai', 'tn_rto_2026')}
                  className="w-full text-left p-2.5 rounded-lg bg-slate-900/60 hover:bg-slate-900 border border-slate-700/80 text-xs text-slate-300 transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <div>
                    <div className="font-semibold text-white group-hover:text-emerald-400 transition-colors">
                      கோவை RTO அலுவலர் (ARTO)
                    </div>
                    <div className="text-[11px] text-slate-400">
                      பயனர்பெயர்: <code className="text-emerald-400 font-mono">officer_kovai</code> | கடவுச்சொல்: <code className="text-emerald-400 font-mono">tn_rto_2026</code>
                    </div>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
              <span className="text-amber-400 font-bold block mb-0.5">பாதுகாப்பு குறிப்பு:</span>
              இது உலாவியிலான மாதிரி JWT-அமர்வு முறையாகும் (Demo-only JWT Session). உண்மை அரசு அமைப்பில் சமச்சீரற்ற சங்கேத குறிமுறைகள் கொண்ட பின்னணி சேவையக பாதுகாப்பு பின்பற்றப்படும்.
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-slate-400 py-2">
        © 2026 தமிழ்நாடு அரசு போக்குவரத்துத் துறை • ஓட்டுநர் உரிம மறுஆய்வு முறைமை (Demo MVP)
      </div>
    </div>
  );
}

