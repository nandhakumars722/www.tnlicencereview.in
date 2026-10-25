import React from 'react';
import { ApplicationStatus } from '../lib/types';
import { Clock, CheckCircle2, AlertTriangle, XCircle, Search } from 'lucide-react';

interface StatusBadgeProps {
  status: ApplicationStatus;
  size?: 'sm' | 'md' | 'lg';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs md:text-sm px-2.5 py-1 gap-1.5',
    lg: 'text-sm md:text-base px-3 py-1.5 gap-2',
  }[size];

  switch (status) {
    case 'pending':
      return (
        <span className={`inline-flex items-center font-medium rounded-full bg-amber-50 text-amber-800 border border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-700 ${sizeClasses}`}>
          <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          நிலுவையில் உள்ளது
        </span>
      );
    case 'under_review':
      return (
        <span className={`inline-flex items-center font-medium rounded-full bg-blue-50 text-blue-800 border border-blue-300 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-700 ${sizeClasses}`}>
          <Search className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          ஆய்வில் உள்ளது
        </span>
      );
    case 'approved':
      return (
        <span className={`inline-flex items-center font-medium rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-700 ${sizeClasses}`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          ஒப்புதல் அளிக்கப்பட்டது
        </span>
      );
    case 'returned':
      return (
        <span className={`inline-flex items-center font-medium rounded-full bg-orange-50 text-orange-800 border border-orange-300 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-700 ${sizeClasses}`}>
          <AlertTriangle className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
          திருப்பி அனுப்பப்பட்டது
        </span>
      );
    case 'rejected':
      return (
        <span className={`inline-flex items-center font-medium rounded-full bg-rose-50 text-rose-800 border border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-700 ${sizeClasses}`}>
          <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
          நிராகரிக்கப்பட்டது
        </span>
      );
    default:
      return null;
  }
}

