import type { SessionSummary } from "@repo/api-client";
import { projectColor } from "../lib/colors";
import { relativeTime, truncate } from "../lib/format";
import { ExternalLink } from "lucide-react";

type Props = {
  session: SessionSummary;
  allProjectIds?: string[];
  /** Compact presentation for grid mode — drops prompt preview + branch chips. */
  compact?: boolean;
};

export default function SessionCard({ session, allProjectIds = [], compact = false }: Props) {
  const titles = session.session_titles ?? [];
  const title =
    titles[0] ?? session.chain_title ?? truncate(session.initial_prompt, 80) ?? "(untitled)";
  const projectId = session.project_encoded_name ?? "";
  const color = projectId ? projectColor(projectId, allProjectIds) : null;
  const projectLabel =
    session.project_display_name ?? session.project_slug ?? projectId ?? "(no project)";

  const karmaSessionUrl = `http://localhost:5173/sessions/${session.uuid}`;

  return (
    <div
      className={`rounded-lg border border-border bg-card hover:border-ring transition-colors ${
        compact ? "p-3 h-full flex flex-col" : "p-4"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {color && (
              <span
                className="inline-block size-2.5 rounded-sm shrink-0"
                style={{ background: color.background, borderColor: color.border }}
                aria-hidden
              />
            )}
            <span className="truncate">{projectLabel}</span>
            <span>·</span>
            <span className="whitespace-nowrap">{relativeTime(session.start_time)}</span>
            {!compact && (
              <>
                <span>·</span>
                <span className="whitespace-nowrap">
                  {session.message_count} msg{session.message_count === 1 ? "" : "s"}
                </span>
              </>
            )}
          </div>
          <div
            className={`mt-1 font-medium text-foreground break-words ${
              compact ? "text-sm line-clamp-2" : ""
            }`}
          >
            {title}
          </div>
          {!compact && session.initial_prompt && (
            <div className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {truncate(session.initial_prompt, 160)}
            </div>
          )}
          {!compact && (session.git_branches ?? []).length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {(session.git_branches ?? []).slice(0, 3).map((b) => (
                <span
                  key={b}
                  className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground"
                >
                  {b}
                </span>
              ))}
            </div>
          )}
        </div>
        <a
          href={karmaSessionUrl}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          title="Open session in karma"
        >
          <ExternalLink className="size-4" />
        </a>
      </div>
      {compact && (
        <div className="mt-auto pt-2 text-[11px] text-muted-foreground">
          {session.message_count} msg{session.message_count === 1 ? "" : "s"}
        </div>
      )}
    </div>
  );
}
