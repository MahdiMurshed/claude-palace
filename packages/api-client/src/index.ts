import createFetchClient from "openapi-fetch";
import type { paths, components } from "./openapi";

export type { paths, components } from "./openapi";

// Convenient aliases for the schemas apps/web touches most. Extend this list
// as more pages come online — never hand-edit openapi.ts; re-run `bun run codegen`.
export type Schema<K extends keyof components["schemas"]> = components["schemas"][K];

export type ProjectFilterOption = Schema<"ProjectFilterOption">;
export type SessionSummary = Schema<"SessionSummary">;
export type AllSessionsResponse = Schema<"AllSessionsResponse">;

export type KarmaClient = ReturnType<typeof createFetchClient<paths>>;

export function createKarmaClient(baseUrl = "http://localhost:8000"): KarmaClient {
  return createFetchClient<paths>({
    baseUrl: baseUrl.replace(/\/$/, ""),
  });
}

/** Default singleton client hitting localhost:8000. */
export const karma = createKarmaClient();
