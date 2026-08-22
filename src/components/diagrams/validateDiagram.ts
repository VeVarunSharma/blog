import type { FlowDiagramDefinition } from './types';

export function validateFlowDiagram(diagram: FlowDiagramDefinition): void {
  const nodeIds = new Set<string>();

  for (const node of diagram.nodes) {
    if (nodeIds.has(node.id)) {
      throw new Error(
        `Flow diagram "${diagram.id}" contains duplicate node "${node.id}".`,
      );
    }
    nodeIds.add(node.id);
  }

  const edgeIds = new Set<string>();

  for (const edge of diagram.edges) {
    if (edgeIds.has(edge.id)) {
      throw new Error(
        `Flow diagram "${diagram.id}" contains duplicate edge "${edge.id}".`,
      );
    }
    edgeIds.add(edge.id);

    if (!nodeIds.has(edge.source)) {
      throw new Error(
        `Flow diagram "${diagram.id}" edge "${edge.id}" references missing source node "${edge.source}".`,
      );
    }
    if (!nodeIds.has(edge.target)) {
      throw new Error(
        `Flow diagram "${diagram.id}" edge "${edge.id}" references missing target node "${edge.target}".`,
      );
    }
  }
}
