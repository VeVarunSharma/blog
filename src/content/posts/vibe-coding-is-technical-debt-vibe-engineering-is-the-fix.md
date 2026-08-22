---
title: 'Vibe Coding is Technical Debt. Vibe Engineering is the Fix'
description: 'TL;DR for the Busy Dev      Vibe Coding is "Single Player Mode": Prompting based on...'
publishedAt: 2025-12-01
tags:
  - 'githubcopilot'
  - 'github'
  - 'vibecoding'
  - 'agents'
draft: false
featured: false
image:
  src: '/images/posts/vibe-coding-is-technical-debt-vibe-engineering-is-the-fix/cover.jpg'
  alt: 'Cover image for Vibe Coding is Technical Debt. Vibe Engineering is the Fix'
sourceUrl: 'https://dev.to/vevarunsharma/vibe-coding-is-technical-debt-vibe-engineering-is-the-fix-5a8j'
---

### TL;DR for the Busy Dev

- **Vibe Coding** is "Single Player Mode": Prompting based on intuition, pasting code, and moving fast. It’s great for POCs but creates "Context Amnesia" and security risks in production.
- **Vibe Engineering** is "Multiplayer Mode": Architecting the constraints, rules, and agents to produce reliable software at scale.
- **The Fix:** Move context from your head to the Repo. Use **Context Engineering Primitives** (Instructions, Prompts, Agents) to enforce standards.
- **The Result:** A workflow where the prompt remains the same, but the output shifts from "insecure" to "production-ready" automatically.

---

## The "Vibe" Shift

We’ve all been there. You have a Lo-Fi playlist on, a fresh coffee, and an LLM chat window open. You ask for a React component, you paste it, it works.

This is **Vibe Coding**. The strategy is simple: _"Prompt, Paste, and Pray."_

At my last company (YGG), we Vibe Coded our way to an MVP at breakneck speed and kept up with major business pivots that required constant rework. It felt like magic and we got it down 4x faster with less devs saving us 7 figures of costs. But when we prepared for launch, we hit a wall that "vibes" couldn't fix.
We discovered that vibe coding can actually be vulnerability-as-a-service.

![Image description](/images/posts/vibe-coding-is-technical-debt-vibe-engineering-is-the-fix/image-01.png)

We had an external security audit, and the report came back: **163 pages of vulnerabilities**, including 15 rated Severe. Too name a few issues, we had SQL injection risks, SSRF threat vectors, and inconsistent authentication patterns.

The diagnosis wasn't that the AI was "bad." The diagnosis was **Context Amnesia** and discovering that vibe coding can also be vulnerability-as-a-service. We were prompting in a chat window that didn't know our security protocols, didn't know our auth patterns, and didn't know our infrastructure rules.

That is when we shifted to **Vibe Engineering**.

### The Result?

By applying these methods, we didn't just fix the bugs. We shipped the product on time. We addressed every single High and Severe vulnerability before launch, and in our subsequent sprints, our security ticket volume dropped significantly compared to our "Vibe Coding" days.

## Defining the Terms

To fix the problem, we first have to define the methodology. What exactly is the difference between just using AI and _engineering_ with AI?

### 1. Vibe Coding

![vibe-coding-meme](/images/posts/vibe-coding-is-technical-debt-vibe-engineering-is-the-fix/image-02.png)

> **Definition:** The practice of writing software using natural language, intuition, and heavy reliance on AI "vibes" rather than syntax.
> _E.g: "It looks correct, so it is correct."_

- **The Strategy:** "Prompt, Paste, and Pray."
- **The Vibe:** Fast, magical, and chaotic.
- **The Trap: Single Player Mode.** It relies entirely on _your_ mental context. If you forget to tell the AI to secure the endpoint, it won't.

### 2. Vibe Engineering

> **Definition:** The discipline of architecting context, constraints, and agents to produce reliable software at scale.
> _E.g: "Trust the Agent, but Verify the Spec."_

