/**
 * Level 2: MAC Address Table
 * Teaching: MAC learning, forwarding tables
 */

import type {
  LevelConfig,
} from '../../types';
import {
  LevelDifficulty,
  DeviceType,
} from '../../types';
import {
  createL2Packet,
  createBroadcastPacket,
} from '../packets';

const level2: LevelConfig = {
  id: 2,
  title: "MAC Address Table",
  subtitle: "Learn how switches build forwarding tables",
  difficulty: LevelDifficulty.BEGINNER,
  description: "Switches learn topology dynamically by watching traffic. Watch your MAC table grow!",

  playerDevice: {
    type: DeviceType.SWITCH,
    name: "Switch-01",
    ports: [
      { id: "port1", name: "Port 1", type: "access", enabled: true, connectedDevice: "PC-A" },
      { id: "port2", name: "Port 2", type: "access", enabled: true, connectedDevice: "PC-B" },
      { id: "port3", name: "Port 3", type: "access", enabled: true, connectedDevice: "PC-C" },
      { id: "port4", name: "Port 4", type: "access", enabled: true, connectedDevice: "PC-D" },
    ],
    macTable: [], // Starts EMPTY
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
      label: "PC-A\nAA:BB:CC:DD:EE:FF",
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
      label: "PC-B\n11:22:33:44:55:66",
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
      label: "PC-C\nAB:CD:EF:12:34:56",
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
      label: "PC-D\n99:88:77:66:55:44",
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
      title: "MAC Address Learning",
      content: "Real switches don't magically know which port leads to which MAC address. They LEARN by watching traffic. When a packet arrives from Port 1 with source MAC AA:BB:CC:DD:EE:FF, the switch learns: 'AA:BB:CC:DD:EE:FF is on Port 1.' This builds the MAC address table.",
      trigger: { type: 'start' },
      requiresAction: false,
    },
    {
      id: "first-learn",
      title: "First Packet - Learning",
      content: "This packet arrived from PC-A (Port 1). Watch your MAC table - it will automatically learn that AA:BB:CC:DD:EE:FF is on Port 1! Now where should you send it?",
      trigger: { type: 'packetIndex', index: 0 },
      requiresAction: true,
    },
    {
      id: "use-table",
      title: "Using the MAC Table",
      content: "Great! Now this packet is TO PC-A. Check your MAC table - you learned Port 1 earlier. Send it there!",
      trigger: { type: 'packetIndex', index: 1 },
      requiresAction: true,
    },
    {
      id: "broadcast",
      title: "Still Flood Broadcasts",
      content: "Even with a MAC table, broadcasts still go to all ports.",
      trigger: { type: 'packetIndex', index: 2 },
      requiresAction: true,
    },
  ],

  packets: [
    // Packet 1: FROM PC-A (learn AA:BB on port1), unknown destination
    createL2Packet("AA:BB:CC:DD:EE:FF", "11:22:33:44:55:66"),

    // Packet 2: TO PC-A (should use learned table entry)
    createL2Packet("11:22:33:44:55:66", "AA:BB:CC:DD:EE:FF"),

    // Packet 3: Broadcast
    createBroadcastPacket("AA:BB:CC:DD:EE:FF"),

    // Packet 4-10: Mix of learning and using table
    createL2Packet("AB:CD:EF:12:34:56", "AA:BB:CC:DD:EE:FF"), // Learn PC-C
    createL2Packet("99:88:77:66:55:44", "AB:CD:EF:12:34:56"), // Learn PC-D
    createL2Packet("AA:BB:CC:DD:EE:FF", "99:88:77:66:55:44"), // Use table
    createL2Packet("11:22:33:44:55:66", "AB:CD:EF:12:34:56"), // Learn PC-B, use table for PC-C
    createL2Packet("99:88:77:66:55:44", "11:22:33:44:55:66"), // Use table
    createL2Packet("AB:CD:EF:12:34:56", "AA:BB:CC:DD:EE:FF"), // Use table
    createBroadcastPacket("99:88:77:66:55:44"), // Broadcast
  ].map((pkt, idx) => ({
    ...pkt,
    ingressPort: ["port1", "port2", "port1", "port3", "port4", "port1", "port2", "port4", "port3", "port4"][idx],
  })),

  guidedPacketIndices: [0, 1, 2],

  automationEnabled: false,
  availableRuleBlocks: [],

  starThresholds: {
    oneStarAccuracy: 0.90, // 9/10 packets
    twoStarAccuracy: 0.95,
    threeStarAccuracy: 1.0, // Perfect
  },

  passThreshold: 0.90,

  learningOutcomes: [
    "Switches learn topology dynamically from source addresses",
    "MAC table maps MAC → Port",
    "Table eliminates need for flooding known destinations",
    "Unknown destinations still require flooding",
  ],
};

export default level2;
