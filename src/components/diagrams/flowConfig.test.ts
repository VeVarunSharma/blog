import { describe, expect, it } from 'vitest';
import { FLOW_INTERACTION } from './flowConfig';

describe('published flow-diagram interaction', () => {
  it('allows moving nodes without allowing readers to edit connections', () => {
    expect(FLOW_INTERACTION.nodesDraggable).toBe(true);
    expect(FLOW_INTERACTION.nodesConnectable).toBe(false);
    expect(FLOW_INTERACTION.edgesReconnectable).toBe(false);
    expect(FLOW_INTERACTION.connectOnClick).toBe(false);
  });
});
