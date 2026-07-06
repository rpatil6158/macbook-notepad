# MIS Score Board shows 0 while drilldown shows tasks — Root Cause & Fix Plan

**Status:** Investigation complete — awaiting review before implementation
**Scope:** Backend `rosewalt-apis` (primary) + minor frontend reconciliation `rosewalt-panel`
**Owner:** Task Management / MIS Scoreboard
**Created:** 2026-07-06

---

## 1. Refined Problem Statement

On the **MIS Score board**, each user gets a per-module score for **D1, D2, FMS, PMS**.
For a user whose tasks in the selected date range are **pending = 2, completed = 44, total = 46**,
the expected score is a small positive number (the reporter's mental model:
`total / completed * 100 − 100 = 46 / 44 * 100 − 100 = 4.54`).

**Observed bug:** the **main MIS score board displays `0`** for that user/module, yet **clicking the
D1 / D2 / FMS / PMS chip** opens a detail view that **correctly lists all 46 tasks (44 completed + 2 pending)**.

The board score and the drilldown list **do not reconcile**. The user's hypothesis was a date-filter
mismatch. Investigation confirms the *category* of the bug (period/window handling) but pinpoints the
**real** cause as a **task-membership rule mismatch between two independent backends**, not a date-format bug.

---

## 2. Architecture of the Two Data Paths

The board number and the chip drilldown are served by **completely different endpoints** that resolve the
"period" from **different inputs** and select tasks with **different rules**.

| Aspect | MAIN BOARD (the score) | DETAIL CHIP (the drilldown list) |
|---|---|---|
| Endpoint | `GET /api/v1/tasks/scoreboard/data` | `GET /api/v1/tasks/dashboard-with-pending` (D1/D2/PMS), `GET /api/v1/fms-scoreboard/tasks` (Sales FMS) |
| Controller | `tasks.controller.ts:1775` | `tasks.controller.ts:759` |
| Service | `tasks.service.ts:7420` → `calculateMISScore` (`:6699`, called `:7636`) | `tasks.service.ts:1836` `getDashboardTasksWithPending` |
| Period input | **`week` / `month` / `year` tokens** (no dates) | **`from_date` / `to_date`** as `YYYY-MM-DD` |
| Window resolution | `getWeekDateRange(week, year)` → single Mon 00:00 → Sun 23:59:59.999 IST (`:6156`, `:6182-6192`); monthly = month range | `new Date(from + 'T00:00:00.000+05:30')` … `to + 'T23:59:59.999+05:30'` (`:1856-1857`) |
| Result | Pre-computed `misScore` object (D1/D2/PMS/FMS numbers) | Raw paginated task documents (`docs`) |

**Frontend wiring (for reference):**
- Board fetch: `getScoreboardData(params)` → `Redux/actions/taskManagement/scoreboard/index.js:36`; params built in `getScoreboardParams()` (`Scoreboard/index.js:784`); score read at `Scoreboard/index.js:2216`, rendered `:6770-6794`.
- Chip fetch: `fetchScoreDetailTasks()` (`Scoreboard/index.js:4086-4139`); `from_date`/`to_date` come from `getScoreboardPeriodRange()` (`:4067-4084`), which formats **local** `YYYY-MM-DD` (no time component) and, in **monthly** mode, spans the **whole month / all weeks**, while in **weekly** mode uses the selected week.

> **Key structural fact:** the board renders a *server-computed aggregate*; the chip renders a *raw task list* filtered by a *different* window source and *different* membership rules. For the two to agree, both backends must select the same task set. They currently do not.

---

## 3. Root Cause (with evidence)

### 3.1 The membership rule diverges (primary cause)

**Board (`calculateMISScore`)** counts a D1/D2/FMS task in the current period **only if its
deadline/planned_date is inside the window** — bounded on *both* sides:

- D1 current window: `deadline { $gte: startDate, $lte: endDate }` — `tasks.service.ts:6736`
- D2 current window: `deadline { $gte: startDate, $lte: endDate }` — `:6791`
- FMS current window: `planned_date { $gte: startDate, $lte: endDate }` — `:6893`

