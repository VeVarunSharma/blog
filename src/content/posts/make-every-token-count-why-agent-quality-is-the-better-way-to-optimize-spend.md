---
title: 'Make Every Token Count: Why Agent Quality Is the Better Way to Optimize Spend'
description: 'GitHub Copilot switched from premium requests to usage-based billing. That single change set off a...'
publishedAt: 2026-07-06
tags:
  - 'ai'
  - 'github'
  - 'githubcopilot'
  - 'claude'
draft: false
featured: false
image:
  src: '/images/posts/make-every-token-count-why-agent-quality-is-the-better-way-to-optimize-spend/cover.png'
  alt: 'Cover image for Make Every Token Count: Why Agent Quality Is the Better Way to Optimize Spend'
sourceUrl: 'https://dev.to/vevarunsharma/make-every-token-count-why-agent-quality-is-the-better-way-to-optimize-spend-2b9g'
---

GitHub Copilot switched from premium requests to usage-based billing. That single change set off a wave of questions from customers, and most of them sounded like this:

> "How do we cut our token spend?"

It's the wrong question. Or at least, it's the _small_ version of the right question.

The better question is: **how do we make the most out of the tokens we spend?** The goal isn't fewer tokens per request. The goal is fewer wasted tokens per _successful outcome_. Once you frame it that way, you stop chasing cost and start chasing quality, and the cost takes care of itself because most token waste comes from failed runs and stuffed contexts.

This post is the long-form version of a workshop I run on agent quality and token optimization. We'll cover the why, the foundations, and the practical controls you can apply today.

_Slide images in this post are inpired the GitHub workshop deck of a similar name, used with credit to GitHub. The interpretation and prose are mine._

![Workshop cover: Agent Quality and Token Optimization](/images/posts/make-every-token-count-why-agent-quality-is-the-better-way-to-optimize-spend/image-01.png)

_The workshop this post is based on._

---

## TL;DR for the Busy Dev

If you only have two minutes:

1. **Optimize for cost per successful outcome, not raw token count.** Most token waste comes from failed runs and stuffed contexts.
2. **Quality compounds.** At 95% accuracy per step, a 50-step agent workflow lands at 8%. Every quality lever pays back hard.
3. **Context is the main lever.** Reasoning models for planning, smaller models for implementation. Never stuff "might-need" files. Use `/clear` often.
4. **Use deterministic guardrails.** Tests, linters, security scans. The Copilot CLI team ships 500 PRs a week and 53% of their codebase is tests. That's the move.
5. **Treat agent configs like engineering.** A small, human-written `copilot-instructions.md` beats any clever prompt.

The five concrete actions to take today live at the bottom.

---

## The rocket problem

![The Rocket Problem](/images/posts/make-every-token-count-why-agent-quality-is-the-better-way-to-optimize-spend/image-02.png)

Stay with me on an analogy. It's the easiest way I've found to explain what has changed.

### The Sputnik era

Call it the Sputnik era: early, experimental, cheap-feeling, launch-and-learn energy. Rockets are cheap, you build twenty in a weekend, you point them roughly in the right direction because you just need one to land.

That's exactly how a lot of us have been using agents. You give a little context. You write a quick prompt. You send the agent off. If it comes back with something good, you ship it. If not, you fire another one. Then another. The cost is invisible, so the gambling feels free.

_How most teams still use agents: launch more, hope one hits._

### The Falcon era

Now imagine launches cost what real launches cost. A SpaceX Falcon isn't cheap. You get one or two shots, not twenty. So the engineering job becomes: build a rocket that actually reaches the destination _and_ lands back on the pad so you can reuse it.

That's where we are with agents now. Usage-based billing didn't make tokens expensive in absolute terms. It made the _gambling_ expensive. The fix isn't cheaper fuel. The fix is fewer, better-engineered launches.

### The expensive-rocket-that-explodes-on-the-pad era

There's a third failure mode worth naming, and it's the most painful one. You can absolutely build a very heavy, very expensive agent that burns a fortune in tokens and _still_ explodes on the launch pad. Massive context window stuffed with every file that might be relevant. Every MCP turned on. Three reasoning models chained together. No tests in the loop. No stop signal. No definition of done.