- **The Strategy:** "Plan, Orchestrate, and Verify."
- **The Vibe:** Disciplined, context-aware, and consistent.
- **The Upgrade: Multiplayer Mode.** It follows the _team's_ rules and the _repo's_ context, regardless of which developer is prompting.

## The Comparison: Coding vs. Engineering

Here is the breakdown of how the workflow shifts when you move from individual usage to team-based orchestration.

| Feature               | Vibe Coding (Individual)        | Vibe Engineering (Team/Agent)                              |
| :-------------------- | :------------------------------ | :--------------------------------------------------------- |
| **The Human Role**    | The Typist / Prompter           | The Architect / Orchestrator                               |
| **The Context**       | Whatever is in your chat window | The entire Repo + `*.agents.md`, + other .md ruleset files |
| **The Quality Check** | "Does it run?" (Eye test)       | "Does it pass the test suite?"                             |
| **The Danger**        | Breaking Production / Security  | Over-engineering                                           |
| **The Tooling**       | Chatbots & Tab-Complete         | Agents, Plan Mode, & MCP                                   |

## It’s Not a Boolean, It’s a Spectrum

Before we dive into the fix, let's be clear: **Vibe Coding isn't "wrong."** It’s a tool.

- **Vibe Coding (0-60% Maturity):** Excellent for prototyping, hackathons, and exploring new APIs. If you need to test an idea in 30 minutes, Vibe Code it.
- **Vibe Engineering (60-100% Maturity):** Critical for production, teams, and long-term maintenance.

The danger lies in staying in "Vibe Mode" when you move to production. Conversely, you don't want to **Over-Engineer** a weekend project with complex agent rules. It’s a gradient, and knowing when to switch gears is the skill of the future AI-native developer.

## Context Engineering Primitives

Vibe Engineering relies on codifying your team's "vibes" into the repository. At GitHub & Microsoft, we call these **Context Engineering Primitives**:

| Feature                 | File Pattern        | Purpose                                                                        | Best For                                                                                                      |
| :---------------------- | :------------------ | :----------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------ |
| **Custom Instructions** | `*.instructions.md` | **Rules of Engagement.** Always-on guidelines that influence all interactions. | 1. Coding Standards (No `any` types)<br>2. Security Rules (No raw SQL)<br>3. Tech Stack (Always use Tailwind) |
| **Reusable Prompts**    | `*.prompts.md`      | **Executable Commands.** Specific tasks you run frequently.                    | 1. Generating boilerplate components<br>2. Writing Unit Tests<br>3. Creating Atomic Commits                   |
| **Custom Agents**       | `*.agents.md`       | **Personas & Workflows.** Specialized contexts with specific tools.            | 1. Security Review Agent<br>2. Terraform/SRE Agent<br>3. Migration Agent                                      |

### Context Engineering Primitives in a Repo

Here's what these primitives look like in an actual repo:

![context-eng-primitives](/images/posts/vibe-coding-is-technical-debt-vibe-engineering-is-the-fix/image-03.png)

## Real World Example 1: The App Layer (Next.js)

Let's look at how "Vibe Coding" vs. "Vibe Engineering" handles the exact same prompt.

**The User Prompt:**

> _"Write a quick endpoint to fetch user data by ID."_

### ❌ Scenario A: Vibe Coding (No Context)

Without instructions, the AI optimizes for speed. It assumes you just want the data _now_.

```typescript
// src/app/api/legacy-vibe/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  // 🚩 RISK 1: SQL Injection vulnerability via template literal
  // 🚩 RISK 2: No input validation (Zod is missing)
  const users = await db.query(`SELECT * FROM users WHERE id = ${id}`);

  // 🚩 RISK 3: Returning full object including password_hash and salt
  return NextResponse.json(users[0]);
}
```

### ✅ Scenario B: Vibe Engineering (With `agents.md`)

We add a `.github/agents/security.agent.md` file to the repo with non-negotiables: _1. Always use ORM methods. 2. Validate inputs with Zod. 3. Never return sensitive fields._

