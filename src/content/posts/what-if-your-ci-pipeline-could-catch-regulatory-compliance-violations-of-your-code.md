---
title: 'What If Your CI Pipeline Could catch regulatory compliance violations of your code?'
description: 'TL;DR for the Busy Dev:     Traditional CI checks (linting, tests, SAST) are...'
publishedAt: 2026-01-13
tags:
  - 'github'
  - 'devops'
  - 'ai'
  - 'security'
draft: false
featured: false
image:
  src: '/images/posts/what-if-your-ci-pipeline-could-catch-regulatory-compliance-violations-of-your-code/cover.jpg'
  alt: 'Cover image for What If Your CI Pipeline Could catch regulatory compliance violations of your code?'
sourceUrl: 'https://dev.to/vevarunsharma/what-if-your-ci-pipeline-could-catch-regulatory-compliance-violations-of-your-code-405b'
---

## TL;DR for the Busy Dev:

- **Traditional CI checks** (linting, tests, SAST) are deterministic—same input always produces the same output
- **AI-powered CI checks** using GitHub Copilot CLI can catch nuanced compliance violations that rule-based scanners miss
- We built a **PIPA BC (Privacy) compliance gate** that analyzes code for consent verification, data minimization, PHI logging, and more
- **Non-compliant code fails the pipeline** with a detailed report of violations
- Best used **alongside** (not replacing) deterministic checks for defense in depth
- **ROI**: Catching a privacy violation in CI costs ~$100. Catching it post-breach? $4.45 million average (IBM 2023)
- Example: Here are 2 examples in PR formats using the compliance workflow:[ Compliant version](https://github.com/VeVarunSharma/contoso-vibe-engineering/pull/13), and the [Non-compliant version failing in the CI](https://github.com/VeVarunSharma/contoso-vibe-engineering/pull/15).

---

## The Problem: Privacy Compliance is Hard to Automate

If you've worked with healthcare, finance, or government data, you know the drill. Regulations like **PIPA BC**, **HIPAA**, **GDPR**, and **PIPEDA** require specific handling of personal information:

- ✅ Verify consent before data access
- ✅ Minimize data exposure (return only what's needed)
- ✅ Never log sensitive values like SIN, PHN, or medical records
- ✅ Maintain audit trails
- ✅ Implement proper authentication and authorization

Traditional static analysis tools can catch some of these—hardcoded secrets, missing auth middleware, SQL injection. But they struggle with **contextual violations**:

> "Is this `console.log()` statement printing a patient's Social Insurance Number, or just a debug message?"

That's where non-deterministic, AI-powered checks come in.

---

## Deterministic vs. Non-Deterministic CI Checks

| Aspect         | Deterministic                    | Non-Deterministic (AI)              |
| -------------- | -------------------------------- | ----------------------------------- |
| **Output**     | Same input → Same result, always | May vary slightly between runs      |
| **Examples**   | ESLint, Jest, Trivy, CodeQL      | GitHub Copilot CLI, LLM analysis    |
| **Strengths**  | Predictable, fast, cheap         | Understands context, catches nuance |
| **Weaknesses** | Pattern-based, easy to bypass    | Can hallucinate, slower, costs $    |
| **Best for**   | Syntax, known vulnerabilities    | Compliance, code review, intent     |

**The key insight**: These aren't competing approaches—they're complementary layers of defense.

---

## Our Use Case: PIPA BC Compliance for Healthcare APIs

British Columbia's **Personal Information Protection Act (PIPA)** governs how private-sector organizations handle personal information. For healthcare apps, this means:

| PIPA Section | Requirement        | What to Check                             |
| ------------ | ------------------ | ----------------------------------------- |
| Section 6    | Consent            | Is consent verified before PHI access?    |
| Section 4    | Data Minimization  | Are we returning only necessary fields?   |
| Section 11   | Purpose Limitation | Is a purpose required and validated?      |
| Section 34   | Security           | Auth middleware? No PHI in logs?          |
| Section 34   | Audit Trail        | Are accesses logged (without PHI values)? |

Let's build a CI gate that checks all of this.

---

## The GitHub Action: How It Works

Here's our workflow that runs on every push to `main`:

```yaml
name: PIPA BC Compliance Check

on:
  pull_request:
    paths:
      - "services/medical-api/**"
    types:
      - opened
      - synchronize
      - reopened
  workflow_dispatch: # Allows manual trigger for testing

# Ensure only one compliance check runs at a time per PR
concurrency:
  group: pipa-compliance-${{ github.event.pull_request.number || github.run_id }}
  cancel-in-progress: true

permissions:
  contents: read
  pull-requests: write

env:
  COMPLIANCE_THRESHOLD: 80

jobs:
  pipa-compliance-check:
    name: PIPA BC Compliance Analysis
    runs-on: ubuntu-latest
    timeout-minutes: 15

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0 # Full history for accurate diff

      - name: Get changed files
        id: changed-files
        uses: tj-actions/changed-files@v44
        with:
          files: |
            services/medical-api/**/*.ts
            services/medical-api/**/*.tsx
            services/medical-api/**/*.js
            services/medical-api/**/*.jsx

      - name: Check if relevant files changed
        id: check-files
        run: |
          if [ -z "${{ steps.changed-files.outputs.all_changed_files }}" ]; then
            echo "skip=true" >> $GITHUB_OUTPUT
            echo "No relevant TypeScript/JavaScript files changed in medical-api"
          else
            echo "skip=false" >> $GITHUB_OUTPUT
            echo "Files to analyze:"
            echo "${{ steps.changed-files.outputs.all_changed_files }}"
          fi

      - name: Setup Node.js
        if: steps.check-files.outputs.skip != 'true'
        uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: Install GitHub Copilot CLI
        if: steps.check-files.outputs.skip != 'true'
        run: npm i -g @github/copilot

      - name: Run PIPA BC Compliance Agent
        if: steps.check-files.outputs.skip != 'true'
        env:
          COPILOT_GITHUB_TOKEN: ${{ secrets.COPILOT_GITHUB_TOKEN }}
          GITHUB_REPOSITORY: ${{ github.repository }}
        run: |
          set -euo pipefail

          # Build the list of changed files
          CHANGED_FILES="${{ steps.changed-files.outputs.all_changed_files }}"

          # Read the agent prompt
          AGENT_PROMPT=$(cat .github/agents/pipa-bc-compliance.agent.md)

          # Build the full prompt
          PROMPT="$AGENT_PROMPT"
          PROMPT+=$'\n\n## Context\n'
          PROMPT+="- Repository: $GITHUB_REPOSITORY"
          PROMPT+=$'\n- Service: services/medical-api'
          PROMPT+=$'\n- Changed Files: '"$CHANGED_FILES"
          PROMPT+=$'\n\n## Task\n'
          PROMPT+='1. Read the PIPA BC compliance documentation at services/medical-api/PIPA_COMPLIANCE.md'
          PROMPT+=$'\n2. Analyze the changed files for PIPA BC compliance'
          PROMPT+=$'\n3. Check each file against all PIPA BC requirements (consent, data minimization, purpose limitation, security, audit logging, access control)'
          PROMPT+=$'\n4. Generate a compliance report at services/medical-api/pipa-compliance-report.md'
          PROMPT+=$'\n5. The report MUST include a JSON block with compliance_score and status fields'

          # Run Copilot CLI with the agent
          copilot --prompt "$PROMPT" --allow-all-tools --allow-all-paths < /dev/null

. . .
```

You can find the full file here: [.github/workflows/pipa-bc-compliance.yml](https://github.com/VeVarunSharma/contoso-vibe-engineering/blob/main/.github/workflows/pipa-bc-compliance.yml)

### What's Happening Here?

1. **Checkout & Setup**: Standard CI setup
2. **Install Copilot CLI**: The `@github/copilot` npm package provides terminal access to Copilot
3. **Load the Agent Prompt**: We read our compliance rules from a markdown file
4. **Run Analysis**: Copilot analyzes the entire codebase against our rules
5. **Fail on Critical**: If critical violations are found, the pipeline fails

The magic is in the **agent prompt**—a markdown file that tells Copilot exactly what to look for.

---

## Example 1: Compliant Code ✅

Here's a PIPA-compliant patient endpoint:

```typescript
// ✅ Auth middleware applied to all routes
app.use("/*", requireAuth);

app.get("/:id", zValidator("query", getPatientQuerySchema), async (c) => {
  const patientId = c.req.param("id");
  const { purpose } = c.req.valid("query"); // ✅ Purpose required
  const user = c.get("user");

  // ✅ Verify role has permission for this purpose
  if (!ROLE_PERMISSIONS[user.role].includes(purpose)) {
    await createAuditLog({ action: "ACCESS_DENIED", ... });
    return c.json({ error: "Access denied" }, 403);
  }

  // ✅ Verify consent before data access
  const consentResult = await verifyConsent(patientId, purpose, user.id);
  if (!consentResult.valid) {
    await createAuditLog({ action: "ACCESS_DENIED", ... });
    return c.json({ error: "Consent verification failed" }, 403);
  }

  const patient = await db.query.patients.findFirst({
    where: eq(patients.id, patientId),
  });

  // ✅ Apply data minimization based on purpose
  const filteredData = filterPHI(patient, purpose, user.role);

  // ✅ Audit log with field names only, no PHI values
  await createAuditLog({
    action: "PATIENT_ACCESS",
    fieldsAccessed: filteredData._accessedFields, // Names only!
  });

  return c.json({ data: filteredData });
});
```

**CI Result**: ✅ PASS

Here are some examples of the GitHub Compliance CI check in action taken from the example repo.

![compliance-pass-1](/images/posts/what-if-your-ci-pipeline-could-catch-regulatory-compliance-violations-of-your-code/image-01.png)

![compliance-pass-2](/images/posts/what-if-your-ci-pipeline-could-catch-regulatory-compliance-violations-of-your-code/image-02.png)

---

## Example 2: Non-Compliant Code ❌

Here's intentionally bad code for demo purposes:

```typescript
// ❌ VIOLATION 8: Hardcoded credentials
const API_SECRET_KEY = 'sk-prod-12345-abcdef-secret-key';
const DATABASE_PASSWORD = 'super_secret_password_123';

// ❌ VIOLATION 1: No authentication middleware
app.get('/:id', async (c) => {
  const patientId = c.req.param('id');

  // ❌ VIOLATION 7: No purpose validation
  const purpose = c.req.query('purpose'); // Optional and ignored!

  // ❌ VIOLATION 2: No consent verification
  const patient = await db.query.patients.findFirst({
    where: eq(patients.id, patientId),
  });

  // ❌ VIOLATION 4: Logging PHI values
  console.log(`[PATIENT] SIN: ${patient.socialInsuranceNumber}`);
  console.log(`[PATIENT] Health Card: ${patient.healthCardNumber}`);
  console.log(
    `[PATIENT] Medical History: ${JSON.stringify(patient.medicalHistory)}`,
  );

  // ❌ VIOLATION 6: No audit logging

  // ❌ VIOLATION 3: Returns ALL fields (no data minimization)
  return c.json({
    data: patient,
    _internal: {
      apiKey: API_SECRET_KEY, // ❌ Exposing secrets!
    },
  });
});

// ❌ VIOLATION 5: Bulk export with no access controls
app.get('/export/all', async (c) => {
  const allPatients = await db.query.patients.findMany();
  return c.json({ patients: allPatients });
});
```

**CI Result**: ❌ FAIL

![non-compliance-fail-1](/images/posts/what-if-your-ci-pipeline-could-catch-regulatory-compliance-violations-of-your-code/image-03.png)

The report is uploaded as an artifact, and it's attached right in the Pull Request for other agents & humans to review, and to possibly to other agentic actions from this type of trigger.

![non-compliance-fail-2](/images/posts/what-if-your-ci-pipeline-could-catch-regulatory-compliance-violations-of-your-code/image-04.png)

The report identifies all 8 violations with specific line numbers and PIPA sections violated.

---

## Step-by-Step Setup Guide

### Prerequisites

- GitHub repository with Actions enabled
- GitHub Copilot subscription (Business or Enterprise)
- Fine-grained Personal Access Token with Copilot permissions

### Step 1: Create the Copilot Token

1. Go to **GitHub Settings → Developer settings → Personal access tokens → Fine-grained tokens**
2. Create a new token with:
   - **Repository access**: Your target repo
   - **Permissions**: `Copilot` → Read-only
3. Copy the token

### Step 2: Add the Secret

1. Go to your repo's **Settings → Secrets and variables → Actions**
2. Create a new secret: `COPILOT_GITHUB_TOKEN`
3. Paste your token

### Step 3: Create the Agent Prompt

Create `.github/agents/pipa-bc-compliance.agent.md`:

```markdown
# PIPA BC Compliance Agent

You are a privacy compliance auditor for British Columbia's PIPA.

## Your Task

Analyze all TypeScript/JavaScript files for PIPA violations:

### Critical Violations (Immediate Fail)

- [ ] PHI values logged to console (SIN, PHN, medical records)
- [ ] No authentication on endpoints accessing PHI
- [ ] No consent verification before data access
- [ ] Hardcoded credentials or API keys
- [ ] Bulk data export without access controls

### Major Violations

- [ ] Missing purpose validation on data requests
- [ ] No data minimization (returning all fields)
- [ ] Missing audit logging

## Output Format

Generate a report with:

1. Overall compliance score (0-100)
2. List of violations with file, line, and PIPA section
3. Remediation guidance for each violation

If any CRITICAL violations exist, include this line:
"THIS ASSESSMENT CONTAINS A CRITICAL VULNERABILITY"
```

You can find the full file for this compliance agent here: [.github/agents/pipa-bc-compliance.agent.md](https://github.com/VeVarunSharma/contoso-vibe-engineering/blob/main/.github/agents/pipa-bc-compliance.agent.md)

### Step 4: Create the Workflow

Create `.github/workflows/pipa-compliance.yml` with the workflow shown above.

### Step 5: Test It

1. Push compliant code → Should pass ✅
2. Push non-compliant code → Should fail ❌

---

## Pros and Cons

### ✅ Pros

| Benefit                           | Impact                                            |
| --------------------------------- | ------------------------------------------------- |
| **Catches contextual violations** | Understands "is this log statement printing PHI?" |
| **Natural language rules**        | No regex patterns or AST parsing required         |
| **Adapts to your codebase**       | Learns patterns from your actual code             |
| **Reduces manual review time**    | Flags issues before human reviewers see them      |
| **Documentation as code**         | Agent prompts are readable, version-controlled    |

### ❌ Cons

| Drawback                     | Mitigation                              |
| ---------------------------- | --------------------------------------- |
| **Non-deterministic output** | Run multiple times, require consensus   |
| **Can hallucinate**          | Human review of flagged issues          |
| **Slower than linting**      | Run on specific paths, use caching      |
| **Costs money**              | Only run on PRs to protected branches   |
| **Requires Copilot license** | ROI justifies for compliance-heavy orgs |

---

## When to Use Each Type

### Use Deterministic Checks For:

- ✅ Syntax errors and formatting (ESLint, Prettier)
- ✅ Type checking (TypeScript)
- ✅ Known vulnerability patterns (CodeQL, Trivy)
- ✅ Unit and integration tests (Jest, Playwright)
- ✅ Secret scanning (git-secrets, Gitleaks)
- ✅ Dependency vulnerabilities (Dependabot, Snyk)

### Use Non-Deterministic (AI) Checks For:

- ✅ Privacy compliance (PIPA, HIPAA, GDPR intent)
- ✅ Business logic validation
- ✅ Code review augmentation
- ✅ Documentation completeness
- ✅ API contract compliance
- ✅ Security posture assessment

### The Hybrid Approach (Recommended)

```yaml
jobs:
  # Fast, deterministic checks first
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - run: pnpm lint
      - run: pnpm test
      - run: pnpm typecheck

  # AI compliance check after deterministic passes
  compliance-check:
    needs: lint-and-test
    runs-on: ubuntu-latest
    steps:
      - run: copilot --prompt "..."
```

Only run the expensive AI check if the cheap checks pass first.

---

## Why This Matters: The Business Case

### The Cost of Getting It Wrong

| Stage                                    | Cost to Fix                   |
| ---------------------------------------- | ----------------------------- |
| Development (caught in CI)               | ~$100                         |
| QA/Staging                               | ~$1,000                       |
| Production (pre-breach)                  | ~$10,000                      |
| Post-breach (notification, legal, fines) | **$4.45M average** (IBM 2023) |

For PIPA BC specifically:

- **Fines**: Up to $100,000 per violation
- **Reputation**: Healthcare data breaches make headlines
- **Lawsuits**: Class actions for privacy violations

### ROI Calculation

```
Annual Copilot Business license: ~$228/developer
PRs per developer per year: ~200
Cost per AI compliance check: ~$1.14

Violations caught per 100 PRs: ~5
Cost to fix in CI: $100 × 5 = $500
Cost to fix post-production: $10,000 × 5 = $50,000

Savings per 100 PRs: $49,500
ROI: 4,342%
```

Even if AI checks only catch **one** violation per quarter that would have reached production, they pay for themselves.

---

## For Government and Regulated Industries

### Why Non-Deterministic Checks Matter More Here

1. **Regulations are written in natural language**—AI understands intent, not just patterns
2. **Auditors ask "why"**—AI can explain its reasoning in reports
3. **Requirements change frequently**—Update a markdown file, not regex rules
4. **Defense in depth**—Another layer for compliance-by-design

### Implementation Tips

- **Start with critical violations only**—Get quick wins before expanding
- **Human-in-the-loop**—Require approval for AI-flagged issues, don't auto-reject
- **Audit the auditor**—Review AI decisions quarterly for accuracy
- **Document everything**—AI reports become compliance evidence

---

## Conclusion

![Github-ci-cover-image](/images/posts/what-if-your-ci-pipeline-could-catch-regulatory-compliance-violations-of-your-code/cover.jpg)

Non-deterministic CI checks aren't replacing your test suite—they're augmenting it. For compliance-heavy domains like healthcare, finance, and government, AI-powered analysis catches the nuanced violations that rule-based scanners miss.

The setup is straightforward:

1. Create a Copilot token
2. Write your compliance rules in plain English
3. Add the workflow
4. Push and watch it work

The cost of a privacy breach—in fines, reputation, and user trust—dwarfs the cost of an AI-powered CI check. For organizations handling sensitive data, this isn't optional anymore.

**Start small. Catch one critical violation. Prove the ROI. Then expand.**

---

## Resources

- [GitHub Copilot CLI Documentation](https://docs.github.com/en/copilot)
- [PIPA BC Full Text](https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/03063_01)
- [Example Repository (this article's code)](https://github.com/VeVarunSharma/contoso-vibe-engineering)
- [IBM Cost of a Data Breach Report 2023](https://www.ibm.com/reports/data-breach)

---

_I’m Ve Sharma, a Solution Engineer at Microsoft focusing on Cloud & AI working on GitHub Copilot. I help developers become AI-native developers and optimize the SDLC for teams. I also make great memes. Find me on [LinkedIn](https://www.linkedin.com/in/vevarunsharma) or [GitHub](https://github.com/VeVarunSharma)._
