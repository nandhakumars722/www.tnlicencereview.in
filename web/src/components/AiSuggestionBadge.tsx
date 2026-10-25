import React from 'react';
import { Sparkles, CheckCircle, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';

interface AiSuggestionBadgeProps {
  suggestion: 'approve' | 'return' | 'reject' | 'manual_review';
  size?: 'sm' | 'md';
}

export function AiSuggestionBadge({ suggestion, size = 'sm' }: AiSuggestionBadgeProps) {
  const sizeClasses = size === 'sm' ? 'text-[11px] px-2 py-0.5 gap-1' : 'text-xs px-2.5 py-1 gap-1.5';

  switch (suggestion) {
    case 'approve':
      return (
        <span
          title="AI பரிந்துரை: ஒப்புதல் அளிக்கலாம்"
          className={`inline-flex items-center font-bold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 ${sizeClasses}`}
        >
          <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          <span>AI: ஒப்புதல்</span>
        </span>
      );
    case 'return':
      return (
        <span
          title="AI பரிந்துரை: கூடுதல் ஆவணம் / திருத்தம் கோரலாம்"
          className={`inline-flex items-center font-bold rounded-full bg-orange-50 text-orange-800 border border-orange-300 dark:bg-orange-950/40 dark:text-orange-300 ${sizeClasses}`}
        >
          <AlertTriangle className="w-3 h-3 text-orange-600 dark:text-orange-400" />
          <span>AI: திருப்பி அனுப்பு</span>
        </span>
      );
    case 'reject':
      return (
        <span
          title="AI பரிந்துரை: சட்ட விதிகளின்படி நிராகரிக்கலாம்"
          className={`inline-flex items-center font-bold rounded-full bg-rose-50 text-rose-800 border border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 ${sizeClasses}`}
        >
          <XCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
          <span>AI: நிராகரி</span>
        </span>
      );
    default:
      return (
        <span
          title="AI பரிந்துரை: அலுவலரின் நேரடி ஆய்வு தேவை"
          className={`inline-flex items-center font-bold rounded-full bg-indigo-50 text-indigo-800 border border-indigo-300 dark:bg-indigo-950/40 dark:text-indigo-300 ${sizeClasses}`}
        >
          <HelpCircle className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
          <span>AI: நேரடி ஆய்வு</span>
        </span>
      );
  }
}

