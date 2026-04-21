import { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { karma, type SessionSummary } from "@repo/api-client";
import { useSearchParams } from "react-router-dom";
import { Search as SearchIcon, X } from "lucide-react";
import SessionCard from "../components/SessionCard";

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState("");

  // Pre-fill project filter from URL (?project=...)
  const projectFilter = searchParams.get("project") ?? "";

  const { data, isLoading, error } = useQuery({
    queryKey: ["sessions-all"],
    queryFn: ({ signal }) => karma.listAllSessions(1000, signal),
  });

  // Tokenize search input on whitespace — AND logic matches karma's own search.
  const tokens = useMemo(
    () =>
      query
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 7),
    [query],
  );

  const filtered = useMemo(() => {
    const sessions = data?.sessions ?? [];
    return sessions.filter((s) => {
      if (projectFilter && s.project_encoded_name !== projectFilter) return false;
      if (tokens.length === 0) return true;
      const haystack = [
        ...s.session_titles,
        s.slug ?? "",
        s.chain_title ?? "",
        s.initial_prompt ?? "",
        s.uuid,
      ]
        .join(" ")
        .toLowerCase();
      return tokens.every((t) => haystack.includes(t));
    });
  }, [data?.sessions, tokens, projectFilter]);

  const projects = data?.projects ?? [];
  const allIds = projects.map((p) => p.encoded_name);
  const projectLookup = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of projects) {
      map.set(p.encoded_name, p.display_name ?? p.name ?? p.slug ?? p.encoded_name);
    }
    return map;
  }, [projects]);

  // Autofocus input on mount
  useEffect(() => {
    document.getElementById("search-input")?.focus();
  }, []);

  return (
    <div>
      <div className="mb-4 flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Search</h1>
        <div className="text-sm text-muted-foreground">
          {isLoading
            ? "Loading…"
            : `${filtered.length} of ${data?.sessions.length ?? 0} sessions`}
        </div>
      </div>

      <div className="mb-3 flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
        <SearchIcon className="size-4 text-muted-foreground" />
        <input
          id="search-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Try a Linear key like KEY-1273, or any keyword…"
          className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Clear"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {projectFilter && (
        <div className="mb-3 flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Filtered to project:</span>
          <span className="rounded-full border border-border px-2 py-0.5 text-xs">
            {projectLookup.get(projectFilter) ?? projectFilter}
          </span>
          <button
            type="button"
            onClick={() => {
              const next = new URLSearchParams(searchParams);
              next.delete("project");
              setSearchParams(next);
            }}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error instanceof Error ? error.message : "Failed to load sessions"}
        </div>
      )}

      <div className="space-y-2">
        {filtered.map((s: SessionSummary) => (
          <SessionCard key={s.uuid} session={s} allProjectIds={allIds} />
        ))}
      </div>

      {!isLoading && filtered.length === 0 && (
        <div className="rounded-lg border border-border p-6 text-sm text-muted-foreground">
          No sessions match{tokens.length > 0 ? ` "${query}"` : ""}.
        </div>
      )}
    </div>
  );
}
