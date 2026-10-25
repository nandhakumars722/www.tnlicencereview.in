import React from 'react';
import { PriorityLevel } from '../lib/types';
import { ShieldAlert, ArrowUpRight, Minus } from 'lucide-react';

interface PriorityBadgeProps {
  priority: PriorityLevel;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  switch (priority) {
    case 'high':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-300 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800">
          <ShieldAlert className="w-3 h-3 text-red-600 dark:text-red-400" />
          உயர் முன்னுரிமை
        </span>
      );
    case 'medium':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800">
          <ArrowUpRight className="w-3 h-3 text-amber-600 dark:text-amber-400" />
          நடுத்தர முன்னுரிமை
        </span>
      );
    case 'low':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-normal px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
          <Minus className="w-3 h-3 text-slate-500" />
          சாதாரண முன்னுரிமை
        </span>
      );
    default:
      return null;
  }
}

