import { LinkIcon } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { SYSTEM_NODES } from '../constants';
import type { FlowCanvasProps } from '../types';

export const FlowCanvas: React.FC<FlowCanvasProps> = ({ 
  nodes, 
  connections, 
  onNodeSelect, 
  onNodeMove, 
  selectedNodeId 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragNode, setDragNode] = useState<string | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    
    setIsDragging(true);
    setDragNode(nodeId);
    setOffset({
      x: e.clientX - node.x,
      y: e.clientY - node.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && dragNode) {
      onNodeMove(dragNode, e.clientX - offset.x, e.clientY - offset.y);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragNode(null);
  };

  // Draw curved bezier lines
  const drawConnection = (conn: typeof connections[0]) => {
    const sourceNode = nodes.find(n => n.id === conn.source);
    const targetNode = nodes.find(n => n.id === conn.target);

    if (!sourceNode || !targetNode) return null;

    const startX = sourceNode.x + 200; // Right side of source
    const startY = sourceNode.y + 40;
    const endX = targetNode.x; // Left side of target
    const endY = targetNode.y + 40;

    const controlPoint1X = startX + 50;
    const controlPoint1Y = startY;
    const controlPoint2X = endX - 50;
    const controlPoint2Y = endY;

    const pathData = `M ${startX} ${startY} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${endX} ${endY}`;

    const isRef = conn.type === 'reference';
    const strokeColor = isRef ? '#f97316' : '#94a3b8'; // Orange for refs, Slate for standard
    const strokeDash = isRef ? "5,5" : "none";

    return (
      <g key={conn.id}>
        <path
          d={pathData}
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
          strokeDasharray={strokeDash}
          markerEnd={`url(#arrowhead-${isRef ? 'ref' : 'std'})`}
        />
        {isRef && (
          <circle cx={(startX + endX)/2} cy={(startY + endY)/2} r="10" fill="white" stroke={strokeColor} />
        )}
        {isRef && (
          <text x={(startX + endX)/2} y={(startY + endY)/2} dy="4" dx="-3" fontSize="10" fill={strokeColor}>R</text>
        )}
      </g>
    );
  };

  return (
    <div
      className="flex-1 bg-slate-50 relative overflow-hidden cursor-grab active:cursor-grabbing"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="absolute top-4 left-4 z-10 bg-white/80 p-2 rounded text-xs text-slate-500 pointer-events-none">
        Drag nodes to rearrange. Click to edit. Orange lines are References.
      </div>

      <svg ref={svgRef} className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <defs>
          <marker id="arrowhead-std" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
          </marker>
          <marker id="arrowhead-ref" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#f97316" />
          </marker>
        </defs>
        {connections.map(drawConnection)}
      </svg>

      {nodes.map(node => (
        <div
          key={node.id}
          onMouseDown={(e) => handleMouseDown(e, node.id)}
          onClick={(e) => { e.stopPropagation(); onNodeSelect(node.id); }}
          style={{ transform: `translate(${node.x}px, ${node.y}px)` }}
          className={`absolute w-[200px] z-10 shadow-md rounded-lg border-2 transition-colors bg-white 
            ${selectedNodeId === node.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-slate-200 hover:border-slate-300'}
            ${SYSTEM_NODES.includes(node.id) ? 'border-t-4 border-t-purple-500' : ''}
            ${node.isRef ? 'border-dashed border-orange-300' : ''}
          `}
        >
          <div className="p-3">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-1 overflow-hidden">
                {node.isRef && <LinkIcon size={12} className="text-orange-500 flex-shrink-0" />}
                <span className="font-bold text-sm truncate text-slate-700">{node.id}</span>
              </div>
              {SYSTEM_NODES.includes(node.id) && <span className="text-[10px] bg-purple-100 text-purple-700 px-1 rounded">System</span>}
            </div>
            <div className={`text-xs truncate ${node.isRef ? 'text-orange-600 font-medium italic' : 'text-slate-500'}`}>
              {node.preview || "No content"}
            </div>
          </div>
          {/* Connectors visual helpers */}
          <div className="absolute top-1/2 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
          <div className="absolute top-1/2 -left-1 w-2 h-2 bg-slate-300 rounded-full"></div>
        </div>
      ))}
    </div>
  );
};
