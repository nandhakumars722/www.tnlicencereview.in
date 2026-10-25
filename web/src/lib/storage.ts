import { initialApplications } from '../data/initial-applications';
import { Application, DashboardStats, FilterState, OfficerDecision, ReviewHistoryEntry } from './types';

const STORAGE_KEY = 'tn_rto_applications_v1';

/**
 * Loads applications from browser localStorage, seeding from JSON if empty or malformed.
 */
export function getApplications(): Application[] {
  if (typeof window === 'undefined') {
    return initialApplications as Application[];
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // First-time seeding
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialApplications));
      return initialApplications as Application[];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialApplications));
      return initialApplications as Application[];
    }

    return parsed as Application[];
  } catch (err) {
    console.error('Error reading localStorage applications, re-seeding:', err);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialApplications));
    return initialApplications as Application[];
  }
}

/**
 * Retrieves a single application by its stable ID or applicationNumber
 */
export function getApplicationById(idOrAppNum: string): Application | undefined {
  const list = getApplications();
  return list.find(
    (app) => app.id === idOrAppNum || app.applicationNumber.toLowerCase() === idOrAppNum.toLowerCase()
  );
}

/**
 * Persists updated application list to localStorage
 */
function persistApplications(apps: Application[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
  }
}

/**
 * Resets localStorage back to initial fictional applications.json dataset
 */
export function resetToInitialData(): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialApplications));
  }
}

/**
 * Saves an officer's review decision (approve, reject, return) and records history.
 */
export function saveApplicationDecision(
  id: string,
  decision: OfficerDecision
): { success: boolean; application?: Application; error?: string } {
  const apps = getApplications();
  const index = apps.findIndex((a) => a.id === id);

  if (index === -1) {
    return { success: false, error: 'விண்ணப்பம் கண்டறியப்படவில்லை.' };
  }

  const current = apps[index];

  // Validation rules
  if ((decision.action === 'rejected' || decision.action === 'returned') && !decision.reason?.trim()) {
    return {
      success: false,
      error: decision.action === 'rejected'
        ? 'நிராகரிப்பிற்கான காரணத்தை குறிப்பிடுவது கட்டாயமாகும்.'
        : 'திருத்தத்திற்கு திருப்பி அனுப்புவதற்கான காரணத்தை குறிப்பிடுவது கட்டாயமாகும்.',
    };
  }

  const now = new Date();
  const dateFormatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  let decisionTamilText = '';
  if (decision.action === 'approved') {
    decisionTamilText = 'விண்ணப்பத்திற்கு இறுதி ஒப்புதல் அளிக்கப்பட்டது';
  } else if (decision.action === 'rejected') {
    decisionTamilText = 'விண்ணப்பம் நிராகரிக்கப்பட்டது';
  } else if (decision.action === 'returned') {
    decisionTamilText = 'திருத்தத்திற்காக திருப்பி அனுப்பப்பட்டது';
  }

  // Prevent duplicate consecutive entries with identical timestamp/action
  const newHistoryId = `hist-${current.id}-${Date.now()}`;
  const historyEntry: ReviewHistoryEntry = {
    id: newHistoryId,
    timestamp: dateFormatted,
    action: decision.action,
    officerName: decision.officerName || 'அலுவலர்',
    officerRole: 'ஆய்வாளர்',
    decisionText: decisionTamilText,
    reason: decision.reason?.trim() || undefined,
    notes: decision.notes?.trim() || undefined,
  };

  const updatedApp: Application = {
    ...current,
    status: decision.action,
    reviewNotes: decision.notes?.trim() ? decision.notes.trim() : current.reviewNotes,
    lastUpdated: dateFormatted,
    history: [...current.history, historyEntry],
  };

  apps[index] = updatedApp;
  persistApplications(apps);

  return { success: true, application: updatedApp };
}

/**
 * Computes dashboard statistics from current application state
 */
export function getDashboardStats(apps?: Application[]): DashboardStats {
  const list = apps || getApplications();

  return {
    total: list.length,
    pending: list.filter((a) => a.status === 'pending').length,
    underReview: list.filter((a) => a.status === 'under_review').length,
    highPriority: list.filter((a) => a.priority === 'high' && (a.status === 'pending' || a.status === 'under_review')).length,
    approved: list.filter((a) => a.status === 'approved').length,
    returned: list.filter((a) => a.status === 'returned').length,
    rejected: list.filter((a) => a.status === 'rejected').length,
    requiresAttention: list.filter(
      (a) =>
        (a.status === 'pending' || a.status === 'under_review') &&
        (a.priority === 'high' || (a.riskFlags && a.riskFlags.length > 0))
    ).length,
  };
}

/**
 * Filters applications by search query and dropdown criteria
 */
export function filterApplications(apps: Application[], filters: FilterState): Application[] {
  return apps.filter((app) => {
    // Search query: applicationNumber, applicantName, applicantNameEn, district, rtoCode
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      const matchNum = app.applicationNumber.toLowerCase().includes(q);
      const matchName = app.applicantName.toLowerCase().includes(q);
      const matchNameEn = app.applicantNameEn ? app.applicantNameEn.toLowerCase().includes(q) : false;
      const matchDistrict = app.district.toLowerCase().includes(q);
      if (!matchNum && !matchName && !matchNameEn && !matchDistrict) {
        return false;
      }
    }

    // Filter application type
    if (filters.applicationType && filters.applicationType !== 'ALL') {
      if (app.applicationType !== filters.applicationType) {
        return false;
      }
    }

    // Filter status
    if (filters.status && filters.status !== 'ALL') {
      if (app.status !== filters.status) {
        return false;
      }
    }

    // Filter district
    if (filters.district && filters.district !== 'ALL') {
      if (app.district !== filters.district) {
        return false;
      }
    }

    // Filter priority
    if (filters.priority && filters.priority !== 'ALL') {
      if (app.priority !== filters.priority) {
        return false;
      }
    }

    return true;
  });
}

