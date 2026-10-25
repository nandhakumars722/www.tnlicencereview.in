'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentSession } from '../../../lib/auth';
import { getApplicationById, saveApplicationDecision, getDashboardStats, getApplications } from '../../../lib/storage';
import { evaluateApplication } from '../../../lib/review-rules';
import { Application, AuthSession, OfficerDecision } from '../../../lib/types';
import { Navbar } from '../../../components/Navbar';
import { Sidebar } from '../../../components/Sidebar';
import { StatusBadge } from '../../../components/StatusBadge';
import { PriorityBadge } from '../../../components/PriorityBadge';
import { TypeBadge } from '../../../components/TypeBadge';
import { AiReviewPanel } from '../../../components/AiReviewPanel';
import { DecisionModal } from '../../../components/DecisionModal';
import {
  ArrowLeft,
  User,
  Calendar,
  Phone,
  Mail,
  MapPin,
  FileCheck,
  AlertCircle,
  Clock,
  History,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  FileText,
  BadgeAlert,
} from 'lucide-react';

interface ApplicationDetailClientProps {
  applicationId: string;
}

export function ApplicationDetailClient({ applicationId }: ApplicationDetailClientProps) {
  const router = useRouter();

  const [session, setSession] = useState<AuthSession | null>(null);
  const [application, setApplication] = useState<Application | null>(null);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [highPriorityCount, setHighPriorityCount] = useState<number>(0);
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string>('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const loadData = () => {
    const currentSession = getCurrentSession();
    if (!currentSession) {
      router.replace('/login');
      return;
    }
    setSession(currentSession);

    const app = getApplicationById(applicationId);
    if (!app) {
      return;
    }
    setApplication(app);

    const allApps = getApplications();
    const stats = getDashboardStats(allApps);
    setPendingCount(stats.pending);
    setHighPriorityCount(stats.highPriority);
  };

  useEffect(() => {
    loadData();
  }, [applicationId, router]);

  if (!session || !application) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-300">விண்ணப்ப விவரங்கள் ஏற்றப்படுகின்றன...</p>
        </div>
      </div>
    );
  }

  // Evaluate application using the deterministic rule-based AI engine
  const aiEvaluation = evaluateApplication(application);

  const handleFinalizeDecision = (decision: OfficerDecision) => {
    const res = saveApplicationDecision(application.id, decision);
    if (res.success && res.application) {
      setApplication(res.application);
      setIsDecisionModalOpen(false);

      const actionName =
        decision.action === 'approved'
          ? 'ஒப்புதல் அளிக்கப்பட்டது'
          : decision.action === 'returned'
          ? 'திருத்தத்திற்கு திருப்பி அனுப்பப்பட்டது'
          : 'நிராகரிக்கப்பட்டது';

      setSuccessToast(`விண்ணப்பம் வெற்றிகரமாக புதுப்பிக்கப்பட்டது: ${actionName}.`);

      // Refresh sidebar counts
      const stats = getDashboardStats();
      setPendingCount(stats.pending);
      setHighPriorityCount(stats.highPriority);

      // Auto-hide toast after 6 seconds
      setTimeout(() => {
        setSuccessToast('');
      }, 6000);
    } else {
      alert(res.error || 'முடிவை சேமிப்பதில் பிழை ஏற்பட்டது.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900">
      <Navbar
        session={session}
        onDataReset={loadData}
        toggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      />

      <div className="flex-1 flex">
        <Sidebar
          pendingCount={pendingCount}
          highPriorityCount={highPriorityCount}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Breadcrumb & Navigation */}
          <div className="flex items-center justify-between">
            <Link
              href="/applications"
              className="inline-flex items-center gap-1.5 text-xs md:text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>விண்ணப்பங்கள் பட்டியலுக்குத் திரும்பு</span>
            </Link>

            <div className="flex items-center gap-2">
              <PriorityBadge priority={application.priority} />
              <StatusBadge status={application.status} size="md" />
            </div>
          </div>

          {/* Success Notification Banner */}
          {successToast && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-sm font-semibold flex items-center justify-between shadow-xs animate-in fade-in duration-300">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{successToast}</span>
              </div>
              <button
                type="button"
                onClick={() => setSuccessToast('')}
                className="text-emerald-700 hover:text-emerald-900 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Top Title Banner */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {application.applicationNumber}
                </span>
                <TypeBadge type={application.applicationType} />
                <span className="text-xs text-slate-500">
                  சமர்ப்பித்த தேதி: <strong className="text-slate-800">{application.submittedDate}</strong>
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-extrabold text-slate-900">
                {application.applicantName}
                {application.applicantNameEn && (
                  <span className="text-sm font-normal text-slate-500 ml-2">
                    ({application.applicantNameEn})
                  </span>
                )}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                RTO அலுவலகம்: <span className="font-semibold text-slate-700">{application.rtoCode}</span>
                {application.lastUpdated && (
                  <span className="ml-3">
                    கடைசி புதுப்பிப்பு: <strong className="text-slate-700">{application.lastUpdated}</strong>
                  </span>
                )}
              </p>
            </div>

            {/* Officer Decision Trigger */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsDecisionModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs md:text-sm shadow-sm transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-4.5 h-4.5" />
                <span>அலுவலர் முடிவை மாற்றுக</span>
              </button>
            </div>
          </div>

          {/* Main 2-Column Content Layout: Left = Details, Right = AI Review & History */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column (2 Cols): Details, Documents, Eligibility */}
            <div className="lg:col-span-2 space-y-6">
              {/* Applicant Personal & Vehicle Info */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <User className="w-4.5 h-4.5 text-emerald-600" />
                  <h2 className="text-sm font-bold text-slate-900">
                    விண்ணப்பதாரர் தனிநபர் விவரங்கள்
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 block">முழுப் பெயர்:</span>
                    <span className="font-bold text-slate-800 text-sm mt-0.5 block">{application.applicantName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">வயது / பாலினம்:</span>
                    <span className="font-semibold text-slate-800 mt-0.5 block">
                      {application.age} வயது ({application.gender === 'male' ? 'ஆண்' : application.gender === 'female' ? 'பெண்' : 'மற்றவை'})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">பிறந்த தேதி:</span>
                    <span className="font-semibold text-slate-800 mt-0.5 block">{application.dob}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">தொடர்பு அலைபேசி:</span>
                    <span className="font-semibold text-slate-800 mt-0.5 block">{application.phoneNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">மின்னஞ்சல்:</span>
                    <span className="font-semibold text-slate-800 mt-0.5 block truncate">{application.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">கோரப்பட்ட வாகனப் பிரிவு:</span>
                    <div className="flex items-center gap-1 mt-0.5">
                      {application.vehicleClass.map((vc) => (
                        <span key={vc} className="px-2 py-0.5 rounded font-mono font-bold bg-slate-100 text-slate-800 text-[11px]">
                          {vc}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="sm:col-span-2 md:col-span-3 pt-1">
                    <span className="text-slate-500 block">நிரந்தர முகவரி:</span>
                    <span className="font-medium text-slate-800 mt-0.5 block">{application.address}</span>
                  </div>
                </div>
              </div>

              {/* Document Checklist & Verification */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4.5 h-4.5 text-emerald-600" />
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">
                        சமர்ப்பிக்கப்பட்ட ஆவணங்கள் சரிபார்ப்பு பட்டியல்
                      </h2>
                      <p className="text-[11px] text-slate-500">
                        மோட்டார் வாகன விதிமுறைகளின்படி ஆவணங்களின் உண்மைத்தன்மை
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-600">
                    {application.documents.filter((d) => d.status === 'verified').length} / {application.documents.length} சரிபார்க்கப்பட்டது
                  </span>
                </div>

                <div className="divide-y divide-slate-100">
                  {application.documents.map((doc) => (
                    <div key={doc.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">{doc.name}</span>
                          {doc.fileNumber && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                              {doc.fileNumber}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          பதிவேற்ற தேதி: {doc.uploadedAt}
                          {doc.notes && (
                            <span className="text-amber-800 font-medium ml-2">
                              • குறிப்பு: {doc.notes}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0">
                        {doc.status === 'verified' ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            சரிபார்க்கப்பட்டது
                          </span>
                        ) : doc.status === 'missing' ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                            விடுபட்டுள்ளது
                          </span>
                        ) : doc.status === 'rejected' ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            நிராகரிக்கப்பட்டது
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                            <Clock className="w-3.5 h-3.5 text-blue-600" />
                            ஆய்வில் உள்ளது
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Eligibility Checklist */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <ShieldCheck className="w-4.5 h-4.5 text-emerald-600" />
                  <h2 className="text-sm font-bold text-slate-900">
                    சட்டப்பூர்வ தகுதிச் சரிபார்ப்புகள் (Eligibility Verification)
                  </h2>
                </div>

                <div className="space-y-2.5">
                  {application.eligibilityChecks.map((chk) => (
                    <div
                      key={chk.id}
                      className={`p-3 rounded-lg border text-xs flex items-start justify-between gap-3 ${
                        chk.passed
                          ? 'bg-emerald-50/40 border-emerald-200 text-emerald-950'
                          : 'bg-rose-50/50 border-rose-200 text-rose-950'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold flex items-center gap-2">
                          {chk.passed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                          )}
                          <span>{chk.label}</span>
                        </div>
                        {chk.notes && (
                          <p className="text-[11px] opacity-80 pl-6">
                            குறிப்பு: {chk.notes}
                          </p>
                        )}
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${
                          chk.passed
                            ? 'bg-emerald-200/80 text-emerald-800'
                            : 'bg-rose-200/80 text-rose-800'
                        }`}
                      >
                        {chk.passed ? 'தேர்ச்சி' : 'தோல்வி / தேவை'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Officer Notes if present */}
              {application.reviewNotes && (
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-2">
                  <span className="text-xs font-bold text-slate-700 block">
                    அலுவலர் உள் குறிப்புகள் (Officer Notes):
                  </span>
                  <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed italic">
                    &ldquo;{application.reviewNotes}&rdquo;
                  </p>
                </div>
              )}
            </div>

            {/* Right Column (1 Col): AI Review Assistant & Decision History */}
            <div className="space-y-6">
              {/* AI Review Assistant Panel */}
              <AiReviewPanel
                evaluation={aiEvaluation}
                onOpenDecision={() => setIsDecisionModalOpen(true)}
              />

              {/* Review History Timeline */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <History className="w-4 h-4 text-emerald-600" />
                  <h2 className="text-sm font-bold text-slate-900">
                    மறுஆய்வு வரலாற்றுப் பதிவு (Review History)
                  </h2>
                </div>

                <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {application.history.map((hist, idx) => (
                    <div key={hist.id || idx} className="relative text-xs space-y-1">
                      <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-emerald-600 ring-4 ring-white" />
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{hist.decisionText}</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {hist.timestamp} • {hist.officerName} ({hist.officerRole})
                      </div>
                      {hist.reason && (
                        <div className="p-2 rounded bg-amber-50 text-amber-900 border border-amber-200 text-[11px] mt-1 font-medium">
                          <strong>காரணம்:</strong> {hist.reason}
                        </div>
                      )}
                      {hist.notes && (
                        <p className="text-[11px] text-slate-600 italic mt-0.5">
                          குறிப்பு: {hist.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Decision Workflow Confirmation Modal */}
      <DecisionModal
        isOpen={isDecisionModalOpen}
        onClose={() => setIsDecisionModalOpen(false)}
        applicationNumber={application.applicationNumber}
        applicantName={application.applicantName}
        currentOfficer={{
          id: session.officer.id,
          name: session.officer.name,
        }}
        onFinalizeDecision={handleFinalizeDecision}
      />
    </div>
  );
}

