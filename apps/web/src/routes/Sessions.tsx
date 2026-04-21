import { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { karma, type AllSessionsResponse } from "@repo/api-client";
import { useSearchParams } from "react-router-dom";
import { Search as SearchIcon, X } from "lucide-react";
import SessionCard from "../components/SessionCard";
import {
  DEFAULT_FILTERS,
  tokenize,
  applyFilters,
  groupByTime,
  getActiveChips,
  BUCKET_ORDER,
  BUCKET_LABELS,
  type DateRange,
  type SessionFilters,
  type StatusFilter,
} from "../lib/sessionFilters";

const DATE_OPTIONS: { v: DateRange; label: string }[] = [
  { v: "all", label: "All time" },
  { v: "today", label: "Today" },
  { v: "7d", label: "Last 7 days" },
  { v: "30d", label: "Last 30 days" },
];

const STATUS_OPTIONS: { v: StatusFilter; label: string }[] = [
  { v: "all", label: "All" },
  { v: "completed", label: "Completed" },
];

export default function Sessions() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState("");

  const projectFilter = searchParams.get("project");

  const [filters, setFilters] = useState<SessionFilters>(() => ({
    ...DEFAULT_FILTERS,
    project: projectFilter ?? null,
  }));

  useEffect(() => {
    setFilters((f) => ({ ...f, project: projectFilter ?? null }));
  }, [projectFilter]);

  useEffect(() => {
    setFilters((f) => ({ ...f, tokens: tokenize(query) }));
  }, [query]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["sessions-all"],
    queryFn: async ({ signal }) => {
      const { data, error } = await karma.GET("/sessions/all", {
        params: { query: { per_page: 1000 } },
        signal,
      });
      if (error) throw new Error(`GET /sessions/all failed: ${JSON.stringify(error)}`);
      return data as AllSessionsResponse;
    },
  });

  const projects = data?.projects ?? [];
  const allIds = projects.map((p) => p.encoded_name);
  const projectLabel = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of projects) {
      map.set(p.encoded_name, p.display_name ?? p.name ?? p.slug ?? p.encoded_name);
    }
    return map;
  }, [projects]);

  // Aggregate every branch that appears in any session
  const allBranches = useMemo(() => {
    const set = new Set<string>();
    for (const s of data?.sessions ?? []) {
      for (const b of s.git_branches ?? []) set.add(b);
    }
    return [...set].sort();
  }, [data?.sessions]);

  const filtered = useMemo(
    () => applyFilters(data?.sessions ?? [], filters),
    [data?.sessions, filters],
  );

  const grouped = useMemo(() => groupByTime(filtered), [filtered]);

  const chips = useMemo(
    () => getActiveChips(filters, filters.project ? projectLabel.get(filters.project) : undefined),
    [filters, projectLabel],
  );

  useEffect(() => {
    document.getElementById("session-search-input")?.focus();
  }, []);

  return (
    <div>
      <div className="mb-4 flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Sessions</h1>
        <div className="text-sm text-muted-foreground">
          {isLoading
            ? "Loading…"
            : `${filtered.length} of ${data?.sessions?.length ?? 0}`}
        </div>
      </div>

      {/* Search + filters */}
      <div className="mb-3 flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
        <SearchIcon className="size-4 text-muted-foreground" />
        <input
          id="session-search-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Try KEY-1273, or any keyword… (space = AND)"
          className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Filter row */}
      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
        <FilterSelect
          label="Status"
          value={filters.status}
          options={STATUS_OPTIONS}
          onChange={(v) => setFilters((f) => ({ ...f, status: v as StatusFilter }))}
        />
        <FilterSelect
          label="Date"
          value={filters.dateRange}
          options={DATE_OPTIONS}
          onChange={(v) => setFilters((f) => ({ ...f, dateRange: v as DateRange }))}
        />
        <FilterSelect
          label="Project"
          value={filters.project ?? ""}
          options={[
            { v: "", label: "All projects" },
            ...projects.map((p) => ({
              v: p.encoded_name,
              label: p.display_name ?? p.name ?? p.slug ?? p.encoded_name,
            })),
          ]}
          onChange={(v) => {
            setFilters((f) => ({ ...f, project: v || null }));
            const next = new URLSearchParams(searchParams);
            if (v) next.set("project", v);
            else next.delete("project");
            setSearchParams(next, { replace: true });
          }}
        />
        {allBranches.length > 0 && (
          <BranchesDropdown
            allBranches={allBranches}
            selected={filters.branches}
            onChange={(branches) => setFilters((f) => ({ ...f, branches }))}
          />
        )}
      </div>

      {/* Active chips */}
      {chips.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {chips.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => {
                setFilters((f) => {
                  const next = { ...f };
                  if (c.key === "project") next.project = null;
                  else if (c.key === "status") next.status = "all";
                  else if (c.key === "dateRange") next.dateRange = "all";
                  else if (typeof c.key === "string" && c.key.startsWith("branch:")) {
                    const name = c.key.slice("branch:".length);
                    const b = new Set(f.branches);
                    b.delete(name);
                    next.branches = b;
                  }
                  return next;
                });
                if (c.key === "project") {
                  const next = new URLSearchParams(searchParams);
                  next.delete("project");
                  setSearchParams(next, { replace: true });
                }
              }}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground hover:text-foreground hover:border-ring transition-colors"
            >
              {c.label}
              <X className="size-3" />
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setFilters(DEFAULT_FILTERS);
              setQuery("");
              const next = new URLSearchParams(searchParams);
              next.delete("project");
              setSearchParams(next, { replace: true });
            }}
            className="text-xs text-muted-foreground underline hover:text-foreground"
          >
            Clear all
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error instanceof Error ? error.message : "Failed to load sessions"}
        </div>
      )}

      {/* Grouped session list */}
      <div className="space-y-6">
        {BUCKET_ORDER.map((bucket) => {
          const group = grouped[bucket];
          if (group.length === 0) return null;
          return (
            <section key={bucket}>
              <h2 className="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                {BUCKET_LABELS[bucket]}{" "}
                <span className="text-muted-foreground/60">({group.length})</span>
              </h2>
              <div className="space-y-2">
                {group.map((s) => (
                  <SessionCard key={s.uuid} session={s} allProjectIds={allIds} />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {!isLoading && filtered.length === 0 && (
        <div className="rounded-lg border border-border p-6 text-sm text-muted-foreground">
          No sessions match the current filters.
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inline subcomponents (will migrate to @repo/ui shadcn primitives later)
// ---------------------------------------------------------------------------

type FilterSelectProps = {
  label: string;
  value: string;
  options: readonly { v: string; label: string }[];
  onChange: (v: string) => void;
};

function FilterSelect({ label, value, options, onChange }: FilterSelectProps) {
  return (
    <label className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2 py-1 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent outline-none text-foreground"
      >
        {options.map((o) => (
          <option key={o.v} value={o.v}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

type BranchesDropdownProps = {
  allBranches: string[];
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
};

function BranchesDropdown({ allBranches, selected, onChange }: BranchesDropdownProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2 py-1 text-xs"
      >
        <span className="text-muted-foreground">Branches</span>
        <span className="text-foreground">
          {selected.size === 0 ? "any" : `${selected.size} selected`}
        </span>
      </button>
      {open && (
        <div className="absolute z-20 mt-1 max-h-64 w-72 overflow-auto rounded-md border border-border bg-card p-1 shadow-lg">
          {allBranches.map((b) => {
            const checked = selected.has(b);
            return (
              <button
                key={b}
                type="button"
                onClick={() => {
                  const next = new Set(selected);
                  if (checked) next.delete(b);
                  else next.add(b);
                  onChange(next);
                }}
                className="flex w-full items-center gap-2 rounded px-2 py-1 text-left text-xs hover:bg-muted"
              >
                <span
                  className={`inline-block size-3 rounded border ${
                    checked ? "bg-primary border-primary" : "border-border"
                  }`}
                />
                <span className="truncate">{b}</span>
              </button>
            );
          })}
          {allBranches.length === 0 && (
            <div className="px-2 py-1 text-xs text-muted-foreground">
              No branches tracked.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
