/**
 * Level 3: Automate Your Switch
 * Teaching: Automation introduction, rule-based forwarding
 */

import type {
  LevelConfig,
  RuleBlock,
} from '../../types';
import {
  LevelDifficulty,
  DeviceType,
  ConditionType,
  ActionType,
} from '../../types';
import {
  createL2Packet,
  createBroadcastPacket,
} from '../packets';

// Available rule blocks for Level 3
const level3RuleBlocks: RuleBlock[] = [
  {
    id: 'cond-mac-in-table',
    type: 'condition',
    conditionType: ConditionType.DST_MAC_IN_TABLE,
    label: 'If dst_mac in learned table',
    description: 'Matches packets where destination MAC is in the MAC address table',
    availableIn: [3, 4, 5, 6, 7, 8, 9],
    requiresParams: false,
  },
  {
    id: 'cond-broadcast',
    type: 'condition',
    conditionType: ConditionType.DST_MAC_BROADCAST,
    label: 'If dst_mac = FF:FF:FF:FF:FF:FF',
    description: 'Matches broadcast packets',
    availableIn: [3, 4, 5, 6, 7, 8, 9],
    requiresParams: false,
  },
  {
    id: 'action-learned-port',
    type: 'action',
    actionType: ActionType.SEND_TO_LEARNED_PORT,
    label: 'Send to learned port',
    description: 'Forward to the port learned in MAC table',
    availableIn: [3, 4, 5, 6, 7, 8, 9],
    requiresParams: false,
  },
  {
    id: 'action-flood',
    type: 'action',
    actionType: ActionType.FLOOD_ALL_PORTS,
    label: 'Flood all ports',
    description: 'Send packet to all ports',
    availableIn: [3, 4, 5, 6, 7, 8, 9],
    requiresParams: false,
  },
];

const level3: LevelConfig = {
  id: 3,
  title: "Automate Your Switch",
  subtitle: "Build rules to handle traffic automatically",
  difficulty: LevelDifficulty.INTERMEDIATE,
  description: "Manually routing every packet is tedious. Real switches automate this with forwarding rules. Let's build some rules!",

  playerDevice: {
    type: DeviceType.SWITCH,
    name: "Switch-01",
    ports: [
      { id: "port1", name: "Port 1", type: "access", enabled: true, connectedDevice: "PC-A" },
      { id: "port2", name: "Port 2", type: "access", enabled: true, connectedDevice: "PC-B" },
      { id: "port3", name: "Port 3", type: "access", enabled: true, connectedDevice: "PC-C" },
      { id: "port4", name: "Port 4", type: "access", enabled: true, connectedDevice: "PC-D" },
    ],
    macTable: [],
    vlans: [],
  },

  nodes: [
    {
      id: "you",
      device: {
        type: DeviceType.SWITCH,
        name: "YOU (Switch)",
        ports: [],
        macTable: [],
        vlans: [],
      },
      position: { x: 400, y: 300 },
      label: "YOU",
    },
    {
      id: "pc-a",
      device: {
        type: DeviceType.PC,
        name: "PC-A",
        mac: "AA:BB:CC:DD:EE:FF",
        ip: "192.168.1.10",
        subnet: "192.168.1.0/24",
        gateway: "192.168.1.1",
        port: "port1",
      },
      position: { x: 200, y: 150 },
      label: "PC-A",
    },
    {
      id: "pc-b",
      device: {
        type: DeviceType.PC,
        name: "PC-B",
        mac: "11:22:33:44:55:66",
        ip: "192.168.1.11",
        subnet: "192.168.1.0/24",
        gateway: "192.168.1.1",
        port: "port2",
      },
      position: { x: 600, y: 150 },
      label: "PC-B",
    },
    {
      id: "pc-c",
      device: {
        type: DeviceType.PC,
        name: "PC-C",
        mac: "AB:CD:EF:12:34:56",
        ip: "192.168.1.12",
        subnet: "192.168.1.0/24",
        gateway: "192.168.1.1",
        port: "port3",
      },
      position: { x: 200, y: 450 },
      label: "PC-C",
    },
    {
      id: "pc-d",
      device: {
        type: DeviceType.PC,
        name: "PC-D",
        mac: "99:88:77:66:55:44",
        ip: "192.168.1.13",
        subnet: "192.168.1.0/24",
        gateway: "192.168.1.1",
        port: "port4",
      },
      position: { x: 600, y: 450 },
      label: "PC-D",
    },
  ],

  connections: [
    { id: "conn1", from: "pc-a", to: "you", fromPort: "eth0", toPort: "port1" },
    { id: "conn2", from: "pc-b", to: "you", fromPort: "eth0", toPort: "port2" },
    { id: "conn3", from: "pc-c", to: "you", fromPort: "eth0", toPort: "port3" },
    { id: "conn4", from: "pc-d", to: "you", fromPort: "eth0", toPort: "port4" },
  ],

  tutorial: [
    {
      id: "intro",
      title: "Time to Automate!",
      content: "Manually routing every packet is tedious and real switches handle thousands per second. Let's build automation rules!",
      trigger: { type: 'packetIndex', index: 5 }, // After first 5 packets
      requiresAction: false,
    },
    {
      id: "rule1",
      title: "Create Your First Rule",
      content: "Create a rule: 'If dst_mac in learned table' → 'Send to learned port'. This handles most packets automatically!",
      trigger: { type: 'packetIndex', index: 5 },
      requiresAction: true,
    },
    {
      id: "rule2",
      title: "Handle Broadcasts",
      content: "Now add a rule for broadcasts: 'If dst_mac = FF:FF:FF:FF:FF:FF' → 'Flood all ports'",
      trigger: { type: 'packetIndex', index: 5 },
      requiresAction: true,
    },
  ],

  // 20 packets - too many for comfortable manual routing
  packets: Array.from({ length: 20 }, (_, i) => {
    const sources = [
      "AA:BB:CC:DD:EE:FF",
      "11:22:33:44:55:66",
      "AB:CD:EF:12:34:56",
      "99:88:77:66:55:44",
    ];
    const ports = ["port1", "port2", "port3", "port4"];

    // Every 5th packet is a broadcast
    if (i % 5 === 4) {
      const srcIdx = i % 4;
      return {
        ...createBroadcastPacket(sources[srcIdx]),
        ingressPort: ports[srcIdx],
      };
    }

    // Regular unicast
    const srcIdx = i % 4;
    const dstIdx = (i + 1) % 4;
    return {
      ...createL2Packet(sources[srcIdx], sources[dstIdx]),
      ingressPort: ports[srcIdx],
    };
  }),

  guidedPacketIndices: [5], // Tutorial at packet 5

  automationEnabled: true,
  availableRuleBlocks: level3RuleBlocks,
  maxRecommendedRules: 4,

  starThresholds: {
    oneStarAccuracy: 0.90, // 18/20 packets
    twoStarAccuracy: 0.95,
    threeStarAccuracy: 0.98,
    maxRulesForThreeStars: 4,
  },

  passThreshold: 0.90,

  learningOutcomes: [
    "Switches use lookup tables for fast forwarding",
    "Simple rules can handle most traffic patterns",
    "Automation is more efficient than manual processing",
    "Rule design matters for efficiency",
  ],
};

export default level3;
