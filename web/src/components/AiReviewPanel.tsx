import React from 'react';
import { AIReviewOutput } from '../lib/types';
import { Sparkles, AlertTriangle, CheckCircle, HelpCircle, XCircle, ArrowRight, ShieldCheck, FileWarning, Lightbulb, Info } from 'lucide-react';

interface AiReviewPanelProps {
  evaluation: AIReviewOutput;
  onOpenDecision: () => void;
}

export function AiReviewPanel({ evaluation, onOpenDecision }: AiReviewPanelProps) {
  const getBadgeStyle = () => {
    switch (evaluation.suggestion) {
      case 'approve':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200',
          badgeText: 'ஒப்புதல் அளிக்க பரிந்துரைக்கப்படுகிறது (Recommend Approval)',
          icon: <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />,
        };
      case 'return':
        return {
          bg: 'bg-orange-50 dark:bg-orange-950/40 border-orange-300 dark:border-orange-700 text-orange-900 dark:text-orange-200',
          badgeText: 'திருத்தத்திற்கு திருப்பி அனுப்ப பரிந்துரைக்கப்படுகிறது (Recommend Return)',
          icon: <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400 shrink-0" />,
        };
      case 'reject':
        return {
          bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700 text-rose-900 dark:text-rose-200',
          badgeText: 'நிராகரிக்க பரிந்துரைக்கப்படுகிறது (Recommend Rejection)',
          icon: <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />,
        };
      default:
        return {
          bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 text-blue-900 dark:text-blue-200',
          badgeText: 'அலுவலரின் நேரடி ஆய்வு தேவை (Manual Officer Review)',
          icon: <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />,
        };
    }
  };

  const badge = getBadgeStyle();

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-indigo-950/80 shadow-md overflow-hidden">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-5 py-4 border-b border-indigo-800/50">
        <div className="flex items-start gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0">
            <Sparkles className="w-4 h-4 text-indigo-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold tracking-wide text-white">
                AI தானியங்கி மறுஆய்வு வழிகாட்டி
              </h3>
              <span className="text-[10px] uppercase font-bold bg-indigo-900/80 text-indigo-300 px-2 py-0.2 rounded border border-indigo-700">
                Rule-Engine
              </span>
            </div>
            <p className="text-[11px] text-indigo-200/90 mt-1 font-medium leading-relaxed">
              விதிமுறை அடிப்படையிலான தானியங்கி உதவி — இறுதி முடிவு அலுவலருடையது.
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4 text-xs md:text-sm">
        {/* Preliminary Suggestion Box */}
        <div className={`p-4 rounded-xl border shadow-xs ${badge.bg}`}>
          <div className="flex items-start gap-3">
            {badge.icon}
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                பரிந்துரைக்கப்படும் முதற்கட்ட முடிவு (Suggested Decision)
              </span>
              <p className="font-extrabold text-sm md:text-base leading-snug">
                {badge.badgeText}
              </p>
            </div>
          </div>
        </div>

        {/* Short Summary (விண்ணப்பச் சுருக்கம்) */}
        <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-800 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-bold text-xs">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>விண்ணப்பச் சுருக்கம் (Summary):</span>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed pl-5 font-medium">
            {evaluation.summary}
          </p>
        </div>

        {/* Missing Documents Alert (விடுபட்ட ஆவணங்கள்) */}
        {evaluation.missingDocuments.length > 0 && (
          <div className="p-3.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800">
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold mb-1.5">
              <FileWarning className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>விடுபட்ட / சமர்ப்பிக்கப்படாத ஆவணங்கள் (Missing Documents):</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-xs text-amber-950 dark:text-amber-300 pl-1 font-medium">
              {evaluation.missingDocuments.map((doc, idx) => (
                <li key={idx}>{doc}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Inconsistencies & Warnings (கவனிக்க வேண்டியவை / முரண்பாடுகள்) */}
        {evaluation.inconsistencies.length > 0 && (
          <div className="p-3.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800">
            <div className="flex items-center gap-2 text-rose-900 dark:text-rose-200 font-bold mb-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>கவனிக்க வேண்டிய தகுதி மற்றும் தரவு முரண்பாடுகள் (Inconsistencies):</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-xs text-rose-950 dark:text-rose-300 pl-1 font-medium">
              {evaluation.inconsistencies.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Reasons Supporting Suggestion (பரிந்துரைக்கான காரணங்கள்) */}
        <div className="space-y-1.5">
          <span className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-indigo-600" />
            <span>பரிந்துரைக்கான சட்டப்பூர்வ காரணங்கள் (Reasons):</span>
          </span>
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1.5">
            {evaluation.reasons.map((r, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                <span className="text-indigo-600 dark:text-indigo-400 font-bold mt-0.5">•</span>
                <span className="leading-relaxed">{r}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Next Steps (பரிந்துரைக்கப்படும் அடுத்த கட்ட நடவடிக்கைகள்) */}
        <div className="space-y-1.5">
          <span className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
            <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
            <span>பரிந்துரைக்கப்படும் அடுத்த கட்ட நடவடிக்கைகள் (Next Steps):</span>
          </span>
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1.5">
            {evaluation.nextSteps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">→</span>
                <span className="leading-relaxed">{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Manual Officer Decision CTA */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onOpenDecision}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-4.5 h-4.5" />
            <span>அலுவலர் முடிவை பதிவு செய் (Approve / Return / Reject)</span>
          </button>
          <p className="text-[10px] text-center text-slate-500 mt-2">
            * AI வழிகாட்டி தானாக முடிவெடுக்காது; அலுவலரின் உறுதிப்படுத்தலுக்கு பிறகே இறுதி முடிவு அமலுக்கு வரும்.
          </p>
        </div>
      </div>
    </div>
  );
}
