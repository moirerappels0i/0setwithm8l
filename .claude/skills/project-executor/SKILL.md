---
name: project-executor
description: Use this skill whenever the user invokes /project-executor or asks to create a plan, start, continue, resume, check status of, list, or complete a long-running implementation project. Also triggers when the current branch is a claude/implementation/* branch or the repo contains a Project-Development/ folder. This skill runs a git-native, branch-scoped workflow: state lives in Project-Development/ on a feature branch so any session — terminal or web — can resume by pulling the branch. On completion, Project-Development/ is removed in a final commit so squash-merging the PR leaves main clean.
---

# Project Executor

You execute long-running implementation projects using a git-native, branch-scoped state system. All project state lives in `Project-Development/` on a dedicated feature branch. Any session — terminal or web — resumes by pulling the branch.

## Core invariants

- State lives in `<repo_root>/Project-Development/` on branch `claude/implementation/<feature>`.
- `main` (or the repo's default branch) NEVER contains `Project-Development/`. A final commit removes it before the PR is opened.
- Git is the sync layer: commit and push state changes so other sessions see them.
- Only markdown state goes in `Project-Development/`. Code lives in its normal repo locations.
- Planning (`create`) is strictly separated from execution (`start`).

## Subcommand dispatch

You are always invoked with a subcommand (parsed from `$ARGUMENTS` by the slash command). Route as follows:

| Subcommand | Mode |
|---|---|
| `create <goal>` | Mode 0 — planning only |
| `start [<plan>]` | Mode 1 — begin execution |
| `continue [feature]` | Mode 2 — resume |
| `status [feature]` | Mode 5 — status report |
| `approved` / `ship` / `open-pr` | Mode 4 — finalize PR |
| `list` | Mode 6 — list projects |
| `help` | print subcommand list, stop |

If invoked without a subcommand: if `Project-Development/` exists on the current branch → Mode 2; otherwise print help.

## The four state files

All inside `Project-Development/`:

**PLAN.md** — full plan. Written in Mode 0 (proposal) or Mode 1 (if user skips `create`). Changes only on explicit user scope change.

**TODO.md** — phased checklist:
```
## Phase 1: <name>
- [ ] Task
- [x] Done
- [~] In progress
- [!] Blocked — <reason>
```
Tasks small enough to be 1–3 file edits each.

**PROGRESS.md** — append-only:
```
## YYYY-MM-DD HH:MM — <task title>
- What was done (2–3 lines)
- Files: path/to/file
- Decisions: <non-obvious choices>
- Next: <next task>
```

**CONTEXT.md** — written once:
```
# <feature>

**Branch:** claude/implementation/<feature>
**Base branch:** <detected default>
**Stack:** <languages, frameworks>
**Run tests:** <command>
**Run locally:** <command>
**Key conventions:** <notes>
```

## Mode 0: create (planning only)

Purpose: turn a rough user goal into a reviewable PLAN.md proposal. No branch, no execution, no state folder yet.

1. Read the goal from the payload (e.g. `new feature login page, create a modern login page`).
2. Briefly scan the repo to understand the stack: look at `package.json`, `requirements.txt`, `pyproject.toml`, `Cargo.toml`, `go.mod`, the top-level folder structure, and the README. Don't go deep — just enough to ask informed questions.
3. Ask the user a focused set of clarifying questions. Keep it to 3–6 questions covering the things that meaningfully change the plan:
   - Scope boundaries (what's in, what's out)
   - User-facing behavior / UX expectations
   - Tech choices where multiple reasonable options exist (libraries, patterns)
   - Integration points with existing code
   - Testing expectations
   - Any non-negotiable constraints (design system, accessibility, auth provider, etc.)
   If the goal is already very specific, ask fewer questions. If it's very vague, ask more — but never more than 6 at once. Prefer the `ask_user_input_v0` tool when available; otherwise number the questions clearly.
4. After receiving answers, write the **plan proposal** directly in the chat (not to a file yet). Structure:
   ```
   # Proposed plan: <feature>

   ## Goal
   <1–3 lines>

   ## Approach
   <high-level strategy, tech choices, key decisions>

   ## Phases
   ### Phase 1: <name>
   - Task
   - Task
   ### Phase 2: <name>
   - Task
   ...

   ## Out of scope
   - <things explicitly not being done>

   ## Open questions
   - <anything still unresolved, if any>
   ```
5. End the message with: "Reply with changes, or run `/project-executor start` to execute this plan."
6. **Do not create any files. Do not create a branch. Do not commit anything.**
7. If the user replies with edits, revise the proposal in-chat and offer it again. Iterate until they approve.

When the user later runs `/project-executor start` (with no payload), use the most recent approved proposal from this session as the plan for Mode 1. If the session was lost, ask the user to paste the plan or re-run `create`.

## Mode 1: start

1. `git status` — must be clean. If dirty, stop and tell user to commit or stash.
2. Detect the default branch: `git symbolic-ref refs/remotes/origin/HEAD` or `gh repo view --json defaultBranchRef -q .defaultBranchRef.name`. Fall back to `main`.
3. Determine the plan source:
   - If a proposal from Mode 0 exists in this session → use it.
   - Else if `$ARGUMENTS` after `start` contains a plan → use that.
   - Else ask the user to provide one or run `create` first.
4. Derive a kebab-case feature name from the plan (short, descriptive: `user-auth`, `invoice-pdf`, `login-page`). If ambiguous, ask.
5. Auto-create the branch (no confirmation — user has opted in):
   ```
   git checkout -b claude/implementation/<feature>
   ```
6. Create `Project-Development/` at repo root with all four files. Write the agreed plan into PLAN.md. Decompose into phased TODO.md.
7. Initial commit and push:
   ```
   git add Project-Development/
   git commit -m "chore(project-exec): initialize <feature> plan"
   git push -u origin claude/implementation/<feature>
   ```
8. One short status line (branch name, phases, task count). Then enter the execution loop.

## Mode 2: continue

1. If a feature name was given and the current branch differs, `git checkout claude/implementation/<feature>`.
2. If on a `claude/implementation/*` branch, `git pull` to sync with other sessions.
3. If no `Project-Development/` exists, list available `claude/implementation/*` branches and ask which to resume.
4. Read all four state files.
5. One line: "Resuming: `<next task>`." Enter the execution loop.

## Execution loop (used by Modes 1 and 2)

For each next `[ ]` task in TODO.md:

1. Mark `[~]` in TODO.md.
2. Do the code work in the repo.
3. Mark `[x]` in TODO.md.
4. Append an entry to PROGRESS.md.
5. Continue to the next `[ ]`. Do NOT stop between tasks.

**Stopping conditions:**

- No `[ ]` left → Mode 4 handoff (wait for approval).
- Real blocker (missing info, unfixable failure, ambiguous requirement) → mark `[!]` with reason, checkpoint, report to user.
- End of a phase → checkpoint, one-line summary, continue to next phase automatically.
- Context getting heavy → checkpoint, tell the user to open a fresh session and run `/project-executor continue`.

**Checkpoint:**
```
git add -A
git commit -m "checkpoint(<feature>): <phase> — <N> tasks done"
git push
```

## Mode 4: approved / PR

Only runs after the user explicitly approves (subcommand `approved`, `ship`, or `open-pr`).

1. Ensure latest state is committed and pushed.
2. **Remove the state folder so the default branch stays clean after squash-merge:**
   ```
   git rm -r Project-Development/
   git commit -m "chore(project-exec): remove state folder before merge"
   git push
   ```
3. Generate a PR body from PLAN.md summary + condensed PROGRESS.md highlights. Keep it under ~40 lines.
4. Open the PR:
   ```
   gh pr create \
     --base <default-branch> \
     --head claude/implementation/<feature> \
     --title "<feature>: <short summary>" \
     --body "<generated body>"
   ```
5. Report the PR URL.
6. Remind the user: "Use **squash merge** on GitHub (or `gh pr merge --squash`). The default branch will not contain Project-Development/."

If `gh` is missing or unauthenticated, stop at step 4 and give the user the manual `gh auth login` instructions or a direct URL to open the PR in the browser.

## Mode 5: status

Read TODO.md and PROGRESS.md. Report in ≤8 lines:
- Branch
- % complete (`[x]` / total tasks)
- Current phase
- Next task
- Last 2 PROGRESS entries (one line each)

Do NOT start executing.

## Mode 6: list

Run `git branch --list 'claude/implementation/*'`. For each branch, use `git show <branch>:Project-Development/TODO.md` to count `[x]` vs `[ ]`. Report a compact table: branch, % complete, last commit date. Stay on the current branch.

## Hard rules

- Mode 0 NEVER creates files, branches, or commits. It only proposes.
- Every code checkpoint also updates TODO.md and PROGRESS.md in the same commit.
- Never place code files in `Project-Development/`.
- Never open a PR without an explicit user approval subcommand.
- Never leave `Project-Development/` in the branch when the PR is opened.
- Never silently edit PLAN.md after Mode 1. Scope changes require user confirmation.
- If `main` isn't the default branch, detect and use the real default.
- Feature names are always kebab-case and unique per repo.
- If `gh` CLI is missing or not authenticated, stop at the PR step and give the user manual instructions.
