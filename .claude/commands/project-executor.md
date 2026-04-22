---
description: Unified entry point for branch-scoped implementation projects. Subcommands: create, start, continue, status, approved, list, help.
---

Use the project-executor skill.

Parse $ARGUMENTS as a subcommand. The first word is the subcommand; the rest is its payload.

Subcommands:
- `create <goal>` — Mode 0: planning only. Ask clarifying questions, produce a PLAN.md proposal for the user's review. Do NOT create a branch or execute. The user must run `start` separately to execute the plan.
- `start [<plan>]` — Mode 1: start a new project. If a plan was previously proposed via `create` in this session, execute that one. Otherwise treat the payload as the plan.
- `continue` or `continue <feature>` — Mode 2: resume. If a feature name is given, check out that branch first.
- `status` or `status <feature>` — Mode 5: status report only, no execution.
- `approved` / `ship` / `open-pr` — Mode 4: finalize and open PR.
- `list` — Mode 6: list all local `claude/implementation/*` branches with % complete.
- `help` — show this list of subcommands.

Fallback rules if no subcommand is given:
- If $ARGUMENTS looks like a plan (multi-line or long prose), treat as `start`.
- If $ARGUMENTS is empty and `Project-Development/` exists on current branch, treat as `continue`.
- If $ARGUMENTS is empty and no project exists, show `help`.

Arguments: $ARGUMENTS
