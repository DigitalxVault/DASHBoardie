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
    // Width/height on node level lets NodeResizer control sizing during resize
    width: block.size.width,
    height: block.size.height,
    data: {
      type: block.type,
      rotation: block.rotation,
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

  // Sync nodes when blocks or selection change - preserves selection during updates
  useEffect(() => {
    setNodes(blocks.map(block => ({
      ...blockToNode(block),
      selected: selectedBlockIds.includes(block.id),
    })))
  }, [blocks, selectedBlockIds, setNodes])

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

  // Prevent node drag when clicking on interactive elements like sliders
  const handleNodeDragStart = useCallback(
    (event: React.MouseEvent) => {
      const target = event.target as HTMLElement
      // Only prevent drag for form elements, NOT for .nodrag/.nopan
      // React Flow handles .nodrag internally, and NodeResizer needs those events
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'BUTTON' ||
        target.tagName === 'SELECT' ||
        target.closest('input') ||
        target.closest('button') ||
        target.closest('select')
      ) {
        event.stopPropagation()
        event.preventDefault()
      }
    },
    []
  )

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

  // Fit view when React Flow initializes - ensures all modules are visible
  const handleInit = useCallback(() => {
    // Multiple delayed calls to ensure fitView works after transitions
    // First call immediately
    fitView({ padding: 0.15, duration: 0 })
    // Second call after short delay for any layout shifts
    setTimeout(() => {
      fitView({ padding: 0.15, duration: 300 })
    }, 100)
    // Third call after longer delay to handle slow renders
    setTimeout(() => {
      fitView({ padding: 0.15, duration: 200 })
    }, 500)
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
        onNodeDragStart={handleNodeDragStart}
        onInit={handleInit}
        nodeTypes={nodeTypes}
        snapToGrid={true}
        snapGrid={[gridSize, gridSize]}
        minZoom={CANVAS_CONFIG.minZoom}
        maxZoom={CANVAS_CONFIG.maxZoom}
        fitView={true}
        fitViewOptions={{ padding: 0.15 }}
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
        noDragClassName="nodrag"
        noPanClassName="nopan"
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
