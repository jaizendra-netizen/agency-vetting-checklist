# agency-vetting-checklist

A TypeScript command-line checklist and calculator for vetting a B2B lead generation agency before you sign anything. It
implements the buyer criteria in
[Best B2B Lead Generation Agency in 2026: 10 Agencies Compared](https://www.onegtmlab.dev/blog/best-b2b-lead-generation-agency):
the five checks you can run in a week, the four ownership questions, the three warning signs, the three cases when you should
not hire yet, the three pricing models and what each fits, and the arithmetic for the real cost of a meeting. It is neutral:
no agency is named and no ranking is produced. A person answers; the code only counts. Runs on [Bun](https://bun.sh), no
dependencies.

## Print the criteria

```bash
bun src/cli.ts list
```

Five checks: the meeting definition in writing (it names the buyer's role, the company type and what "held" means), where the
data comes from, deliverability numbers from a live campaign, two to three references, and the handoff plan (how meetings
reach your calendar, and what happens with reschedules and no-shows). Four ownership questions: who owns the sending domains
and inboxes when the contract ends, who owns the lists and can you export them, where the data comes from and how each
address is verified, and whether you can see domain health while campaigns run. Three warning signs: guaranteed meetings with
no qualification criteria, no visibility into data sources, domain health or deliverability, and no plan for handoffs,
reschedules or show rates.

## Score the answers you collected

Keep the answers in a file (`true`, `false` or leave an item out). For checks and ownership `true` means satisfied; for warning
signs `true` means the sign is present:

```bash
bun src/cli.ts score examples/answers.json
# Satisfied: 7
# Open (ask again before signing): deliverability, domain-health
```

It exits 1 while anything is open or a warning sign is present.

## Should you wait?

An agency multiplies a working offer; it rarely fixes a missing one. Wait if you cannot name your buyer, if the deal is too
small for the meeting cost, or if no one can take the meetings:

```bash
bun src/cli.ts wait --buyer-named no --can-take-meetings yes --deal-covers-meeting yes
# Wait. Fix the gap first:
# - Name your buyer: talk to ten customers.
```

## Which pricing model fits

```bash
bun src/cli.ts model --buyer-clear yes --offer-proven yes --enough-accounts no
# meeting-based: You pay for an outcome, so the definition of a meeting carries all the weight. ...
```

Pay per meeting (or a guaranteed count) fits a proven offer with a clear buyer. A monthly retainer fits when the list and the
message still need testing. A dedicated SDR fits when you have enough accounts to keep a rep busy every day.

## What a meeting really costs

The invoice is only part of the cost; tools, data and setup change the real number. Ask every agency for one number that covers
all three, then judge on held meetings, not on sends or opens:

```bash
bun src/cli.ts price --amount 4000 --per 4weeks --tools 300 --setup 1500 --months 3 --held 12
bun src/cli.ts breakeven --meeting-cost 500 --deal-value 10000   # 5.0% of held meetings
```

A price quoted per 4 weeks is converted at 13 periods a year. The figures above are made up for the example; use the numbers
from your own quotes. A low price per meeting means little until you know what counts as a meeting.

## Test

```bash
bun test
```

MIT licensed.