The agent reasons in circles. It calls tools you didn't need. It "fixes" things that weren't broken. By turn 40 it's drifting from the original goal, hallucinating helpfully, and burning through your monthly budget. The output, when it finally arrives, is wrong.

That's the worst of the three. You paid for the moon mission _and_ you blew up the pad.

I'll come back to this one throughout the post. Most of the controls that follow are about _not_ building this rocket.

---

## Why counting tokens is the wrong question

### Quality drives ROI, not token frugality

Apply the standard ROI formula to agents:

```plaintext
Agent ROI = (Value of Agent Output − Token Cost) / Token Cost × 100%
```

You can't calculate this cleanly. Nobody can. How do you quantify the value of an agent that wrote a feature for you? A lot of companies are still figuring this out. But the formula doesn't have to be measurable to be useful as guidance.

The key insight: if the value is zero, the result is −100%. Optimizing the denominator from there is pointless. A free wrong answer is still a wrong answer. Even worse, optimizing for low cost often _causes_ low value. Cheap models and skimpy context produce bad output that you then pay to debug. Now you've spent tokens on the bad run, tokens on the debug session, tokens on the fix, plus your own time.

The flip side: when you reduce waste at the source, both quality and cost improve together. Most of what we do wrong as developers is:

- Stuffing irrelevant files into the context window
- Letting conversations compound with useless turns we keep paying for in every following turn
- Asking one model to do work that a smaller, cheaper one would handle better

Trim that, and the bill shrinks while the quality goes up.

To be clear: some of the controls in this post will _increase_ the tokens of a single run. A reasoning model costs more than a small one. Tests in the loop add tool calls. Subagents spin up a second context. The trade is total cost across attempts, not raw tokens per request.

![ROI math: net value over cost, expressed as a percentage.](/images/posts/make-every-token-count-why-agent-quality-is-the-better-way-to-optimize-spend/image-03.png)

_The standard ROI math, applied to agents: net value over cost, as a percentage._

### The compounding error problem

There's one more reason quality matters more than people think. LLMs are non-deterministic. They have an error margin. They're never 100 percent accurate per step. In a multi-step agent workflow, that error compounds.

Here's the math:

| Accuracy per step | After 10 steps | After 50 steps |
| ----------------- | -------------- | -------------- |
| 99%               | 90%            | 61%            |
| 95%               | 60%            | 8%             |
| 90%               | 35%            | 0.5%           |

Read that table twice. At 95 percent per step, which _feels_ great, you're at 8 percent after a long workflow. Most real agent sessions have many more than 50 internal steps.

This doesn't mean every agent will fail. It means every quality improvement you make doesn't give you a linear gain. It gives you a compounding one. And every miss costs you real money: the wasted tokens, the bug fix run, the review cycle, the human time, and sometimes the incident in production.

![compounding accuracy](/images/posts/make-every-token-count-why-agent-quality-is-the-better-way-to-optimize-spend/image-04.png)

_Compounding accuracy: 99% per step still only lands you at 61% over 50 steps._

In classical software we addressed this with the shift-left movement. Shift-left quality, testing, security. That movement matters even more in agentic systems. The cost of being right early is much smaller than the cost of being wrong late.

### The summary in one line

> Instead of counting tokens, make every token count.

Send fewer rockets with higher accuracy and the fuel cost shrinks on its own.

![Instead of counting tokens, make every token count.](/images/posts/make-every-token-count-why-agent-quality-is-the-better-way-to-optimize-spend/image-05.png)

_The whole pitch in one line._

---

## Foundations: how agents actually work

You can't optimize what you don't understand. Here's the short version. Skip ahead if you live in this stuff already.

### LLMs are token probability machines

An LLM is a text-in, text-out machine. Under the hood, it's a token probability machine. Given everything you fed it plus its training data, it predicts the most probable next token. Then the next. Then the next. "Next word" is good enough as a mental model.

Newer models add reasoning, tool use, larger context, and biases toward code. The underlying engine is the same.

