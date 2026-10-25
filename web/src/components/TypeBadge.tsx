import React from 'react';
import { ApplicationType } from '../lib/types';
import { FileText, Award, RefreshCw } from 'lucide-react';

interface TypeBadgeProps {
  type: ApplicationType;
}

export function TypeBadge({ type }: TypeBadgeProps) {
  switch (type) {
    case 'LL':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded bg-indigo-50 text-indigo-800 border border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800">
          <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          பழகுநர் உரிமம் (LL)
        </span>
      );
    case 'DL':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
          <Award className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          ஓட்டுநர் உரிமம் (DL)
        </span>
      );
    case 'RENEWAL':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded bg-purple-50 text-purple-800 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800">
          <RefreshCw className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
          உரிமம் புதுப்பித்தல் (Renewal)
        </span>
      );
    default:
      return null;
  }
}

