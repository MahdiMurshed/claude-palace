import type { SessionSummary } from "@repo/api-client";
import {
  differenceInCalendarDays,
  isSameDay,
  isSameWeek,
  isSameMonth,
  subDays,
} from "date-fns";

// --------------------------------------------------------------------------
// Filter state
// --------------------------------------------------------------------------

export type StatusFilter = "all" | "completed";
export type DateRange = "all" | "today" | "7d" | "30d";

export type SessionFilters = {
  tokens: string[];
  project: string | null;
  branches: Set<string>;
  status: StatusFilter;
  dateRange: DateRange;
};

export const DEFAULT_FILTERS: SessionFilters = {
  tokens: [],
  project: null,
  branches: new Set(),
  status: "all",
  dateRange: "all",
};

// --------------------------------------------------------------------------
// Tokenization (mirrors karma's client-side AND search)
// --------------------------------------------------------------------------

export const MAX_TOKENS = 7;

export function tokenize(query: string): string[] {
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, MAX_TOKENS);
}

// --------------------------------------------------------------------------
// Filtering
// --------------------------------------------------------------------------

function sessionHaystack(s: SessionSummary): string {
  return [
    ...(s.session_titles ?? []),
    s.slug ?? "",
    s.chain_title ?? "",
    s.initial_prompt ?? "",
    s.uuid,
  ]
    .join(" ")
    .toLowerCase();
}

function dateLowerBound(range: DateRange, now = new Date()): Date | null {
  switch (range) {
    case "today": {
      const d = new Date(now);
      d.setHours(0, 0, 0, 0);
      return d;
    }
    case "7d":
      return subDays(now, 7);
    case "30d":
      return subDays(now, 30);
    default:
      return null;
  }
}

export function applyFilters(
  sessions: SessionSummary[],
  f: SessionFilters,
): SessionSummary[] {
  const since = dateLowerBound(f.dateRange);
  return sessions.filter((s) => {
    if (f.project && s.project_encoded_name !== f.project) return false;

    if (f.branches.size > 0) {
      const branches = s.git_branches ?? [];
      if (!branches.some((b) => f.branches.has(b))) return false;
    }

    if (f.status === "completed" && s.end_time == null) return false;

    if (since && s.start_time) {
      const started = new Date(s.start_time).getTime();
      if (started < since.getTime()) return false;
    }

    if (f.tokens.length > 0) {
      const hay = sessionHaystack(s);
      if (!f.tokens.every((t) => hay.includes(t))) return false;
    }

    return true;
  });
}

// --------------------------------------------------------------------------
// Time grouping
// --------------------------------------------------------------------------

export type TimeBucket =
  | "today"
  | "yesterday"
  | "thisWeek"
  | "thisMonth"
  | "older"
  | "undated";

export const BUCKET_ORDER: TimeBucket[] = [
  "today",
  "yesterday",
  "thisWeek",
  "thisMonth",
  "older",
  "undated",
];

export const BUCKET_LABELS: Record<TimeBucket, string> = {
  today: "Today",
  yesterday: "Yesterday",
  thisWeek: "This week",
  thisMonth: "This month",
  older: "Older",
  undated: "No timestamp",
};

function bucketForDate(d: Date, now = new Date()): TimeBucket {
  if (isSameDay(d, now)) return "today";
  if (isSameDay(d, subDays(now, 1))) return "yesterday";
  if (isSameWeek(d, now, { weekStartsOn: 1 })) return "thisWeek";
  if (isSameMonth(d, now)) return "thisMonth";
  return "older";
}

export type GroupedSessions = Record<TimeBucket, SessionSummary[]>;

export function groupByTime(sessions: SessionSummary[], now = new Date()): GroupedSessions {
  const groups: GroupedSessions = {
    today: [],
    yesterday: [],
    thisWeek: [],
    thisMonth: [],
    older: [],
    undated: [],
  };
  for (const s of sessions) {
    if (!s.start_time) {
      groups.undated.push(s);
      continue;
    }
    const d = new Date(s.start_time);
    if (Number.isNaN(d.getTime())) {
      groups.undated.push(s);
      continue;
    }
    groups[bucketForDate(d, now)].push(s);
  }
  // Sort each group by start_time desc
  for (const k of BUCKET_ORDER) {
    groups[k].sort((a, b) => {
      const ta = a.start_time ? new Date(a.start_time).getTime() : 0;
      const tb = b.start_time ? new Date(b.start_time).getTime() : 0;
      return tb - ta;
    });
  }
  return groups;
}

// --------------------------------------------------------------------------
// Filter chips (active non-default filter summary)
// --------------------------------------------------------------------------

export type FilterChip = { key: keyof SessionFilters | string; label: string };

export function getActiveChips(
  f: SessionFilters,
  projectLabel?: string,
): FilterChip[] {
  const chips: FilterChip[] = [];
  if (f.project) {
    chips.push({ key: "project", label: `Project: ${projectLabel ?? f.project}` });
  }
  if (f.status !== "all") {
    chips.push({ key: "status", label: `Status: ${f.status}` });
  }
  if (f.dateRange !== "all") {
    const labels: Record<DateRange, string> = {
      all: "All time",
      today: "Today",
      "7d": "Last 7 days",
      "30d": "Last 30 days",
    };
    chips.push({ key: "dateRange", label: `Date: ${labels[f.dateRange]}` });
  }
  for (const b of f.branches) {
    chips.push({ key: `branch:${b}`, label: `Branch: ${b}` });
  }
  return chips;
}

// --------------------------------------------------------------------------
// Relative duration helper
// --------------------------------------------------------------------------

export function daysAgo(iso: string | null | undefined, now = new Date()): number | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return differenceInCalendarDays(now, d);
}