### The core principle: context balance

The single most important rule of working with LLMs:

> Provide as little context as possible, but as much as required.

Miss it in either direction and you lose quality.

**Too much context** biases the model toward irrelevant information. The math doesn't distinguish "useful" from "noise". Stuff a giant codebase into context for a small change and the model is fighting hundreds of competing signals.

**Too little context** is just as bad. The model fills the gap with what it knows from training, which means it may hallucinate to compensate. There's no error message when this happens. The model doesn't say "I needed more information." It just makes something up. The math doesn't distinguish between hallucination and fact.

Context engineering is the fundamental skill. Everything that follows is a flavor of it.

### Harness, LLM, and your config

When you "talk to Copilot" or any other coding agent, three things are in play:

- **You and your project**: prompts, files, instructions, skills, MCPs.
- **The agent (the harness)**: VS Code chat, Copilot CLI, Copilot's cloud agent, Claude Code, OpenAI Codex. Just code. No magic.
- **The LLM**: GPT, Claude, Gemini. A pure model API.

Two things matter about how the harness talks to the LLM:

1. **It's just text.** No magic protocol. The harness assembles plain text, sends it to the model, parses what comes back, and decides what to do next.
2. **It's stateless.** The LLM doesn't remember anything between calls. "Having a conversation" means re-sending the _entire_ previous exchange every single turn. Tokens compound.

That second point is what makes context engineering matter so much. Every turn you take pays for every turn before it. Input tokens _can_ be cached on repeated turns, but caching isn't guaranteed. Don't plan around it.

![Harness, LLM, and your project: three independent layers.](/images/posts/make-every-token-count-why-agent-quality-is-the-better-way-to-optimize-spend/image-06.png)

_Harness, LLM, and your project: three independent layers._

### Context rot: lost in the middle, recency bias

Two things degrade in long context windows. Both are real, both are documented, and both should change how you work.

**Lost in the middle (below 50 percent context fill)**: models favor content at the beginning and end of the window over the middle. Usually fine, because your instructions sit at the start and your current work sits at the end.

It hits you when you switch tasks mid-session. You start with a bug fix, then halfway through you say "now let's implement that feature instead." As the window grows, the model can pull back toward the original bug fix because it weights the start of the conversation more than recent input. Fix: start a new session for each distinct task.

**Recency bias (above 50 percent context fill)**: past that threshold, the model starts heavily favoring the end of the conversation. It can forget your system instructions, your custom instructions, your original prompt. The model drifts. You start seeing it do things you don't understand because it's operating mostly on recent context.

Fix: don't let the window grow past 60-70 percent unless you really need to. Divide and conquer from the start. Compact only when you must. Reach for `/clear` more often than you currently do.

None of this is absolute. "Bias" doesn't mean the model _will_ forget the middle. There are real scenarios where you need to be at 70 or 80 percent. Just be aware of it as a knob you can turn.

![Context rot: lost-in-the-middle below 50%, recency bias above it.](/images/posts/make-every-token-count-why-agent-quality-is-the-better-way-to-optimize-spend/image-07.png)

_Context rot: lost-in-the-middle bias below 50% fill, recency bias above it._

---

## The controls you actually have

This is the practical core. Tips are ordered by impact. Earlier ones matter more for almost everyone. Later ones are power-user territory.

### Where you sit on the maturity spectrum

How much should you care about optimization? It depends on where you sit:

- **AI-assisted engineer**: one agent at a time, mostly synchronous. Maybe ten agent runs a day. If you spend 20 dollars a month on tokens, even cutting that in half saves you 10 dollars. Not worth massive effort.
- **AI engineer**: orchestrator of multiple async agents, dozens to hundreds per day. Every percentage point of quality compounds. Every percentage point of token savings multiplies. Optimization is a serious investment.

Most people are moving from the first to the second whether they realize it or not. Read on with that in mind.

![From AI-assisted engineer to AI engineer.](/images/posts/make-every-token-count-why-agent-quality-is-the-better-way-to-optimize-spend/image-08.png)

