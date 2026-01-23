'use client'

import { useCallback, useEffect, useMemo, useRef } from 'react'
import {
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  useNodesState,
  type Node,
  type OnNodesChange,
  type NodeChange,
  type XYPosition,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { useCanvasStore } from '@/stores/canvasStore'
import { CANVAS_CONFIG, type BlockInstance, type BlockType } from '@/types/canvas'
import { CanvasBackground } from './CanvasBackground'
import { CanvasControls } from './CanvasControls'
import { CanvasMinimap } from './CanvasMinimap'
import { BlockNode } from './BlockNode'

// Custom node types
const nodeTypes = {
  block: BlockNode,
}

// Convert BlockInstance to React Flow Node
function blockToNode(block: BlockInstance): Node {
  return {
    id: block.id,
    type: 'block',
    position: { x: block.position.x, y: block.position.y },
    data: {
      type: block.type,
      rotation: block.rotation,
      width: block.size.width,
      height: block.size.height,
    },
    style: {
      zIndex: block.zIndex,
    },
    draggable: true,
    selectable: true,
  }
}

interface DashboardCanvasInnerProps {
  onDropBlock?: (type: BlockType, position: XYPosition) => void
}

function DashboardCanvasInner({ onDropBlock }: DashboardCanvasInnerProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const { screenToFlowPosition, fitView } = useReactFlow()

  // Canvas store state
  const blocks = useCanvasStore((state) => state.blocks)
  const selectedBlockIds = useCanvasStore((state) => state.selectedBlockIds)
  const showGrid = useCanvasStore((state) => state.showGrid)
  const gridSize = useCanvasStore((state) => state.gridSize)
  const viewport = useCanvasStore((state) => state.viewport)
  const setViewport = useCanvasStore((state) => state.setViewport)

  // Canvas store actions
  const updateBlockPosition = useCanvasStore((state) => state.updateBlockPosition)
  const selectBlock = useCanvasStore((state) => state.selectBlock)
  const selectBlocks = useCanvasStore((state) => state.selectBlocks)
  const deselectAll = useCanvasStore((state) => state.deselectAll)
  const addBlock = useCanvasStore((state) => state.addBlock)

  // Convert blocks to React Flow nodes
  const initialNodes = useMemo(() => {
    return blocks.map(blockToNode)
  }, [blocks])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)

  // Sync nodes when blocks change
  useEffect(() => {
    setNodes(blocks.map(blockToNode))
  }, [blocks, setNodes])

  // Sync selection state
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        selected: selectedBlockIds.includes(node.id),
      }))
    )
  }, [selectedBlockIds, setNodes])

  // Handle node changes (position, selection)
  const handleNodesChange: OnNodesChange = useCallback(
    (changes: NodeChange[]) => {
      // Let React Flow handle internal state
      onNodesChange(changes)

      // Sync back to our store
      changes.forEach((change) => {
        if (change.type === 'position' && change.position && change.dragging === false) {
          // Position change completed
          updateBlockPosition(change.id, change.position)
        } else if (change.type === 'select') {
          // Selection change
          if (change.selected) {
            selectBlock(change.id, false)
          }
        }
      })
    },
    [onNodesChange, updateBlockPosition, selectBlock]
  )

  // Handle selection box changes
  const handleSelectionChange = useCallback(
    ({ nodes: selectedNodes }: { nodes: Node[] }) => {
      const ids = selectedNodes.map((n) => n.id)
      if (ids.length > 0) {
        selectBlocks(ids)
      }
    },
    [selectBlocks]
  )

  // Handle pane click to deselect
  const handlePaneClick = useCallback(() => {
    deselectAll()
  }, [deselectAll])

  // Handle viewport changes
  const handleMoveEnd = useCallback(
    (_event: unknown, viewport: { x: number; y: number; zoom: number }) => {
      setViewport(viewport)
    },
    [setViewport]
  )

  // Handle drop from nav
  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      const blockType = event.dataTransfer.getData('application/dashboardie-block') as BlockType
      if (!blockType) return

      // Get drop position in flow coordinates
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      // Add block at drop position
      if (onDropBlock) {
        onDropBlock(blockType, position)
      } else {
        addBlock(blockType, position)
      }
    },
    [screenToFlowPosition, onDropBlock, addBlock]
  )

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
  }, [])

  // Fit view on initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      fitView({ duration: 0, padding: 0.1 })
    }, 100)
    return () => clearTimeout(timer)
  }, [fitView])

  return (
    <div
      ref={reactFlowWrapper}
      className="w-full h-full"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <ReactFlow
        nodes={nodes}
        edges={[]}
        onNodesChange={handleNodesChange}
        onSelectionChange={handleSelectionChange}
        onPaneClick={handlePaneClick}
        onMoveEnd={handleMoveEnd}
        nodeTypes={nodeTypes}
        defaultViewport={viewport}
        snapToGrid={true}
        snapGrid={[gridSize, gridSize]}
        minZoom={CANVAS_CONFIG.minZoom}
        maxZoom={CANVAS_CONFIG.maxZoom}
        fitView={false}
        panOnDrag={true}
        zoomOnScroll={true}
        zoomOnPinch={true}
        selectionOnDrag={true}
        selectNodesOnDrag={false}
        panOnScroll={false}
        multiSelectionKeyCode="Shift"
        deleteKeyCode={null} // We'll handle delete ourselves
        className="touch-none"
        proOptions={{ hideAttribution: true }}
      >
        <CanvasBackground showGrid={showGrid} gridSize={gridSize} />
        <CanvasMinimap />
        <CanvasControls />
      </ReactFlow>
    </div>
  )
}

interface DashboardCanvasProps {
  onDropBlock?: (type: BlockType, position: XYPosition) => void
}

export function DashboardCanvas({ onDropBlock }: DashboardCanvasProps) {
  return (
    <ReactFlowProvider>
      <DashboardCanvasInner onDropBlock={onDropBlock} />
    </ReactFlowProvider>
  )
}
