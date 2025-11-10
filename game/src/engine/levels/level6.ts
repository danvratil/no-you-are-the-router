/**
 * Level 6: Transport Layer - Ports and Protocols
 * Teaching: TCP/UDP, port numbers, basic firewall rules
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

// Available rule blocks for Level 6
const level6RuleBlocks: RuleBlock[] = [
  {
    id: 'cond-dst-subnet-lan',
    type: 'condition',
    conditionType: ConditionType.DST_IP_IN_SUBNET,
    label: 'If dst_ip in 192.168.1.0/24',
    description: 'Matches packets destined for LAN subnet',
    paramTemplate: { subnet: '192.168.1.0/24' },
    availableIn: [6, 7, 8],
    requiresParams: false,
  },
  {
    id: 'cond-default-route',
    type: 'condition',
    conditionType: ConditionType.DEFAULT_ROUTE,
    label: 'If default route (all others)',
    description: 'Matches all packets not matched by other rules',
    availableIn: [6, 7, 8],
    requiresParams: false,
  },
  {
    id: 'cond-port-22',
    type: 'condition',
    conditionType: ConditionType.DST_PORT_EQUALS,
    label: 'If dst_port = 22 (SSH)',
    description: 'Matches SSH traffic',
    paramTemplate: { port: 22 },
    availableIn: [6, 7, 8],
    requiresParams: false,
  },
  {
    id: 'cond-port-80',
    type: 'condition',
    conditionType: ConditionType.DST_PORT_EQUALS,
    label: 'If dst_port = 80 (HTTP)',
    description: 'Matches HTTP traffic',
    paramTemplate: { port: 80 },
    availableIn: [6, 7, 8],
    requiresParams: false,
  },
  {
    id: 'cond-port-443',
    type: 'condition',
    conditionType: ConditionType.DST_PORT_EQUALS,
    label: 'If dst_port = 443 (HTTPS)',
    description: 'Matches HTTPS traffic',
    paramTemplate: { port: 443 },
    availableIn: [6, 7, 8],
    requiresParams: false,
  },
  {
    id: 'action-send-lan',
    type: 'action',
    actionType: ActionType.SEND_TO_INTERFACE,
    label: 'Send to LAN',
    description: 'Forward to LAN interface',
    paramTemplate: { interface: 'lan' },
    availableIn: [6, 7, 8],
    requiresParams: false,
  },
  {
    id: 'action-send-wan',
    type: 'action',
    actionType: ActionType.SEND_TO_INTERFACE,
    label: 'Send to WAN',
    description: 'Forward to WAN interface',
    paramTemplate: { interface: 'wan' },
    availableIn: [6, 7, 8],
    requiresParams: false,
  },
  {
    id: 'action-drop',
    type: 'action',
    actionType: ActionType.DROP_PACKET,
    label: 'Drop packet',
    description: 'Block this packet',
    availableIn: [6, 7, 8, 9],
    requiresParams: false,
  },
];

const level6: LevelConfig = {
  id: 6,
  title: "Transport Layer - Ports and Protocols",
  subtitle: "Learn about TCP/UDP and port-based filtering",
  difficulty: LevelDifficulty.INTERMEDIATE,
  description: "IP addresses tell us which computer, but computers run many programs at once. PORT NUMBERS identify specific applications.",

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
    firewallRules: [],
    natTable: [],
    natEnabled: false,
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
        natEnabled: false,
        firewallRules: [],
      },
      position: { x: 400, y: 300 },
      label: "YOU\n(Router + Firewall)",
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
      position: { x: 150, y: 200 },
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
      position: { x: 150, y: 400 },
      label: "PC-B\n192.168.1.11",
    },
    {
      id: "web-server",
      device: {
        type: DeviceType.SERVER,
        name: "Web Server",
        mac: "11:11:11:11:11:11",
        ip: "1.1.1.1",
        subnet: "1.1.1.0/24",
        gateway: "0.0.0.0",
        port: "wan",
      },
      position: { x: 650, y: 200 },
      label: "Web Server\n1.1.1.1:443",
    },
    {
      id: "attacker",
      device: {
        type: DeviceType.SERVER,
        name: "Attacker",
        mac: "66:66:66:66:66:66",
        ip: "203.0.113.66",
        subnet: "203.0.113.0/24",
        gateway: "0.0.0.0",
        port: "wan",
      },
      position: { x: 650, y: 400 },
      label: "Attacker\n203.0.113.66",
    },
  ],

  connections: [
    { id: "conn-lan", from: "pc-a", to: "you", fromPort: "eth0", toPort: "lan" },
    { id: "conn-lan2", from: "pc-b", to: "you", fromPort: "eth0", toPort: "lan" },
    { id: "conn-wan", from: "you", to: "web-server", fromPort: "wan", toPort: "eth0" },
    { id: "conn-wan2", from: "you", to: "attacker", fromPort: "wan", toPort: "eth0" },
  ],

  tutorial: [
    {
      id: "intro",
      title: "Ports and Protocols",
      content: "IP addresses tell us which computer, but computers run many programs at once. How does data reach the right application? PORT NUMBERS! Each program listens on a port: web servers use port 80 (HTTP) or 443 (HTTPS), SSH uses port 22, etc. Protocols like TCP and UDP manage how data is sent.",
      trigger: { type: 'packetIndex', index: 0 },
      requiresAction: false,
    },
    {
      id: "web-traffic",
      title: "Web Traffic",
      content: "This is HTTPS traffic (port 443) from PC-A to a web server. Route it to WAN like before!",
      trigger: { type: 'packetIndex', index: 0 },
      requiresAction: true,
    },
    {
      id: "ssh-attack",
      title: "Block SSH from Outside",
      content: "This is an SSH attempt (port 22) from the internet trying to access PC-A. For security, you should DROP this packet - never allow unsolicited SSH from the internet!",
      trigger: { type: 'packetIndex', index: 5 },
      requiresAction: true,
    },
  ],

  packets: [
    // Outbound web traffic (HTTPS)
    {
      ...createL4Packet("AA:AA:AA:AA:AA:AA", "00:11:22:33:44:55", "192.168.1.10", "1.1.1.1", 54321, 443, Protocol.TCP),
      ingressPort: "lan",
    },
    {
      ...createL4Packet("11:11:11:11:11:11", "AA:BB:CC:DD:EE:00", "1.1.1.1", "192.168.1.10", 443, 54321, Protocol.TCP),
      ingressPort: "wan",
    },

    // More web traffic (HTTP)
    {
      ...createL4Packet("BB:BB:BB:BB:BB:BB", "00:11:22:33:44:55", "192.168.1.11", "1.1.1.1", 12345, 80, Protocol.TCP),
      ingressPort: "lan",
    },
    {
      ...createL4Packet("11:11:11:11:11:11", "AA:BB:CC:DD:EE:00", "1.1.1.1", "192.168.1.11", 80, 12345, Protocol.TCP),
      ingressPort: "wan",
    },

    // More HTTPS traffic
    {
      ...createL4Packet("AA:AA:AA:AA:AA:AA", "00:11:22:33:44:55", "192.168.1.10", "1.1.1.1", 54322, 443, Protocol.TCP),
      ingressPort: "lan",
    },

    // SSH attack from outside (should be blocked)
    {
      ...createL4Packet("66:66:66:66:66:66", "AA:BB:CC:DD:EE:00", "203.0.113.66", "192.168.1.10", 39123, 22, Protocol.TCP),
      ingressPort: "wan",
    },

    // More legitimate traffic
    {
      ...createL4Packet("11:11:11:11:11:11", "AA:BB:CC:DD:EE:00", "1.1.1.1", "192.168.1.10", 443, 54322, Protocol.TCP),
      ingressPort: "wan",
    },
    {
      ...createL4Packet("BB:BB:BB:BB:BB:BB", "00:11:22:33:44:55", "192.168.1.11", "1.1.1.1", 12346, 443, Protocol.TCP),
      ingressPort: "lan",
    },

    // Another SSH attack (should be blocked)
    {
      ...createL4Packet("66:66:66:66:66:66", "AA:BB:CC:DD:EE:00", "203.0.113.66", "192.168.1.11", 39124, 22, Protocol.TCP),
      ingressPort: "wan",
    },

    // More web traffic
    {
      ...createL4Packet("11:11:11:11:11:11", "AA:BB:CC:DD:EE:00", "1.1.1.1", "192.168.1.11", 443, 12346, Protocol.TCP),
      ingressPort: "wan",
    },

    // More legitimate traffic
    {
      ...createL4Packet("AA:AA:AA:AA:AA:AA", "00:11:22:33:44:55", "192.168.1.10", "1.1.1.1", 54323, 80, Protocol.TCP),
      ingressPort: "lan",
    },
    {
      ...createL4Packet("11:11:11:11:11:11", "AA:BB:CC:DD:EE:00", "1.1.1.1", "192.168.1.10", 80, 54323, Protocol.TCP),
      ingressPort: "wan",
    },

    // Final SSH attack (should be blocked)
    {
      ...createL4Packet("66:66:66:66:66:66", "AA:BB:CC:DD:EE:00", "203.0.113.66", "192.168.1.10", 39125, 22, Protocol.TCP),
      ingressPort: "wan",
    },

    // Final web traffic
    {
      ...createL4Packet("BB:BB:BB:BB:BB:BB", "00:11:22:33:44:55", "192.168.1.11", "1.1.1.1", 12347, 443, Protocol.TCP),
      ingressPort: "lan",
    },
    {
      ...createL4Packet("11:11:11:11:11:11", "AA:BB:CC:DD:EE:00", "1.1.1.1", "192.168.1.11", 443, 12347, Protocol.TCP),
      ingressPort: "wan",
    },
  ],

  guidedPacketIndices: [0, 5],

  automationEnabled: true,
  availableRuleBlocks: level6RuleBlocks,
  maxRecommendedRules: 6,

  starThresholds: {
    oneStarAccuracy: 0.93, // 14/15 packets
    twoStarAccuracy: 0.95,
    threeStarAccuracy: 0.98,
    maxRulesForThreeStars: 6,
  },

  passThreshold: 0.93,

  learningOutcomes: [
    "Transport layer (TCP/UDP) sits above network layer (IP)",
    "Port numbers identify specific applications",
    "Firewalls can filter based on protocol, ports, direction",
    "Port numbers are essential for NAT (next level)",
  ],
};

export default level6;
