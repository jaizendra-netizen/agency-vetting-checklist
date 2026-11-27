#!/usr/bin/env bun
import { readFileSync } from "node:fs";
import * as V from "./vet.ts";

const [cmd, ...rest] = process.argv.slice(2);

function flags(args: string[]): Record<string, string> {
  const o: Record<string, string> = {};
  for (let i = 0; i < args.length; i += 2) {
    const k = args[i];
    if (!k?.startsWith("--") || args[i + 1] === undefined) fail(`bad arguments near ${k}`);
    o[k.slice(2)] = args[i + 1];
  }
  return o;
}
function fail(m: string): never { console.error("error: " + m); process.exit(2); }
const num = (o: Record<string, string>, k: string, d?: number) => {
  const v = o[k] ?? (d !== undefined ? String(d) : undefined);
  if (v === undefined) fail(`missing --${k}`);
  const n = Number(v);
  if (!Number.isFinite(n)) fail(`--${k} must be a number`);
  return n;
};
const yn = (o: Record<string, string>, k: string) => {
  if (o[k] !== "yes" && o[k] !== "no") fail(`--${k} must be yes or no`);
  return o[k] === "yes";
};
const usd = (n: number) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

try {
  if (cmd === "list") {
    const show = (t: string, items: V.Item[]) => { console.log(t); for (const i of items) console.log(`  [${i.id}] ${i.ask}\n      Good: ${i.good}`); };
    show("Five checks before you hire", V.CHECKS);
    show("Ownership questions before you sign", V.OWNERSHIP);
    show("Warning signs", V.WARNINGS);
  } else if (cmd === "score") {
    const file = rest[0] ?? fail("score needs a JSON file of answers");
    const r = V.score(JSON.parse(readFileSync(file, "utf8")));
    console.log(`Satisfied: ${r.passed.length}`);
    console.log(`Open (ask again before signing): ${r.open.join(", ") || "none"}`);
    console.log(`Warning signs present: ${r.redFlags.join(", ") || "none"}`);
    console.log(`Not answered yet: ${r.unanswered.join(", ") || "none"}`);
    if (r.redFlags.length || r.open.length) process.exit(1);
  } else if (cmd === "wait") {
    const o = flags(rest);
    const w = V.shouldWait(yn(o, "buyer-named"), yn(o, "can-take-meetings"), yn(o, "deal-covers-meeting"));
    if (!w.wait) console.log("None of the three wait cases applies.");
    else { console.log("Wait. Fix the gap first:"); for (const f of w.fixFirst) console.log("- " + f); process.exit(1); }
  } else if (cmd === "model") {
    const o = flags(rest);
    for (const m of V.modelFit(yn(o, "buyer-clear"), yn(o, "offer-proven"), yn(o, "enough-accounts"))) console.log(`${m}: ${V.MODEL_NOTE[m]}`);
  } else if (cmd === "price") {
    const o = flags(rest);
    const per = (o.per ?? "month") as "month" | "4weeks" | "week" | "year";
    if (!["month", "4weeks", "week", "year"].includes(per)) fail("--per must be month, 4weeks, week or year");
    const monthly = V.monthlyFrom(num(o, "amount"), per);
    console.log(`Retainer per month: ${usd(monthly)}`);
    if (o.months) {
      const total = V.allIn({ retainerMonthly: monthly, toolsMonthly: num(o, "tools", 0), dataMonthly: num(o, "data", 0), setupOnce: num(o, "setup", 0), months: num(o, "months") });
      console.log(`All-in per month over ${o.months} months (retainer, tools, data, setup spread): ${usd(total)}`);
      if (o.held) console.log(`Per held meeting: ${usd(V.costPerHeldMeeting(total * num(o, "months"), num(o, "held")))}`);
    }
  } else if (cmd === "breakeven") {
    const o = flags(rest);
    console.log(`Break-even close rate: ${(V.breakEvenCloseRate(num(o, "meeting-cost"), num(o, "deal-value")) * 100).toFixed(1)}% of held meetings`);
  } else {
    console.log("agency-vet list | score FILE | wait --buyer-named yes|no --can-take-meetings yes|no --deal-covers-meeting yes|no\n  | model --buyer-clear yes|no --offer-proven yes|no --enough-accounts yes|no\n  | price --amount N [--per month|4weeks|week|year] [--tools N --data N --setup N --months N --held N]\n  | breakeven --meeting-cost N --deal-value N");
    if (cmd && cmd !== "help") process.exit(2);
  }
} catch (e) { fail((e as Error).message); }
