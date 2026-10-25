export type ApplicationType = 'LL' | 'DL' | 'RENEWAL';

export type ApplicationStatus = 'pending' | 'under_review' | 'returned' | 'approved' | 'rejected';

export type PriorityLevel = 'high' | 'medium' | 'low';

export type DocumentVerificationStatus = 'verified' | 'pending' | 'rejected' | 'missing';

export interface DocumentItem {
  id: string;
  name: string; // Tamil document name (e.g., "ஆதார் அட்டை (முகவரிச் சான்று)")
  category: 'identity' | 'address' | 'age' | 'medical' | 'training' | 'existing_licence';
  fileNumber?: string;
  status: DocumentVerificationStatus;
  uploadedAt: string;
  notes?: string;
}

export interface EligibilityCheckItem {
  id: string;
  label: string; // Tamil check description
  passed: boolean;
  requiresReview: boolean;
  notes?: string;
}

export interface ReviewHistoryEntry {
  id: string;
  timestamp: string;
  action: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'returned' | 'notes_added';
  officerName: string;
  officerRole: string;
  decisionText: string; // Tamil description
  reason?: string;
  notes?: string;
}

export interface Application {
  id: string;
  applicationNumber: string; // e.g., TN-2026-DL-84920
  applicantName: string; // Tamil name
  applicantNameEn?: string; // English transliteration for search/convenience
  applicationType: ApplicationType;
  age: number;
  gender: 'male' | 'female' | 'other';
  dob: string;
  phoneNumber: string;
  email: string;
  district: string; // Tamil Nadu district
  rtoCode: string; // e.g. TN-01, TN-09, TN-38
  address: string;
  submittedDate: string;
  status: ApplicationStatus;
  priority: PriorityLevel;
  vehicleClass: string[]; // e.g., ['MCWG', 'LMV']
  documents: DocumentItem[];
  eligibilityChecks: EligibilityCheckItem[];
  riskFlags: string[]; // Tamil risk warning tags
  reviewNotes?: string;
  history: ReviewHistoryEntry[];
  lastUpdated?: string;
}

export interface AIReviewOutput {
  summary: string;
  suggestion: 'approve' | 'return' | 'reject' | 'manual_review';
  suggestionLabel: string;
  missingDocuments: string[];
  inconsistencies: string[];
  reasons: string[];
  nextSteps: string[];
  confidenceLevel: 'high' | 'medium' | 'requires_human_attention';
}

export interface OfficerDecision {
  action: 'approved' | 'rejected' | 'returned';
  reason?: string;
  notes?: string;
  officerId: string;
  officerName: string;
}

export interface Officer {
  id: string;
  username: string;
  passwordHash?: string;
  name: string;
  role: string;
  rtoOffice: string;
  district: string;
  designation: string;
}

export interface AuthSession {
  token: string;
  officer: {
    id: string;
    username: string;
    name: string;
    designation: string;
    rtoOffice: string;
    district: string;
  };
  expiresAt: number;
}

export interface FilterState {
  searchQuery: string;
  applicationType: string;
  status: string;
  district: string;
  priority: string;
}

export interface DashboardStats {
  total: number;
  pending: number;
  underReview: number;
  highPriority: number;
  approved: number;
  returned: number;
  rejected: number;
  requiresAttention: number;
}

