---
title: 'How I Would Manage Enterprise Copilot Agents: Plugins, Managed Settings, and APM'
description: 'A practical architecture for packaging, distributing, and governing GitHub Copilot agents across an enterprise.'
publishedAt: 2026-09-28
tags:
  - 'github'
  - 'githubcopilot'
  - 'agents'
  - 'governance'
draft: false
featured: false
---

## TL;DR for the Busy Platform Team

- Use an **enterprise-managed plugin** to package agents, skills, hooks, rules, and MCP configuration.
- Use **`managed-settings.json`** to install that plugin and enforce the boundaries around it.
- Add **APM** when you need the same agent assets across Copilot, Claude, Cursor, Codex, or other harnesses—or when lockfiles and transitive dependency auditing matter.
- If you are a Copilot-only enterprise, start with the plugin and managed settings. You probably do not need all three on day one.

---

## Why This Gets Confusing

I kept seeing the same question:

> Do we manage enterprise agents with plugins, `managed-settings.json`, or Agent Package Manager?

The answer is not “pick the best one.” They operate at different layers.

| Layer           | What it answers                              | Tool                              |
| --------------- | -------------------------------------------- | --------------------------------- |
| **Delivery**    | What agent capabilities do we ship?          | Copilot plugin                    |
| **Enforcement** | What can those capabilities install and do?  | Enterprise managed settings       |
| **Portability** | How do we reuse them across agent harnesses? | Agent Package Manager, optionally |

That is the mental model. The plugin is the product. Managed settings are the guardrails. APM is the portability and supply-chain layer when you actually need one.

## The Architecture I Would Start With

I would create an internal plugin marketplace repository:

```text
acme/copilot-plugins/
├── .github/plugin/marketplace.json
└── plugins/engineering-platform/
    ├── plugin.json
    ├── skills/deploy/SKILL.md
    ├── mcp.json
    └── com.github.copilot/
        ├── agents/platform-engineer.agent.md
        ├── rules/
        └── hooks/hooks.json
```