Its **previous-pending** bucket (`deadline { $lt: startDate }`) only catches carryover that is **still open**
and **explicitly excludes completed tasks**:

- D1 prev-pending excludes `['completed','cancelled','not required','closed']` — `:6760-6762`
- D2 prev-pending — `:6806-6808`; FMS prev-pending excludes `['Completed','Skipped','Rejected']` — `:6906-6907`

**Drilldown (`getDashboardTasksWithPending`)** counts a task if its **effective deadline is `$lte toDate`
(no lower bound)** OR it is still open:

- D1/D2 effective deadline `$lte toDate` — `:1906`; fromDate `$or[ $gte fromDate , status $nin[...] ]` — `:1912-1917` (effective-deadline `$addFields` `:1942-1970`)
- FMS `planned_date { $lte: toDate }` — `:2245`; fromDate `$or[ $gte fromDate , task_status $nin[...] ]` — `:2253-2256`
- PMS completed by `actual_end_date` range — `:2122`; open `end_date { $lte: toDate }` — `:2118`; status `$in ['Pending','Under Review','Reopened','Completed']` — `:2103`

**Consequence for the reported user (backlog clearance):**
Their 44 completed + 2 pending tasks have **deadlines that fall *before* the selected week's `startDate`**
(overdue work completed during the period). Therefore:

- They are **excluded** from the board's *current-window* count (deadline not `$gte startDate`).
- The 44 **completed** ones are **also excluded** from the board's *previous-pending* bucket (completed status is filtered out).
- The drilldown **includes all 46** because its rule is `effective_deadline $lte toDate` (all past deadlines qualify) plus "keep still-open".

Net: board `d1EffectiveTotal → 0`, drilldown list → 46. Exactly the observed contradiction.

### 3.2 The zero-guard amplifies it (secondary cause)

```ts
// tasks.service.ts:6768-6782  (D1; D2 :6815-6828, FMS :6913-6923 identical shape)
const d1EffectiveTotal   = d1TotalCount - d1NotRequiredCount;
const d1TotalRemaining   = (d1EffectiveTotal - d1CompletedCount) + d1PreviousPendingCount;
const d1TotalWithPrevious = d1EffectiveTotal + d1PreviousPendingCount;
const d1 = d1EffectiveTotal === 0 ? 0
         : d1TotalWithPrevious > 0 ? Math.round((d1TotalRemaining / d1TotalWithPrevious) * 100) : 0;
```

The guard `d1EffectiveTotal === 0 ? 0` **short-circuits to 0 whenever no task has a deadline in the current
window — even when `d1PreviousPendingCount > 0`**. So even the 2 pending carryover tasks the board *did*
count are discarded, and the score is forced to `0`. PMS has the same shape (guard on denominator, `:6882-6886`),
and `const total = d1 + d2 + pms + fms` (`:6925`) then sums to 0.

### 3.3 Formula-model mismatch (clarification, not the bug)

The score the reporter expects (`actual / planned * 100 − 100`) is **not** what the board uses.
The board uses a **percent-remaining penalty**: `(remaining / totalWithPrevious) * 100`.
The literal `actual/planned*100−100` formula only exists in the **cron PDF report**
(`cron/scoreboard-report/scoreboard-report.service.ts:777-780`, `calculateTitleScore`), which additionally
filters completed D1/D2 by yet a **third** date field — `completion_date { $gte weekStart, $lte weekEnd }`
(`:1253`, `:1273`) — and pending by `deadline { $lte weekEnd }` (`:968`, `:990`).

Both the board formula and the reporter's formula would return a **small positive number (~4–4.5)** for
46 total / 44 completed / 2 pending — **neither returns 0**. This confirms the `0` is a **task-counting**
failure (§3.1/§3.2), **not** an arithmetic/formula failure. The formula divergence is documented here only
so we do not "fix" the wrong thing.

### 3.4 What is NOT the cause (ruled out)

