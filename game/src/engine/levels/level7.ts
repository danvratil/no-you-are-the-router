/**
 * Level 7: NAT - The Address Translator
 * Teaching: Network Address Translation, 5-tuple tracking, stateful connections
 */

import type {
  LevelConfig,
} from '../../types';
import {
  LevelDifficulty,
  DeviceType,
  Protocol,
} from '../../types';
import {
  createL4Packet,
} from '../packets';

const level7: LevelConfig = {
  id: 7,
  title: "NAT - The Address Translator",
  subtitle: "Learn how private networks share one public IP",
  difficulty: LevelDifficulty.ADVANCED,
  description: "Your home uses private IP addresses (192.168.x.x) that can't reach the Internet. Your router performs NAT - Network Address Translation.",

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
    natEnabled: false,
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
      label: "YOU\n(Router with NAT)",
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
      position: { x: 150, y: 150 },
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
      position: { x: 150, y: 450 },
      label: "PC-B\n192.168.1.11",
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
      label: "Web Server\n8.8.8.8",
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
      title: "NAT - Network Address Translation",
      content: "Your home uses private IP addresses (192.168.x.x) that can't reach the Internet. Your router performs NAT - Network Address Translation. Outgoing packets get rewritten to use the router's public IP. The router remembers each connection so returning packets can be translated back.",
      trigger: { type: 'packetIndex', index: 0 },
      requiresAction: false,
    },
    {
      id: "outbound",
      title: "Outbound Connection",
      content: "This packet is from 192.168.1.10:54321 → 8.8.8.8:443. Your router will:\n1. Create NAT entry: 192.168.1.10:54321 ↔ 203.0.113.1:1024\n2. Rewrite to: 203.0.113.1:1024 → 8.8.8.8:443\n3. Forward to WAN\n\nThe NAT table updates automatically. Just route it to WAN!",
      trigger: { type: 'packetIndex', index: 0 },
      requiresAction: true,
    },
    {
      id: "inbound",
      title: "Return Traffic",
      content: "This packet is from 8.8.8.8:443 → 203.0.113.1:1024. Your router will:\n1. Look up NAT table for 203.0.113.1:1024\n2. Find mapping: 192.168.1.10:54321\n3. Rewrite to: 8.8.8.8:443 → 192.168.1.10:54321\n4. Forward to LAN\n\nRoute it to LAN!",
      trigger: { type: 'packetIndex', index: 1 },
      requiresAction: true,
    },
    {
      id: "unsolicited",
      title: "Unsolicited Inbound",
      content: "This packet is from 203.0.113.66:39123 → 203.0.113.1:22. There's NO NAT entry for this - it's unsolicited traffic from the internet. For security, you must DROP it!",
      trigger: { type: 'packetIndex', index: 6 },
      requiresAction: true,
    },
  ],

  packets: [
    // Connection 1: PC-A to Web Server
    // Outbound
    {
      ...createL4Packet("AA:AA:AA:AA:AA:AA", "00:11:22:33:44:55", "192.168.1.10", "8.8.8.8", 54321, 443, Protocol.TCP),
      ingressPort: "lan",
    },
    // Inbound (return traffic)
    {
      ...createL4Packet("11:11:11:11:11:11", "AA:BB:CC:DD:EE:00", "8.8.8.8", "203.0.113.1", 443, 1024, Protocol.TCP),
      ingressPort: "wan",
    },

    // Connection 2: PC-B to Web Server
    // Outbound
    {
      ...createL4Packet("BB:BB:BB:BB:BB:BB", "00:11:22:33:44:55", "192.168.1.11", "8.8.8.8", 12345, 443, Protocol.TCP),
      ingressPort: "lan",
    },
    // Inbound (return traffic)
    {
      ...createL4Packet("11:11:11:11:11:11", "AA:BB:CC:DD:EE:00", "8.8.8.8", "203.0.113.1", 443, 1025, Protocol.TCP),
      ingressPort: "wan",
    },

    // More outbound from PC-A
    {
      ...createL4Packet("AA:AA:AA:AA:AA:AA", "00:11:22:33:44:55", "192.168.1.10", "8.8.8.8", 54322, 80, Protocol.TCP),
      ingressPort: "lan",
    },
    {
      ...createL4Packet("11:11:11:11:11:11", "AA:BB:CC:DD:EE:00", "8.8.8.8", "203.0.113.1", 80, 1026, Protocol.TCP),
      ingressPort: "wan",
    },

    // Unsolicited inbound - should be DROPPED
    {
      ...createL4Packet("66:66:66:66:66:66", "AA:BB:CC:DD:EE:00", "203.0.113.66", "203.0.113.1", 39123, 22, Protocol.TCP),
      ingressPort: "wan",
    },

    // More legitimate traffic
    {
      ...createL4Packet("BB:BB:BB:BB:BB:BB", "00:11:22:33:44:55", "192.168.1.11", "8.8.8.8", 12346, 80, Protocol.TCP),
      ingressPort: "lan",
    },
    {
      ...createL4Packet("11:11:11:11:11:11", "AA:BB:CC:DD:EE:00", "8.8.8.8", "203.0.113.1", 80, 1027, Protocol.TCP),
      ingressPort: "wan",
    },

    // Another unsolicited inbound - should be DROPPED
    {
      ...createL4Packet("66:66:66:66:66:66", "AA:BB:CC:DD:EE:00", "203.0.113.66", "203.0.113.1", 39124, 80, Protocol.TCP),
      ingressPort: "wan",
    },

    // More return traffic
    {
      ...createL4Packet("11:11:11:11:11:11", "AA:BB:CC:DD:EE:00", "8.8.8.8", "203.0.113.1", 443, 1024, Protocol.TCP),
      ingressPort: "wan",
    },
    {
      ...createL4Packet("11:11:11:11:11:11", "AA:BB:CC:DD:EE:00", "8.8.8.8", "203.0.113.1", 443, 1025, Protocol.TCP),
      ingressPort: "wan",
    },

    // Final outbound
    {
      ...createL4Packet("AA:AA:AA:AA:AA:AA", "00:11:22:33:44:55", "192.168.1.10", "8.8.8.8", 54323, 443, Protocol.TCP),
      ingressPort: "lan",
    },

    // Final inbound
    {
      ...createL4Packet("11:11:11:11:11:11", "AA:BB:CC:DD:EE:00", "8.8.8.8", "203.0.113.1", 443, 1028, Protocol.TCP),
      ingressPort: "wan",
    },

    // Final unsolicited - should be DROPPED
    {
      ...createL4Packet("66:66:66:66:66:66", "AA:BB:CC:DD:EE:00", "203.0.113.66", "203.0.113.1", 39125, 443, Protocol.TCP),
      ingressPort: "wan",
    },
  ],

  guidedPacketIndices: [0, 1, 6],

  automationEnabled: false,
  availableRuleBlocks: [],

  starThresholds: {
    oneStarAccuracy: 0.93, // 14/15 packets
    twoStarAccuracy: 0.95,
    threeStarAccuracy: 1.0,
  },

  passThreshold: 0.93,

  learningOutcomes: [
    "NAT allows private networks to share one public IP",
    "NAT is stateful (tracks active connections)",
    "NAT rewrites BOTH IP and port numbers",
    "5-tuple: protocol, src_ip, src_port, dst_ip, dst_port",
    "Unsolicited inbound traffic is blocked (security benefit)",
  ],
};

export default level7;
