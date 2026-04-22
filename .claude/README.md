# Project Executor — Claude Code Setup

A single-command, branch-scoped workflow for long-running implementation projects. Works in Claude Code terminal and on the web.

## What's included

```
.claude/
├── commands/
│   └── project-executor.md     # the single slash command
└── skills/
    └── project-executor/
        └── SKILL.md            # the workflow brain
```

## Installation

Copy the `.claude` folder contents into your home directory:

```bash
# macOS / Linux
cp -r .claude/commands/* ~/.claude/commands/
cp -r .claude/skills/* ~/.claude/skills/

# Or, if you don't have ~/.claude yet:
mkdir -p ~/.claude/commands ~/.claude/skills
cp -r .claude/commands/project-executor.md ~/.claude/commands/
cp -r .claude/skills/project-executor ~/.claude/skills/
```

Verify by running `claude` in any repo and typing `/project-executor help`.

## Usage

One command, seven subcommands:

| Command | What it does |
|---|---|
| `/project-executor create <goal>` | Ask clarifying questions, propose a plan. No files/branch created. |
| `/project-executor start [<plan>]` | Create branch + state folder, begin autonomous execution. |
| `/project-executor continue [feature]` | Resume work on the current or named branch. |
| `/project-executor status [feature]` | Quick progress readout. |
| `/project-executor approved` | Remove state folder, open PR via `gh`. |
| `/project-executor list` | List all in-flight project branches. |
| `/project-executor help` | Show subcommands. |

## Typical flow

```
# 1. Planning
/project-executor create new feature login page, modern design

# Claude asks clarifying questions, you answer, Claude proposes a plan.
# Iterate until you're happy with it.

# 2. Execution
/project-executor start

# Claude creates claude/implementation/login-page branch,
# Project-Development/ folder, and starts working autonomously.

# 3. Check in (any time, any session)
/project-executor status
/project-executor continue

# 4. Ship it
/project-executor approved

# Claude removes Project-Development/, pushes, opens PR.
# You squash-merge on GitHub. Main stays clean.
```

## Requirements

- Claude Code (terminal or web)
- `git` and a clean working tree when starting
- `gh` CLI authenticated (`gh auth login`) for automatic PR creation — optional; if missing, Claude will give you manual instructions

## How state is kept

State lives on the feature branch in `Project-Development/`:

- **PLAN.md** — the agreed plan
- **TODO.md** — phased checklist with `[ ]` `[x]` `[~]` `[!]` markers
- **PROGRESS.md** — append-only log of completed work
- **CONTEXT.md** — repo paths, stack, test commands

Because state is in git, any session (local terminal or web) can resume by pulling the branch and running `/project-executor continue`.

Before the PR is opened, `Project-Development/` is removed in a final commit so squash-merging leaves the default branch clean.