- ❌ **Not** a `createdAt`-vs-`deadline` field swap — each module uses the *same* date field on both endpoints (D1/D2 `deadline`, FMS `planned_date`, PMS `actual_end_date`/`end_date`).
- ❌ **Not** a missing end-of-day — the drilldown correctly uses `23:59:59.999 IST` (`:1857`) and the board uses `Sun 23:59:59.999 IST` (`:6192`).
- ❌ **Not** a frontend timezone/`YYYY-MM-DD` bug alone — the frontend divergence (week token vs `from_date/to_date`, and monthly = whole-month span) *contributes* to which tasks the drilldown enumerates, but the score `0` is produced server-side by §3.1 + §3.2.

---

## 4. Reproduction Plan (do this first, before coding)

Confirm the hypothesis against the reporter's real user + date range so we fix the actual case:

1. Identify the affected `user` + selected `week/year` (or `month`) that shows `0`.
2. Directly call/inspect `calculateMISScore` inputs for that user/window and log:
   `d1TotalCount`, `d1NotRequiredCount`, `d1CompletedCount`, `d1PreviousPendingCount`,
   `d1EffectiveTotal`, and the resolved `startDate`/`endDate`.
   - **Expected finding:** `d1EffectiveTotal === 0` (or near 0) while `d1PreviousPendingCount ≥ 2`.
3. Query the 46 tasks the drilldown returns and inspect their `deadline` values relative to `startDate`.
   - **Expected finding:** the 44 completed tasks have `deadline < startDate` (backlog completed in-period).
4. Record the actual numbers in this doc's "Verification Results" section (§9) before changing code.

> Because scoring is a **shared runtime module**, we prove the diagnosis with real data **before** editing,
> per the non-regression discipline.

---

## 5. Decision: which side do we align?

| Option | What it does | Effect on reporter's case | Verdict |
|---|---|---|---|
| **A. Align drilldown → board** | Make the chip list use the board's exact window + membership + status rules, so it only shows tasks that fed the score | Drilldown would show **0** tasks too → "reconciled at 0". User loses visibility of the 46 real tasks. **User does not want this.** | ❌ Reject |
| **B. Align board → drilldown (recommended)** | Make `calculateMISScore` count the same task set the drilldown enumerates (include in-period completions of past-deadline tasks + open carryover), and fix the zero-guard so carryover is not discarded | Board produces the small positive score (~4–4.5) that reconciles with the 46 visible tasks | ✅ **Recommended** |
| **C. Do nothing to logic, only relabel** | Keep score as-is, add a tooltip explaining "score counts deadline-in-window only" | Cheapest, but the numbers still contradict the drilldown and the user's expectation. | ⚠️ Fallback only |

**Recommendation: Option B**, implemented conservatively and behind measurement, because the score must
reflect the work the user can see in the drilldown.

---

## 6. Proposed Change (Option B)

### 6.1 Backend — `calculateMISScore` (`tasks.service.ts:6699`)

Two coordinated fixes:

**(a) Fix the zero-guard ordering** so carryover is not thrown away.
Change the guard from "no in-window deadline ⇒ 0" to "no work at all ⇒ 0":

```ts
// BEFORE (:6778)
const d1 = d1EffectiveTotal === 0 ? 0
         : d1TotalWithPrevious > 0 ? Math.round((d1TotalRemaining / d1TotalWithPrevious) * 100) : 0;

// AFTER
const d1 = d1TotalWithPrevious > 0
         ? Math.round((d1TotalRemaining / d1TotalWithPrevious) * 100)
         : 0;
```

Apply the identical change to **D2** (`:6824`) and **FMS** (`:6919`) — **and to the duplicate copies in
`calculateWeekMISScore`** (D1 `:6554`, D2 `:6605`, FMS `:6678`), which powers the trend bars. There are
**6 guards total across 2 functions**; fixing only `calculateMISScore` leaves the trend bars showing the
old values → a new headline-vs-trend mismatch (see §12, Caveat 1).

> ⚠️ **PMS is different — do NOT apply this same edit.** PMS has **no** `EffectiveTotal===0` guard. Its
> gap is the opposite: PMS "remaining" is scoped to `end_date { $gte, $lte }` (`:6871`) with **no
> open-carryover bucket**, while the drilldown counts open PMS by `end_date { $lte: toDate }` (`:2118`,
> no lower bound). To align PMS you must **ADD** an open-carryover bucket (open PMS with `end_date <
> startDate`), not remove a guard. See §12, Caveat 2.

