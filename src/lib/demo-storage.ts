export type DemoContribution = {
  id: string;
  amount: number;
  opportunityId: string;
  opportunityTitle: string;
  pathId: string;
  pathTitle: string;
  createdAt: string;
};

export type ContributionDraft = {
  step: number;
  amount: number;
  customAmount: string;
  opportunityId: string;
  pathId: string;
  paymentMethod: string;
  accepted: boolean;
};

type DemoState = {
  contributions: DemoContribution[];
  draft?: ContributionDraft;
};

const STORAGE_KEY = "aaid-mvp-demo";

const emptyState: DemoState = { contributions: [] };

export function loadDemoState(): DemoState {
  if (typeof window === "undefined") return emptyState;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return emptyState;
    const parsed = JSON.parse(stored) as DemoState;
    return { contributions: Array.isArray(parsed.contributions) ? parsed.contributions : [], draft: parsed.draft };
  } catch {
    return emptyState;
  }
}

export function saveContributionDraft(draft: ContributionDraft) {
  const current = loadDemoState();
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, draft }));
}

export function recordDemoContribution(contribution: DemoContribution) {
  const current = loadDemoState();
  const contributions = [contribution, ...current.contributions.filter((item) => item.id !== contribution.id)].slice(0, 12);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ contributions }));
}