_The maturity spectrum: from one synchronous agent at a time to orchestrating many at once._

### Lever 1: model choice and auto mode

The biggest single lever. When tokens felt free, everyone defaulted to the largest available model for everything, including typo fixes. The waste was significant.

The cost gap between the smallest and largest options can be 20x or more. Bigger doesn't always mean better, either.

- **Reasoning models** (the current top tier like Claude Opus and GPT-5.5): planning, architecture, debugging complex bugs, synchronous work where you're driving, anything that needs to think before it acts.
- **Mid-tier models** (Sonnet, GPT-5.4): async implementation after a plan exists. Most day-to-day code work.
- **Smaller models** (Haiku, GPT-mini): small refactorings, repetitive tasks, doc updates, anything where the answer is mostly clear.

Counter-intuitive note: using a reasoning model for _implementation_ can actually hurt quality. If you have a tight spec, a reasoning model may second-guess it, re-open the plan, and go rogue. "Actually, this spec is wrong, I'll do it my way." That's great when you want it to challenge your thinking. It's terrible when you just want it to ship the plan you agreed on.

The lazy answer is **Auto Mode**. As of mid-2026, auto mode has task intent detection and picks the model for you. Stay lazy. Make deliberate model choices only when it matters.

### Lever 2: provide only relevant context

The second biggest lever, and the one with the most room to improve.

Stop stuffing the prompt with "might-need" information. Stop attaching your entire project for a small change. Let the agent discover what it needs. It can find files on its own.

A few tactical rules:

- **Compacting helps token count but loses information.** If the lost information was relevant, you've traded tokens for misses. Use it carefully.
- **Use `/clear` liberally.** Start fresh for each distinct task. Don't try to steer a bloated 80-percent-full session with a new prompt. Recency bias will eat your guidance.
- **Context doesn't carry across sessions.** Your bill still counts every token you send, but a fresh session stops the old context from being resent on every turn. Throw context away without hesitation when you switch tasks.

![Model choice and relevant context are the two biggest levers.](/images/posts/make-every-token-count-why-agent-quality-is-the-better-way-to-optimize-spend/image-09.png)

_Model choice and relevant context are the two biggest levers you have._

### Your prompt: the always-on context

Your prompt sits at the top of every turn. Combined with the system prompt and tool descriptions, it has outsized influence. That "lost in the middle" bias works in your favor here. The model weights your opening heavily.

Don't optimize prompts for fewer tokens. Optimize them to steer the agent correctly.

**Be precise.**

Vague:

```text
Fix the bug.
```

Precise:

```text
Issue #45 in this repo describes a bug where editing a user's email triggers a 500 from POST /users/:id.
Reproduce it locally with the test in tests/users/email-update.test.ts, then fix it in src/users/handlers.ts.
```

The second one is longer in tokens. It saves you many turns. Worth it.

**Add stop signals.**

Tell the agent when it's done. Otherwise it'll keep going.

```text
Once the test in tests/users/email-update.test.ts passes and `npm run lint` is clean, stop.
Do not commit, push, or open a PR.
```

Without that stop signal, agents often keep working past the actual goal: running extra linters, committing, pushing, opening PRs, updating unrelated docs. Every one of those is a step toward the exploding rocket.

**Add known context up front.**

If you know where the relevant files are, name them. If you want the agent to read a docs page, hand it the URL. If a skill applies, invoke it. Anything you can supply up front saves discovery cycles.

### Research, plan, implement

The single workflow change that has helped me most. Don't do everything in one session.

- **Phase 1: Research.** Load the files, read the issue, understand the problem. A lot of files come into context here. Most of them won't matter for implementation. Use a model that handles big context well.
- **Phase 2: Plan.** Take what you learned and produce a precise spec. A detailed to-do list of what needs to change, where, and why. Use a reasoning model. This is where the expensive models earn their cost.
- **Phase 3: Implement.** With a clear spec, you can switch to a smaller model. You can even split the work and run multiple agents in parallel, one per layer (frontend, backend, database) or per slice, with explicit contracts between them. Each agent only carries the context that matters for its slice.