**(b) Broaden the membership window to match the drilldown** so in-period completions of past-deadline
tasks are counted. Options, in order of preference:

- **B-1 (preferred):** add an **"in-period completion"** contribution — count tasks whose *completion*
  falls in `[startDate, endDate]` even if their `deadline < startDate`, mirroring the drilldown's inclusion.
  This aligns `EffectiveTotal` + `CompletedCount` with the visible list.
- **B-2 (simpler, coarser):** change the current-window bound from `deadline { $gte, $lte }` to
  `deadline { $lte: endDate }` (drop the lower bound) and rely on `PreviousPending` + completed-in-range
  to represent carryover — matching `getDashboardTasksWithPending`'s `$lte toDate` rule (`:1906`).
  Risk: this changes the denominator for *every* user, so it needs the full non-regression pass (§7).

> **Exact selection rule to implement must be copied from `getDashboardTasksWithPending`** (`:1906-1917`,
> `:2245-2256`, effective-deadline `$addFields` `:1942-1970`) so the two endpoints are provably identical.
> The implementation task is: **extract the drilldown's per-module match criteria into a shared helper**
> and have **both** the score aggregation and the list endpoint call it — eliminating drift permanently.

### 6.2 Frontend — reconcile the period source (`rosewalt-panel`)

- Ensure `getScoreboardPeriodRange()` (`Scoreboard/index.js:4067-4084`) produces a window **identical** to
  the board's `week/month/year` resolution, so the drilldown and the board describe the *same* period.
  - **Weekly mode:** confirm `selectedWeek.startDate/endDate` == server `getWeekDateRange(week, year)`.
  - **Monthly mode:** confirm the whole-month span matches the server's monthly `startDate/endDate`.
- No formula lives on the frontend for D1/D2/PMS internal-FMS (they are display-only, `:6770-6794`), so
  no arithmetic change is needed there. The Sales-FMS MECA `fmsMecaScore` (`:4226-4228`) already guards
  `planned > 0 ? … : 0` correctly — leave as is unless §4 shows an FMS-specific miss.

### 6.3 Shared helper (recommended refactor)

Create a single `buildScoreboardTaskMatch(module, startDate, endDate)` used by **both**
`calculateMISScore` and `getDashboardTasksWithPending` (and ideally the cron report). This is the
durable fix: the score and its own drilldown can never diverge again.

---

## 7. Non-Regression / Impact Analysis (MANDATORY before approval)

`calculateMISScore` is a **shared runtime module** feeding every user's board, the cron PDF report path,
and TL/HOD dashboards. Any change to counting affects **all historical and current scores**.

Required before merge:

1. **Snapshot current scores** for a representative sample (N users × several weeks/months) via the live
   endpoint, store as a baseline.
2. **Re-run with the patched logic** and **diff** every score.
   - Expected: scores only *change* for users with backlog/carryover patterns (§3.1); "clean" users
     (all deadlines in-window) must be **byte-identical**.
   - Any unexpected delta on a clean user = regression, block merge.
3. **Boundary cases to test explicitly:**
   - User with 0 tasks entirely → score `0` (unchanged).
   - User with only in-window tasks → score unchanged (proves the guard fix is inert when EffectiveTotal>0).
   - User with only carryover pending (deadline < start, still open) → now scored via `TotalWithPrevious`
     instead of forced `0`.
   - User completing past-deadline backlog (the reported case) → now non-zero, reconciles with drilldown.
   - Monthly vs weekly mode for the same user.
4. **Cross-check board vs drilldown** for each test user: the score's implied task set must equal the
   drilldown's `docs` count (this is the acceptance criterion).
5. Confirm the **cron report** (`scoreboard-report.service.ts`) is either updated to the shared helper or
   explicitly documented as intentionally using its own `completion_date` convention.

---

## 8. Security / Compliance / Threat-Model Delta

- **Security controls applied:** none changed — read-only scoring/aggregation path; no new input surface,
  no new endpoint, no auth/authz change. Existing `from_date`/`to_date` are already `Date`-parsed server-side.
