import { z } from "zod";

export const ticketSchema = z.object({
  id: z.string().regex(/^[A-Z]+-\d+$/u, "Ticket id must look like QF-123"),
  synthetic: z.literal(true, {
    error: "Factory refuses non-synthetic tickets",
  }),
  title: z.string().min(1).max(200),
  reporter: z.string().min(1),
  body: z.string().min(1).max(8000),
});

const surface = z.enum(["frontend", "backend"]);

export const handoffSchema = z.object({
  rootCause: z.string().min(1),
  confidence: z.enum(["low", "medium", "high"]),
  reproduction: z.array(z.string()).min(1),
  files: z
    .array(z.object({ path: z.string().min(1), reason: z.string().min(1) }))
    .min(1),
  discovery: z.array(z.string()),
  proposedFix: z.string().min(1),
  testPlan: z.array(z.string()).min(1),
  surfaces: z.array(surface).min(1),
});

export const fixSchema = z.object({
  summary: z.string().min(1),
  filesChanged: z.array(z.string()),
  testsAdded: z.array(z.string()),
  checks: z.object({
    lint: z.enum(["pass", "fail", "not_run"]),
    typecheck: z.enum(["pass", "fail", "not_run"]),
    test: z.enum(["pass", "fail", "not_run"]),
  }),
});

export const reviewSchema = z.object({
  verdict: z.enum(["approved", "changes_made", "concerns"]),
  findings: z.array(
    z.object({
      severity: z.enum(["blocker", "major", "minor", "nit"]),
      file: z.string(),
      note: z.string().min(1),
      fixed: z.boolean(),
    })
  ),
  unresolved: z.array(z.string()),
});

export const mergeSchema = z.object({
  status: z.enum(["merged", "blocked"]),
  reason: z.string().min(1),
});

/**
 * Pull the last `<tag>{json}</tag>` block out of agent stdout and validate it.
 * Agents may wrap the JSON in a fenced code block, so fences are stripped.
 */
export function extractTagged(stdout, tag, schema) {
  const pattern = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "gu");
  const matches = [...stdout.matchAll(pattern)];
  const raw = matches.at(-1)?.[1];
  if (raw === undefined) {
    throw new Error(`Agent output is missing a <${tag}> block`);
  }
  const json = raw
    .trim()
    .replace(/^```(?:json)?\s*/u, "")
    .replace(/\s*```$/u, "");
  return schema.parse(JSON.parse(json));
}
