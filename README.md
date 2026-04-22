# Project Executor — Claude Code Skill

A single-skill, branch-scoped workflow for long-running implementation projects. Works in Claude Code terminal and on the web.

One file. One slash command. Seven subcommands.

## What's included

```
.claude/
└── skills/
    └── project-executor/
        └── SKILL.md
```

The skill's `name: project-executor` in the YAML frontmatter is what creates the `/project-executor` slash command. No separate command file needed — custom slash commands have been merged into skills.

## Installation

You have two options. Pick one or use both.

### Option A — Install at your user level (works everywhere locally)

```bash
mkdir -p ~/.claude/skills
cp -r .claude/skills/project-executor ~/.claude/skills/
```

Now `/project-executor` works in any repo from your local terminal.

### Option B — Commit to the repo (works guaranteed on Claude Code web)

For any repo where you want `/project-executor` to work in a fresh Claude Code web session, commit the skill into the repo:

```bash
mkdir -p <your-repo>/.claude/skills
cp -r .claude/skills/project-executor <your-repo>/.claude/skills/
cd <your-repo>
git add .claude/
git commit -m "chore: add project-executor skill"
git push
```

Now anyone opening a Claude Code web session on that repo gets `/project-executor` immediately.

### Recommended: use both

Install at user level for local convenience, and commit to repos where you want guaranteed web access.

## Verify it works

In any Claude Code session (terminal or web), type:

```
/project-executor help
```

You should see the list of subcommands.

## Usage

One slash command, seven subcommands:

| Command | What it does |
|---|---|
| `/project-executor create <goal>` | Ask clarifying questions, propose a plan. No files, no branch. |
| `/project-executor start [<plan>]` | Create branch + state folder, begin autonomous execution. |
| `/project-executor continue [feature]` | Resume work on the current or named branch. |
| `/project-executor status [feature]` | Quick progress readout. |
| `/project-executor approved` | Remove state folder, open PR via `gh`. |
| `/project-executor list` | List all in-flight project branches. |
| `/project-executor help` | Show subcommands. |

## Typical flow

```
# 1. Planning (in a chat on your repo's main branch)
/project-executor create new feature login page, modern design

# Claude asks clarifying questions. You answer.
# Claude writes a plan proposal in chat. You iterate until happy.

# 2. Execution
/project-executor start

# Claude creates claude/implementation/login-page branch,
# creates Project-Development/ folder with PLAN.md, TODO.md, PROGRESS.md, CONTEXT.md,
# and starts working autonomously through the task list.

# 3. Check in (any time, any session, terminal or web)
/project-executor status
/project-executor continue

# 4. Ship it
/project-executor approved

# Claude removes Project-Development/, pushes, opens the PR.
# You squash-merge on GitHub. The default branch stays clean.
```

## Requirements

- Claude Code (terminal or web)
- `git` and a clean working tree when starting
- `gh` CLI authenticated (`gh auth login`) for automatic PR creation. Optional — if missing, Claude will give you manual instructions.

## How state is kept

State lives on the feature branch in `Project-Development/`:

- **PLAN.md** — the agreed plan
- **TODO.md** — phased checklist with `[ ]` `[x]` `[~]` `[!]` markers
- **PROGRESS.md** — append-only log of completed work
- **CONTEXT.md** — repo paths, stack, test commands

Because state is in git on the branch, any session (local terminal or Claude Code web) can resume by pulling the branch and running `/project-executor continue`.

Before the PR is opened, `Project-Development/` is removed in a final commit, so squash-merging the PR leaves the default branch clean.
