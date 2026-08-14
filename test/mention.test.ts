/**
 * mention.test.ts — the `@handle` grammar.
 *
 * Both halves are load-bearing in a way that fails silently. A handle that
 * isn't `[\w-]` can never be typed back (the trigger regex would not match it),
 * and a collision that reuses a name makes an older sibling permanently
 * unreachable. On the parse side, every rejection here is a case where being
 * too eager would swallow input the user meant for the main model — a leading
 * file path, a bare handle, a mention mid-sentence.
 */
import { describe, expect, it } from "vitest";
import { assignHandle, handleBase, MENTION_TRIGGER, parseMention } from "../src/mention.js";

describe("handleBase", () => {
  it("lowercases so the handle matches how it is typed", () => {
    expect(handleBase("Explore")).toBe("explore");
  });

  it("keeps a hyphenated type as-is", () => {
    expect(handleBase("general-purpose")).toBe("general-purpose");
  });

  it("reduces anything outside [\\w-] to hyphens, without leaving edge hyphens", () => {
    expect(handleBase("Code Review!")).toBe("code-review");
    expect(handleBase("  spaced  out  ")).toBe("spaced-out");
  });

  it("always produces something typeable", () => {
    // A type made entirely of stripped characters would otherwise slug to "",
    // and `@` alone can address nothing.
    expect(handleBase("!!!")).toBe("agent");
    expect(handleBase("")).toBe("agent");
  });

  it("only ever produces handles the suggestion trigger can match", () => {
    for (const type of ["Explore", "general-purpose", "Code Review!", "!!!", "デバッグ"]) {
      expect(MENTION_TRIGGER.test(`@${handleBase(type)}`)).toBe(true);
    }
  });
});

describe("assignHandle", () => {
  it("takes the plain base when it is free", () => {
    expect(assignHandle("explore", new Set())).toBe("explore");
  });

  it("numbers from 2 on the first collision", () => {
    expect(assignHandle("explore", new Set(["explore"]))).toBe("explore-2");
  });

  it("keeps counting past every taken form", () => {
    expect(assignHandle("explore", new Set(["explore", "explore-2"]))).toBe("explore-3");
  });

  it("skips a gap rather than reusing a live handle", () => {
    // explore-2 finished and was evicted; reusing it is fine, but explore-3
    // is still running and must not be shadowed.
    expect(assignHandle("explore", new Set(["explore", "explore-3"]))).toBe("explore-2");
  });
});

describe("parseMention", () => {
  it("splits a leading handle from its message", () => {
    expect(parseMention("@explore check the RPC path")).toEqual({
      handle: "explore",
      message: "check the RPC path",
    });
  });

  it("trims the message and accepts a newline as the separator", () => {
    expect(parseMention("@explore   spaced   ")).toEqual({ handle: "explore", message: "spaced" });
    expect(parseMention("@explore\nline1\nline2")).toEqual({ handle: "explore", message: "line1\nline2" });
  });

  it("rejects a bare handle — that belongs to the main model", () => {
    expect(parseMention("@explore")).toBeNull();
    expect(parseMention("@explore ")).toBeNull();
    expect(parseMention("@explore \t ")).toBeNull();
  });

  it("rejects a leading file path so pi's @-attachment keeps working", () => {
    expect(parseMention("@src/index.ts summarize this")).toBeNull();
    expect(parseMention("@README.md what changed")).toBeNull();
  });

  it("rejects a mention that is not at the start of the input", () => {
    expect(parseMention("hey @explore look at this")).toBeNull();
    expect(parseMention(" @explore look at this")).toBeNull();
  });
});
