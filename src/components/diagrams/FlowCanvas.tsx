import {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  MarkerType,
  MiniMap,
  Panel,
  Position,
  ReactFlow,
  useNodesState,
  type ColorMode,
  type Edge,
  type NodeProps,
  type ReactFlowInstance,
} from '@xyflow/react';
import { useCallback, useMemo, useRef, useSyncExternalStore } from 'react';
import '@xyflow/react/dist/style.css';
import './flow.css';
import { FLOW_INTERACTION } from './flowConfig';
import type { FlowDiagramDefinition, PublicationNode } from './types';

interface Props {
  diagram: FlowDiagramDefinition;
}

const nodeTypes = {
  publication: PublicationNodeCard,
};

function cloneNodes(nodes: PublicationNode[]): PublicationNode[] {
  return nodes.map((node) => ({
    ...node,
    data: { ...node.data },
    position: { ...node.position },
  }));
}

function PublicationNodeCard({ data, selected }: NodeProps<PublicationNode>) {
  return (
    <div
      className="flow-node"
      data-tone={data.tone ?? 'default'}
      data-selected={selected ? 'true' : 'false'}
    >
      <Handle
        className="flow-handle"
        type="target"
        position={Position.Left}
        isConnectable={false}
      />
      <span className="flow-node-eyebrow">{data.eyebrow}</span>
      <strong>{data.label}</strong>
      {data.detail && <span className="flow-node-detail">{data.detail}</span>}
      <Handle
        className="flow-handle"
        type="source"
        position={Position.Right}
        isConnectable={false}
      />
    </div>
  );
}

function subscribeToTheme(onStoreChange: () => void) {
  window.addEventListener('publication-theme-change', onStoreChange);
  return () =>
    window.removeEventListener('publication-theme-change', onStoreChange);
}

function getThemeSnapshot(): ColorMode {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

function getServerThemeSnapshot(): ColorMode {
  return 'dark';
}

export default function FlowCanvas({ diagram }: Props) {
  const initialNodes = useMemo(
    () => cloneNodes(diagram.nodes),
    [diagram.nodes],
  );
  const [nodes, setNodes, onNodesChange] =
    useNodesState<PublicationNode>(initialNodes);
  const colorMode = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );
  const instanceRef = useRef<ReactFlowInstance<PublicationNode, Edge> | null>(
    null,
  );

  const resetLayout = useCallback(() => {
    setNodes(cloneNodes(diagram.nodes));
    window.requestAnimationFrame(() => {
      const duration = window.matchMedia('(prefers-reduced-motion: reduce)')
        .matches
        ? 0
        : 250;
      void instanceRef.current?.fitView({ padding: 0.18, duration });
    });
  }, [diagram.nodes, setNodes]);

  return (
    <ReactFlow<PublicationNode, Edge>
      nodes={nodes}
      edges={diagram.edges}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      onInit={(instance) => {
        instanceRef.current = instance;
      }}
      colorMode={colorMode}
      fitView
      fitViewOptions={{ padding: 0.18 }}
      minZoom={0.45}
      maxZoom={1.8}
      zoomOnScroll={false}
      panOnScroll={false}
      zoomOnPinch
      panOnDrag
      selectionOnDrag={false}
      elementsSelectable
      deleteKeyCode={null}
      defaultEdgeOptions={{
        type: 'smoothstep',
        style: {
          stroke: 'var(--flow-edge)',
          strokeWidth: 2.2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 16,
          height: 16,
          color: 'var(--flow-edge)',
        },
      }}
      proOptions={{ hideAttribution: false }}
      aria-label={diagram.title}
      {...FLOW_INTERACTION}
    >
      <Background variant={BackgroundVariant.Dots} gap={22} size={1} />
      <MiniMap
        className="flow-minimap"
        pannable
        zoomable
        nodeColor="var(--accent)"
        maskColor="color-mix(in srgb, var(--canvas) 76%, transparent)"
      />
      <Controls showInteractive={false} position="bottom-left" />
      <Panel position="top-right">
        <button
          className="flow-reset nodrag"
          type="button"
          onClick={resetLayout}
        >
          Reset layout
        </button>
      </Panel>
    </ReactFlow>
  );
}
