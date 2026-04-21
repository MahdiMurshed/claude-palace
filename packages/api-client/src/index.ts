import type { AllSessionsResponse, ProjectFilterOption } from "./types";

export * from "./types";

export type ClientOptions = {
  /** Base URL of the claude-code-karma API. Defaults to http://localhost:8000. */
  baseUrl?: string;
};

export class KarmaClient {
  private readonly baseUrl: string;

  constructor(options: ClientOptions = {}) {
    const base = options.baseUrl ?? "http://localhost:8000";
    this.baseUrl = base.replace(/\/$/, "");
  }

  /**
   * List every project karma has indexed. One tile per entry in the palace.
   * Endpoint: GET /projects  →  ProjectFilterOption[]
   */
  async listProjects(signal?: AbortSignal): Promise<ProjectFilterOption[]> {
    return this.fetchJson<ProjectFilterOption[]>("/projects", signal);
  }

  /**
   * Fetch sessions for search. v0 pulls a large page and filters client-side
   * to match claude-code-karma's own SvelteKit search behavior.
   * Endpoint: GET /sessions/all?limit=N  →  AllSessionsResponse
   */
  async listAllSessions(limit = 1000, signal?: AbortSignal): Promise<AllSessionsResponse> {
    return this.fetchJson<AllSessionsResponse>(`/sessions/all?limit=${limit}`, signal);
  }

  private async fetchJson<T>(path: string, signal?: AbortSignal): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, { signal });
    if (!res.ok) {
      throw new Error(`karma API ${path} → HTTP ${res.status} ${res.statusText}`);
    }
    return res.json() as Promise<T>;
  }
}

/** Default singleton that hits localhost:8000. Convenient for app-level use. */
export const karma = new KarmaClient();
