export const STORAGE_KEYS = {
  QUESTIONS: 'FLOW_POC::questions',
  POLICIES: 'FLOW_POC::policies',
  PARAMETERS: 'FLOW_POC::parameters',
} as const;

export const DECISION_COLORS: Record<string, string> = {
  ALLOW: 'bg-green-500',
  BLOCK: 'bg-red-500',
  REVIEW: 'bg-amber-500',
};

export const DECISION_BADGE_VARIANTS: Record<string, string> = {
  ALLOW: 'bg-green-100 text-green-800 border-green-300',
  BLOCK: 'bg-red-100 text-red-800 border-red-300',
  REVIEW: 'bg-amber-100 text-amber-800 border-amber-300',
};
