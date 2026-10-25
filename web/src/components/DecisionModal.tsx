import React, { useState } from 'react';
import { OfficerDecision } from '../lib/types';
import { CheckCircle2, XCircle, AlertTriangle, Send, AlertOctagon } from 'lucide-react';

interface DecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationNumber: string;
  applicantName: string;
  currentOfficer: {
    id: string;
    name: string;
  };
  onFinalizeDecision: (decision: OfficerDecision) => void;
}

export function DecisionModal({
  isOpen,
  onClose,
  applicationNumber,
  applicantName,
  currentOfficer,
  onFinalizeDecision,
}: DecisionModalProps) {
  const [selectedAction, setSelectedAction] = useState<'approved' | 'rejected' | 'returned'>('approved');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [validationError, setValidationError] = useState('');

  if (!isOpen) return null;

  const handleProceedToConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if ((selectedAction === 'rejected' || selectedAction === 'returned') && !reason.trim()) {
      setValidationError(
        selectedAction === 'rejected'
          ? 'நிராகரிப்பிற்கான காரணத்தை உள்ளிடுவது கட்டாயமாகும்.'
          : 'திருத்தத்திற்கு திருப்பி அனுப்புவதற்கான காரணத்தை உள்ளிடுவது கட்டாயமாகும்.'
      );
      return;
    }

    setIsConfirming(true);
  };

  const handleFinalSubmit = () => {
    onFinalizeDecision({
      action: selectedAction,
      reason: reason.trim(),
      notes: notes.trim(),
      officerId: currentOfficer.id,
      officerName: currentOfficer.name,
    });
    // Reset state
    setIsConfirming(false);
    setReason('');
    setNotes('');
  };

  const getActionTitle = () => {
    switch (selectedAction) {
      case 'approved':
        return 'ஒப்புதல் அளித்தல் (Approve)';
      case 'rejected':
        return 'நிராகரித்தல் (Reject)';
      case 'returned':
        return 'திருத்தத்திற்கு திருப்பி அனுப்புதல் (Return for Corrections)';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">அலுவலர் இறுதி முடிவு</span>
            <h3 className="text-base md:text-lg font-bold text-white mt-0.5">
              {applicationNumber} — {applicantName}
            </h3>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="text-slate-400 hover:text-white text-xl p-1 rounded-md"
          >
            ✕
          </button>
        </div>

        {!isConfirming ? (
          /* Step 1: Decision Input Form */
          <form onSubmit={handleProceedToConfirm} className="p-6 space-y-5">
            {/* Action Selection Tabs */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                முடிவு நடவடிக்கை (Action) <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAction('approved');
                    setValidationError('');
                  }}
                  className={`flex flex-col items-center justify-center py-3 px-2 rounded-lg border text-xs md:text-sm font-semibold transition-all cursor-pointer ${
                    selectedAction === 'approved'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 dark:bg-emerald-950/50 dark:border-emerald-600 dark:text-emerald-200 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <CheckCircle2 className={`w-5 h-5 mb-1 ${selectedAction === 'approved' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                  ஒப்புதல்
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedAction('returned');
                    setValidationError('');
                  }}
                  className={`flex flex-col items-center justify-center py-3 px-2 rounded-lg border text-xs md:text-sm font-semibold transition-all cursor-pointer ${
                    selectedAction === 'returned'
                      ? 'bg-orange-50 border-orange-500 text-orange-800 dark:bg-orange-950/50 dark:border-orange-600 dark:text-orange-200 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <AlertTriangle className={`w-5 h-5 mb-1 ${selectedAction === 'returned' ? 'text-orange-600 dark:text-orange-400' : 'text-slate-400'}`} />
                  திருப்பி அனுப்பு
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedAction('rejected');
                    setValidationError('');
                  }}
                  className={`flex flex-col items-center justify-center py-3 px-2 rounded-lg border text-xs md:text-sm font-semibold transition-all cursor-pointer ${
                    selectedAction === 'rejected'
                      ? 'bg-rose-50 border-rose-500 text-rose-800 dark:bg-rose-950/50 dark:border-rose-600 dark:text-rose-200 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <XCircle className={`w-5 h-5 mb-1 ${selectedAction === 'rejected' ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'}`} />
                  நிராகரி
                </button>
              </div>
            </div>

            {/* Reason Field (Mandatory for rejected / returned) */}
            {(selectedAction === 'rejected' || selectedAction === 'returned') && (
              <div className="space-y-1.5 animate-in fade-in duration-200">
                <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {selectedAction === 'rejected' ? 'நிராகரிப்புக்கான காரணம்' : 'திருப்பி அனுப்புவதற்கான காரணம்'}
                  <span className="text-rose-500 ml-1 font-bold">* கட்டாயமானது</span>
                </label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value);
                    if (validationError) setValidationError('');
                  }}
                  placeholder={
                    selectedAction === 'rejected'
                      ? 'எ.கா: மருத்துவ பரிசோதனை தோல்வி அல்லது சட்டப்பூர்வ வயது வரம்பு பூர்த்தி செய்யப்படவில்லை...'
                      : 'எ.கா: முகவரிச் சான்றில் முத்திரை இல்லை அல்லது படிவம் 1A விடுபட்டுள்ளது...'
                  }
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>
            )}

            {/* Optional Notes */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
                அலுவலர் உள் குறிப்புகள் (விருப்பத்தேர்வு)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="பதிவேட்டிற்கான கூடுதல் குறிப்புகள்..."
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>

            {/* Error Message */}
            {validationError && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 shrink-0" />
                {validationError}
              </div>
            )}

            {/* Footer Buttons */}
            <div className="pt-2 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg cursor-pointer"
              >
                ரத்து
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm cursor-pointer transition-colors"
              >
                தொடரவும் →
              </button>
            </div>
          </form>
        ) : (
          /* Step 2: Final Confirmation Screen */
          <div className="p-6 space-y-5 animate-in fade-in duration-200">
            <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700">
              <h4 className="text-sm font-bold text-amber-900 dark:text-amber-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                இறுதி முடிவை உறுதிப்படுத்தவும்
              </h4>
              <p className="text-xs text-amber-800 dark:text-amber-400 mt-1 leading-relaxed">
                இந்த முடிவு அதிகாரப்பூர்வமாக பதிவு செய்யப்படும் மற்றும் விண்ணப்ப வரலாறு புதுப்பிக்கப்படும்.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-lg space-y-2 text-xs md:text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">நடவடிக்கை:</span>
                <span className="font-bold text-slate-900 dark:text-white">{getActionTitle()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">மதிப்பீட்டாளர்:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{currentOfficer.name}</span>
              </div>
              {reason && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400 block mb-1">காரணம்:</span>
                  <p className="text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-700">
                    {reason}
                  </p>
                </div>
              )}
              {notes && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400 block mb-1">அலுவலர் குறிப்பு:</span>
                  <p className="text-slate-700 dark:text-slate-300 italic">{notes}</p>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsConfirming(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                ← மாற்றவும்
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                className={`inline-flex items-center gap-2 px-5 py-2 text-sm font-bold text-white rounded-lg shadow-sm transition-colors cursor-pointer ${
                  selectedAction === 'approved'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : selectedAction === 'returned'
                    ? 'bg-orange-600 hover:bg-orange-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                <Send className="w-4 h-4" />
                முடிவை உறுதி செய்
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

