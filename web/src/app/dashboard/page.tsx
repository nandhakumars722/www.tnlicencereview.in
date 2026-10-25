'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldAlert,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  RotateCcw,
  Eye,
  SlidersHorizontal,
  ChevronRight,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Filters state
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    applicationType: 'ALL',
    status: 'ALL',
    district: 'ALL',
    priority: 'ALL',
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

  if (!session || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-300">முகப்புப் பலகை ஏற்றப்படுகிறது...</p>
        </div>
      </div>
    );
  }

  // Filtered applications for the table
  const filteredApps = filterApplications(applications, filters);

  // High priority review queue (applications needing immediate attention: high priority + pending/under_review)
  const priorityQueue = applications
    .filter(
      (a) =>
        (a.status === 'pending' || a.status === 'under_review') &&
        (a.priority === 'high' || (a.riskFlags && a.riskFlags.length > 0))
    )
    .slice(0, 5);

  // Recent applications (latest submitted)
  const recentApplications = [...applications]
    .sort((a, b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime())
    .slice(0, 6);

  // Unique districts for filter dropdown
  const districts = Array.from(new Set(applications.map((a) => a.district))).sort();

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
          {/* Welcome Banner */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {session.officer.rtoOffice}
                </span>
                <span className="text-xs text-slate-500">• மாவட்டம்: {session.officer.district}</span>
              </div>
              <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 mt-1">
                வணக்கம், {session.officer.name}
              </h1>
              <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                ஓட்டுநர் உரிம விண்ணப்பங்களை ஆய்வு செய்து முடிவெடுக்க உங்கள் பணிப்பலகை தயார் நிலையில் உள்ளது.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/applications?status=pending"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs md:text-sm font-bold shadow-xs transition-colors"
              >
                <Clock className="w-4 h-4" />
                <span>நிலுவை விண்ணப்பங்களை ஆய்வு செய் ({stats.pending})</span>
              </Link>
            </div>
          </div>

          {/* Metrics Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Applications */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold text-slate-600">மொத்த விண்ணப்பங்கள்</span>
                <div className="p-2 rounded-lg bg-slate-100 text-slate-700">
                  <FileText className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-2">
                {stats.total}
              </div>
              <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                <span>கணினி பதிவேட்டில் உள்ளவை</span>
              </div>
            </div>

            {/* Pending Applications */}
            <div className="bg-white rounded-xl p-5 border border-amber-200 shadow-xs bg-gradient-to-br from-white to-amber-50/30">
              <div className="flex items-center justify-between text-amber-700">
                <span className="text-xs font-bold text-amber-800">நிலுவையில் உள்ளவை</span>
                <div className="p-2 rounded-lg bg-amber-100 text-amber-800">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl md:text-3xl font-extrabold text-amber-900 mt-2">
                {stats.pending}
              </div>
              <div className="text-[11px] text-amber-700 mt-1 flex items-center gap-1">
                <span className="font-semibold">{stats.underReview}</span> ஆய்வில் உள்ளன
              </div>
            </div>

            {/* High Priority & Immediate Attention */}
            <div className="bg-white rounded-xl p-5 border border-rose-200 shadow-xs bg-gradient-to-br from-white to-rose-50/30">
              <div className="flex items-center justify-between text-rose-700">
                <span className="text-xs font-bold text-rose-800">உடனடி கவனம் தேவை</span>
                <div className="p-2 rounded-lg bg-rose-100 text-rose-800">
                  <ShieldAlert className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl md:text-3xl font-extrabold text-rose-900 mt-2">
                {stats.requiresAttention}
              </div>
              <div className="text-[11px] text-rose-700 mt-1">
                உயர் முன்னுரிமை மற்றும் இடர் கொடிகள்
              </div>
            </div>

            {/* Completed Decisions: Approved & Returned */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold text-slate-600">முடிவு எடுக்கப்பட்டவை</span>
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl md:text-3xl font-extrabold text-emerald-700">
                  {stats.approved}
                </span>
                <span className="text-xs font-semibold text-slate-500">ஒப்புதல்</span>
                <span className="text-slate-300">|</span>
                <span className="text-base font-bold text-orange-600">
                  {stats.returned}
                </span>
                <span className="text-xs font-semibold text-slate-500">திருப்பி</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                நிராகரிக்கப்பட்டவை: <span className="font-semibold text-rose-600">{stats.rejected}</span>
              </div>
            </div>
          </div>

          {/* Quick Priority Queue Banner & Application Status Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Priority Review Queue */}
            <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-rose-100 text-rose-700">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">
                      முக்கியத்துவ அடிப்படையிலான ஆய்வு வரிசை
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      உடனடி ஆய்வு மற்றும் முடிவு எடுக்க வேண்டிய விண்ணப்பங்கள்
                    </p>
                  </div>
                </div>

                <Link
                  href="/applications?priority=high"
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                >
                  <span>அனைத்தும் ({stats.highPriority})</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {priorityQueue.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-xs">
                  உயர் முன்னுரிமை நிலுவை விண்ணப்பங்கள் எதுவும் இல்லை.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {priorityQueue.map((item) => {
                    const ai = evaluateApplication(item);
                    return (
                      <div
                        key={item.id}
                        className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50 px-2 rounded-lg transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-bold text-xs text-slate-900">
                              {item.applicationNumber}
                            </span>
                            <TypeBadge type={item.applicationType} />
                            <PriorityBadge priority={item.priority} />
                            <AiSuggestionBadge suggestion={ai.suggestion} size="sm" />
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-600">
                            <span className="font-bold text-slate-800">{item.applicantName}</span>
                            <span>•</span>
                            <span>{item.district} ({item.rtoCode.split(' ')[0]})</span>
                            <span>•</span>
                            <span>சமர்ப்பித்த தேதி: {item.submittedDate}</span>
                          </div>
                          {item.riskFlags && item.riskFlags.length > 0 && (
                            <div className="flex items-center gap-1.5 text-[11px] text-rose-700 font-medium">
                              <AlertTriangle className="w-3 h-3 shrink-0" />
                              <span>{item.riskFlags.join(', ')}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <StatusBadge status={item.status} size="sm" />
                          <Link
                            href={`/applications/${item.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>ஆய்வு செய்</span>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Status Distribution Summary Card */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <h2 className="text-sm font-bold text-slate-900">
                    விண்ணப்ப நிலை பரவல் (Status Breakdown)
                  </h2>
                </div>

                <div className="space-y-3">
                  {/* Pending */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-amber-800">நிலுவையில் (Pending)</span>
                      <span className="font-bold text-slate-800">{stats.pending} ({Math.round((stats.pending / stats.total) * 100)}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: `${(stats.pending / stats.total) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Under Review */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-blue-800">ஆய்வில் (Under Review)</span>
                      <span className="font-bold text-slate-800">{stats.underReview} ({Math.round((stats.underReview / stats.total) * 100)}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${(stats.underReview / stats.total) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Approved */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-emerald-800">ஒப்புதல் (Approved)</span>
                      <span className="font-bold text-slate-800">{stats.approved} ({Math.round((stats.approved / stats.total) * 100)}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${(stats.approved / stats.total) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Returned */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-orange-800">திருப்பி அனுப்பப்பட்டது (Returned)</span>
                      <span className="font-bold text-slate-800">{stats.returned} ({Math.round((stats.returned / stats.total) * 100)}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-500 rounded-full"
                        style={{ width: `${(stats.returned / stats.total) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Rejected */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-rose-800">நிராகரிக்கப்பட்டது (Rejected)</span>
                      <span className="font-bold text-slate-800">{stats.rejected} ({Math.round((stats.rejected / stats.total) * 100)}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-rose-500 rounded-full"
                        style={{ width: `${(stats.rejected / stats.total) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4 text-[11px] text-slate-500">
                உலாவியின் localStorage-ல் தற்போதைய தகவல்கள் புதுப்பிக்கப்பட்டுள்ளன.
              </div>
            </div>
          </div>

          {/* Quick Search and Filter Bar */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  விண்ணப்பங்கள் தேடல் மற்றும் வடிகட்டி
                </h2>
                <p className="text-[11px] text-slate-500">
                  எண், பெயர், விண்ணப்ப வகை, மாவட்டம் அல்லது முன்னுரிமை அடிப்படையில் வடிகட்டவும்
                </p>
              </div>

              <div className="text-xs font-semibold text-slate-600">
                பொருந்திய விண்ணப்பங்கள்: <span className="font-bold text-emerald-700">{filteredApps.length}</span> / {applications.length}
              </div>
            </div>

            {/* Filter Inputs Grid */}
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
                  placeholder="விண்ணப்ப எண் அல்லது பெயர் மூலம் தேடவும்..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              {/* Application Type */}
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

              {/* District */}
              <div>
                <select
                  value={filters.district}
                  onChange={(e) => setFilters({ ...filters, district: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="ALL">அனைத்து மாவட்டங்கள் (Districts)</option>
                  {districts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Application Data Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-4 py-3">விண்ணப்ப எண்</th>
                    <th className="px-4 py-3">விண்ணப்பதாரர் பெயர்</th>
                    <th className="px-4 py-3">வகை</th>
                    <th className="px-4 py-3">மாவட்டம்</th>
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
                      <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
                        தேடல் அளவுகோலுக்கு ஏற்ப விண்ணப்பங்கள் எதுவும் இல்லை.
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
                        <td className="px-4 py-3 text-slate-700 font-medium">
                          {app.district}
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
                            <span>விவரங்கள்</span>
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

