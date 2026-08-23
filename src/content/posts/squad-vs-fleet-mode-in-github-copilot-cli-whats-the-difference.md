---
title: "Squad vs Fleet Mode in GitHub Copilot CLI: What's the Difference?"
description: 'TL;DR For the Busy Dev     Fleet Mode (/fleet) is built into Copilot CLI. It auto-decomposes...'
publishedAt: 2026-06-07
tags:
  - 'github'
  - 'githubcopilot'
  - 'ai'
  - 'product'
draft: false
featured: false
image:
  src: '/images/posts/squad-vs-fleet-mode-in-github-copilot-cli-whats-the-difference/cover.png'
  alt: "Cover image for Squad vs Fleet Mode in GitHub Copilot CLI: What's the Difference?"
sourceUrl: 'https://dev.to/vevarunsharma/squad-vs-fleet-mode-in-github-copilot-cli-whats-the-difference-2a47'
---

## TL;DR For the Busy Dev

- **Fleet Mode** [(`/fleet`) is built into Copilot CLI](https://github.blog/ai-and-ml/github-copilot/run-multiple-agents-at-once-with-fleet-in-copilot-cli/). It auto-decomposes your task and runs stateless sub-agents in parallel. Zero setup. No memory between sessions.
- **Squad** is an [open-source framework by Brady Gaster (Principal PM Architect at Microsoft)](https://github.blog/ai-and-ml/github-copilot/how-squad-runs-coordinated-ai-agents-inside-your-repository/). It installs a persistent team of named AI specialists into your repo. They remember decisions, enforce review protocols, and learn your codebase over time.
- They are **different layers** that solve different problems. Fleet is a dispatch primitive. Squad is a coordination framework built on top of the same sub-agent primitives.
- Squad is **not redundant** because of Fleet. Brady explicitly evaluated using Fleet as Squad's core and [decided against it](https://github.com/bradygaster/squad/issues/24).
- They **work better together**. Squad v0.10.0 ships a hybrid dispatch mode that uses Fleet for read-heavy batch work (2.9x faster) and its own charter-aware dispatching for writes.
- **Pick Fleet** for one-off parallel tasks. **Pick Squad** for projects where agents need to accumulate knowledge over days or weeks. **Pick both** if you want the speed of Fleet and the governance of Squad.

---

## The confusion is real

I kept seeing `/fleet` and `squad` referenced in the same conversations. Both involve multiple agents. Both parallelize work. Both run inside the Copilot CLI. So I dug into the docs, the source code, and the GitHub issues to figure out what actually differs.

The short answer: they operate at different levels. Fleet gives you raw parallelism. Squad gives you a coordinated team. Understanding that distinction changes how you think about multi-agent workflows.

---

## What is Fleet Mode?

![fleet-in-cli](/images/posts/squad-vs-fleet-mode-in-github-copilot-cli-whats-the-difference/image-01.png)

Fleet is a built-in Copilot CLI slash command. Type `/fleet` followed by a prompt, and the orchestrator breaks your task into independent sub-tasks, then runs them in parallel.

```bash
/fleet refactor the auth module, add tests for each endpoint, and update the README
```

The orchestrator figures out what can run at the same time. It dispatches background sub-agents, waits for them to finish, then synthesizes the results.

You can also trigger it from plan mode. Write a plan with `Shift+Tab`, then choose "Autopilot + /fleet" to run everything hands-off.

Here's what you need to know about Fleet's sub-agents:

- Each one gets its own **isolated context window**. They don't see what the other agents are doing.
- They **cannot talk to each other**. All coordination flows through the parent orchestrator.
- They share the **filesystem** but there's no file locking. If two agents write the same file, the last one wins. Silently.
- They are **stateless**. When the session ends, everything they learned is gone.

Fleet is fast. It's free of setup. And it works well for tasks that split cleanly into independent pieces.

---

## What is Squad?

![squad-in-action](/images/posts/squad-vs-fleet-mode-in-github-copilot-cli-whats-the-difference/image-02.png)

Squad is an [open-source framework](https://github.com/bradygaster/squad) by Brady Gaster (Principal PM Architect at Microsoft, working on CoreAI Apps & Agents). Install it globally, run `squad init`, and you get a persistent AI development team living inside your repo as plain Markdown files.

```bash
npm install -g @bradygaster/squad-cli
squad init
copilot --agent squad --yolo
```

That `squad init` command scaffolds a `.squad/` directory. Inside it:

- **`team.md`** lists who's on the team
- **`routing.md`** defines who handles what kind of work
- **`decisions.md`** records team decisions that every agent reads before starting work
- **`agents/{name}/charter.md`** defines each agent's identity, expertise, and constraints
- **`agents/{name}/history.md`** stores what each agent has learned about your specific project

Agents get persistent names drawn from fictional universes. Apollo 13 mission control callsigns. Characters from The Usual Suspects. The names stick across sessions and live in `.squad/casting/registry.json`.

A coordinator agent (`.github/agents/squad.agent.md`) acts as the router. It reads your request, checks the routing table, and spawns the right specialists. It never does domain work itself. It delegates.

A silent agent called **Scribe** runs in the background after every work batch. Scribe merges agent decisions, updates history files, and archives old entries. You never interact with Scribe directly.

Another agent called **Ralph** watches your GitHub issue board and can auto-triage and dispatch agents on a polling interval.

All of this state lives in git. Clone the repo and you get the team with all their accumulated knowledge.

---

## Side-by-side comparison

|                    | Fleet Mode                                     | Squad                                            |
| ------------------ | ---------------------------------------------- | ------------------------------------------------ |
| **Setup**          | None. Built into Copilot CLI                   | `npm install` + `squad init`                     |
| **Agent identity** | Anonymous, generic                             | Named specialists with charters                  |
| **Memory**         | None. Starts fresh every session               | Three tiers: skills, decisions, personal history |
| **Routing**        | Auto-decomposition from your prompt            | Explicit routing rules in `routing.md`           |
| **Quality gates**  | None                                           | Reviewer lockout, design reviews, retros         |
| **Custom agents**  | Ignores `.github/agents/` charters in practice | Charter-driven, enforced                         |
| **Cross-client**   | CLI only                                       | CLI + VS Code + GitHub.com                       |
| **File safety**    | Shared filesystem, no locking                  | Write-authority model per agent                  |
| **Governance**     | None                                           | RAI agent, audit trails, write restrictions      |
| **Automation**     | Not designed for it                            | Ralph daemon for issue triage                    |

---

![ghcp-warp-speed](/images/posts/squad-vs-fleet-mode-in-github-copilot-cli-whats-the-difference/image-03.png)

## The key difference

Fleet answers the question: "How do I run multiple agents in parallel?"

Squad answers a different question: "How do I run a persistent team of specialists that learn my project and enforce quality over time?"

Fleet is a dispatch primitive. Squad is a coordination framework. Squad happens to use the same underlying `task` tool that Fleet uses to spawn sub-agents. But it layers six things on top:

1. **Persistent identity.** Agents have names, charters, and histories that survive sessions.
2. **Cross-session memory.** Decisions and skills compound over time. Clone the repo and a new contributor gets the team's full knowledge.
3. **Explicit routing.** Domain-aware routing rules in a durable file. Named routing, domain matching, and skill-aware routing, in that priority order.
4. **Quality gates.** A reviewer lockout protocol prevents an agent from revising its own rejected work. A different agent must step in.
5. **Ceremonies.** Design reviews auto-trigger before multi-agent tasks touching shared systems. Retrospectives auto-trigger after failures.
6. **Governance.** A write-authority model controls which agent can write to which file. A dedicated RAI agent issues traffic-light verdicts.

Brady Gaster put it simply in a [GitHub issue](https://github.com/bradygaster/squad/issues/164#issuecomment-3981188496):

> "Fleet mode is a Copilot CLI feature, whereas Squad is a Copilot Agent in the context of the CLI. We investigated using Fleet for our spawn at one point but didn't. Fleet is awesome sauce!"

---

## They work better together

As of Squad v0.10.0, Fleet is integrated as an optional dispatch mode inside Squad's watch system.

```bash
squad watch --execute --dispatch-mode hybrid
```

In hybrid mode, Squad's Ralph daemon auto-classifies incoming GitHub issues by scanning the title:

| Issue type  | Example keywords                 | Dispatched via                          |
| ----------- | -------------------------------- | --------------------------------------- |
| Read-heavy  | research, review, analyze, audit | `/fleet` (parallel)                     |
| Write-heavy | fix, implement, create, build    | `task` tool (sequential, charter-aware) |

The classification defaults to "write" when it's ambiguous. That's the safer path because write-heavy work needs charter enforcement.

### Why not pure Fleet?

Testing revealed a critical limitation. Fleet [ignores custom agent charters](https://github.com/bradygaster/squad/issues/775). When you reference `@my-agent` in a `/fleet` prompt, Copilot CLI spawns a generic explore agent instead. Your agent's identity, constraints, and expertise get skipped.

That makes Fleet great for read-only work like triage and audits. But for code changes that need governance, you want Squad's charter-aware dispatch.

### The benchmarks

Squad's team benchmarked hybrid mode against sequential dispatch on 4 real issues:

| Metric               | Fleet (parallel) |    Sequential    |   Improvement   |
| -------------------- | :--------------: | :--------------: | :-------------: |
| Total time           |     **116s**     |       332s       | **2.9x faster** |
| Premium requests     |        12        |       ~16        | **~25% fewer**  |
| MCP startup overhead |   1x (shared)    | 4x (per process) |   **4x less**   |

Fleet correctly triaged all four issues with proper urgency classification and actionable next steps.

---

## When to use which

![ghcp-background-commit-image](/images/posts/squad-vs-fleet-mode-in-github-copilot-cli-whats-the-difference/image-04.png)

### Pick Fleet when:

- You have a **one-off task** that splits into independent pieces. Multi-file refactor, test generation across modules, docs for several components.
- You don't need agents to remember anything after the session.
- You don't need review protocols or quality gates.
- You want zero setup and maximum speed.

### Pick Squad when:

- You're working on a project **over days or weeks** and want agents to build up knowledge.
- You need **quality enforcement**. Reviewer lockout, design reviews before complex changes, retrospectives after failures.
- You want **named specialists** whose domain expertise persists across sessions.
- You need it working in **VS Code or GitHub.com** too, beyond just the CLI.
- You want **automated issue triage** running on a polling interval.
- Your team has conventions that agents should follow consistently.

### Pick both when:

- You already run Squad and want to speed up batch operations. Issue triage, code audits, research.
- You want Fleet's speed for reads and Squad's governance for writes.

---

## The mental model

Fleet is like hiring freelancers for a day. They show up, you explain the task, they work fast in parallel, and they deliver. Tomorrow you'd have to explain everything again from scratch.

Squad is like having a permanent team. They know your codebase, your conventions, and your past decisions. They review each other's work. When someone new joins, they read the decision log and get up to speed. They run design reviews and retros. They get better over time.

Fleet gives you speed. Squad gives you continuity. The hybrid mode gives you both, applied where each one is strongest.

---

## Links

- [Fleet Mode docs](https://docs.github.com/en/copilot/concepts/agents/copilot-cli/fleet)
- [Fleet Mode blog post](https://github.blog/ai-and-ml/github-copilot/run-multiple-agents-at-once-with-fleet-in-copilot-cli/)
- [Squad repo](https://github.com/bradygaster/squad)
- [Squad blog post](https://github.blog/ai-and-ml/github-copilot/how-squad-runs-coordinated-ai-agents-inside-your-repository/)
- [Squad-IRL examples](https://github.com/bradygaster/Squad-IRL)
- [Custom agents docs](https://docs.github.com/en/copilot/concepts/agents/copilot-cli/about-custom-agents)
