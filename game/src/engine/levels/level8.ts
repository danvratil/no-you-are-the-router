/**
 * Level 8: Automate Your Router
 * Teaching: Routing + NAT automation
 */

import type {
  LevelConfig,
  RuleBlock,
} from '../../types';
import {
  LevelDifficulty,
  DeviceType,
  Protocol,
  ConditionType,
  ActionType,
} from '../../types';
import {
  createL4Packet,
} from '../packets';

// Available rule blocks for Level 8
const level8RuleBlocks: RuleBlock[] = [
  {
    id: 'cond-dst-subnet-lan',
    type: 'condition',
    conditionType: ConditionType.DST_IP_IN_SUBNET,
    label: 'If dst_ip in 192.168.1.0/24',
    description: 'Matches packets destined for LAN subnet',
    paramTemplate: { subnet: '192.168.1.0/24' },
    availableIn: [8],
    requiresParams: false,
  },
  {
    id: 'cond-src-private',
    type: 'condition',
    conditionType: ConditionType.SRC_IP_PRIVATE,
    label: 'If src_ip is private',
    description: 'Matches packets from private IP ranges',
    availableIn: [8],
    requiresParams: false,
  },
  {
    id: 'cond-inbound-nat',
    type: 'condition',
    conditionType: ConditionType.IN_NAT_TABLE,
    label: 'If packet in NAT table',
    description: 'Matches return traffic with NAT entry',
    availableIn: [8],
    requiresParams: false,
  },
  {
    id: 'cond-default-route',
    type: 'condition',
    conditionType: ConditionType.DEFAULT_ROUTE,
    label: 'If default route',
    description: 'Matches all other packets',
    availableIn: [8],
    requiresParams: false,
  },
  {
    id: 'action-send-lan',
    type: 'action',
    actionType: ActionType.SEND_TO_INTERFACE,
    label: 'Send to LAN',
    description: 'Forward to LAN interface',
    paramTemplate: { interface: 'lan' },
    availableIn: [8],
    requiresParams: false,
  },
  {
    id: 'action-nat-to-wan',
    type: 'action',
    actionType: ActionType.ROUTE_AND_NAT,
    label: 'Apply NAT, send to WAN',
    description: 'Perform NAT translation and forward to WAN',
    paramTemplate: { interface: 'wan' },
    availableIn: [8],
    requiresParams: false,
  },
  {
    id: 'action-reverse-nat-to-lan',
    type: 'action',
    actionType: ActionType.REVERSE_NAT,
    label: 'Reverse NAT, send to LAN',
    description: 'Reverse NAT translation and forward to LAN',
    paramTemplate: { interface: 'lan' },
    availableIn: [8],
    requiresParams: false,
  },
  {
    id: 'action-drop',
    type: 'action',
    actionType: ActionType.DROP_PACKET,
    label: 'Drop packet',
    description: 'Block this packet',
    availableIn: [8],
    requiresParams: false,
  },
];

