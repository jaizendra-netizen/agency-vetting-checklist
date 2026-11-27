// Criteria and arithmetic for vetting a lead generation agency. No agency is named here.

export type Item = { id: string; ask: string; good: string };

export const CHECKS: Item[] = [
  { id: "meeting-definition", ask: "Ask for the meeting definition in writing.", good: "It names the buyer's role, the company type and what \"held\" means." },
  { id: "data-source", ask: "Ask where the data comes from.", good: "The answer names the sources and the verification steps." },
  { id: "deliverability", ask: "Ask to see deliverability.", good: "You get domain health and bounce numbers from a live campaign." },
  { id: "references", ask: "Speak with references.", good: "You speak with two to three of them." },
  { id: "handoff", ask: "Ask for the handoff plan.", good: "It covers how meetings reach your calendar, and what happens with reschedules and no-shows." },
];

export const OWNERSHIP: Item[] = [
  { id: "own-domains", ask: "Who owns the sending domains and inboxes when the contract ends?", good: "You do, or the handover is written down." },
  { id: "own-lists", ask: "Who owns the contact lists, and can you export them at any time?", good: "You do, and export is allowed at any time." },
  { id: "data-origin", ask: "Where does the data come from, and how is each address verified?", good: "Named sources and a verification step per address." },
  { id: "domain-health", ask: "Can you see domain health and deliverability numbers while campaigns run?", good: "Yes, live, not only at month end." },
];

export const WARNINGS: Item[] = [
  { id: "guarantee-no-criteria", ask: "Guaranteed meetings with no qualification criteria or industry context?", good: "A guarantee comes with a written definition of a qualified meeting." },
  { id: "no-visibility", ask: "No visibility into data sources, domain health or email deliverability?", good: "All three are visible to you." },
  { id: "no-handoff-plan", ask: "No plan for handoffs, reschedules or show rates?", good: "A plan exists for all three." },
];

export const ALL: Item[] = [...CHECKS, ...OWNERSHIP, ...WARNINGS];

export type Answers = Record<string, boolean | null | undefined>;

export type Report = { passed: string[]; open: string[]; unanswered: string[]; redFlags: string[] };

// For checks and ownership, true means satisfied. For warnings, true means the warning sign is present.
export function score(a: Answers): Report {
  const known = new Set(ALL.map((i) => i.id));
  for (const k of Object.keys(a)) if (!known.has(k)) throw new Error(`unknown item: ${k}`);
  const passed: string[] = [];
  const open: string[] = [];
  const unanswered: string[] = [];
  const redFlags: string[] = [];
  for (const i of [...CHECKS, ...OWNERSHIP]) {
    const v = a[i.id];
    if (v === true) passed.push(i.id);
    else if (v === false) open.push(i.id);
    else unanswered.push(i.id);
  }
  for (const i of WARNINGS) {
    const v = a[i.id];
    if (v === true) redFlags.push(i.id);
    else if (v == null) unanswered.push(i.id);
  }
  return { passed, open, unanswered, redFlags };
}

export type Model = "meeting-based" | "retainer" | "dedicated-sdr";

// Each model puts the risk in a different place; pick the one that matches how sure you are.
export function modelFit(buyerClear: boolean, offerProven: boolean, enoughAccounts: boolean): Model[] {
  const out: Model[] = [];
  if (offerProven && buyerClear) out.push("meeting-based");
  if (!offerProven || !buyerClear) out.push("retainer");
  if (enoughAccounts) out.push("dedicated-sdr");
  return out.length ? out : ["retainer"];
}

export const MODEL_NOTE: Record<Model, string> = {
  "meeting-based": "You pay for an outcome, so the definition of a meeting carries all the weight. Fits a proven offer with a clear buyer.",
  retainer: "You pay for a team and its output each month. Fits when the list and the message still need testing.",
  "dedicated-sdr": "You pay per rep, and the reps work only on your account. Fits when you have enough accounts to keep a rep busy every day.",
};

// A price quoted per 4 weeks is 13 periods a year; a month is one twelfth of a year.
export function monthlyFrom(amount: number, per: "month" | "4weeks" | "week" | "year"): number {
  if (!(amount >= 0)) throw new Error("amount must be zero or more");
  switch (per) {
    case "month": return amount;
    case "4weeks": return (amount * 13) / 12;
    case "week": return (amount * 52) / 12;
    case "year": return amount / 12;
  }
}

// The invoice is only part of the cost: tools, data and setup change the real number.
export function allIn(o: { retainerMonthly: number; toolsMonthly?: number; dataMonthly?: number; setupOnce?: number; months: number }): number {
  if (!(o.months > 0)) throw new Error("months must be positive");
  const monthly = o.retainerMonthly + (o.toolsMonthly ?? 0) + (o.dataMonthly ?? 0);
  return monthly + (o.setupOnce ?? 0) / o.months;
}

// Judge on held meetings, not on sends or opens.
export function costPerHeldMeeting(totalCost: number, held: number): number {
  if (!(held > 0)) throw new Error("held meetings must be positive");
  return totalCost / held;
}

// Cost per meeting C against deal value V: you need to close at least C/V of held meetings to break even.
export function breakEvenCloseRate(costPerMeeting: number, dealValue: number): number {
  if (!(dealValue > 0)) throw new Error("deal value must be positive");
  return costPerMeeting / dealValue;
}

export type Wait = { wait: boolean; fixFirst: string[] };

// An agency multiplies a working offer. Wait in these three cases, and fix the gap first.
export function shouldWait(buyerNamed: boolean, someoneCanTakeMeetings: boolean, dealValueCoversMeeting: boolean): Wait {
  const fixFirst: string[] = [];
  if (!buyerNamed) fixFirst.push("Name your buyer: talk to ten customers.");
  if (!dealValueCoversMeeting) fixFirst.push("Deal size: raise it, or the sums do not work.");
  if (!someoneCanTakeMeetings) fixFirst.push("Free up someone to run and follow up meetings the same week.");
  return { wait: fixFirst.length > 0, fixFirst };
}
