import { describe, expect, it } from 'vitest';
import type { FlowDiagramDefinition } from './types';
import { validateFlowDiagram } from './validateDiagram';

const validDiagram: FlowDiagramDefinition = {
  id: 'valid',
  title: 'Valid diagram',
  summary: 'A valid two-node diagram.',
  nodes: [
    {
      id: 'source',
      type: 'publication',
      position: { x: 0, y: 0 },
      data: { eyebrow: 'Start', label: 'Source' },
    },
    {
      id: 'target',
      type: 'publication',
      position: { x: 200, y: 0 },
      data: { eyebrow: 'End', label: 'Target' },
    },
  ],
  edges: [{ id: 'source-target', source: 'source', target: 'target' }],
};

describe('flow diagram validation', () => {
  it('accepts edges whose nodes exist', () => {
    expect(() => validateFlowDiagram(validDiagram)).not.toThrow();
  });

  it('rejects duplicate node ids', () => {
    expect(() =>
      validateFlowDiagram({
        ...validDiagram,
        nodes: [validDiagram.nodes[0], validDiagram.nodes[0]],
      }),
    ).toThrow('duplicate node "source"');
  });

  it('rejects edges that reference a missing node', () => {
    expect(() =>
      validateFlowDiagram({
        ...validDiagram,
        edges: [{ id: 'broken', source: 'source', target: 'missing' }],
      }),
    ).toThrow('missing target node "missing"');
  });
});
