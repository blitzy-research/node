# Blitzy Project Guide

**Project:** `test_runner` — bind built-in coverage exclusions to cwd-relative paths
**Repository:** `nodejs/node` @ `v26.0.0-pre`
**Branch:** `blitzy-b2b6224e-33b7-4c6f-9925-b4f09649cbc1`
**HEAD:** `fc5d7a9e6a04de491dad52abdf8617e4fccf9108`
**Upstream issue:** [nodejs/node#58654](https://github.com/nodejs/node/issues/58654) — *open, `confirmed-bug`, `test_runner`*

---

## 1. Executive Summary

### 1.1 Project Overview

This project eliminates a silent path-domain logic error in the Node.js test runner's built-in coverage exclusion filter. `shouldSkipFileCoverage()` matched the framework's own default test-file glob and its `node_modules` filter against **absolute** paths, so every source file of any project stored below a directory named `test` or `node_modules` was misclassified as a test file and dropped from the coverage report — with no error, no warning, and a vacuous `100.00%` result that silently defeated `--test-coverage-lines` CI gates. The fix binds both built-in exclusions to the working-directory-relative path while preserving the documented dual-matching contract for user-supplied globs. Beneficiaries are every Node.js user of `--experimental-test-coverage` and every CI pipeline enforcing coverage thresholds.

### 1.2 Completion Status

```mermaid
%%{init: {'theme':'base','themeVariables':{'pie1':'#5B39F3','pie2':'#FFFFFF','pieStrokeColor':'#5B39F3','pieStrokeWidth':'2px','pieOuterStrokeColor':'#5B39F3','pieTitleTextColor':'#B23AF2','pieSectionTextColor':'#FFFFFF','pieLegendTextColor':'#111111'}}}%%
pie showData title 67.6% Complete
    "Completed Work (AI)" : 71
    "Remaining Work" : 34
```

> **Center label: 67.6% Complete** · Completed = Dark Blue `#5B39F3` · Remaining = White `#FFFFFF`

| Metric | Value |
| --- | --- |
| **Total Hours** | **105.0** |
| **Completed Hours (AI + Manual)** | **71.0** (AI: 71.0 · Manual: 0.0) |
| **Remaining Hours** | **34.0** |
| **Percent Complete** | **67.6%** |

**Calculation (PA1, AAP-scoped work only):**
`71.0 ÷ (71.0 + 34.0) × 100 = 71.0 ÷ 105.0 × 100 = 67.6190% → 67.6%`

**Scope note:** all 29 AAP-scoped requirements are **COMPLETED (29/29)**. **0 hours of AAP implementation or verification work remain.** The entire 34.0-hour remainder is path-to-production work for an upstream open-source contribution — PR submission, a real cross-platform CI matrix, human collaborator review, and release-line backports — none of which can be executed autonomously in this environment.

### 1.3 Key Accomplishments

- ✅ **Root cause #1 eliminated** — the built-in default exclusion glob is now gated behind `excludeGlob !== kDefaultPattern` so it can never match an absolute path (`lib/internal/test_runner/coverage.js:491-512`).
- ✅ **Root cause #2 eliminated** — the `node_modules` filter now tests the cwd-relative path via `kNodeModulesPrefix`/`kNodeModulesSegment` instead of the absolute file URL (`coverage.js:532-540`).
- ✅ **The silently-defeated CI coverage gate is repaired** — affected and control projects now *both* exit `1` with `Error: 63.64% line coverage does not meet threshold of 90%.` Pre-fix the affected project exited `0` with no output at all.
- ✅ **Documented user-glob contract preserved byte-for-byte** — the include loop retains both match arms and absolute `--test-coverage-exclude` globs still work; Case C exists solely to guard this.
- ✅ **Regression tests proven load-bearing, not inert** — reverting only `coverage.js` and rebuilding produces `tests 6 | pass 3 | fail 3`, exactly the empty-table + vacuous `100.00` failure mode. This is the precise flaw that made the competing upstream PR #62362's test worthless.
- ✅ **5,341 / 5,341 autonomous test units pass** with 0 failures, 0 blocked, 0 skipped-for-breakage — including 100/100 report snapshots with **zero snapshot diffs**.
- ✅ **20+ case behavioural matrix 100% correct** — zero false positives (`node_modules_extra/`, `my_node_modules/`, `node_modules.js`, ancestor `test-utils` all still reported) and every pre-existing exclusion intact.
- ✅ **Surgical, in-scope diff** — 5 files, +171/−8, matching the AAP's exhaustive change list exactly, with zero out-of-scope files touched and `kDefaultPattern`'s text (also the test-discovery glob) unaltered.
- ✅ **Windows cross-volume hardened** beyond the plan with an `isRelativeToCwd` guard — a strict no-op on POSIX that fails safe by reporting rather than hiding.
- ✅ **`make lint-js` EXIT=0** with `--max-warnings=0` and no auto-fix; longest lines 119 and 109 against a 120-column maximum.
- ✅ **Restored `lcov` artifact browser-verified** — affected and control artifacts are SHA-256 identical inside a real Chrome session, with zero console errors and 15/15 HTTP 200.

### 1.4 Critical Unresolved Issues

**No critical issues block validation or release readiness of the code itself.** There are no unresolved compilation errors, no failing tests, and no missing functionality. The items below are open dependencies on the upstream contribution path, not code defects.

| Issue | Impact | Owner | ETA |
| --- | --- | --- | --- |
| Change not yet submitted upstream to `nodejs/node` | The fix cannot reach released Node.js binaries until a PR is opened and lands | Node.js core contributor / maintainer | 3.0h (H1–H2) |
| Native Windows / UNC / cross-volume behaviour never executed on real hardware | `path.sep`-built constants and the `isRelativeToCwd` guard are verified only on Linux plus simulated `platform:'win32'` matcher runs (16/16) | Platform reviewer with Windows access | 4.0h (H5) |
| Full Node CI matrix (Windows, macOS, AIX, SmartOS, ARM, Alpine) not run | Cross-platform regressions cannot be ruled out from Linux-only evidence | CI operator / release engineer | 8.0h (H3–H4) |
| Competing stale upstream PR #62362 targets the same lines | Possible merge conflict or maintainer preference for an approach that breaks the documented user-glob contract | Reviewing collaborator | 8.0h (H6–H7) |
| Backports to v24.x LTS / v25.x not yet validated | Users on affected release lines (defect shipped in v23.5.0) stay exposed until backported | Release-line owner | 6.0h (H8–H10) |
| Genuinely-empty coverage reports still render as `100.00%` | The silent-failure *class* persists for real empty measurements; AAP §0.6.2.1 explicitly forbids adding a diagnostic in this fix | Follow-up issue owner | 2.0h (H12) |

### 1.5 Access Issues

| System/Resource | Type of Access | Issue Description | Resolution Status | Owner |
| --- | --- | --- | --- | --- |
| `github.com/nodejs/node` | Push / pull-request creation | The container has no network access and no GitHub identity, so the PR cannot be opened and issue/PR statuses could not be re-fetched for confirmation | **Open** — requires a human contributor with commit-signing and GitHub credentials | Node.js core contributor |
| Node.js Jenkins CI (`node-test-pull-request`) | CI job trigger | No access to the upstream CI cluster; only Linux x64 was exercised locally | **Open** — requires collaborator-level CI permissions | CI operator |
| Native Windows / macOS / AIX / SmartOS hosts | Hardware / VM access | Only Linux x64 (Ubuntu 25.10 container, 4 vCPU / 3.9 GB) is available; Windows paths were validated by simulation only | **Open** — requires access to the CI platform fleet | Platform reviewer |
| npm registry / external package sources | Network fetch | No network access. **Not a blocker**: the repository has no root `package.json`, the pre-provisioned `tools/*/node_modules` were reused intact, and the fix adds no dependency | **Resolved / not applicable** | — |
| Local repository, build toolchain and test harness | Read / write / execute | Full access. `configure` state persisted, `out/Release/node` built and current, all suites and linters executable | **Resolved** — no issue | — |

### 1.6 Recommended Next Steps

1. **[High]** Curate the 6 commits and open the upstream PR against `nodejs/node` main, citing `Fixes: https://github.com/nodejs/node/issues/58654` and explaining up front why PR #62362's approach was rejected. *(3.0h — H1, H2)*
2. **[High]** Trigger `node-test-pull-request` and drive the full matrix green, prioritising the **Windows** legs where the `path.sep` constants and `isRelativeToCwd` guard have never executed. *(8.0h — H3, H4)*
3. **[High]** Perform native-Windows manual verification of the cross-volume (`C:` cwd → `D:` source), UNC, and `..`-prefixed scenarios, and publish the result table. *(4.0h — H5)*
4. **[High]** Prepare the design-rationale pack for reviewers — strict-identity discrimination vs. the `TODO(pmarchini)` options-object refactor, and the fail-safe justification for the accepted `..`-prefixed behavioural delta — then apply and re-verify any requested changes. *(8.0h — H6, H7)*
5. **[Medium]** Apply `semver-patch` + `test_runner` labels and validate cherry-picks onto the v24.x LTS and v25.x staging branches. *(6.0h — H8, H9, H10)*

---

## 2. Project Hours Breakdown

### 2.1 Completed Work Detail

Every row traces to a specific AAP requirement. All hours were delivered autonomously by Blitzy agents.

| Component | Hours | Description |
| --- | --- | --- |
| Root-cause isolation & fix-design validation | 6.0 | AAP §0.3 — dual-root-cause proof, 48-case boundary harness driven by the vendored minimatch 10.1.1 with the exact `matchGlobPattern` option set, shipped-binary code-identity extraction, isolation of `test/**/*` as the sole leaking alternative |
| **RC#1 fix** — default exclusion bound to cwd-relative path | 5.0 | AAP Edit 4 — exclude loop rewritten so the absolute arm is short-circuited for `kDefaultPattern` only (`coverage.js:491-512`), with the mandatory 9-line comment naming `createTestFileList()`, a concrete failing path and issue #58654 |
| **RC#2 fix** — `node_modules` exclusion moved onto `relativePath` | 4.5 | AAP Edits 3 & 5 — `kNodeModulesPrefix`/`kNodeModulesSegment` module constants + prefix/segment tests replacing the absolute-URL substring test (`coverage.js:48-49, 532-540`), with the mandatory 5-line comment |
| Module wiring & acyclicity proof | 2.0 | AAP Edits 1-2 — `sep`/`isAbsolute` added to the `path` destructure (`coverage.js:30`); `kDefaultPattern` imported from `internal/test_runner/utils` (`coverage.js:41`); `coverage.js → utils.js` edge proven acyclic by enumeration and by `test-bootstrap-modules.js` |
| Windows cross-volume hardening | 2.5 | Compatible superset — `isRelativeToCwd = !isAbsolute(relativePath)` guard with explanatory comment, covering the case where `path.relative()` cannot express a cross-volume path; strict no-op on POSIX, fail-safe |
| Regression fixtures (×3) | 1.5 | AAP items 8-10 — `logic-file.js` (proven byte-identical to its sibling via `cmp`, guaranteeing the `66.67 / 100.00 / 50.00 / 5-7` row), `file.test.mjs`, `node_modules/dependency.js` |
| `setupFixtures()` fixture staging | 2.0 | AAP item 6 — two fixture copies staged under `tmpdir.resolve('node_modules', …)`; load-bearing twice over: creates the ancestor `node_modules` segment and keeps the 3 pre-existing cases' asserted tables byte-identical |
| Regression Cases A, B and C | 6.5 | AAP item 7 — ancestor-`test` case, ancestor-`node_modules` case (strengthened to run one level above so the interior segment arm is exercised) and the absolute-user-glob contract guard; expected tables captured empirically; exact file idiom preserved |
| Build environment & from-source compilation | 8.0 | AAP §0.7 prerequisite — toolchain verification (gcc 15.2.0 vs the 12.2 floor), `configure --ninja` with ccache, full build, js2c re-embed, binary-freshness proof (`isRelativeToCwd` ×3 in `node_javascript.cc`) and 8/8 live method introspection |
| **Mandatory pre-fix inertness proof** | 3.0 | AAP §0.7.1.1 — reverted `coverage.js` to the pre-fix blob, rebuilt, re-ran → `tests 6 \| pass 3 \| fail 3` with the exact empty-table failure mode, then restored bit-perfectly (sha256 match, empty `git diff HEAD`) and rebuilt |
| Targeted test execution | 4.0 | AAP §0.7.1.2/§0.7.1.6/§0.7.2.1/§0.7.2.2 — primary 6-case suite, 4/4 coverage contract guards, 60/60 `test-runner-*`, 100/100 report snapshots, `test-config-file.js` |
| Full JS + native suite & contention diagnosis | 10.0 | AAP §0.7.2.3 — 5,057/5,057 JS+native, 179/179 cctest, 5/5 tooltest, plus the four-proof diagnosis eliminating 10 apparent failures as resource contention (decisive: `process.moduleLoadList` shows the modified module is never loaded without `--experimental-test-coverage`) |
| Runtime confirmations | 4.5 | AAP §0.7.1.3/§0.7.1.4/§0.7.1.5 — RC#1 and RC#2 paired byte-comparison against controls, threshold-gate repair, `lcov` `SF:` records 0→1, programmatic `run({coverage:true})` byte-identical from affected vs control cwd |
| Behavioural non-regression matrix | 4.0 | AAP §0.7.2.5 — 20+ cases covering false-positive guards (`node_modules_extra`, `my_node_modules`, `node_modules.js`, `test-utils`), every pre-existing exclusion, the `!test/**` override, absolute and relative user globs, TypeScript, and core-module `node:` URLs |
| Lint & static conformance | 3.0 | AAP §0.7.2.4 — `make lint-js` EXIT=0 (`--max-warnings=0`, no auto-fix), per-file `eslint --no-fix` EXIT=0, `lint-md`, `ruff`, 120-column and `operator-linebreak: after` audit, `node --check` on all 5 files |
| Scope-boundary & rules compliance audit | 3.0 | AAP §0.6.2 + §0.8 — verified every DO-NOT-TOUCH region intact (include loop both arms, `file:` guard, `toPercentage`, `kDefaultPattern` text), all 8 baseline constraints, credential scan (0 hits), zero-placeholder audit (0 hits) |
| Commit hygiene & traceability | 1.5 | 6 atomic commits with Node subsystem prefixes, author *and* committer `Blitzy Agent <agent@blitzy.com>`, HEAD ↔ worktree byte-identity confirmed for all 5 files, submodule check |
| **TOTAL COMPLETED** | **71.0** | — |

### 2.2 Remaining Work Detail

Every category is path-to-production work for an upstream contribution. **No AAP implementation or verification work remains.**

| Category | Hours | Priority |
| --- | --- | --- |
| Upstream PR submission preparation (commit curation, `CONTRIBUTING.md`-conformant message, PR body, checklist) | 3.0 | High |
| Node.js CI matrix run & failure triage (Windows, macOS, AIX, SmartOS, ARM, Alpine) | 8.0 | High |
| Native-Windows verification of the cross-volume / UNC guard and the `..`-prefixed delta | 4.0 | High |
| Collaborator / `test_runner`-team review iteration & requested-change re-verification | 8.0 | High |
| `semver-patch` labelling + v24.x LTS / v25.x backport cherry-pick & validation | 6.0 | Medium |
| Full-suite re-run at full parallelism on unconstrained CI hardware (retire the `-j 2` workaround) | 3.0 | Medium |
| AAP-flagged follow-up tracker filing (empty-coverage diagnostic; pre-existing `isolation=none` skip) | 2.0 | Low |
| **TOTAL REMAINING** | **34.0** | — |

*Priority split: High 23.0h · Medium 9.0h · Low 2.0h = 34.0h*

### 2.3 Hours Reconciliation

| Check | Computation | Result |
| --- | --- | --- |
| Section 2.1 total | Sum of 17 completed rows | **71.0h** |
| Section 2.2 total | Sum of 7 remaining categories | **34.0h** |
| Total project hours | 71.0 + 34.0 | **105.0h** ✅ matches §1.2 |
| Completion percentage | 71.0 ÷ 105.0 × 100 = 67.6190% | **67.6%** ✅ matches §1.2, §7, §8 |
| Section 7 pie values | Completed 71 · Remaining 34 | ✅ identical to §1.2 |
| Human task list (§8) | Sum of 12 granular tasks | **34.0h** ✅ matches §2.2 |

**Confidence levels:** *High* for all implementation and Linux-verified rows (direct file, commit and test-output evidence). *Medium* for the CI-matrix and review-iteration estimates (dependent on upstream scheduling and reviewer volume). *High* for the native-Windows and backport estimates (well-bounded, mechanical work).

---

## 3. Test Results

All tests below were executed by Blitzy's autonomous validation systems against `out/Release/node` (`v26.0.0-pre`) built from this branch. Rows marked **†** were independently re-executed live during this assessment phase.

| Test Category | Framework | Total Tests | Passed | Failed | Coverage % | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| **Primary regression (authoritative, AAP §0.5.3)** † | `node:test` + `tools/test.py` | 6 cases | 6 | 0 | 100% of the modified filter branches | `test-runner-coverage-default-exclusion.mjs`: 3 pre-existing + **Case A** (ancestor `test`) + **Case B** (ancestor `node_modules`) + **Case C** (absolute user glob). `pass 6 \| fail 0 \| skipped 0` |
| **Pre-fix inertness proof (AAP §0.7.1.1)** | `node:test` + `tools/test.py` | 6 cases | 3 | **3 (required)** | n/a | Reverting only `coverage.js` → Cases A, B **and** C fail with the exact empty-table + vacuous `100.00` mode. **A deliberate, mandatory failure proving the tests are load-bearing** |
| **Coverage contract guards** † | `tools/test.py` | 4 files | 4 | 0 | 100% of coverage suites | `test-runner-coverage`, `-default-exclusion`, `-source-map`, `-thresholds`. Includes the `'does not include node_modules'` 3-file assertion and the `!test/**` override cases |
| **Test-runner regression** † | `tools/test.py` (`-j 2`) | 60 files | 60 | 0 | Full `test-runner-*` surface | Guards `kDefaultPattern`'s unchanged text via `createTestFileList()` across discovery, watch mode, flag propagation and the `run()` API |
| **Report snapshot / output** † | `tools/test.py` (`-j 2`) | 100 files | 100 | 0 | All 14 coverage snapshots + lcov/junit/dot | **ZERO snapshot diffs** — character-for-character proof that table layout, column widths, ordering and grouping are unchanged |
| **Configuration file** † | `tools/test.py` | 1 file | 1 | 0 | Config-file coverage options | `test-config-file.js` — the configuration route to the coverage options |
| **Full JS + native suite** | `tools/test.py --mode=release -j 2` (`default addons js-native-api node-api embedding`) | 5,057 | 5,057 | 0 | Whole-runtime regression | "All tests passed." Ten apparent failures at `-j 4` were proven to be resource contention on a 4-vCPU/3.9 GB host by four independent proofs |
| **C++ unit tests** | `gtest` (`make cctest`) | 179 | 179 | 0 | 29 gtest suites | Confirms the new `require` edge and module constants perturb nothing native |
| **Tooling tests** | `make tooltest` | 5 | 5 | 0 | Build/tooling scripts | — |
| **Static / syntax validation** † | `node --check` | 5 files | 5 | 0 | 100% of in-scope files | 3 CJS direct + 2 ESM via `--input-type=module` |
| **Lint & style conformance** † | ESLint flat config (`--max-warnings=0`, no auto-fix) | 2 files (+ full `lib`/`test` trees) | 2 | 0 | 100% of modified files | `make lint-js` **EXIT=0**; longest lines 119 and 109 vs the 120 maximum; `operator-linebreak: after` satisfied |
| **Behavioural non-regression matrix** † | Custom fixtures + live binary | 20+ cases | 20+ | 0 | All boundary conditions in AAP §0.7.2.5 | Re-run live on a fresh 9-file fixture: 4 files correctly reported, 6 correctly excluded, zero false positives |
| **Browser artifact verification** † | Chrome DevTools (headless) | 6 assertions × 2 runs | 12 | 0 | `lcov` artifact surface | Affected vs control artifacts SHA-256 identical; 0 console errors, 0 warnings; 15/15 HTTP 200 |
| **TOTAL** | — | **5,341 units** | **5,341** | **0** | — | **100% pass rate. 0 failures, 0 blocked, 0 skipped-for-breakage.** |

> **Integrity note:** every row originates from Blitzy's autonomous validation logs for this project. The single "failed" row is the AAP-mandated pre-fix inertness proof, where failure is the required outcome. Two upstream `SKIP` markers exist in the tree (`test-runner-coverage.js:233` and `test-runner.status`); both are pre-existing, predate this work, and sit in files the AAP designates DO-NOT-MODIFY — see §6 (T5).

---

## 4. Runtime Validation & UI Verification

### 4.1 Build & Binary Health

- ✅ **Operational** — `make -j4` → `ninja: no work to do.`, EXIT=0, zero errors, zero warnings (0.37 s no-op).
- ✅ **Operational** — `./out/Release/node -p …` → `v26.0.0-pre | node | v8=14.3.127.18-node.11`.
- ✅ **Operational** — fix proven embedded in the V8 snapshot: `grep -c 'isRelativeToCwd' out/Release/gen/node_javascript.cc` → **3**.
- ✅ **Operational** — live introspection of the patched method in the running binary: `kDefaultPattern`, `isRelativeToCwd`, `kNodeModulesPrefix`, `kNodeModulesSegment` all **present**; the old buggy arm `StringPrototypeIncludes(url, '/node_modules/')` **absent**.
- ✅ **Operational** — `coverage.js → internal/test_runner/utils` require edge is acyclic; `test-bootstrap-modules.js` passes, so the snapshot is unperturbed.

### 4.2 Root Cause #1 — Ancestor Directory Named `test` (AAP §0.7.1.3)

- ✅ **Operational** — `/tmp/test/covrepro` now emits the `src` group and ` add.js | 100.00 | 100.00 | 100.00`; output **byte-identical** to the `/tmp/covrepro-ctl` control; exit `0`; **stderr 0 bytes**. *Pre-fix: an empty table body.*
- ✅ **Operational** — reproduced **from scratch** during this assessment at `/tmp/guidecheck/test/covrepro`; `diff` against the control returned no differences.

### 4.3 Root Cause #2 — Ancestor Directory Named `node_modules`

- ✅ **Operational** — `/tmp/node_modules/covrepro2` now lists ` add.js | 100.00 | 100.00 | 100.00`. *Pre-fix: an empty table.*
- ✅ **Operational** — reproduced **from scratch** at `/tmp/guidenm/node_modules/covrepro2` with identical output.

### 4.4 Coverage Threshold Gate — Highest-Value Confirmation (AAP §0.7.1.4)

- ✅ **Operational** — `/tmp/test/covgate` (affected) **exit 1** with `Error: 63.64% line coverage does not meet threshold of 90%.` and ` add.js | 63.64 | 100.00 | 33.33 | 6-7 10-11`.
- ✅ **Operational** — `/tmp/covgate-ctl` (control) **exit 1** with byte-identical output → **zero divergence** between affected and control.
- ✅ **Operational** — reproduced **from scratch** at `/tmp/guidegate/…` with identical results.
- 🔎 *Pre-fix the affected project exited **0** with no error at all.* **This validates the repair of a correctness control, not merely a display.**

### 4.5 Reporter & Artifact Integration

- ✅ **Operational** — `--test-reporter=lcov` from the affected project emits the complete record: `TN:` / **`SF:src/add.js`** / `FN:1,add` / `FNDA:1,add` / `FNF:1` / `FNH:1` / `BRDA:1,0,0,1` / `BRDA:1,1,0,1` / `BRF:2` / `BRH:2` / `DA:1,1` / `DA:2,1` / `DA:3,1` / `LH:3` / `LF:3` / `end_of_record`. `SF:` count **0 → 1**; zero `SF:node:` entries; stderr empty.
- ✅ **Operational** — `spec` and `tap` reporters render the restored rows; 100/100 snapshot tests confirm the format is unchanged.
- ✅ **Operational** — the `dot` and `junit` reporters render no coverage rows **by upstream design** (verified by control experiment and source inspection); identical in affected and control, therefore not a defect.
- ✅ **Operational** — programmatic `run({ coverage: true })` produces **byte-identical** output from an affected and a control cwd, confirming the API path is unaffected as the AAP predicted.

### 4.6 Behavioural Correctness Matrix (re-run live on a fresh 9-file fixture)

| Path | Required | Observed |
| --- | --- | --- |
| `src/lib.js` | Reported | ✅ Reported |
| `my_node_modules/mine.js` | Reported (no false positive) | ✅ Reported |
| `node_modules_extra/extra.js` | Reported (no false positive) | ✅ Reported |
| `node_modules.js` | Reported (no false positive) | ✅ Reported |
| `test/helper.js` (own top-level `test/`) | Excluded | ✅ Excluded |
| `src/test/nested.js` (nested `test/`) | Excluded | ✅ Excluded |
| `node_modules/dep/index.js` (own top-level dep) | Excluded via `kNodeModulesPrefix` | ✅ Excluded |
| `packages/a/node_modules/pkg.js` (nested dep) | Excluded via `kNodeModulesSegment` | ✅ Excluded |
| `file-test.js` (basename alternative) | Excluded | ✅ Excluded |
| `run.test.mjs` (the test file itself) | Excluded | ✅ Excluded |

- ✅ **Operational** — contracts preserved: `--test-coverage-exclude=!test/**` still disables the default; absolute user exclude globs still honoured (with and without magic characters); include globs honoured relative *and* absolute; TypeScript stripping unchanged; core `node:` URLs never reported.

### 4.7 UI Verification

- ✅ **No user-interface surface exists — confirmed empirically, not assumed.** All 8 built-in reporters are textual (`dot`, `junit`, `lcov`, `rerun`, `spec`, `tap`, `utils`, `v8-serializer`); a grep for `<html`, `<!doctype`, `document.`, `window.`, `.css` and `createElement` across `lib/internal/test_runner/` returns **zero** hits; a grep for `createServer`/`listen(` returns **zero** hits; there is no root `package.json` in which a UI library could be declared. This confirms AAP §0.4 and §0.5.4.
- ✅ **Operational** — the one **web-consumed** artifact *was* browser-verified. Because the AAP identifies coverage-upload pipelines as part of the blast radius ("silently publish empty artifacts"), the live `lcov` and report-table artifacts from the affected and control projects were served locally and verified in a real headless Chrome session across **two runs**:
  - Verdict: **"ALL 6 ARTIFACT ASSERTIONS PASS — coverage data restored and identical to control"**; all 6 assertion rows PASS.
  - `SF:src/add.js` present in **both** the affected and control panes; the ` add.js | 100.00 | 100.00 | 100.00` row present in both tables; zero `SF:node:` leakage.
  - **In-browser SHA-256 matched `sha256sum` on disk exactly** — `fb4e29fc…f014` for *both* lcov artifacts and `2dce9342…4d24` for *both* tables, proving byte-identity inside the browser.
  - Second run (after eliminating a browser-initiated favicon probe): **0 console errors, 0 console warnings, 0 console messages of any type** (validated with a positive-control injection proving the instrumentation was not blind), and **15/15 network requests HTTP 200** across three cache-bypassing hard reloads.
  - Evidence: `blitzy/screenshots/coverage-artifact-verification.png`, `blitzy/screenshots/coverage-artifact-verification-clean-console.png` (1440×1000), `blitzy/screen_recordings/coverage_artifact_hard_reload_clean_console.webm`.
- ⚠ **Partial** — native Windows / UNC / cross-volume runtime behaviour is verified only by simulated `platform:'win32'` matcher runs (16/16 cases) and static reasoning. Closing this requires real hardware (task **H5**, 4.0h).

---

## 5. Compliance & Quality Review

### 5.1 AAP Deliverable Compliance Matrix

| AAP Requirement | Benchmark | Evidence | Status |
| --- | --- | --- | --- |
| §0.6.1 #1 — add `sep` to the `path` destructure | Exact edit at line 30 | `coverage.js:30` — `const { isAbsolute, join, resolve, relative, sep } = require('path');` | ✅ **Pass** |
| §0.6.1 #2 — import `kDefaultPattern` | No new export; acyclic | `coverage.js:41`; `utils.js:654` export untouched; acyclicity proven | ✅ **Pass** |
| §0.6.1 #3 — `node_modules` comparison constants | Module scope, `sep`-built, `k`-prefixed | `coverage.js:48-49` | ✅ **Pass** |
| §0.6.1 #4 — **RC#1 fix** + mandatory 9-line comment | Absolute arm gated for the default only; comment names `createTestFileList()`, a failing path and issue #58654 | `coverage.js:491-512` | ✅ **Pass** |
| §0.6.1 #5 — **RC#2 fix** + mandatory 5-line comment | Relative-path prefix + segment tests; comment states the relative-path change and discovery mirroring | `coverage.js:532-540` | ✅ **Pass** |
| §0.6.1 #6 — extend `setupFixtures()` | Staged under `tmpdir.resolve('node_modules', …)` with the load-bearing comment | test file lines 17-24 | ✅ **Pass** |
| §0.6.1 #7 — Cases A, B, C | File's exact `spawnSync` idiom; 3 assertions each | test file lines 125-224 | ✅ **Pass** (Case B strengthened) |
| §0.6.1 #8 — `logic-file.js` fixture | **Byte-identical** to its sibling | `cmp` returns no differences | ✅ **Pass** |
| §0.6.1 #9 — `file.test.mjs` fixture | Imports source **and** nested dependency | 9 lines, both imports present | ✅ **Pass** |
| §0.6.1 #10 — `node_modules/dependency.js` fixture | Git-tracked CJS module | 5 lines, tracked (`.gitignore:111`) | ✅ **Pass** |
| §0.6.2 — include loop untouched | **Both** match arms retained | `coverage.js:516-525` | ✅ **Pass** |
| §0.6.2 — `file:` scheme guard untouched | Unchanged | `coverage.js:474` | ✅ **Pass** |
| §0.6.2 — `toPercentage` untouched | `0/0 → 100` convention preserved | `coverage.js:545` | ✅ **Pass** |
| §0.6.2 — `kDefaultPattern` text untouched | Discovery semantics preserved | `utils.js:62, 67` unchanged | ✅ **Pass** |
| §0.6.2 — no `deps/`, `src/`, doc, build-config changes | Diff limited to 5 files | `git diff --name-status` = exactly the AAP list | ✅ **Pass** |
| §0.6.2 — 3 pre-existing cases byte-identical | Insertions only | test file diff `107 / 0` — no deletions | ✅ **Pass** |
| §0.6.3 — no new flag, export, option or dependency | Zero public-surface change | No `package.json`; no CLI/API additions | ✅ **Pass** |
| §0.7.1.1 — **inertness proof** | Cases must fail pre-fix | `tests 6 \| pass 3 \| fail 3`; bit-perfect restore | ✅ **Pass** |
| §0.7.1.2 — primary suite | All cases pass | 6/6, 0 skipped | ✅ **Pass** |
| §0.7.1.3 — symptom gone | Byte-identical to control | Verified for RC#1 and RC#2 | ✅ **Pass** |
| §0.7.1.4 — gate no longer defeated | Both exit `1` with the 63.64% error | Verified, zero divergence | ✅ **Pass** |
| §0.7.1.5 — error surface | `stderr` empty; lcov emits `SF:` | 0 bytes stderr; `SF:` 0→1 | ✅ **Pass** |
| §0.7.1.6 / §0.7.2.1-3 — regression suites | Zero failures | 4/4 · 60/60 · 100/100 · 1/1 · 5,057/5,057 · 179/179 · 5/5 | ✅ **Pass** |
| §0.7.2.4 — lint | Clean, no auto-fix | `make lint-js` EXIT=0 | ✅ **Pass** |
| §0.7.2.5 — spot checks | All unchanged / correct | 20+ cases, 100% correct | ✅ **Pass** |
| §0.7.2.6 — no performance work | Allocation-free by construction | No benchmarks added | ✅ **Pass** |

### 5.2 Repository Convention & Rules Conformance (AAP §0.8)

| Constraint | Verification | Status |
| --- | --- | --- |
| §0.8.1 Minimal surgical diff | 5 files, +171/−8; no refactor, no options-object restructure, no loop unification | ✅ **Pass** |
| §0.8.2 Preserve documented contracts | Include loop intact; absolute user globs honoured; Case C guards it | ✅ **Pass** |
| §0.8.3 Node core internal-JS conventions | Zero new primordial imports; `sep` destructured per sibling precedent; template literals; `k`-prefixed constants; acyclic require | ✅ **Pass** |
| §0.8.4 Linter & formatter conformance | Longest lines 119 / 109 ≤ 120; `operator-linebreak: after` satisfied; `node --check` clean; no auto-fix used | ✅ **Pass** |
| §0.8.5 Repository test conventions | Same `describe`/`it` structure, `spawnSync` shape, `--test-reporter=tap`, `fixtures.path()` / `tmpdir.resolve()`; no new imports | ✅ **Pass** |
| §0.8.6 No collateral harm | Fixtures staged under `node_modules` so pre-existing cases cannot discover them; separate fixture directory used | ✅ **Pass** |
| §0.8.7 Platform neutrality | Constants built from `path.sep`; 16/16 simulated Windows cases incl. UNC; `isRelativeToCwd` cross-volume guard added | ✅ **Pass** (hardware confirmation pending — H5) |
| §0.8.8 Honour stated boundaries | No `deps/`/`src/`/build changes, no `known_issues` test, no directory name special-cased — the *matching domain* changed, not the vocabulary | ✅ **Pass** |

### 5.3 Code Quality Gates

| Gate | Result |
| --- | --- |
| Zero-placeholder policy (TODO/FIXME/stub/`NotImplementedError`) | ✅ **0 hits** across all 5 in-scope files |
| Mandatory explanatory comments | ✅ Both comment blocks present; 14 of the 19 net added runtime lines are documentation |
| Credential / secret scan over the full diff | ✅ **0 matches** (password, secret, api-key, token, private-key, aws patterns) |
| Commit authorship | ✅ 6/6 commits with author **and** committer `Blitzy Agent <agent@blitzy.com>`; identity never overridden |
| HEAD ↔ working-tree byte identity | ✅ All 5 files verified identical — the committed bytes are exactly the validated bytes |
| Out-of-scope artifacts committed | ✅ **None** — `blitzy/`, `.eslintcache`, `out/`, `core.*`, `test/.tmp.*` all 0 tracked |
| Submodules | ✅ None exist (`git submodule status` empty, no `.gitmodules`) |

### 5.4 Fixes Applied During Autonomous Validation

**Source fixes required: 0.** The implementation was already complete and correct when validation began; the validator's mandate was to prove it. Six diagnostic investigations were opened and closed:

1. Ten apparent full-suite failures eliminated as resource-contention artifacts via four independent proofs — the decisive one being a `process.moduleLoadList` exit hook showing `internal/test_runner/coverage` is **not loaded at all** without `--experimental-test-coverage`, so the modified module cannot influence those tests.
2. Three `ruff` errors traced to an untracked scratch directory, plus identification of the methodology trap that `--exclude` *replaces* `pyproject.toml` excludes (852 spurious errors) whereas `--extend-exclude` is correct.
3. Fixture "File ignored" ESLint notices proven to be by-design output at exact parity with the pre-existing sibling fixtures.
4. `dot`/`junit` reporters showing no coverage rows proven to be upstream design by control experiment and source inspection.
5. Recovery from a host-initiated session termination mid-`make lint-js`, with full tree-integrity re-verification.
6. Two AAP-spec deviations reviewed and accepted as compatible supersets (the `isRelativeToCwd` guard; the strengthened Case B).

### 5.5 Outstanding Compliance Items

- ⚠ Native-Windows hardware confirmation of §0.8.7 platform neutrality — task **H5**.
- ⚠ Cross-platform CI evidence for the §0.7.2 regression claims beyond Linux x64 — tasks **H3**/**H4**.
- ℹ Two upstream `SKIP` markers (`test-runner-coverage.js:233`, `test-runner.status`) remain; both are pre-existing, both live in DO-NOT-MODIFY files, and this fix strictly *improves* the first scenario. Tracked for follow-up as **H12**.

---

## 6. Risk Assessment

| Risk | Category | Severity | Probability | Mitigation | Status |
| --- | --- | --- | --- | --- | --- |
| **T1** Windows cross-volume / UNC path handling never executed on native hardware | Technical | Medium | Low | `isRelativeToCwd` guard fails safe (reports rather than hides); 16/16 simulated `win32` cases pass incl. UNC; close with tasks H3–H5 | ⚠ Open — pending hardware |
| **T2** Out-of-cwd test files (`..`-prefixed relative path) are no longer excluded by the **default** pattern | Technical | Low | High (deterministic) | AAP §0.3.3.3 accepts this: `**` cannot traverse `..` without the `dot` option, such files are unreachable by cwd-rooted discovery, the behaviour is *narrower* than `test-exclude`/`c8` (which drop out-of-cwd files entirely), and it fails safe. **Re-confirmed live during this assessment.** Most likely review discussion point | ✅ Accepted & documented |
| **T3** Two AAP-spec supersets (`coverage.js` 731 vs 717 lines; test file 224 vs 219) | Technical | Low | n/a | Both reviewed and accepted as compatible strengthenings; the guard is a strict no-op on POSIX; Case B's strengthening is proven load-bearing | ✅ Accepted & documented |
| **T4** Fix relies on strict reference identity `excludeGlob !== kDefaultPattern` | Technical | Medium | Low | Exact today (a single module-scope string injected at `utils.js:314`); a future refactor that copies or normalises the glob array would re-open RC#1, but Cases A/B are proven load-bearing and would fail. Flag the coupling in the PR body (task H6) | ⚠ Monitored |
| **T5** Pre-existing upstream `test.skip('coverage works with isolation=none')` | Technical | Low | n/a | Proven **not ours** (0 commits by this branch touch that file); AAP §0.6.2.1 lists it DO-NOT-MODIFY; this fix strictly improves the scenario | ℹ Out of scope → H12 |
| **T6** Coupling to vendored minimatch 10.1.1 `**`-traversal semantics | Technical | Low | Low | Cases A/B assert behaviour end-to-end, so any semantics change surfaces as a test failure; `deps/` deliberately untouched | ✅ Guarded by tests |
| **S1** Credential or secret exposure in the diff | Security | None | None | Full-diff scan for password/secret/api-key/token/private-key/aws patterns → **0 matches** | ✅ Verified clean |
| **S2** New attack surface | Security | None | None | Zero new dependencies (no root `package.json`), zero new CLI flags/exports/options, zero C++ change, zero added I/O | ✅ Verified none |
| **S3** Supply-chain exposure | Security | Low | None | `deps/` untouched (minimatch 10.1.1 unchanged); the 3 fixtures are 5–9 line static assets with no install step | ✅ Verified |
| **S4** CI coverage-gate integrity (correctness control) | Security | **High (pre-fix)** | High (pre-fix) | **Repaired and verified** — the gate no longer passes vacuously at `0/0 → 100%`; both affected and control projects now exit `1` at 63.64% | ✅ **Resolved by this fix** |
| **S5** Paths above the project can now appear in reports and `lcov` artifacts | Security | Low | Low | Users can exclude them with an explicit `--test-coverage-exclude` glob (contract preserved); reporting is fail-safe versus silent omission | ✅ Accepted |
| **O1** Genuinely-empty coverage reports still render as `100.00%` | Operational | Medium | Medium | AAP §0.6.2.1 explicitly forbids adding a diagnostic in this fix and calls it a legitimate future enhancement; file a follow-up issue | ⚠ Deferred → H12 |
| **O2** Full-suite flakiness under resource contention (≤4 vCPU / ≤4 GB) | Operational | Medium | High on constrained hosts | Run at `-j 2` (5,057/5,057 clean); failures proven unrelated by four proofs; re-run at full parallelism on CI-class hardware | ⚠ Mitigated → H11 |
| **O3** Container exports `TERM=dumb`, deterministically failing 9 `test-repl-*` tests | Operational | Low | High | `export TERM=xterm-256color` documented as mandatory in §9 | ✅ Mitigated |
| **O4** Editing `lib/*.js` without rebuilding leaves the binary silently stale | Operational | Medium | High for the next developer | The js2c re-embed rule plus a binary-freshness check are documented in §9 | ✅ Mitigated |
| **O5** Untracked-but-not-gitignored `blitzy/` scratch directory | Operational | Medium | Medium | Never use `git add .` / `git add -A`; stage explicit paths only (documented in §9) | ✅ Mitigated |
| **I1** Change cannot reach production without human PR submission, review and green CI | Integration | High | Certain | Tasks H1–H7; the PR body and rationale pack are pre-specified | ⚠ Open by design |
| **I2** Competing stale upstream PR #62362 targets the same lines | Integration | Medium | Medium | Case C demonstrates the contract this fix preserves and that PR breaks; cite it explicitly in the PR body | ⚠ Open |
| **I3** Backport cherry-picks may not apply cleanly to v24.x / v25.x | Integration | Low-Medium | Medium | Tasks H9/H10 include build + suite validation per line, and raising backport PRs if needed | ⚠ Open |
| **I4** No network access in the validation environment | Integration | Low | Certain | Documented in §1.5; all authoritative context was drawn from the repository itself | ℹ Documented |
| **I5** Programmatic `run({ coverage: true })` interaction | Integration | None | None | `runner.js:744-759` overwrites the parsed globs, so no default exclusion applies before or after; verified byte-identical from affected vs control cwd | ✅ Verified no change |

---

## 7. Visual Project Status

### 7.1 Project Hours Breakdown

```mermaid
%%{init: {'theme':'base','themeVariables':{'pie1':'#5B39F3','pie2':'#FFFFFF','pieStrokeColor':'#5B39F3','pieStrokeWidth':'2px','pieOuterStrokeColor':'#5B39F3','pieTitleTextColor':'#B23AF2','pieSectionTextColor':'#FFFFFF','pieLegendTextColor':'#111111'}}}%%
pie showData title Project Hours - 67.6% Complete
    "Completed Work" : 71
    "Remaining Work" : 34
```

*Completed Work = Dark Blue `#5B39F3` (71.0h) · Remaining Work = White `#FFFFFF` (34.0h) · Total 105.0h*

### 7.2 Remaining Work by Priority

```mermaid
%%{init: {'theme':'base','themeVariables':{'pie1':'#5B39F3','pie2':'#B23AF2','pie3':'#A8FDD9','pieStrokeColor':'#5B39F3','pieStrokeWidth':'2px','pieTitleTextColor':'#B23AF2','pieLegendTextColor':'#111111'}}}%%
pie showData title Remaining 34 Hours by Priority
    "High" : 23
    "Medium" : 9
    "Low" : 2
```

### 7.3 Remaining Hours by Category

| Category | Hours | Bar |
| --- | --- | --- |
| Node.js CI matrix run & triage | 8.0 | ████████████████ |
| Collaborator review iteration | 8.0 | ████████████████ |
| `semver-patch` + backport validation | 6.0 | ████████████ |
| Native-Windows verification | 4.0 | ████████ |
| Upstream PR submission prep | 3.0 | ██████ |
| Full-suite re-run at full parallelism | 3.0 | ██████ |
| Follow-up tracker filing | 2.0 | ████ |
| **Total** | **34.0** | — |

### 7.4 AAP Requirement Status

```mermaid
%%{init: {'theme':'base','themeVariables':{'pie1':'#5B39F3','pie2':'#FFFFFF','pieStrokeColor':'#5B39F3','pieStrokeWidth':'2px','pieTitleTextColor':'#B23AF2','pieLegendTextColor':'#111111'}}}%%
pie showData title AAP Requirements - 29 of 29 Completed
    "Completed" : 29
    "Not Started" : 0
```

> **Integrity check:** Section 7 "Remaining Work" = **34** = Section 1.2 Remaining Hours = Section 2.2 Hours total. Section 7 "Completed Work" = **71** = Section 1.2 Completed Hours = Section 2.1 Hours total. 71 + 34 = **105** = Section 1.2 Total Hours.

---

## 8. Summary & Recommendations

### 8.1 What Was Achieved

The project is **67.6% complete** (71.0 of 105.0 total hours). **Every one of the 29 AAP-scoped requirements is delivered and verified** — both root causes, all five source edits, all three fixtures, all three regression cases, and all thirteen steps of the verification protocol.

The engineering substance is a 163-net-line change in which 14 of the 19 net added runtime lines are explanatory comments — a deliberately surgical diff that nonetheless repairs a defect with an enormous blast radius. The two behaviours that matter most were confirmed empirically and repeatedly:

1. **Coverage data is restored.** A project stored below a directory named `test` or `node_modules` now produces coverage output **byte-identical** to the same project stored anywhere else — verified on the original fixtures, on fixtures rebuilt from scratch, and inside a real browser via SHA-256 comparison of the emitted `lcov` artifacts.
2. **The CI coverage gate is repaired.** `--test-coverage-lines=90` now fails at 63.64% in *both* the affected and control projects. Before the fix the affected project exited `0` with no output whatsoever — a correctness control silently defeated by a directory name. This is the highest-value outcome of the work.

Quality evidence is unusually strong: **5,341 of 5,341 autonomous test units pass** with zero failures, including 100 report snapshots with **zero diffs**; `make lint-js` exits `0` under `--max-warnings=0` with no auto-fix; and the new regression tests were **proven load-bearing** by reverting the fix and observing three genuine failures — the exact validation step whose absence rendered the competing upstream attempt worthless.

### 8.2 Remaining Gaps

**Zero AAP implementation or verification work remains.** The 34.0-hour remainder is entirely the human and organisational path required to land an upstream Node.js core contribution, which no agent can execute here: no network access, no GitHub identity, no Jenkins CI permissions, and no non-Linux hardware. Concretely: PR submission (3.0h), CI matrix execution and triage (8.0h), native-Windows verification (4.0h), collaborator review iteration (8.0h), release-line backports (6.0h), a full-parallelism suite re-run (3.0h) and two follow-up trackers (2.0h).

The single genuine technical unknown is **native Windows behaviour**. The `path.sep`-built constants and the `isRelativeToCwd` cross-volume guard are correct by construction and pass 16/16 simulated `win32` cases including a UNC path, but they have never executed on real Windows. The design fails safe — a file is *reported*, never silently omitted — so the worst realistic outcome is a slightly wider report rather than a return of the silent defect.

### 8.3 Critical Path to Production

| # | Task | Priority | Hours | Blocks |
| --- | --- | --- | --- | --- |
| H1 | Curate the 6 commits + `CONTRIBUTING.md`-conformant message (`test_runner:` prefix, ≤50-char subject, `Fixes:`/`Refs:` trailers) | High | 1.5 | H2 |
| H2 | Open the upstream PR (both root causes with file:line; the preserved user-glob contract; the accepted `..` delta stated up front; why #62362 was rejected) | High | 1.5 | H3, H6 |
| H3 | Trigger `node-test-pull-request`; drive Linux/Alpine/macOS green | High | 4.0 | Landing |
| H4 | Triage the Windows / AIX / SmartOS / ARM legs | High | 4.0 | Landing |
| H5 | Native-Windows verification: cross-volume (`C:` cwd → `D:` source), UNC `\\server\share\test\project`, backslash `path.relative()` through both constants, and the `..` delta | High | 4.0 | Reviewer confidence |
| H6 | Design-rationale pack: strict-identity vs. the `TODO(pmarchini)` refactor; why `test/**/*` is the only leaking alternative; fail-safe + industry precedent (`test-exclude` `relativePath:true`, `c8` `allowExternal:false`, `@istanbuljs/schema` anchoring); note the T4 coupling | High | 3.0 | H7 |
| H7 | Apply reviewer changes + re-verify (per change: `make`, then 6/6 + 4/4 + 100/100 + `make lint-js`) | High | 5.0 | Landing |
| H8 | Apply `semver-patch`/`test_runner` labels; confirm the affected-release window (PR #56060 / `5ad2ca920cd`, first shipped v23.5.0; v22.x unaffected) | Medium | 1.0 | H9, H10 |
| H9 | Cherry-pick + build + validate coverage suites on v24.x LTS staging | Medium | 2.5 | v24 release |
| H10 | Cherry-pick + build + validate coverage suites on v25.x staging | Medium | 2.5 | v25 release |
| H11 | Full-suite re-run at full parallelism on ≥8 vCPU / ≥16 GB (`make jstest`, `make cctest`, `make tooltest`) | Medium | 3.0 | Retires the `-j 2` caveat |
| H12 | File two follow-up trackers: empty-coverage diagnostic (O1); pre-existing `isolation=none` skip (T5) | Low | 2.0 | Nothing |
| | **Total** | | **34.0** | |

**Sequence:** H1 → H2 → (H3, H4, H5, H6 in parallel) → H7 → (H8 → H9, H10) → H11, H12.
**Priority split:** High 23.0h · Medium 9.0h · Low 2.0h = **34.0h**, matching §2.2 exactly.

> **Note on absent task categories:** the standard "Immediate Fixes", "Configuration" and "Optimization" categories are **verifiably empty** for this project — there are no compilation errors, no failing tests and no missing functionality to fix; there are no environment variables, API keys, service endpoints or databases in scope; and AAP §0.6.2.3 explicitly forbids performance work.

### 8.4 Success Metrics

| Metric | Target | Actual | Status |
| --- | --- | --- | --- |
| AAP requirements delivered | 29/29 | **29/29** | ✅ |
| Autonomous test pass rate | 100% | **5,341/5,341 = 100%** | ✅ |
| Report snapshot diffs | 0 | **0** of 100 | ✅ |
| Regression tests fail before the fix (inertness) | ≥2 cases | **3 cases** | ✅ Exceeded |
| Threshold-gate divergence between affected and control | 0 | **0** (both exit 1 at 63.64%) | ✅ |
| Behavioural matrix correctness | 100% | **100%** of 20+ cases | ✅ |
| Lint violations | 0 | **0** (`--max-warnings=0`) | ✅ |
| Out-of-scope files modified | 0 | **0** | ✅ |
| Placeholders / TODOs introduced | 0 | **0** | ✅ |
| Secrets in the diff | 0 | **0** | ✅ |
| Platforms runtime-verified | 6 (full CI matrix) | **1** (Linux x64) | ⚠ H3–H5 |

### 8.5 Production Readiness Assessment

**The code is production-ready. The contribution is not yet production-*deployed*.**

The distinction matters and is the whole reason the figure is 67.6% rather than ~99%. Judged as an engineering artefact, this change meets every bar the AAP set: it compiles cleanly, passes 5,341 test units with zero failures, passes lint under the strictest configuration, touches not one out-of-scope file, contains no placeholders, and — uniquely valuable — carries regression tests that have been *proven* to fail without it. Judged as a shipped fix, it has not reached a single end user, because an upstream open-source contribution only becomes "production" when it lands in `nodejs/node` and flows into a release, and that requires a human with network access, CI permissions and reviewer standing.

**Recommendation: proceed immediately to upstream submission (H1–H2).** Attach the design-rationale pack (H6) to the PR from the outset, since the accepted `..`-prefixed behavioural delta and the strict-identity discrimination approach are both foreseeable review topics, and pre-empting them is the cheapest way to shorten the review cycle. Prioritise the Windows CI legs (H4) and the native-Windows verification (H5) above the backports, because they are the only remaining source of genuine technical uncertainty.

---

## 9. Development Guide

> Every command below was executed in this environment during assessment. Outputs shown are verbatim.
> **Working directory for all commands:** `/tmp/blitzy/node/blitzy-b2b6224e-33b7-4c6f-9925-b4f09649cbc1_917303`

### 9.1 System Prerequisites

| Requirement | Minimum | This environment |
| --- | --- | --- |
| C++ compiler | GCC ≥ 12.2 or Clang ≥ 19.1 (`BUILDING.md:158`) | **gcc/g++ 15.2.0** ✅ |
| Python | 3.9+ | **3.13.7** ✅ |
| GNU Make | 4.x | **4.4.1** ✅ |
| Ninja (recommended) | any | **1.12.1** ✅ |
| ccache (recommended) | any | **4.11.2** ✅ |
| Git | 2.x | **2.51.0** ✅ |
| CPU | 4 vCPU minimum; **8+ strongly recommended** | 4 vCPU |
| RAM | 4 GB minimum; **16 GB recommended** | 3.9 GB |
| Disk | ≥ 8 GB free | 915 MB repo + build output |
| OS | Linux / macOS / Windows | Ubuntu 25.10 container |

```bash
# Verify the toolchain before doing anything else
gcc --version | head -1     # gcc (Ubuntu 15.2.0-4ubuntu4) 15.2.0
g++ --version | head -1     # g++ (Ubuntu 15.2.0-4ubuntu4) 15.2.0
python3 --version           # Python 3.13.7
make --version | head -1    # GNU Make 4.4.1
ninja --version             # 1.12.1
ccache --version | head -1  # ccache version 4.11.2
```

> **There is no root `package.json`.** This repository has no JavaScript dependency manifest, so there is **no `npm install` step at the repository root**. Tooling dependencies live in `tools/eslint/node_modules`, `tools/lint-md/node_modules`, `tools/doc/node_modules` and are already provisioned.

### 9.2 Environment Setup

```bash
cd /tmp/blitzy/node/blitzy-b2b6224e-33b7-4c6f-9925-b4f09649cbc1_917303

# BOTH of these are REQUIRED on this container:
export TERM=xterm-256color   # the container exports TERM=dumb, which deterministically fails 9 test-repl-* tests
ulimit -c 0                  # suppress multi-GB core dumps from intentional-crash tests
```

**Configure state is already persisted** — no reconfigure is needed:

```bash
ls -1 config.gypi config.mk config.status   # all three present => skip ./configure
```

For a fresh clone, configure once with ccache and ninja:

```bash
CC="ccache gcc" CXX="ccache g++" python3 ./configure --ninja
```

### 9.3 Build

```bash
make -j4
# ninja: no work to do.
# if [ ! -r node ] || [ ! -L node ]; then ln -fs out/Release/node node; fi
# measured wall time for a no-op: 0.37 s

./out/Release/node -p "process.version + ' | ' + process.release.name + ' | v8=' + process.versions.v8"
# v26.0.0-pre | node | v8=14.3.127.18-node.11
```

> ### ⚠ CRITICAL BUILD RULE
> **Any edit to a file under `lib/` requires re-running `make`.** `js2c` embeds the JavaScript into the V8 startup snapshot; without a rebuild the binary silently keeps executing the *old* code and your change appears to have no effect. A first full build takes roughly 1.5–3 h on 4 vCPU; subsequent `lib/*.js`-only rebuilds are ~8–25 s.

**Verify the fix is actually in the binary you just built:**

```bash
# 1) The patched source reached the embedded snapshot (expect: 3)
grep -c 'isRelativeToCwd' out/Release/gen/node_javascript.cc

# 2) Introspect the live method inside the running binary
./out/Release/node --expose-internals -e "
const { TestCoverage } = require('internal/test_runner/coverage');
const src = TestCoverage.prototype.shouldSkipFileCoverage.toString();
for (const k of ['kDefaultPattern','isRelativeToCwd','kNodeModulesPrefix','kNodeModulesSegment'])
  console.log('present  ', k, '=', src.includes(k));
console.log('old arm removed =', !src.includes(\"StringPrototypeIncludes(url, '/node_modules/')\"));
"
# present   kDefaultPattern = true
# present   isRelativeToCwd = true
# present   kNodeModulesPrefix = true
# present   kNodeModulesSegment = true
# old arm removed = true
```

### 9.4 Verification Steps

```bash
export TERM=xterm-256color; ulimit -c 0

# 1) PRIMARY AAP suite (AAP §0.5.3 / §0.7.1.2) -> 6/6 cases
python3 tools/test.py test/parallel/test-runner-coverage-default-exclusion.mjs
# All tests passed.

# 1b) See the individual case names
./out/Release/node --test-reporter=spec test/parallel/test-runner-coverage-default-exclusion.mjs
# ✔ should override default exclusion setting --test-coverage-exclude
# ✔ should exclude test files from coverage by default
# ✔ should exclude ts test files
# ✔ should not exclude files because an ancestor directory is named test
# ✔ should not exclude files because an ancestor directory is named node_modules
# ✔ should still exclude files matching a user supplied absolute glob
# tests 6 | pass 6 | fail 0 | skipped 0

# 2) Contract guards (AAP §0.7.1.6) -> 4/4
python3 tools/test.py "test/parallel/test-runner-coverage*"

# 3) Regression (AAP §0.7.2.1) -> 60/60
python3 tools/test.py -j 2 "test/parallel/test-runner-*"

# 4) Report snapshots (AAP §0.7.2.2) -> 100/100, zero diffs
python3 tools/test.py -j 2 "test/test-runner/*"
python3 tools/test.py test/parallel/test-config-file.js

# 5) Full JS + native suite -> 5057/5057.
#    USE -j 2 on a 4-vCPU / 3.9 GB host; -j 4 produces non-deterministic timing failures.
python3 tools/test.py --mode=release -j 2 default addons js-native-api node-api embedding
make cctest     # 179/179
make tooltest   # 5/5

# 6) Syntax check every in-scope file
./out/Release/node --check lib/internal/test_runner/coverage.js
./out/Release/node --check test/fixtures/test-runner/coverage-relative-exclusion/logic-file.js
./out/Release/node --check test/fixtures/test-runner/coverage-relative-exclusion/node_modules/dependency.js
./out/Release/node --input-type=module --check < test/parallel/test-runner-coverage-default-exclusion.mjs
./out/Release/node --input-type=module --check < test/fixtures/test-runner/coverage-relative-exclusion/file.test.mjs

# 7) Lint — the canonical gate. NEVER use an auto-fixing variant.
rm -f .eslintcache && make lint-js
# Running JS linter...   (exit 0, no findings)

# 7b) Per-file lint (faster iteration)
./out/Release/node tools/eslint/node_modules/eslint/bin/eslint.js \
  --no-fix --max-warnings=0 --report-unused-disable-directives \
  lib/internal/test_runner/coverage.js \
  test/parallel/test-runner-coverage-default-exclusion.mjs
```

### 9.5 Example Usage — Reproduce and Confirm the Fix

**Confirm Root Cause #1 is gone** (a project below an ancestor directory named `test`):

```bash
NODE=$PWD/out/Release/node

mkdir -p /tmp/demo/test/covrepro/src
printf 'export function add(a, b) {\n  return a + b;\n}\n' > /tmp/demo/test/covrepro/src/add.js
printf "import assert from 'node:assert';\nimport { test } from 'node:test';\nimport { add } from './src/add.js';\n\ntest('adds', () => {\n  assert.strictEqual(add(1, 2), 3);\n});\n" > /tmp/demo/test/covrepro/add.test.mjs
cp -r /tmp/demo/test/covrepro /tmp/demo/covrepro-ctl   # control, no "test" ancestor

cd /tmp/demo/test/covrepro && $NODE --test --experimental-test-coverage
```

Expected — the table body now contains rows and is byte-identical to the control:

```text
ℹ start of coverage report
ℹ ----------------------------------------------------------
ℹ file      | line % | branch % | funcs % | uncovered lines
ℹ ----------------------------------------------------------
ℹ src       |        |          |         |
ℹ  add.js   | 100.00 |   100.00 |  100.00 |
ℹ ----------------------------------------------------------
ℹ all files | 100.00 |   100.00 |  100.00 |
ℹ ----------------------------------------------------------
ℹ end of coverage report
```

**Confirm Root Cause #2 is gone** (a project below an ancestor `node_modules`):

```bash
mkdir -p /tmp/demo/node_modules && cp -r /tmp/demo/covrepro-ctl /tmp/demo/node_modules/covrepro2
cd /tmp/demo/node_modules/covrepro2 && $NODE --test --experimental-test-coverage
# ℹ  add.js   | 100.00 |   100.00 |  100.00 |
```

**Confirm the coverage gate is no longer silently defeated** — the highest-value check:

```bash
mkdir -p /tmp/demo/test/covgate/src
printf 'export function add(a, b) {\n  return a + b;\n}\n\nexport function unused1() {\n  return 1;\n}\n\nexport function unused2() {\n  return 2;\n}\n' > /tmp/demo/test/covgate/src/add.js
cp /tmp/demo/test/covrepro/add.test.mjs /tmp/demo/test/covgate/
cp -r /tmp/demo/test/covgate /tmp/demo/covgate-ctl

cd /tmp/demo/test/covgate && $NODE --test --experimental-test-coverage --test-coverage-lines=90; echo "exit=$?"
cd /tmp/demo/covgate-ctl  && $NODE --test --experimental-test-coverage --test-coverage-lines=90; echo "exit=$?"
```

Expected — **both** exit `1` with identical output (pre-fix the first exited `0` silently):

```text
ℹ  add.js   |  63.64 |   100.00 |   33.33 | 6-7 10-11
ℹ Error: 63.64% line coverage does not meet threshold of 90%.
exit=1
```

**Confirm the `lcov` artifact is populated:**

```bash
cd /tmp/demo/test/covrepro && $NODE --test --experimental-test-coverage --test-reporter=lcov | grep '^SF:'
# SF:src/add.js        (pre-fix: no output at all)
```

**Confirm the exclusions that must still work:**

```bash
mkdir -p /tmp/demo/spot/{src,test,node_modules/dep,node_modules_extra,my_node_modules,packages/a/node_modules,src/test}
# ... populate and import each file from a single test, then:
cd /tmp/demo/spot && $NODE --test --experimental-test-coverage run.test.mjs
# REPORTED : src/lib.js, my_node_modules/mine.js, node_modules_extra/extra.js, node_modules.js
# EXCLUDED : test/helper.js, src/test/nested.js, node_modules/dep/index.js,
#            packages/a/node_modules/pkg.js, file-test.js, run.test.mjs
```

### 9.6 Troubleshooting

| Symptom | Cause | Resolution |
| --- | --- | --- |
| Coverage table is empty / shows a vacuous `100.00` | Stale binary — a `lib/*.js` edit was not rebuilt, so js2c never re-embedded it | `make -j4`, then confirm `grep -c 'isRelativeToCwd' out/Release/gen/node_javascript.cc` returns `3` |
| Random full-suite failures (watch mode, timers, WASI, SEA) | Resource contention on ≤4 vCPU / ≤4 GB | Re-run at `-j 2`, or in isolation with `tools/test.py -J <test>`. The modified module is provably not loaded without `--experimental-test-coverage` |
| 9 `test-repl-*` tests fail | Container exports `TERM=dumb` | `export TERM=xterm-256color` |
| Multi-GB `core.*` files appear | Intentional-crash tests dumping core | `ulimit -c 0` before running suites |
| `eslint: Invalid option '--eslintrc'` (exit 2) | This ESLint uses **flat config**; legacy flags are rejected | Use `--no-fix --max-warnings=0 --report-unused-disable-directives` and omit `--no-eslintrc`/`--ext` |
| `File ignored because of a matching ignore pattern` on the new fixtures | By design — `eslint.config.mjs` ignores `test/fixtures/test-runner/*` except the `output/` subtree | Expected; at exact parity with the pre-existing sibling fixtures. Do not "fix" it |
| `ruff` reports hundreds of errors | Plain `--exclude` **replaces** the `pyproject.toml` excludes | Use `ruff check . --extend-exclude blitzy` |
| `dot` / `junit` reporters show no coverage rows | Upstream design — only `spec`, `tap` and `lcov` render coverage | Not a defect; identical in affected and control runs |
| Accidental commit of build or scratch artifacts | `blitzy/` is untracked but **not** gitignored | **Never** `git add .` or `git add -A`; stage explicit paths only |
| `make lint-js` seems to hang | Full-tree ESLint over `lib`, `test`, `tools`, `benchmark`, `doc` | Let it run (several minutes), or use the per-file invocation in §9.4 step 7b |
| Stale lint results | `run-lint-js` uses `--cache` | `rm -f .eslintcache` before a definitive run |

---

## 10. Appendices

### Appendix A — Command Reference

| Purpose | Command |
| --- | --- |
| Configure (fresh clone) | `CC="ccache gcc" CXX="ccache g++" python3 ./configure --ninja` |
| Build | `make -j4` |
| Binary version | `./out/Release/node --version` |
| Binary freshness | `grep -c 'isRelativeToCwd' out/Release/gen/node_javascript.cc` |
| Live method introspection | `./out/Release/node --expose-internals -e "…shouldSkipFileCoverage.toString()…"` |
| Primary AAP suite | `python3 tools/test.py test/parallel/test-runner-coverage-default-exclusion.mjs` |
| Named case output | `./out/Release/node --test-reporter=spec test/parallel/test-runner-coverage-default-exclusion.mjs` |
| Contract guards | `python3 tools/test.py "test/parallel/test-runner-coverage*"` |
| Runner regression | `python3 tools/test.py -j 2 "test/parallel/test-runner-*"` |
| Report snapshots | `python3 tools/test.py -j 2 "test/test-runner/*"` |
| Config-file route | `python3 tools/test.py test/parallel/test-config-file.js` |
| Full JS + native | `python3 tools/test.py --mode=release -j 2 default addons js-native-api node-api embedding` |
| C++ unit tests | `make cctest` |
| Tooling tests | `make tooltest` |
| Single test, isolated | `python3 tools/test.py -J <test-path>` |
| Lint (canonical) | `rm -f .eslintcache && make lint-js` |
| Lint (per file) | `./out/Release/node tools/eslint/node_modules/eslint/bin/eslint.js --no-fix --max-warnings=0 --report-unused-disable-directives <files>` |
| Markdown lint | `make lint-md` |
| Python lint | `ruff check . --extend-exclude blitzy` |
| Syntax check (CJS) | `./out/Release/node --check <file.js>` |
| Syntax check (ESM) | `./out/Release/node --input-type=module --check < <file.mjs>` |
| Coverage run | `node --test --experimental-test-coverage` |
| Coverage + threshold | `node --test --experimental-test-coverage --test-coverage-lines=90` |
| Coverage as lcov | `node --test --experimental-test-coverage --test-reporter=lcov` |
| Disable default exclusion | `node --test --experimental-test-coverage --test-coverage-exclude='!test/**'` |
| Branch diffstat | `git diff --stat 7777f30e59d..HEAD` |
| Verify authorship | `git log --pretty=format:"%h\|%an\|%ae\|%cn\|%ce\|%s" 7777f30e59d..HEAD` |

> ⛔ **Never run:** `make lint-js-fix`, `eslint --fix`, `git add .`, `git add -A`, or `make jstest` at `-j 4` on ≤4 vCPU.

### Appendix B — Port Reference

The deliverable is a runtime patch to a CLI/library. **It binds no ports and starts no server** (verified: zero `createServer`/`listen(` references in `lib/internal/test_runner/`).

| Port | Usage | Notes |
| --- | --- | --- |
| — | None required by the fix, the test suite, or the runtime | Coverage output goes to stdout or a file only |
| `8099` | *Assessment-only* — a temporary `python3 -m http.server` used to serve the `lcov` artifacts for browser verification | Stopped after verification; not part of the deliverable |
| `9229` | Node's default inspector port, used indirectly by `--experimental-test-coverage` via the inspector protocol | Pre-existing Node behaviour; unchanged by this fix |

### Appendix C — Key File Locations

| Path | Role | Lines | Status |
| --- | --- | --- | --- |
| `lib/internal/test_runner/coverage.js` | **The fix.** `shouldSkipFileCoverage()` — L30 imports, L41 `kDefaultPattern`, L48-49 constants, L477 `isRelativeToCwd`, L491-512 RC#1, L532-540 RC#2 | 731 | **MODIFIED** (+41/−8) |
| `test/parallel/test-runner-coverage-default-exclusion.mjs` | Authoritative regression suite — L17-24 staging, L125-224 Cases A/B/C | 224 | **MODIFIED** (+107) |
| `test/fixtures/test-runner/coverage-relative-exclusion/logic-file.js` | Measured source; byte-identical to its sibling | 9 | **CREATED** |
| `test/fixtures/test-runner/coverage-relative-exclusion/file.test.mjs` | Fixture test; imports source **and** nested dependency | 9 | **CREATED** |
| `test/fixtures/test-runner/coverage-relative-exclusion/node_modules/dependency.js` | Dependency that must never be reported | 5 | **CREATED** |
| `lib/internal/test_runner/utils.js` | Defines (`:62`, `:67`), injects (`:309-316`) and exports (`:654`) `kDefaultPattern` | 661 | Read-only reference |
| `lib/internal/test_runner/runner.js` | Test discovery (`:120-138`), `node_modules` skip by name (`:128`), `run()` glob override (`:744-759`) | 919 | Read-only reference |
| `lib/internal/fs/glob.js` | `matchGlobPattern` option set; the absent `dot` option (`:784-797`) | 803 | Read-only reference |
| `lib/internal/test_runner/test.js` | Threshold enforcement against `coverage.totals` (`:1277-1296`) | 1573 | Read-only reference |
| `lib/internal/test_runner/reporter/lcov.js` | Iterates the same `summary.files` collection (`:31-32`) | 107 | Read-only reference |
| `doc/api/cli.md` | The documented user-glob contract (`:2633-2680`) | 4271 | Read-only reference |
| `test/common/tmpdir.js` | The `test/.tmp.N` layout that masked the defect; `resolve()` helper | 112 | Read-only reference |
| `test/parallel/test-runner-coverage.js` | `'does not include node_modules'` 3-file assertion (`:290-296`); pre-existing skip (`:233`) | 568 | Read-only reference |
| `eslint.config.mjs` | Fixture ignores (`:60`, `:72-74`), 120-column max (`:303-310`), `operator-linebreak` (`:322`) | 421 | Read-only reference |
| `Makefile` | `run-lint-js` (`:1447-1448`), `lint-js` (`:1458-1468`), `jstest` | — | Read-only reference |
| `BUILDING.md` | Toolchain floor (`:158`), build (`:351-352`), `tools/test.py` forms (`:412-420`) | 1143 | Read-only reference |

### Appendix D — Technology Versions

| Component | Version | Source |
| --- | --- | --- |
| Node.js (built) | **v26.0.0-pre** | `src/node_version.h` — major 26, minor 0, patch 0, `NODE_VERSION_IS_RELEASE 0` |
| V8 | 14.3.127.18-node.11 | `process.versions.v8` |
| minimatch (vendored) | **10.1.1** | `deps/minimatch/package.json` — **unchanged by this fix** |
| GCC / G++ | 15.2.0 (Ubuntu 15.2.0-4ubuntu4) | `gcc --version` |
| GNU Make | 4.4.1 | `make --version` |
| Ninja | 1.12.1 | `ninja --version` |
| ccache | 4.11.2 | `ccache --version` |
| Python | 3.13.7 | `python3 --version` |
| Git | 2.51.0 | `git --version` |
| Host OS | Ubuntu 25.10 (container) | — |
| ESLint | Flat config (`eslint.config.mjs`) | `tools/eslint/node_modules` |
| Chrome (verification only) | Headless, DevTools protocol | Assessment tooling |

**Dependency changes introduced by this work: none.** The repository has no root `package.json`; the only root manifests are `.nycrc`, `pyproject.toml`, `tsconfig.json`, `codecov.yml`, `node.gyp` and `Makefile`.

### Appendix E — Environment Variable Reference

| Variable | Value | Required | Purpose |
| --- | --- | --- | --- |
| `TERM` | `xterm-256color` | **Yes** on this container | The container exports `TERM=dumb`, which deterministically fails 9 `test-repl-*` tests |
| `CC` / `CXX` | `ccache gcc` / `ccache g++` | Recommended | Enables ccache (68% hit rate observed), dramatically shortening rebuilds |
| `NODE_TEST_TMPDIR` | `<tmpdir.path>` | Set by the test harness | Used by every case in the exclusion suite; do not set manually |
| `CI` | `true` | Optional | Standard non-interactive signal for Node tooling |
| `DEBIAN_FRONTEND` | `noninteractive` | Optional | Only for `apt` operations |

**Shell limits:** `ulimit -c 0` is required to prevent multi-GB core dumps from intentional-crash tests.

**The fix itself introduces no environment variable, CLI flag, `node:test` export, `run()` option or configuration key** (AAP §0.6.2.3).

### Appendix F — Developer Tools Guide

| Tool | Invocation | Notes |
| --- | --- | --- |
| **Test harness** | `python3 tools/test.py [-j N] [-J] <pattern>` | `-J` runs a single test in isolation — the fastest way to distinguish a real failure from resource contention. Use `-j 2` on ≤4 vCPU |
| **ESLint** | `make lint-js` / per-file invocation | Flat config. `--max-warnings=0`. Uses `--cache`, so `rm -f .eslintcache` before a definitive run. **Never** use `--fix` or `make lint-js-fix` |
| **markdownlint** | `make lint-md` | Writes the `tools/.mdlintstamp` gitignored byproduct |
| **ruff** | `ruff check . --extend-exclude blitzy` | `--extend-exclude` **adds** to the `pyproject.toml` excludes; plain `--exclude` **replaces** them and yields ~852 spurious errors |
| **cctest** | `make cctest` | 179 gtests across 29 suites |
| **Internals introspection** | `./out/Release/node --expose-internals -e "…"` | The only way to confirm what the *built binary* actually executes — indispensable after any `lib/` edit |
| **Module-load audit** | `--require` hook reading `process.moduleLoadList` | Proves whether a module is loaded at all in a given run; used to exonerate this fix from unrelated failures |
| **Diff review** | `git diff <base>..HEAD -- <path>`, `--stat`, `--numstat`, `--name-status` | Base commit for this branch: `7777f30e59d` |
| **Byte-identity check** | `cmp <a> <b>` · `git rev-parse HEAD:<f>` vs `git hash-object <f>` | Used to prove the fixture matches its sibling and that committed bytes equal validated bytes |

### Appendix G — Glossary

| Term | Definition |
| --- | --- |
| **AAP** | Agent Action Plan — the authoritative specification for this work item, including the exhaustive change list (§0.6.1) and verification protocol (§0.7) |
| **RC#1** | Root Cause #1 — the built-in default exclusion glob matched against the **absolute** path, so an ancestor directory named `test` excluded every source file |
| **RC#2** | Root Cause #2 — the `node_modules` filter performed a substring test on the **absolute file URL**, so an ancestor `node_modules` excluded the whole project |
| **`kDefaultPattern`** | `**/{test,test/**/*,test-*,*[._-]test}.{js,mjs,cjs,ts,mts,cts}` — the framework's built-in exclusion glob, defined at `utils.js:67`. Also the test-file **discovery** glob, which is why its text must never change |
| **`kNodeModulesPrefix` / `kNodeModulesSegment`** | `node_modules<sep>` and `<sep>node_modules<sep>` — module-scope constants catching the project's own top-level dependency directory and any nested/out-of-tree one respectively |
| **`isRelativeToCwd`** | `!isAbsolute(relativePath)` — the guard covering Windows cross-volume paths, where `path.relative()` returns an absolute path it cannot express relatively |
| **Inertness proof** | Reverting the fix, rebuilding, and confirming the new tests genuinely **fail**. Mandated by AAP §0.7.1.1; its absence is what made the competing upstream PR #62362's test worthless |
| **Masking** | The reason this defect survived to release: `matchGlobPattern` omits minimatch's `dot` option, so `**` cannot traverse the dot-prefixed `test/.tmp.N` directory the existing suite runs under — the old tests passed despite the bug |
| **js2c** | The build step that compiles `lib/*.js` into the V8 startup snapshot. Skipping a rebuild after a `lib/` edit leaves the binary silently stale |
| **`toPercentage`** | `coverage.js:545` — renders a `0/0` ratio as `100`, which is what turned an empty report into an apparently perfect one and silently defeated coverage gates. Correct for genuinely empty input; deliberately unchanged |
| **Case A / B / C** | The three new regression cases: ancestor directory named `test`; ancestor directory named `node_modules`; absolute user-supplied exclude glob (the contract guard) |
| **`semver-patch`** | The Node.js label marking a change as eligible for backport to active release lines without an API change |
| **`-j 2`** | The parallelism setting required for deterministic full-suite runs on this 4-vCPU / 3.9 GB host |
| **Path-to-production** | For a Node core contribution: upstream PR submission, cross-platform CI, collaborator review, and release-line backports — the entirety of the remaining 34.0 hours |

---

## Cross-Section Integrity Validation

*Verified programmatically before submission — all 12 checks PASS.*

| Rule | Check | Result |
| --- | --- | --- |
| **Rule 1a** | §1.2 Remaining (34.0) == §2.2 Hours sum (34.0) | ✅ PASS |
| **Rule 1b** | §2.2 Hours sum (34.0) == §7 pie "Remaining Work" (34) | ✅ PASS |
| **Rule 1c** | §1.2 Remaining (34.0) == §7 pie "Remaining Work" (34) | ✅ PASS |
| **Rule 2a** | §2.1 Hours sum (71.0) == §1.2 Completed (71.0) | ✅ PASS |
| **Rule 2b** | §2.1 (71.0) + §2.2 (34.0) == §1.2 Total (105.0) | ✅ PASS |
| **Rule 2c** | §7 pie total (71 + 34) == §1.2 Total (105.0) | ✅ PASS |
| **Rule 3** | Every test in §3 originates from Blitzy's autonomous validation logs | ✅ PASS |
| **Rule 4** | §1.5 access issues validated against actual system permissions (network, CI, hardware all confirmed unavailable; local build/test confirmed available) | ✅ PASS |
| **Rule 5** | Completed = Dark Blue `#5B39F3`; Remaining = White `#FFFFFF`; headings Violet-Black `#B23AF2`; accent Mint `#A8FDD9` — applied in §1.2 and §7 | ✅ PASS |
| **Percentage** | 71.0 ÷ 105.0 × 100 = 67.6190% → **67.6%**, used identically in §1.2, §2.3, §7 and §8 | ✅ PASS |
| **Ceiling** | 67.6% < 99% — no claim of completion | ✅ PASS |
| **Task list** | §8.3 twelve granular tasks sum to 34.0h == §2.2 total; priority split High 23.0 / Medium 9.0 / Low 2.0 == 34.0 | ✅ PASS |