Yes, there's some duplication when you move between phases. You'll paste in the plan you already created. That tiny duplication is worth it. The alternative is one giant session carrying all of Phase 1's research through Phase 3's typing, hurting both quality and cost. That single bloated session is, again, the exploding rocket.

![Research → Plan → Implement, with the right model for each phase.](/images/posts/make-every-token-count-why-agent-quality-is-the-better-way-to-optimize-spend/image-10.png)

_Research → Plan → Implement, with the right model for each phase._

### Deterministic controls: tests, linters, security scans

Not strictly context engineering. It's the most powerful counter to non-determinism we have. Tests are the landing pad for the Falcon.

The Copilot CLI team ships 500 PRs a week. Their number-one engineering practice for working with agents is tests. 53 percent of their codebase is tests. Why?

Because a test is a **deterministic control**. It either passes or it fails. There's no probability distribution. A failing test pulls the agent back from drift and _restarts_ the accuracy curve. If after ten steps the agent has drifted to 50 percent accuracy, the failing test forces a correction and the next step starts fresh at ~99 percent again.

Picture two timelines:

**With tests in the loop.** Buggy change. Failing test. Correction. Stable working base. Next change. Failing test. Correction. Stable working base. Done.

**Without tests.** Buggy change. Buggy change on top. Buggy change on top of that. "Done." Then an incident in production, plus a debugging session that fills the next context window, plus CI/CD minutes burned, plus review cycles, plus human hours, plus the accumulation of tokens to clean up the mess.

The "no tests, faster" path is a mirage. The total token and time cost is higher every time.

Tests aren't the only deterministic control. Linters, type checkers, security scanners, schema validators, contract tests, all of them work the same way. Anything you can give the agent that produces a binary pass/fail and that it can run on its own is a quality multiplier.

![Tests bring the agent back on track. No tests means buggy-on-buggy until it explodes.](/images/posts/make-every-token-count-why-agent-quality-is-the-better-way-to-optimize-spend/image-11.png)

_Tests bring the agent back on track. No tests means buggy-on-buggy until it explodes._

### Agent configs: where context engineering lives

When you talk about context engineering in practice, you're mostly talking about agent configs. These are the markdown files and controls you set up once and that agents pick up automatically.

The full menu:

| Config                                                             | What it is                                               | When to reach for it                                        | Token risk                                                           |
| ------------------------------------------------------------------ | -------------------------------------------------------- | ----------------------------------------------------------- | -------------------------------------------------------------------- |
| **Persistent instructions** (`copilot-instructions.md`)            | Always-on rules for every session                        | Project guard rails, agent-miss log, output trimming        | Pays itself off if kept small                                        |
| **Custom agents** (`.github/agents/*.agent.md`)                    | Manually invoked workflows with scoped tools             | Reusable roles like a TDD-red runner or a research subagent | Low                                                                  |
| **Skills** (`.github/skills/*/skill.md`)                           | Lazy-loaded capabilities the model can pull in           | Domain knowledge or workflows the model wouldn't know       | Low when unused, full size when invoked                              |
| **MCP servers**                                                    | External APIs exposed as tools                           | Capabilities you genuinely need on tap                      | High. Bloats tool descriptions, tempts the agent into off-task calls |
| **Subagents**                                                      | A second context window for a focused task               | Research-heavy work that would pollute the main session     | Trades main-session quality for total tokens                         |
| **Scoped instructions** (`.github/instructions/*.instructions.md`) | Instructions that fire by file path pattern              | Monoliths with distinct sections                            | Low                                                                  |
| **Prompt files** (`.github/prompts/*.prompt.md`)                   | Manually invoked reusable prompts                        | Common starting points. Not in Copilot CLI                  | Low                                                                  |
| **Copilot Memory**                                                 | Auto-generated always-on instructions from your behavior | Set-and-forget. Check periodically                          | Low                                                                  |

![The full menu of agent configs.](/images/posts/make-every-token-count-why-agent-quality-is-the-better-way-to-optimize-spend/image-12.png)

The top three are where you should spend most of your time. Here's how to actually use them.

