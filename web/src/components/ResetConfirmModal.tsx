import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface ResetConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ResetConfirmModal({ isOpen, onClose, onConfirm }: ResetConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400 mb-4">
          <div className="p-2.5 rounded-full bg-amber-100 dark:bg-amber-950/60">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            மாதிரித் தரவை மீட்டமைக்கவா?
          </h3>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
          நீங்கள் மேற்கொண்ட அனைத்து மாதிரி முடிவுகளும் (ஒப்புதல், நிராகரிப்பு, திருப்பி அனுப்புதல்) அழிக்கப்பட்டு, தொடக்க நிலை 14 மாதிரி விண்ணப்பங்கள் மீண்டும் ஏற்றப்படும்.
        </p>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            ரத்து செய்
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors shadow-sm cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            ஆம், மீட்டமைக்கவும்
          </button>
        </div>
      </div>
    </div>
  );
}