- **Compliance clauses involved:** none — no PII field added/removed; task metadata only.
- **Threat model delta (STRIDE):** no new asset, no new trust boundary. Aggregation math change only.
- **VAPT result:** not required (no new endpoint/PII/upload/payment/auth). Standard pre-merge review applies.

---

## 9. Verification Results (fill during implementation)

> To be completed in the reproduction step (§4) and the non-regression run (§7).

- Affected user / window: _TBD_
- `d1TotalCount / NotRequired / Completed / PreviousPending / EffectiveTotal`: _TBD_
- Deadlines of the 44 completed tasks vs `startDate`: _TBD_
- Board score before / after fix: _TBD → TBD_
- Drilldown `docs` count reconciles with score set (Y/N): _TBD_
- Non-regression diff (clean users unchanged?): _TBD_

---

## 10. Rollout & Risk

- **Blast radius:** all MIS scores — high. Mitigate with the §7 baseline diff and a feature-flag / staged
  enable if available.
- **Reversibility:** logic-only change, revertable by restoring `calculateMISScore` + the shared helper.
- **Suggested sequence:**
  1. Reproduce & log (§4) — no code change.
  2. Implement shared helper + guard fix behind measurement.
  3. Baseline diff (§7) on staging with production-like data.
  4. Review numbers with the reporter using the exact user that showed `0`.
  5. Merge + monitor; validate the reported user now shows ~4–4.5 and the drilldown reconciles.

---

## 11. Open Questions for Review

1. **Intended definition of a "period task":** should the board count a task by its **deadline** (current
   behavior) or by **activity/completion in the period** (drilldown behavior)? Option B assumes the latter,
   matching the user's expectation. Confirm this is the desired business rule for D1/D2/FMS/PMS.
2. Should the **cron PDF report** be unified onto the same rule, or intentionally remain deadline/completion-date based?
3. Weekly vs monthly: is the board expected to reconcile with the drilldown in **both** modes, or only the
   currently-viewed mode?

---

## 12. Department-Wise Correctness Verification

Confirmed: **there is exactly ONE scoring engine.** No `if (department === …)` / role / designation /
business_unit branch inside `getScoreboardData` or `calculateMISScore` changes how D1/D2/FMS/PMS are
counted. The `department` param is read once (`tasks.service.ts:7443`) and never used for counting again.
Every department (Sales, DMS, Finance, project teams, …) runs the same math, so the fix behaves
identically for all of them. The only per-user/flag special-casing shifts the **date window** or
overrides **MECA** — never the D1/D2/FMS/PMS counting rule (Sangram/Krupa `:7585-7615`; Sales
`week_aligned`/broadcast-month `:7458`, `:7603-7632`; Bullseye `:7730-7837`; external scoreboard `:7506-7558`).

### Correctness table

| Module | Coverage | Fix verdict |
|---|---|---|
| **D1** | All departments (one engine) | ✅ Correct — remove guard, count carryover; matches drilldown. |
| **D2** | All departments | ✅ Correct — same as D1. |
| **FMS (internal / non-Sales)** | All departments | ✅ Correct — same shape as D1/D2. |
| **PMS** | All departments | ⚠️ Needs an **added** open-carryover bucket, NOT the guard edit (Caveat 2). |
| **FMS (Sales only)** | External SmartCue API (`src/fms-scoreboard/*`) | ❌ Out of scope — black box, fix can't reach it (Caveat 3). |

### Caveats that make the fix complete (all must be addressed)

**Caveat 1 — Fix BOTH functions (6 guards).** The buggy shortcut is duplicated in `calculateMISScore`
(D1 `:6778`, D2 `:6824`, FMS `:6919`) **and** `calculateWeekMISScore` (D1 `:6554`, D2 `:6605`, FMS `:6678`,
used by the trend bars, `:6946`/`:6988`). Fix only the first and the headline changes while the trend bars
keep the old values → new headline-vs-trend mismatch. **PMS has no guard in either function.**

**Caveat 2 — PMS needs an addition, not the guard edit.** `calculateMISScore` PMS (`:6840-6886`) counts
remaining PMS only when `end_date ∈ [startDate,endDate]` (`:6871`) — no open-carryover bucket — while the
drilldown counts open PMS by `end_date { $lte: toDate }` (`:2118`). Overdue PMS carryover is dropped from
the score but shown in the list. Fix = ADD an open-PMS carryover bucket (`end_date < startDate`, open
statuses), plus in-period completion by `actual_end_date`, to mirror the drilldown (`:2103`, `:2118`, `:2122`).

