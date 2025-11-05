/**
 * NetworkTopology Component
 *
 * Displays the network topology using SVG, showing nodes (devices) and their connections.
 * Uses data from the game store to render the current level's network layout.
 */

import { useMemo } from 'react';
import { useGameStore } from '../../store/gameStore';
import { DeviceType } from '../../types';
import type { NetworkNode, NetworkConnection } from '../../types';

/**
 * Get device display properties based on device type
 */
const getDeviceStyle = (type: DeviceType) => {
  switch (type) {
    case DeviceType.SWITCH:
      return {
        shape: 'rect',
        color: 'fill-layer2',
        strokeColor: 'stroke-blue-700',
        icon: '⚡',
      };
    case DeviceType.ROUTER:
      return {
        shape: 'rect',
        color: 'fill-layer3',
        strokeColor: 'stroke-green-700',
        icon: '🔀',
      };
    case DeviceType.PC:
      return {
        shape: 'circle',
        color: 'fill-slate-400',
        strokeColor: 'stroke-slate-600',
        icon: '💻',
      };
    case DeviceType.SERVER:
      return {
        shape: 'circle',
        color: 'fill-purple-500',
        strokeColor: 'stroke-purple-700',
        icon: '🖥️',
      };
    default:
      return {
        shape: 'circle',
        color: 'fill-gray-400',
        strokeColor: 'stroke-gray-600',
        icon: '?',
      };
  }
};

/**
 * Render a single network node (device)
 */
const DeviceNode = ({ node, isPlayer }: { node: NetworkNode; isPlayer: boolean }) => {
  const { device, position, label } = node;
  const style = getDeviceStyle(device.type);

  const x = position.x;
  const y = position.y;
  const size = device.type === DeviceType.SWITCH || device.type === DeviceType.ROUTER ? 80 : 60;

  return (
    <g className="device-node" data-device-id={node.id}>
      {/* Device shape */}
      {style.shape === 'circle' ? (
        <circle
          cx={x}
          cy={y}
          r={size / 2}
          className={`${style.color} ${style.strokeColor} stroke-2 transition-all hover:scale-110`}
        />
      ) : (
        <rect
          x={x - size / 2}
          y={y - size / 2}
          width={size}
          height={size}
          rx={8}
          className={`${style.color} ${style.strokeColor} stroke-2 transition-all hover:scale-110`}
        />
      )}

      {/* Player indicator */}
      {isPlayer && (
        <circle
          cx={x + size / 2 - 8}
          cy={y - size / 2 + 8}
          r={8}
          className="fill-yellow-400 stroke-yellow-600 stroke-2 animate-pulse"
        />
      )}

      {/* Device icon */}
      <text
        x={x}
        y={y + 5}
        textAnchor="middle"
        className="text-2xl select-none pointer-events-none"
      >
        {style.icon}
      </text>

      {/* Device label */}
      <text
        x={x}
        y={y + size / 2 + 20}
        textAnchor="middle"
        className="text-sm font-semibold fill-gray-700 select-none pointer-events-none"
      >
        {label}
      </text>

      {/* Additional info for PC/Server */}
      {(device.type === DeviceType.PC || device.type === DeviceType.SERVER) && 'mac' in device && (
        <text
          x={x}
          y={y + size / 2 + 35}
          textAnchor="middle"
          className="text-xs fill-gray-500 select-none pointer-events-none font-mono"
        >
          {device.mac.slice(0, 8)}...
        </text>
      )}
    </g>
  );
};

/**
 * Render a connection line between two nodes
 */
const ConnectionLine = ({
  connection,
  nodes
}: {
  connection: NetworkConnection;
  nodes: NetworkNode[]
}) => {
  const fromNode = nodes.find(n => n.id === connection.from);
  const toNode = nodes.find(n => n.id === connection.to);

  if (!fromNode || !toNode) return null;

  const x1 = fromNode.position.x;
  const y1 = fromNode.position.y;
  const x2 = toNode.position.x;
  const y2 = toNode.position.y;

  // Calculate midpoint for label
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;

  return (
    <g className="connection-line" data-connection-id={connection.id}>
      {/* Connection line */}
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        className="stroke-gray-400 stroke-2"
        strokeDasharray="none"
      />

      {/* Port labels */}
      {connection.fromPort && (
        <text
          x={x1 + (x2 - x1) * 0.2}
          y={y1 + (y2 - y1) * 0.2 - 5}
          className="text-xs fill-gray-600 font-mono select-none"
        >
          {connection.fromPort}
        </text>
      )}

      {connection.toPort && (
        <text
          x={x1 + (x2 - x1) * 0.8}
          y={y1 + (y2 - y1) * 0.8 - 5}
          className="text-xs fill-gray-600 font-mono select-none"
        >
          {connection.toPort}
        </text>
      )}

      {/* Connection label (if any) */}
      {connection.label && (
        <text
          x={midX}
          y={midY - 5}
          textAnchor="middle"
          className="text-xs fill-blue-600 font-semibold select-none bg-white"
        >
          {connection.label}
        </text>
      )}
    </g>
  );
};

/**
 * Main NetworkTopology component
 */
export const NetworkTopology = () => {
  const level = useGameStore((state) => state.level);

  const { nodes, connections } = level;

  // Calculate SVG viewBox to fit all nodes
  const viewBox = useMemo(() => {
    if (nodes.length === 0) {
      return { x: 0, y: 0, width: 800, height: 600 };
    }

    const padding = 100;
    const xs = nodes.map(n => n.position.x);
    const ys = nodes.map(n => n.position.y);

    const minX = Math.min(...xs) - padding;
    const maxX = Math.max(...xs) + padding;
    const minY = Math.min(...ys) - padding;
    const maxY = Math.max(...ys) + padding;

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }, [nodes]);

  // Find player's device
  const playerNodeId = useMemo(() => {
    return nodes.find(n => {
      const device = n.device;
      return (
        (device.type === DeviceType.SWITCH || device.type === DeviceType.ROUTER) &&
        device.name === level.playerDevice.name
      );
    })?.id;
  }, [nodes, level.playerDevice]);

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border-2 border-slate-300 overflow-hidden">
      <svg
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Render connections first (below nodes) */}
        <g className="connections">
          {connections.map(connection => (
            <ConnectionLine
              key={connection.id}
              connection={connection}
              nodes={nodes}
            />
          ))}
        </g>

        {/* Render nodes */}
        <g className="nodes">
          {nodes.map(node => (
            <DeviceNode
              key={node.id}
              node={node}
              isPlayer={node.id === playerNodeId}
            />
          ))}
        </g>
      </svg>

      {/* Legend */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg text-xs">
        <div className="font-semibold mb-2 text-gray-700">Legend</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-layer2 rounded border border-blue-700"></div>
            <span>Switch</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-layer3 rounded border border-green-700"></div>
            <span>Router</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-slate-400 rounded-full border border-slate-600"></div>
            <span>PC</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-500 rounded-full border border-purple-700"></div>
            <span>Server</span>
          </div>
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-200">
            <div className="w-3 h-3 bg-yellow-400 rounded-full border border-yellow-600"></div>
            <span className="font-semibold">YOU</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkTopology;
