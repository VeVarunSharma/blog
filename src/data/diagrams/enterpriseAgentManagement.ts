import type { FlowDiagramDefinition } from '../../components/diagrams/types';

export const enterpriseAgentControlPlane = {
  id: 'enterprise-agent-control-plane',
  title: 'The enterprise agent control plane',
  summary:
    'APM can manage reusable source dependencies upstream. A Copilot plugin packages the approved capability, managed settings install and constrain it, and supported Copilot clients enforce those settings.',
  height: 430,
  nodes: [
    {
      id: 'apm',
      type: 'publication',
      position: { x: 0, y: 105 },
      data: {
        eyebrow: 'Optional upstream',
        label: 'Agent Package Manager',
        detail: 'Cross-harness dependencies, lockfiles, and install-time audit',
      },
    },
    {
      id: 'plugin',
      type: 'publication',
      position: { x: 265, y: 105 },
      data: {
        eyebrow: 'Delivery artifact',
        label: 'Enterprise plugin',
        detail: 'Agents, skills, hooks, rules, and MCP configuration',
        tone: 'accent',
      },
    },
    {
      id: 'settings',
      type: 'publication',
      position: { x: 530, y: 105 },
      data: {
        eyebrow: 'Enterprise policy',
        label: 'managed-settings.json',
        detail: 'Required plugins, permissions, MCP allowlists, and sandboxing',
        tone: 'signal',
      },
    },
    {
      id: 'clients',
      type: 'publication',
      position: { x: 795, y: 105 },
      data: {
        eyebrow: 'Enforcement surface',
        label: 'Supported Copilot clients',
        detail: 'CLI, VS Code, Copilot app, cloud agent, and supported IDEs',
      },
    },
  ],
  edges: [
    {
      id: 'apm-plugin',
      source: 'apm',
      target: 'plugin',
      type: 'smoothstep',
      label: 'build or source',
    },
    {
      id: 'plugin-settings',
      source: 'plugin',
      target: 'settings',
      type: 'smoothstep',
      label: 'register + enable',
    },
    {
      id: 'settings-clients',
      source: 'settings',
      target: 'clients',
      type: 'smoothstep',
      label: 'distribute + enforce',
    },
  ],
} satisfies FlowDiagramDefinition;

export const apmDecisionFlow = {
  id: 'apm-decision-flow',
  title: 'When APM earns a place',
  summary:
    'Copilot-only deployments with simple dependencies should use a managed plugin and managed settings. Add APM upstream when assets must work across agent harnesses or when lockfile-level dependency auditing is required.',
  height: 500,
  nodes: [
    {
      id: 'copilot-only',
      type: 'publication',
      position: { x: 0, y: 155 },
      data: {
        eyebrow: 'Start here',
        label: 'Are the assets Copilot-only?',
        detail: 'Decide based on the actual delivery targets',
        tone: 'accent',
      },
    },
    {
      id: 'audit-needed',
      type: 'publication',
      position: { x: 280, y: 20 },
      data: {
        eyebrow: 'Supply chain',
        label: 'Need dependency locking or transitive audit?',
        detail: 'Content hashes, pinned commits, or CI install gates',
      },
    },
    {
      id: 'native',
      type: 'publication',
      position: { x: 560, y: 20 },
      data: {
        eyebrow: 'Default choice',
        label: 'Plugin + managed settings',
        detail: 'Fewest moving parts for a Copilot-first enterprise',
        tone: 'signal',
      },
    },
    {
      id: 'apm-upstream',
      type: 'publication',
      position: { x: 560, y: 285 },
      data: {
        eyebrow: 'Add the extra layer',
        label: 'APM upstream',
        detail: 'Reuse source assets across harnesses and audit installation',
        tone: 'accent',
      },
    },
    {
      id: 'runtime-policy',
      type: 'publication',
      position: { x: 840, y: 155 },
      data: {
        eyebrow: 'Still required',
        label: 'Managed settings govern Copilot',
        detail: 'APM does not replace runtime permissions or sandbox policy',
      },
    },
  ],
  edges: [
    {
      id: 'copilot-audit',
      source: 'copilot-only',
      target: 'audit-needed',
      type: 'smoothstep',
      label: 'Yes',
    },
    {
      id: 'copilot-apm',
      source: 'copilot-only',
      target: 'apm-upstream',
      type: 'smoothstep',
      label: 'No',
    },
    {
      id: 'audit-native',
      source: 'audit-needed',
      target: 'native',
      type: 'smoothstep',
      label: 'No',
    },
    {
      id: 'audit-apm',
      source: 'audit-needed',
      target: 'apm-upstream',
      type: 'smoothstep',
      label: 'Yes',
    },
    {
      id: 'native-policy',
      source: 'native',
      target: 'runtime-policy',
      type: 'smoothstep',
    },
    {
      id: 'apm-policy',
      source: 'apm-upstream',
      target: 'runtime-policy',
      type: 'smoothstep',
      label: 'Copilot delivery',
    },
  ],
} satisfies FlowDiagramDefinition;