Here's what the agent file looks like (it's 3x longer than what you see here):

![agent-file](/images/posts/vibe-coding-is-technical-debt-vibe-engineering-is-the-fix/image-04.png)

Now here's the updated code running that same initial user prompt.

```typescript
// src/app/api/secure-vibe/route.ts
// Context: .github/copilot-instructions.md active

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

// ✅ SUCCESS 1: Zod Schema for validation
const QuerySchema = z.object({
  id: z.string().uuid(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // ✅ SUCCESS 2: Validate input
  const result = QuerySchema.safeParse({ id: searchParams.get('id') });
  if (!result.success) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  // ✅ SUCCESS 3: Use ORM method (No raw SQL)
  const user = await db.user.findUnique({
    where: { id: result.data.id },
    // ✅ SUCCESS 4: Return only safe fields (DTO)
    select: { id: true, name: true, email: true },
  });

  return NextResponse.json(user);
}
```

## Real World Example 2: The Infrastructure Layer (Terraform)

This is even more critical in Cloud Ops. A "Vibe Coded" infrastructure often leads to public buckets and leaked keys.

**The User Prompt:**

> _"Write Terraform for an Azure Function to process payments."_

### ❌ Scenario A: Vibe Coding (The "It Works" Trap)

```hcl
resource "azurerm_linux_function_app" "payment_api" {
  name                = "vibe-payment-api"
  location            = "East US"

  # 🚩 MISTAKE 1: Hardcoded Secrets (The Cardinal Sin)
  app_settings = {
    "STRIPE_API_KEY" = "sk_live_12345_DONOTCOMMIT"
    "DB_CONN"        = "Server=tcp:db.windows.net;Pwd=Password123!"
  }

  site_config {
    # 🚩 MISTAKE 2: Public & Insecure
    http2_enabled = false
    minimum_tls_version = "1.0"
  }

  # 🚩 MISTAKE 3: Governance (Missing tags)
}
```

### ✅ Scenario B: Vibe Engineering (With `terraform.agent.md`)

We use a **Terraform Agent** context file that enforces: "Always use Key Vault references" and "Enforce Managed Identity."

Here's what the agent file looks like:

![agent-file-eng](/images/posts/vibe-coding-is-technical-debt-vibe-engineering-is-the-fix/image-05.png)

Now here's the updated code, using that same prompt:

```hcl
resource "azurerm_linux_function_app" "payment_api" {
  name                = "secure-payment-api"
  location            = "East US"

  # ✅ SUCCESS 1: Managed Identity (Identity as Perimeter)
  identity {
    type = "SystemAssigned"
  }

  # ✅ SUCCESS 2: Secrets via Key Vault References
  app_settings = {
    "STRIPE_API_KEY" = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.stripe.id})"
    "DB_CONN"        = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.db.id})"
  }

  site_config {
    # ✅ SUCCESS 3: Modern Security Standards
    http2_enabled = true
    minimum_tls_version = "1.2"
  }

  # ✅ SUCCESS 4: FinOps Happy + compliance success
  tags = {
    CostCenter = "Payments-Team"
  }
}
```

## The Enterprise Win: True "Shift Left" Security

For Enterprise teams, this methodology solves a massive headache: **The Shift Left.**

Usually, "Shift Left" means catching security issues in the CI/CD pipeline or during a Pull Request review. While better than fixing it in production, it still creates friction and rework.

**Vibe Engineering shifts security all the way to the Prompt.**

By Codifying your constraints (e.g., "Always use Managed Identity") into the Repo Context:

1.  **Prevention > Detection:** You aren't catching a bad pattern in a scan; you are preventing the AI from suggesting it in the first place.
2.  **Velocity:** Developers don't have to rewrite code after a failed pipeline run.
3.  **Governance:** You ensure that every junior developer (and every AI agent) defaults to your organization's architectural standards without needing to memorize the wiki.