#### Persistent instructions (your `copilot-instructions.md`)

These sit in the context window for every agent session, every interaction. That makes them powerful and dangerous. Powerful because they steer every run. Dangerous because every token in them is a token you pay for in every session.

Rules I live by:

- **Keep them small.** Treat each line as a decision. If it isn't going to fire on most runs, it doesn't belong here.
- **Don't put full docs in them.** No human-readable guides. No design philosophy essays. Distill ruthlessly.
- **Don't generate them with AI.** This is your one chance as a human to fill the gaps the model can't know on its own. AI-generated instructions tend to be wordy and imprecise. Write them yourself.
- **Use them as an agent-miss log.** When you see the agent reach for the wrong testing framework or the wrong build command, write a one-liner that prevents it next time.
- **Trim outputs.** "Be concise", "drop niceties", "only return code". Output tokens cost more than input tokens. This matters.
- **Recreate them often.** The Copilot CLI team throws away their entire instructions file every three months and starts fresh. Models change. Projects change. Old instructions accumulate and stop being relevant. Treat it as a living, breathing document.

A starter `copilot-instructions.md` for a Node.js project might look like this:

```markdown
# Project guard rails

- Use vitest for tests, not jest. Test files live next to source as *.test.ts.
- Build command is `pnpm build`. Not npm. Not yarn.
- All exported functions must have a JSDoc comment with @param and @returns.
- Do not commit, push, or open PRs. Stop after the change is made and tests pass.
- Be concise in your replies. Skip the recap of what you did unless asked.
```

That's roughly 80 tokens. It'll pay for itself many times over.

![Persistent instructions sit in every session, every interaction.](/images/posts/make-every-token-count-why-agent-quality-is-the-better-way-to-optimize-spend/image-13.png)

_Persistent instructions sit in every session, every interaction._

#### Custom agents

A custom agent is a markdown file that defines a role and the tools the agent should use when invoked.

Think of them as manually invoked workflows. You write the prompt once and reuse it. You also get to scope which tools the agent has access to, which prevents it from going down paths you didn't want.

A simple TDD-style custom agent might look like this (treat the tool names as illustrative, check current Copilot custom-agent docs for the real ones):

```markdown
---
name: tdd-red
description: Add a failing test for a feature, then stop.
tools: [edit, run_command]
---

You are a test-first developer. The user will describe a feature.

Your job:

1. Write one failing test that captures the expected behavior.
2. Run the test suite to confirm the new test fails.
3. Stop. Do not implement the feature itself.
```

You invoke it with something like `/tdd-red add API endpoint for user search`. The harness loads the agent file, narrows the available tool set, and runs the workflow.

The token savings from tool scoping are real but small. The big benefit is structural. You prevent the agent from doing things you don't want it to do.

![Custom agents: manually invoked workflows with scoped tools.](/images/posts/make-every-token-count-why-agent-quality-is-the-better-way-to-optimize-spend/image-14.png)

_Custom agents wrap a reusable role with a scoped tool set._

#### Skills

A skill is something you _offer_ to the agent. The harness lists the skill's description in context, and the model decides when to pull the full skill in. That makes skills lazy-loaded context. They cost almost nothing when unused. They cost their full size when invoked.

A few rules:

- **Don't overdo it.** You don't need fifty skills.
- **Watch out for redundant skills.** Does the model really need a "React skill" when it already knows React? Probably not.
- **Reserve skills for capabilities the model doesn't have.** Domain knowledge, your specific deployment process, your internal API conventions.
- **Maintain them.** Models get better. A skill that was essential last year may be redundant this year. Prune.

#### MCPs and subagents (in brief)

**MCPs** expose external APIs as agent tools. Once active, the harness puts their tool descriptions in context, which is overhead even when you don't call the tools. They also tempt the agent into off-task calls. A `read_webpage` tool in scope means the agent might decide to read a webpage for a task where reading a webpage isn't useful. This is how you build the exploding rocket: every MCP turned on, every tool tempting an extra detour.

The pattern that works: keep MCPs deactivated by default. Activate them inside a custom agent that actually needs them. The Playwright MCP is a great example. Powerful for serious frontend work. Wasteful for everything else.