[Agent Plugins 1.0](https://docs.github.com/en/enterprise-cloud@latest/copilot/concepts/agents/about-plugins) gives us a portable format for skills and MCP servers while keeping Copilot-specific agents, rules, commands, hooks, and LSP configuration under `com.github.copilot/`.

The `plugin.json` can stay boring:

```json
{
  "$schema": "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json",
  "name": "engineering-platform",
  "version": "1.0.0",
  "description": "Acme's approved platform engineering agents and skills"
}
```

Then publish it through `.github/plugin/marketplace.json`:

```json
{
  "name": "acme",
  "owner": {
    "name": "Acme Platform Engineering"
  },
  "plugins": [
    {
      "name": "engineering-platform",
      "description": "Approved platform engineering agents and skills",
      "version": "1.0.0",
      "source": "./plugins/engineering-platform"
    }
  ]
}
```

The agent itself should be narrow. “All tools” is convenient until it becomes your default security model.

```markdown
---
name: platform-engineer
description: Reviews and implements changes to Acme's approved platform patterns
tools: ['read', 'search', 'edit', 'execute', 'acme-platform/*']
---

Follow Acme's platform standards. Prefer existing modules and deployment
workflows. Explain any requested exception before changing infrastructure.
```

Skills can carry the repeatable workflow:

```markdown
---
name: deploy
description: Prepares and validates an Acme service deployment
---

1. Validate the service configuration and required tests.
2. Produce the deployment plan before making changes.
3. Stop if the target environment or approval is unclear.
```

And the plugin can declare its MCP integration:

```json
{
  "$schema": "https://agent-plugins.org/schemas/1.0.0/mcp.schema.json",
  "mcpServers": {
    "acme-platform": {
      "type": "streamable-http",
      "url": "https://mcp.acme.example/platform"
    }
  }
}
```

This gives us one versioned unit containing the capability we want developers to receive.

## Now Put the Enterprise Boundary Around It

The plugin tells Copilot what exists. [`managed-settings.json`](https://docs.github.com/en/enterprise-cloud@latest/copilot/reference/enterprise-administrators/enterprise-managed-settings) tells Copilot what is mandatory and what is allowed.

In the enterprise's `.github-private` repository:

```json
{
  "extraKnownMarketplaces": {
    "acme": {
      "source": {
        "source": "github",
        "repo": "acme/copilot-plugins"
      },
      "autoUpdate": true
    }
  },
  "strictKnownMarketplaces": [
    {
      "source": "github",
      "repo": "acme/copilot-plugins"
    }
  ],
  "enabledPlugins": {
    "engineering-platform@acme": true
  },
  "permissions": {
    "disableBypassPermissionsMode": "disable",
    "ask": ["Shell(git push *)"]
  },
  "allowedMcpServers": [
    {
      "serverUrl": "https://mcp.acme.example/*"
    }
  ],
  "sandbox": {
    "enabled": true,
    "allowBypass": false,
    "sandboxMcpServers": true
  }
}
```

Now the plugin is automatically installed for enterprise users on supported clients, other marketplaces can be restricted, `git push` requires approval, and unapproved MCP servers are blocked.

The important part is that the plugin does not get to override the policy around it. Capability and permission remain separate.

Managed-setting support still varies by key and Copilot client, so check the current support matrix before treating one file as universal enforcement.

## When APM Earns Its Place

If all of this is only for GitHub Copilot, I would stop here.

[APM](https://microsoft.github.io/apm/) earns the additional operational layer when the same source assets must deploy to multiple agent harnesses, or when we need exact dependency locking and stronger install-time auditing.

An APM package might look like this:

```text
engineering-agent-package/
├── apm.yml
└── .apm/
    ├── agents/
    ├── skills/
    ├── instructions/
    └── hooks/
```

```yaml
name: engineering-agent-package
version: '1.0.0'
description: Shared engineering agent context
targets:
  - copilot
  - claude
includes: auto
dependencies:
  apm:
    - acme/security-agent-package#v1.2.0
  mcp:
    - io.github.github/github-mcp-server
```

A consumer installs and audits it:

```bash
apm install acme/engineering-agent-package#v1.0.0
apm audit --ci
```

APM generates `apm.lock.yaml`, pinning resolved commits and content hashes. That is useful when an auditor asks what agent content was actually installed, not just what the manifest requested.

But APM is an install-time gate, not a runtime sandbox. It does not replace Copilot permissions, MCP allowlists, or sandbox settings.

## The Ownership Rule

```text
APM manages reusable source dependencies
        ↓
The plugin is the Copilot delivery artifact
        ↓
managed-settings.json installs and constrains it
```

Do not let APM and the Copilot plugin installer independently own the same deployed files. Pick one delivery path for each artifact or you will eventually create drift that nobody understands.

## My Recommendation

For a Copilot-first enterprise:

1. Package meaningful capabilities as managed plugins.
2. Use `managed-settings.json` to install them and establish non-negotiable boundaries.
3. Keep standalone profiles in `.github-private/agents/` for small, self-contained personas.
4. Add APM only when cross-harness reuse, dependency composition, or lockfile-level auditing justifies it.

Start with the fewest moving parts that give you a real control boundary. Add another package manager when it solves a problem you actually have—not because every agent feature needs to appear in the architecture diagram.

## Links

- [About GitHub Copilot plugins](https://docs.github.com/en/enterprise-cloud@latest/copilot/concepts/agents/about-plugins)
- [Creating a plugin marketplace](https://docs.github.com/en/enterprise-cloud@latest/copilot/how-tos/copilot-cli/customize-copilot/plugins-marketplace)
- [Enterprise managed settings](https://docs.github.com/en/enterprise-cloud@latest/copilot/reference/enterprise-administrators/enterprise-managed-settings)
- [Agent Package Manager](https://microsoft.github.io/apm/)
- [APM governance guide](https://microsoft.github.io/apm/enterprise/governance-guide/)
