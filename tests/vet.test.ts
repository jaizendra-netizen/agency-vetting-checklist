import { expect, test } from "bun:test";
import * as V from "../src/vet.ts";

test("the guide's five checks, four ownership questions and three warnings", () => {
  expect(V.CHECKS.length).toBe(5);
  expect(V.OWNERSHIP.length).toBe(4);
  expect(V.WARNINGS.length).toBe(3);
  expect(new Set(V.ALL.map((i) => i.id)).size).toBe(12);
});

test("score separates satisfied, open, warning and unanswered", () => {
  const r = V.score({ "meeting-definition": true, "data-source": false, "no-visibility": true, "no-handoff-plan": false });
  expect(r.passed).toEqual(["meeting-definition"]);
  expect(r.open).toEqual(["data-source"]);
  expect(r.redFlags).toEqual(["no-visibility"]);
  expect(r.unanswered).toContain("deliverability");
  expect(r.unanswered).toContain("guarantee-no-criteria");
  expect(r.unanswered).not.toContain("no-handoff-plan");
});

test("score rejects an unknown item", () => {
  expect(() => V.score({ nope: true })).toThrow("unknown item");
});

test("price per four weeks becomes a monthly figure", () => {
  expect(V.monthlyFrom(1200, "month")).toBe(1200);
  expect(V.monthlyFrom(1200, "4weeks")).toBeCloseTo(1300, 6);
  expect(V.monthlyFrom(100, "week")).toBeCloseTo(433.3333, 3);
  expect(V.monthlyFrom(12000, "year")).toBe(1000);
  expect(() => V.monthlyFrom(-1, "month")).toThrow();
});

test("all-in spreads the setup fee and adds tools and data", () => {
  expect(V.allIn({ retainerMonthly: 5000, toolsMonthly: 500, dataMonthly: 250, setupOnce: 1500, months: 3 })).toBe(6250);
  expect(V.allIn({ retainerMonthly: 5000, months: 3 })).toBe(5000);
  expect(() => V.allIn({ retainerMonthly: 1, months: 0 })).toThrow();
});

test("cost per held meeting and break-even close rate", () => {
  expect(V.costPerHeldMeeting(15000, 20)).toBe(750);
  expect(() => V.costPerHeldMeeting(1, 0)).toThrow();
  expect(V.breakEvenCloseRate(500, 10000)).toBeCloseTo(0.05, 10);
});

test("wait cases name what to fix first", () => {
  expect(V.shouldWait(true, true, true)).toEqual({ wait: false, fixFirst: [] });
  const w = V.shouldWait(false, false, true);
  expect(w.wait).toBe(true);
  expect(w.fixFirst.length).toBe(2);
});

test("model fit follows how sure you are", () => {
  expect(V.modelFit(true, true, false)).toEqual(["meeting-based"]);
  expect(V.modelFit(false, false, false)).toEqual(["retainer"]);
  expect(V.modelFit(true, true, true)).toEqual(["meeting-based", "dedicated-sdr"]);
});
