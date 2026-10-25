'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getCurrentSession } from '../../lib/auth';
import { getApplications, getDashboardStats, filterApplications } from '../../lib/storage';
import { Application, AuthSession, DashboardStats, FilterState } from '../../lib/types';
import { Navbar } from '../../components/Navbar';
import { Sidebar } from '../../components/Sidebar';
import { StatusBadge } from '../../components/StatusBadge';
import { PriorityBadge } from '../../components/PriorityBadge';
import { TypeBadge } from '../../components/TypeBadge';
import { AiSuggestionBadge } from '../../components/AiSuggestionBadge';
import { evaluateApplication } from '../../lib/review-rules';
import {
  FileText,
  Search,
  RotateCcw,
  Eye,
  ArrowRight,
  Filter,
  CheckCircle,
  Clock,
  ShieldAlert,
} from 'lucide-react';

function ApplicationsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [session, setSession] = useState<AuthSession | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Initialize filters from query params if available
  const initialPriority = searchParams.get('priority') || 'ALL';
  const initialStatus = searchParams.get('status') || 'ALL';
  const initialType = searchParams.get('type') || 'ALL';

  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    applicationType: initialType,
    status: initialStatus,
    district: 'ALL',
    priority: initialPriority,
  });

  const loadData = () => {
    const currentSession = getCurrentSession();
    if (!currentSession) {
      router.replace('/login');
      return;
    }
    setSession(currentSession);

    const apps = getApplications();
    setApplications(apps);
    setStats(getDashboardStats(apps));
  };

  useEffect(() => {
    loadData();
  }, [router]);

  // Sync if query param priority or status changes
  useEffect(() => {
    const p = searchParams.get('priority');
    const s = searchParams.get('status');
    const t = searchParams.get('type');

    setFilters((prev) => ({
      ...prev,
      priority: p || prev.priority,
      status: s || prev.status,
      applicationType: t || prev.applicationType,
    }));
  }, [searchParams]);

  if (!session || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-300">விண்ணப்பங்கள் ஏற்றப்படுகின்றன...</p>
        </div>
      </div>
    );
  }

  const filteredApps = filterApplications(applications, filters);
  const districts = Array.from(new Set(applications.map((a) => a.district))).sort();

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      applicationType: 'ALL',
      status: 'ALL',
      district: 'ALL',
      priority: 'ALL',
    });
  };

  const isPriorityQueueView = filters.priority === 'high';

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900">
      <Navbar
        session={session}
        onDataReset={loadData}
        toggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      />

      <div className="flex-1 flex">
        <Sidebar
          pendingCount={stats.pending}
          highPriorityCount={stats.highPriority}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Header */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {isPriorityQueueView ? 'முக்கியத்துவ ஆய்வு வரிசை' : 'விண்ணப்பப் பதிவேடு'}
                </span>
                <span className="text-xs text-slate-500">• {session.officer.district} RTO</span>
              </div>
              <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 mt-1">
                {isPriorityQueueView ? 'உயர் முன்னுரிமை விண்ணப்பங்கள்' : 'அனைத்து ஓட்டுநர் உரிம விண்ணப்பங்கள்'}
              </h1>
              <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                விண்ணப்ப விவரங்களை ஆய்வு செய்து சட்ட விதிகளின்படி முடிவெடுக்கவும்.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>வடிகட்டிகளை மீட்டமை</span>
              </button>
            </div>
          </div>

          {/* Search & Filter Controls */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  வடிகட்டுதல் மற்றும் தேடல்
                </span>
              </div>
              <div className="text-xs text-slate-600">
                காட்டப்படும் விண்ணப்பங்கள்:{' '}
                <span className="font-bold text-emerald-700">{filteredApps.length}</span> / {applications.length}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Search text */}
              <div className="lg:col-span-2 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={filters.searchQuery}
                  onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                  placeholder="விண்ணப்ப எண், பெயர் அல்லது மாவட்டம் மூலம் தேட..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              {/* Type */}
              <div>
                <select
                  value={filters.applicationType}
                  onChange={(e) => setFilters({ ...filters, applicationType: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="ALL">அனைத்து வகைகள் (All Types)</option>
                  <option value="LL">பழகுநர் உரிமம் (LL)</option>
                  <option value="DL">ஓட்டுநர் உரிமம் (DL)</option>
                  <option value="RENEWAL">உரிமம் புதுப்பித்தல் (Renewal)</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="ALL">அனைத்து நிலைகள் (All Status)</option>
                  <option value="pending">நிலுவையில் உள்ளது</option>
                  <option value="under_review">ஆய்வில் உள்ளது</option>
                  <option value="approved">ஒப்புதல் அளிக்கப்பட்டது</option>
                  <option value="returned">திருப்பி அனுப்பப்பட்டது</option>
                  <option value="rejected">நிராகரிக்கப்பட்டது</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <select
                  value={filters.priority}
                  onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="ALL">அனைத்து முன்னுரிமை (All Priorities)</option>
                  <option value="high">உயர் முன்னுரிமை</option>
                  <option value="medium">நடுத்தர முன்னுரிமை</option>
                  <option value="low">சாதாரண முன்னுரிமை</option>
                </select>
              </div>
            </div>

            {/* Applications Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-4 py-3">விண்ணப்ப எண்</th>
                    <th className="px-4 py-3">விண்ணப்பதாரர் பெயர்</th>
                    <th className="px-4 py-3">வகை</th>
                    <th className="px-4 py-3">வயது / பாலினம்</th>
                    <th className="px-4 py-3">மாவட்டம் (RTO)</th>
                    <th className="px-4 py-3">சமர்ப்பித்த தேதி</th>
                    <th className="px-4 py-3">முன்னுரிமை</th>
                    <th className="px-4 py-3">AI பரிந்துரை</th>
                    <th className="px-4 py-3">நிலை</th>
                    <th className="px-4 py-3 text-right">நடவடிக்கை</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredApps.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-4 py-12 text-center text-slate-500">
                        <div className="flex flex-col items-center gap-2">
                          <FileText className="w-8 h-8 text-slate-300" />
                          <p className="text-sm font-semibold">தேர்வு செய்த அளவுகோலுக்கு ஏற்ப எந்த விண்ணப்பமும் கிடைக்கவில்லை.</p>
                          <button
                            type="button"
                            onClick={handleResetFilters}
                            className="mt-2 text-xs text-emerald-600 hover:underline font-bold"
                          >
                            அனைத்து வடிகட்டிகளையும் மீட்டமைக்கவும்
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredApps.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-slate-900">
                          {app.applicationNumber}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-800">{app.applicantName}</div>
                          <div className="text-[10px] text-slate-500">{app.phoneNumber}</div>
                        </td>
                        <td className="px-4 py-3">
                          <TypeBadge type={app.applicationType} />
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {app.age} வயது • {app.gender === 'male' ? 'ஆண்' : app.gender === 'female' ? 'பெண்' : 'மற்றவை'}
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          <span className="font-medium">{app.district}</span>
                          <span className="text-[10px] text-slate-400 block">{app.rtoCode.split(' ')[0]}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {app.submittedDate}
                        </td>
                        <td className="px-4 py-3">
                          <PriorityBadge priority={app.priority} />
                        </td>
                        <td className="px-4 py-3">
                          <AiSuggestionBadge suggestion={evaluateApplication(app).suggestion} />
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={app.status} size="sm" />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/applications/${app.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:text-white bg-emerald-50 hover:bg-emerald-600 rounded-md transition-colors"
                          >
                            <span>ஆய்வு செய்</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function ApplicationsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-300">விண்ணப்பங்கள் ஏற்றப்படுகின்றன...</p>
          </div>
        </div>
      }
    >
      <ApplicationsContent />
    </Suspense>
  );
}

