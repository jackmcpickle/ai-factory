import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";
import { z } from "zod";

import { claudeAuth } from "../src/agents.js";
import { countLines } from "../src/git.js";
import { extractTagged, ticketSchema } from "../src/schemas.js";

const tickets = path.resolve(import.meta.dirname, "../../../fixtures/tickets");
const readTicket = (file) =>
  JSON.parse(readFileSync(path.join(tickets, file), "utf-8"));

describe(ticketSchema, () => {
  it.each(["QF-101-clear.json", "QF-102-unclear.json"])(
    "accepts the %s fixture",
    (file) => {
      expect(ticketSchema.safeParse(readTicket(file)).success).toBeTruthy();
    }
  );

  it("refuses tickets that are not marked synthetic", () => {
    const real = { ...readTicket("QF-101-clear.json"), synthetic: false };
    expect(ticketSchema.safeParse(real).success).toBeFalsy();
  });
});

describe(extractTagged, () => {
  const schema = z.object({ ok: z.boolean() });

  it("reads the last tagged block, ignoring fences", () => {
    const stdout =
      'thinking <out>{"ok": false}</out>\nfinal:\n<out>\n```json\n{"ok": true}\n```\n</out>';
    expect(extractTagged(stdout, "out", schema)).toStrictEqual({ ok: true });
  });

  it("fails loudly when the agent forgot the block", () => {
    expect(() => extractTagged("done", "out", schema)).toThrow(
      "missing a <out> block"
    );
  });

  it("fails when the JSON does not match the schema", () => {
    expect(() =>
      extractTagged('<out>{"ok": "yes"}</out>', "out", schema)
    ).toThrow(z.ZodError);
  });
});

describe(countLines, () => {
  it("sums added and removed lines and skips binary files", () => {
    expect(countLines("3\t1\ta.ts\n-\t-\timg.png\n10\t0\tb.ts\n")).toBe(14);
  });
});

describe(claudeAuth, () => {
  it("prefers a subscription token so the API key cannot shadow it", () => {
    expect(
      claudeAuth({ ANTHROPIC_API_KEY: "k", CLAUDE_CODE_OAUTH_TOKEN: "t" })
    ).toStrictEqual({
      CLAUDE_CODE_OAUTH_TOKEN: "t",
    });
  });

  it("falls back to the API key, and to nothing", () => {
    expect(claudeAuth({ ANTHROPIC_API_KEY: "k" })).toStrictEqual({
      ANTHROPIC_API_KEY: "k",
    });
    expect(claudeAuth({})).toStrictEqual({});
  });
});
