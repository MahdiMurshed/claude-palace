import { useQuery } from "@tanstack/react-query";
import { karma } from "@repo/api-client";
import { useNavigate } from "react-router-dom";
import ProjectTile from "../components/ProjectTile";

export default function Palace() {
  const navigate = useNavigate();
  const { data, isLoading, error } = useQuery({
    queryKey: ["projects"],
    queryFn: ({ signal }) => karma.listProjects(signal),
  });

  if (isLoading) {
    return <div className="text-muted-foreground">Loading projects…</div>;
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
        <div className="font-medium">Failed to reach the karma API.</div>
        <div className="mt-1 opacity-80">
          {error instanceof Error ? error.message : String(error)}
        </div>
        <div className="mt-2 text-xs opacity-70">
          Make sure karma is running:{" "}
          <code className="rounded bg-background/50 px-1">./scripts/dev.sh</code> in your karma repo.
        </div>
      </div>
    );
  }

  const projects = data ?? [];
  const allIds = projects.map((p) => p.encoded_name);

  if (projects.length === 0) {
    return (
      <div className="rounded-lg border border-border p-6 text-sm text-muted-foreground">
        No projects yet. Start a Claude Code session, then refresh.
      </div>
    );
  }

  // Sort by session_count descending — most-used projects surface first.
  const sorted = [...projects].sort((a, b) => b.session_count - a.session_count);

  return (
    <div>
      <div className="mb-4 flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Palace</h1>
        <div className="text-sm text-muted-foreground">
          {projects.length} project{projects.length === 1 ? "" : "s"}
        </div>
      </div>
      <div className="grid gap-3 grid-cols-[repeat(auto-fill,minmax(160px,1fr))]">
        {sorted.map((project) => (
          <ProjectTile
            key={project.encoded_name}
            project={project}
            allProjectIds={allIds}
            onClick={() =>
              navigate(`/search?project=${encodeURIComponent(project.encoded_name)}`)
            }
          />
        ))}
      </div>
    </div>
  );
}