## The Workflow: From Vulnerability Github Issue to Merged PR

How does this look in practice when fighting a real security fire? Here is an actual workflow to fix an SSRF vulnerability using a security Agent.

**1. The Vulnerability:**
We identified a CVE in our Next.js middleware handling. It needed a surgical fix.

![issue-image](/images/posts/vibe-coding-is-technical-debt-vibe-engineering-is-the-fix/image-06.png)

**2. Assigning the Agent:**
Instead of pulling a developer off their sprint, I opened a GitHub Issue and assigned it to our custom `@security-agent` (which is configured to focus solely on vulnerabilities).

![assigning-the-agent](/images/posts/vibe-coding-is-technical-debt-vibe-engineering-is-the-fix/image-07.png)

**3. Orchestration & Execution:**
The agent analyzed the repo, found the vulnerable middleware pattern, and proposed a fix. It didn't just guess - it traced the data flow.

![agent-execution](/images/posts/vibe-coding-is-technical-debt-vibe-engineering-is-the-fix/image-08.png)

**4. Verification:**
The agent ran the linting rules and ensured the fix didn't break existing routing, along with running CodeQL. As well as a security impact report!

![agent-verification](/images/posts/vibe-coding-is-technical-debt-vibe-engineering-is-the-fix/image-09.png)

**5. The Merge:**
I reviewed the PR. Because the agent followed our `copilot-instructions.md` the code style matched ours exactly. The `security.agent.md` ensured all other security best practices specific to our repo meet our standards. I clicked merge.

![agent-merge](/images/posts/vibe-coding-is-technical-debt-vibe-engineering-is-the-fix/image-10.png)

Success!

## Entering Agent HQ: Orchestration at Scale

We are moving beyond simple chat. We are entering the era of **Agent Orchestration**.

![ghu-agent-hq](/images/posts/vibe-coding-is-technical-debt-vibe-engineering-is-the-fix/image-11.jpg)

At GitHub Universe, we announced **Agent HQ**. This turns GitHub into an open ecosystem where you can choose the right model for the specific job and a centralized agent orchestration platform.

- Need complex architectural reasoning? Route the agent to **Claude 3.5 Sonnet**.
- Need massive context analysis? Route to **Gemini**.
- Need fast execution? Route to **OpenAI**.

You don't just prompt a chatbot anymore - you act as the **General Contractor**, hiring the right specialized agent for the right task.

This is already being done at scale at Github itself!

![ghu-agent-commmiter](/images/posts/vibe-coding-is-technical-debt-vibe-engineering-is-the-fix/image-12.jpg)

## Summary

![vibe-code-vibe-eng-comparison](/images/posts/vibe-coding-is-technical-debt-vibe-engineering-is-the-fix/cover.jpg)

### To start Vibe Engineering tomorrow:

1.  **Avoid Single Player Mode:** Don't rely on your mental context.
2.  **Codify Your Vibes:** Create a root `.github/copilot-instructions.md` file today.
3.  **Leverage Context Engineering Primitives:** use `.*.agents.md`, `.*.instructions.md`, `.*.prompts.md` files.
4.  **Orchestrate:** Don't just generate code—**Engineer the System** that generates the code. Use Agents to support this system.

Vibe coding is fun for hackathons. Vibe Engineering is for production.

![last-meme-whoosh](/images/posts/vibe-coding-is-technical-debt-vibe-engineering-is-the-fix/image-14.jpg)

---

You can find the source code for this article here too:
[https://github.com/VeVarunSharma/contoso-vibe-engineering](https://github.com/VeVarunSharma/contoso-vibe-engineering)

---

_I’m Ve Sharma, a Solution Engineer at Microsoft focusing on Cloud & AI working on Github Copilot. I help developers become AI-native developers and optimize the SDLC for teams. I also make great memes. Find me on [LinkedIn](https://www.linkedin.com/in/vevarunsharma) or [GitHub](https://github.com/VeVarunSharma)._