**Subagents** open a second context window for a focused task, usually research. The subagent reads documents, builds a summary, and hands the summary back to the main session. Your main session stays clean. You spend more total tokens to get there. Use them deliberately for research tasks where the alternative is polluting your main session with many irrelevant files.

---

## Power user moves

Advanced territory. Worth it if you orchestrate many agents. Probably not worth it if you're running ten a day.

- **Think in code.** When you need to filter or transform large outputs, prefer writing a small script over feeding raw data to the model. Example: filter a GitHub REST API response down to the three fields you actually need before showing it to the agent.
- **CLI versus MCP.** A CLI tool the model already knows (`gh`, `kubectl`, `aws`) can sometimes be leaner than the equivalent MCP. The MCP adds a static tool description in context. The CLI is part of the model's training. Experiment.
- **Trim shell outputs.** Long shell output is a context killer. Tools like [rtk](https://github.com/rtk-ai/rtk) strip CLI output down to agent-relevant information only.

A couple of niche ones if you're really pushing: run `/chronicle tip` regularly inside Copilot CLI to surface prompt patterns you could improve, and look at plugins like [copilot-codeact-plugin](https://github.com/jsturtevant/copilot-codeact-plugin) that collapse multiple tool calls into one round trip.

---

## What to invest in for the long term

Three things matter most if you want to be ahead of where this is going.

**Build your analytical skills.** What set developers apart was never just writing code. It was analytical skills. Building domain knowledge fast. Understanding what customers actually need. Translating requirements into systems. That's the part agents can't do. They'll execute. They won't strategize. Lean into that work.

**Apply good architecture.** More important than ever. Good architecture reduces agent misses, keeps the agent in its lane, and keeps the codebase legible enough for a non-human collaborator to navigate. Domain-Driven Design, Hexagonal Architecture, CQRS, Event-Driven Design. What these share: they cleanly separate low-level technology from the differentiating domain core. Old debates about function length, comment style, or semicolons in JavaScript matter less than they used to. Architecture is what matters now.

**Iterate on prompts and configs as engineering work.** You're a context engineer now. Keep configs fresh. Treat agent misses like incidents. Set agents up for success the same way you'd set up a junior teammate. Clear scope, clear definition of done, clear guard rails, room to do good work.

---

## 5 things you can start doing today

If you do nothing else from this post, do these:

1. **Choose the right model for the right task.** Stop defaulting to the biggest one. Auto mode if you can't be bothered to pick.
2. **Provide clear guidance in your prompts.** Be precise. Add stop signals. Supply known context up front.
3. **Research, plan, implement.** Split phases into separate sessions. Reasoning model to plan, smaller one to implement.
4. **Provide deterministic guardrails.** Tests, linters, security scans. The agent will use them. They'll pull it back from drift.
5. **Maintain a concise, human-written `copilot-instructions.md`.** Use it as an agent-miss log. Use it to trim outputs. Recreate it every few months.

![5 things you can start doing today.](/images/posts/make-every-token-count-why-agent-quality-is-the-better-way-to-optimize-spend/image-15.png)
_Five things you can start doing today._

If you take one thing out of this whole post, take this:

> Provide as little context as possible, but as much as required.

That's the principle. Everything else is how to apply it.

Send fewer rockets. Make each one land.

---

_This post is based on a workshop I run on agent quality and token optimization. Slide images are from the GitHub workshop deck of the same name, credit to GitHub. If you want to dig deeper or share notes from your own teams, find me on [GitHub](https://github.com/VeVarunSharma)._

![cover image](/images/posts/make-every-token-count-why-agent-quality-is-the-better-way-to-optimize-spend/cover.png)

---

_I’m Ve Sharma, a Solution Engineer at Microsoft focusing on Cloud & AI working on GitHub Copilot. I help developers become AI-native developers and optimize the SDLC for teams. I also make great memes. Find me on [LinkedIn](https://www.linkedin.com/in/vevarunsharma) or [GitHub](https://github.com/VeVarunSharma)._
