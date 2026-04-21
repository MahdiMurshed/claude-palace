import type { ProjectFilterOption } from "@repo/api-client";
import { projectColor } from "../lib/colors";

type Props = {
  project: ProjectFilterOption;
  allProjectIds: string[];
  onClick?: () => void;
};

export default function ProjectTile({ project, allProjectIds, onClick }: Props) {
  const color = projectColor(project.encoded_name, allProjectIds);
  const displayName = project.display_name ?? project.name ?? project.slug ?? project.encoded_name;
  const stripeOverlay = color.striped
    ? "repeating-linear-gradient(45deg, transparent 0 12px, rgba(0,0,0,0.12) 12px 14px)"
    : undefined;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative aspect-square rounded-lg border p-4 text-left transition-transform hover:scale-[1.02] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring"
      style={{
        background: color.background,
        borderColor: color.border,
        color: color.foreground,
        backgroundImage: stripeOverlay,
      }}
    >
      <div className="flex h-full flex-col justify-between">
        <div className="text-[11px] uppercase tracking-widest opacity-80">
          {project.session_count} session{project.session_count === 1 ? "" : "s"}
        </div>
        <div className="font-semibold text-base leading-snug break-words">
          {displayName}
        </div>
      </div>
    </button>
  );
}