const level8: LevelConfig = {
  id: 8,
  title: "Automate Your Router",
  subtitle: "Build rules to handle routing and NAT automatically",
  difficulty: LevelDifficulty.ADVANCED,
  description: "Time to automate! Routers handle thousands of connections. Let's build rules to route and NAT automatically.",

  playerDevice: {
    type: DeviceType.ROUTER,
    name: "Router-01",
    interfaces: {
      lan: { ip: "192.168.1.1", subnet: "192.168.1.0/24", mac: "00:11:22:33:44:55", enabled: true },
      wan: { ip: "203.0.113.1", subnet: "203.0.113.0/24", mac: "AA:BB:CC:DD:EE:00", enabled: true },
    },
    routingTable: [
      { destination: "192.168.1.0/24", nextHop: "Direct", interface: "lan", metric: 0 },
      { destination: "0.0.0.0/0", nextHop: "203.0.113.254", interface: "wan", metric: 1 },
    ],
    natTable: [],
    natEnabled: true,
    firewallRules: [],
  },

  nodes: [
    {
      id: "you",
      device: {
        type: DeviceType.ROUTER,
        name: "YOU (Router)",
        interfaces: {},
        routingTable: [],
        natTable: [],
        natEnabled: true,
        firewallRules: [],
      },
      position: { x: 400, y: 300 },
      label: "YOU\n(Automated Router)",
    },
    {
      id: "pc-a",
      device: {
        type: DeviceType.PC,
        name: "PC-A",
        mac: "AA:AA:AA:AA:AA:AA",
        ip: "192.168.1.10",
        subnet: "192.168.1.0/24",
        gateway: "192.168.1.1",
        port: "lan",
      },
      position: { x: 150, y: 100 },
      label: "PC-A\n192.168.1.10",
    },
    {
      id: "pc-b",
      device: {
        type: DeviceType.PC,
        name: "PC-B",
        mac: "BB:BB:BB:BB:BB:BB",
        ip: "192.168.1.11",
        subnet: "192.168.1.0/24",
        gateway: "192.168.1.1",
        port: "lan",
      },
      position: { x: 150, y: 300 },
      label: "PC-B\n192.168.1.11",
    },
    {
      id: "pc-c",
      device: {
        type: DeviceType.PC,
        name: "PC-C",
        mac: "CC:CC:CC:CC:CC:CC",
        ip: "192.168.1.12",
        subnet: "192.168.1.0/24",
        gateway: "192.168.1.1",
        port: "lan",
      },
      position: { x: 150, y: 500 },
      label: "PC-C\n192.168.1.12",
    },
    {
      id: "web-server",
      device: {
        type: DeviceType.SERVER,
        name: "Web Server",
        mac: "11:11:11:11:11:11",
        ip: "8.8.8.8",
        subnet: "8.8.8.0/24",
        gateway: "0.0.0.0",
        port: "wan",
      },
      position: { x: 650, y: 200 },
      label: "Server 1\n8.8.8.8",
    },
    {
      id: "server2",
      device: {
        type: DeviceType.SERVER,
        name: "Server 2",
        mac: "22:22:22:22:22:22",
        ip: "1.1.1.1",
        subnet: "1.1.1.0/24",
        gateway: "0.0.0.0",
        port: "wan",
      },
      position: { x: 650, y: 400 },
      label: "Server 2\n1.1.1.1",
    },
  ],

  connections: [
    { id: "conn-lan", from: "pc-a", to: "you", fromPort: "eth0", toPort: "lan" },
    { id: "conn-lan2", from: "pc-b", to: "you", fromPort: "eth0", toPort: "lan" },
    { id: "conn-lan3", from: "pc-c", to: "you", fromPort: "eth0", toPort: "lan" },
    { id: "conn-wan", from: "you", to: "web-server", fromPort: "wan", toPort: "eth0" },
    { id: "conn-wan2", from: "you", to: "server2", fromPort: "wan", toPort: "eth0" },
  ],

  tutorial: [
    {
      id: "intro",
      title: "Time to Automate!",
      content: "Routers handle thousands of connections. Let's build rules to automate routing and NAT. The NAT state is maintained automatically by connection tracking - you just need rules for routing!",
      trigger: { type: 'packetIndex', index: 5 },
      requiresAction: false,
    },
    {
      id: "rule1",
      title: "Rule 1: Outbound with NAT",
      content: "Create a rule: 'If src_ip is private' → 'Apply NAT, send to WAN'. This handles all outbound traffic from your LAN.",
      trigger: { type: 'packetIndex', index: 5 },
      requiresAction: true,
    },
    {
      id: "rule2",
      title: "Rule 2: Return Traffic",
      content: "Create a rule: 'If packet in NAT table' → 'Reverse NAT, send to LAN'. This handles return traffic for established connections.",
      trigger: { type: 'packetIndex', index: 5 },
      requiresAction: true,
    },
    {
      id: "rule3",
      title: "Rule 3: Drop Unsolicited",
      content: "Any inbound traffic without a NAT entry should be dropped. Add a default rule: 'If default route' → 'Drop packet'.",
      trigger: { type: 'packetIndex', index: 5 },
      requiresAction: true,
    },
  ],

  // 30 packets - too many for manual routing
  packets: [
    // First 5 packets - manual (feel the pain)
    {
      ...createL4Packet("AA:AA:AA:AA:AA:AA", "00:11:22:33:44:55", "192.168.1.10", "8.8.8.8", 54321, 443, Protocol.TCP),
      ingressPort: "lan",
    },
    {
      ...createL4Packet("11:11:11:11:11:11", "AA:BB:CC:DD:EE:00", "8.8.8.8", "203.0.113.1", 443, 1024, Protocol.TCP),
      ingressPort: "wan",
    },
    {
      ...createL4Packet("BB:BB:BB:BB:BB:BB", "00:11:22:33:44:55", "192.168.1.11", "1.1.1.1", 12345, 80, Protocol.TCP),
      ingressPort: "lan",
    },
    {
      ...createL4Packet("22:22:22:22:22:22", "AA:BB:CC:DD:EE:00", "1.1.1.1", "203.0.113.1", 80, 1025, Protocol.TCP),
      ingressPort: "wan",
    },
    {
      ...createL4Packet("CC:CC:CC:CC:CC:CC", "00:11:22:33:44:55", "192.168.1.12", "8.8.8.8", 54322, 443, Protocol.TCP),
      ingressPort: "lan",
    },

    // Remaining 25 packets with automation
    ...Array.from({ length: 25 }, (_, i) => {
      const pcMacs = ["AA:AA:AA:AA:AA:AA", "BB:BB:BB:BB:BB:BB", "CC:CC:CC:CC:CC:CC"];
      const pcIPs = ["192.168.1.10", "192.168.1.11", "192.168.1.12"];
      const serverMacs = ["11:11:11:11:11:11", "22:22:22:22:22:22"];
      const serverIPs = ["8.8.8.8", "1.1.1.1"];

      if (i % 2 === 0) {
        // Outbound traffic
        const pcIdx = i % 3;
        const serverIdx = i % 2;
        return {
          ...createL4Packet(
            pcMacs[pcIdx],
            "00:11:22:33:44:55",
            pcIPs[pcIdx],
            serverIPs[serverIdx],
            50000 + i,
            443,
            Protocol.TCP
          ),
          ingressPort: "lan",
        };
      } else {
        // Return traffic
        const serverIdx = (i - 1) % 2;
        return {
          ...createL4Packet(
            serverMacs[serverIdx],
            "AA:BB:CC:DD:EE:00",
            serverIPs[serverIdx],
            "203.0.113.1",
            443,
            1024 + i,
            Protocol.TCP
          ),
          ingressPort: "wan",
        };
      }
    }),
  ],

  guidedPacketIndices: [5],

  automationEnabled: true,
  availableRuleBlocks: level8RuleBlocks,
  maxRecommendedRules: 6,

  starThresholds: {
    oneStarAccuracy: 0.90, // 27/30 packets
    twoStarAccuracy: 0.95,
    threeStarAccuracy: 0.98,
    maxRulesForThreeStars: 6,
  },

  passThreshold: 0.90,

  learningOutcomes: [
    "Routers automate routing decisions",
    "NAT state is maintained automatically by connection tracking",
    "Rule order matters (match most specific first)",
    "Efficient rule design minimizes processing overhead",
  ],
};

export default level8;
