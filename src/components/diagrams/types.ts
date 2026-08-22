import type { Edge, Node } from '@xyflow/react';

export type DiagramNodeData = {
  eyebrow: string;
  label: string;
  detail?: string;
  tone?: 'default' | 'accent' | 'signal';
};

export type PublicationNode = Node<DiagramNodeData, 'publication'>;

export interface FlowDiagramDefinition {
  id: string;
  title: string;
  summary: string;
  height?: number;
  nodes: PublicationNode[];
  edges: Edge[];
}
