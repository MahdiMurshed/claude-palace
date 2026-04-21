// Types mirroring the subset of the claude-code-karma OpenAPI schema that v0 uses.
// Source: http://localhost:8000/openapi.json (ProjectFilterOption, SessionSummary,
// AllSessionsResponse). Regenerate via openapi-typescript when the api-client grows.

export type ProjectFilterOption = {
  encoded_name: string;
  path: string;
  name: string;
  slug: string | null;
  display_name: string | null;
  session_count: number;
};

export type SessionSummary = {
  uuid: string;
  slug: string | null;
  project_encoded_name: string | null;
  project_slug: string | null;
  project_display_name: string | null;
  message_count: number;
  start_time: string | null;
  end_time: string | null;
  duration_seconds: number | null;
  models_used: string[];
  subagent_count: number;
  has_todos: boolean;
  todo_count: number;
  initial_prompt: string | null;
  summary: string | null;
  git_branches: string[];
  session_titles: string[];
  chain_title: string | null;
  session_source: string | null;
};

export type AllSessionsResponse = {
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  sessions: SessionSummary[];
  projects: ProjectFilterOption[];
};