**Caveat 3 — Sales FMS is external and out of scope.** The Sales FMS chip pulls from an external
"SmartCue" API via a thin axios proxy (`src/fms-scoreboard/fms-scoreboard.service.ts:50-135`), not
`calculateMISScore`. The internal fix cannot change it. Two consequences: (a) Sales-FMS reconciliation is a
separate problem; (b) a **pre-existing** inconsistency exists — the Sales FMS *chip* shows the external
number, but the board **total** `d1+d2+pms+fms` (`:6925`) always uses the *internal* FMS. Flag to business;
decide whether to reconcile the external source or accept divergence.

**Caveat 4 — Window alignment for shifted users.** Sangram/Krupa are scored on the **previous week**
(`:7610-7615`) and Sales `week_aligned` on a **broadcast month** (`getBroadcastMonthRange` `:6311`). The
fix is safe for them (same engine, different window), but the drilldown must be queried with the **same
shifted/broadcast `from_date`/`to_date`** or the numbers still won't reconcile.

### Monthly vs weekly
`calculateMISScore` runs **once** per request over the full period (`:7636`); monthly mode does **not** loop
per week (only the cosmetic trend bars loop, via `calculateWeekMISScore`). So reconciliation with the
drilldown is identical in shape for weekly and monthly — only the interval length differs — provided the
chip sends the matching month window.

### Module applicability
All four modules are computed for **every** user unconditionally; `total = (d1+d2+pms+fms)` always divides
by 4 even if a user has no PMS/FMS work (those components resolve to 0 via the guards). There is no backend
per-department "only these modules" gating — any such filtering is frontend-only.

### Verdict
The fix is **uniformly correct for D1, D2, and internal FMS across every department** (one engine, no
branching). It is **safe** for the shifted-window users (Caveat 4) as long as the drilldown uses their
window. It is **incomplete** until: both functions are patched (Caveat 1), PMS gets its carryover bucket
(Caveat 2), and Sales-FMS is decided separately (Caveat 3).

---

### Appendix A — Key file/line index

**Backend (`rosewalt-apis/src/task-management/`)**
- Board endpoint: `tasks/tasks.controller.ts:1775`; service `tasks/tasks.service.ts:7420`
- Score math: `tasks/tasks.service.ts:6699` (`calculateMISScore`), called `:7636`
- Window: `getWeekDateRange` `:6156` (`:6182-6192`)
- D1: current `:6736`, prev-pending `:6760-6762`, formula/guard `:6768-6782`
- D2: `:6791`, `:6806-6808`, `:6815-6828`
- PMS: completed `:6853`, remaining `:6871`, formula `:6882-6886`
- FMS: `:6893`, `:6906-6907`, formula `:6913-6923`; total `:6925`
- Drilldown endpoint: `tasks/tasks.controller.ts:759`; service `tasks/tasks.service.ts:1836`
- Drilldown date parse: `:1856-1857`; D1/D2 match `:1906`, `:1912-1917`, addFields `:1942-1970`;
  PMS `:2103`, `:2118`, `:2122`; FMS `:2245`, `:2253-2256`
- Cron report: `cron/scoreboard-report/scoreboard-report.service.ts` — `calculateTitleScore` `:777-780`;
  completion_date `:1253`, `:1273`; pending deadline `:968`, `:990`

**Frontend (`rosewalt-panel/src/views/TaskManagement/Scoreboard/`)**
- Board fetch action: `Redux/actions/taskManagement/scoreboard/index.js:9-56` (endpoint `:36`)
- Params builder: `Scoreboard/index.js:784`; score consumed `:2216`; rendered `:6770-6794`
- Chip fetch: `Scoreboard/index.js:4086-4139`; period range `:4067-4084`
- List actions: `Redux/actions/taskManagement/tasks/index.js:738` (`/dashboard-with-pending`),
  `:684` (`/dashboard`)
