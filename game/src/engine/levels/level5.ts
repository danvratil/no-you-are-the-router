/**
 * Level 5: You Are A Router
 * Teaching: IP routing, subnets, default gateway
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
  createL3Packet,
} from '../packets';

const level5: LevelConfig = {
  id: 5,
  title: "You Are A Router",
  subtitle: "Learn IP routing between networks",
  difficulty: LevelDifficulty.INTERMEDIATE,
  description: "Congratulations on your promotion! You're now a ROUTER. Switches forward packets within ONE network. Routers forward packets BETWEEN different networks.",

  playerDevice: {
    type: DeviceType.ROUTER,
    name: "Router-01",
    interfaces: {
      lan: { ip: "192.168.1.1", subnet: "192.168.1.0/24", mac: "00:11:22:33:44:55", enabled: true },
      wan: { ip: "203.0.113.1", subnet: "203.0.113.0/24", mac: "AA:BB:CC:DD:EE:00", enabled: true },
    },
    routingTable: [
      { destination: "192.168.1.0/24", nextHop: "direct", interface: "lan", metric: 0 },
      { destination: "0.0.0.0/0", nextHop: "203.0.113.254", interface: "wan", metric: 1, isDefault: true },
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
        natEnabled: false,
        firewallRules: [],
      },
      position: { x: 400, y: 300 },
      label: "YOU\n192.168.1.1 (LAN)\n203.0.113.1 (WAN)",
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
      position: { x: 150, y: 450 },
      label: "PC-C\n192.168.1.12",
    },
    {
      id: "server-dns",
      device: {
        type: DeviceType.SERVER,
        name: "DNS Server",
        mac: "88:88:88:88:88:88",
        ip: "8.8.8.8",
        subnet: "8.8.8.0/24",
        gateway: "8.8.8.1",
        port: "wan",
      },
      position: { x: 650, y: 150 },
      label: "DNS Server\n8.8.8.8",
    },
    {
      id: "server-web",
      device: {
        type: DeviceType.SERVER,
        name: "Web Server",
        mac: "11:11:11:11:11:11",
        ip: "1.1.1.1",
        subnet: "1.1.1.0/24",
        gateway: "1.1.1.254",
        port: "wan",
      },
      position: { x: 650, y: 300 },
      label: "Web Server\n1.1.1.1",
    },
    {
      id: "server-mail",
      device: {
        type: DeviceType.SERVER,
        name: "Mail Server",
        mac: "99:99:99:99:99:99",
        ip: "203.0.113.50",
        subnet: "203.0.113.0/24",
        gateway: "203.0.113.1",
        port: "wan",
      },
      position: { x: 650, y: 450 },
      label: "Mail Server\n203.0.113.50",
    },
  ],

  connections: [
    { id: "conn-lan", from: "pc-a", to: "you", fromPort: "eth0", toPort: "lan" },
    { id: "conn-lan2", from: "pc-b", to: "you", fromPort: "eth0", toPort: "lan" },
    { id: "conn-lan3", from: "pc-c", to: "you", fromPort: "eth0", toPort: "lan" },
    { id: "conn-wan", from: "you", to: "server-dns", fromPort: "wan", toPort: "eth0" },
    { id: "conn-wan2", from: "you", to: "server-web", fromPort: "wan", toPort: "eth0" },
    { id: "conn-wan3", from: "you", to: "server-mail", fromPort: "wan", toPort: "eth0" },
  ],

  tutorial: [
    {
      id: "intro",
      title: "Welcome to Routing!",
      content: "You're now a ROUTER. Switches forward packets based on MAC addresses within ONE network. Routers forward packets based on IP addresses BETWEEN different networks. Each network (subnet) has an IP range like 192.168.1.0/24 (IPs from 192.168.1.1 to 192.168.1.254).",
      packetIndex: 0,
      requiresAction: false,
    },
    {
      id: "lan-to-wan",
      title: "LAN to Internet",
      content: "This packet is from PC-A (192.168.1.10) to 8.8.8.8 (internet). The destination is NOT in your LAN subnet (192.168.1.0/24), so it matches the default route (0.0.0.0/0) which goes to WAN. Send it to the WAN interface!",
      packetIndex: 0,
      requiresAction: true,
    },
    {
      id: "wan-to-lan",
      title: "Internet to LAN",
      content: "This packet is returning from 8.8.8.8 to 192.168.1.10. The destination IS in your LAN subnet (192.168.1.0/24), so send it to the LAN interface!",
      packetIndex: 1,
      requiresAction: true,
    },
  ],

  packets: [
    // LAN to Internet
    {
      ...createL3Packet("AA:AA:AA:AA:AA:AA", "00:11:22:33:44:55", "192.168.1.10", "8.8.8.8", Protocol.UDP),
      ingressPort: "lan",
    },
    // Internet to LAN
    {
      ...createL3Packet("88:88:88:88:88:88", "AA:BB:CC:DD:EE:00", "8.8.8.8", "192.168.1.10", Protocol.UDP),
      ingressPort: "wan",
    },

    // More LAN to Internet
    {
      ...createL3Packet("BB:BB:BB:BB:BB:BB", "00:11:22:33:44:55", "192.168.1.11", "1.1.1.1", Protocol.TCP),
      ingressPort: "lan",
    },
    {
      ...createL3Packet("11:11:11:11:11:11", "AA:BB:CC:DD:EE:00", "1.1.1.1", "192.168.1.11", Protocol.TCP),
      ingressPort: "wan",
    },

    // LAN to same subnet WAN
    {
      ...createL3Packet("CC:CC:CC:CC:CC:CC", "00:11:22:33:44:55", "192.168.1.12", "203.0.113.50", Protocol.TCP),
      ingressPort: "lan",
    },
    {
      ...createL3Packet("99:99:99:99:99:99", "AA:BB:CC:DD:EE:00", "203.0.113.50", "192.168.1.12", Protocol.TCP),
      ingressPort: "wan",
    },

    // More traffic
    {
      ...createL3Packet("AA:AA:AA:AA:AA:AA", "00:11:22:33:44:55", "192.168.1.10", "1.1.1.1", Protocol.TCP),
      ingressPort: "lan",
    },
    {
      ...createL3Packet("BB:BB:BB:BB:BB:BB", "00:11:22:33:44:55", "192.168.1.11", "8.8.8.8", Protocol.UDP),
      ingressPort: "lan",
    },
    {
      ...createL3Packet("88:88:88:88:88:88", "AA:BB:CC:DD:EE:00", "8.8.8.8", "192.168.1.11", Protocol.UDP),
      ingressPort: "wan",
    },
    {
      ...createL3Packet("11:11:11:11:11:11", "AA:BB:CC:DD:EE:00", "1.1.1.1", "192.168.1.10", Protocol.TCP),
      ingressPort: "wan",
    },
  ],

  guidedPacketIndices: [0, 1],

  automationEnabled: false,
  availableRuleBlocks: [],

  starThresholds: {
    oneStarAccuracy: 0.90, // 9/10 packets
    twoStarAccuracy: 0.95,
    threeStarAccuracy: 1.0,
  },

  passThreshold: 0.90,

  learningOutcomes: [
    "Routers work with IP addresses, not MAC addresses",
    "Routing tables map IP subnets to interfaces",
    "Default route (0.0.0.0/0) catches everything not explicitly listed",
    "Routers connect DIFFERENT networks; switches work within ONE network",
  ],
};

export default level5;
