/**
 * Level 1: You Are A Switch
 * Teaching: MAC address basics, flooding
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

// Pre-populated MAC addresses known by the switch at level start
// Used in both macTable initialization and tutorial conditions
const PRE_POPULATED_MACS = ['AA:BB:CC:DD:EE:FF'];
const BROADCAST_MAC = 'FF:FF:FF:FF:FF:FF';

const level1: LevelConfig = {
  id: 1,
  title: "You Are A Switch",
  subtitle: "Learn MAC address forwarding",
  difficulty: LevelDifficulty.BEGINNER,
  description: "Your job is simple: forward packets to the right destination by matching MAC addresses.",

  playerDevice: {
    type: DeviceType.SWITCH,
    name: "Switch-01",
    ports: [
      { id: "port1", name: "Port 1", type: "access", enabled: true, connectedDevice: "PC-A" },
      { id: "port2", name: "Port 2", type: "access", enabled: true, connectedDevice: "PC-B" },
      { id: "port3", name: "Port 3", type: "access", enabled: true, connectedDevice: "PC-C" },
      { id: "port4", name: "Port 4", type: "access", enabled: true, connectedDevice: "PC-D" },
    ],
    macTable: [
      // Pre-populated with one entry (using constant defined above)
      { mac: PRE_POPULATED_MACS[0], port: "port1", timestamp: Date.now(), learned: false },
    ],
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
        mac: PRE_POPULATED_MACS[0],
        ip: "192.168.1.10",
        subnet: "192.168.1.0/24",
        gateway: "192.168.1.1",
        port: "port1",
      },
      position: { x: 200, y: 150 },
      label: `PC-A\n${PRE_POPULATED_MACS[0]}`,
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
      title: "Welcome to Level 1!",
      content: "You're a 4-port Ethernet switch. Your job is simple: forward packets to the right destination by matching MAC addresses. Every device has a unique MAC address like AA:BB:CC:DD:EE:FF.",
      trigger: { type: 'start' },
      requiresAction: false,
    },
    {
      id: "first-packet",
      title: "First Packet",
      content: `This packet is for PC-A (MAC: ${PRE_POPULATED_MACS[0]}). Since you already know PC-A is on Port 1, click the 'Port 1' button to send it there.`,
      trigger: { type: 'packetIndex', index: 0 },
      requiresAction: true,
    },
    {
      id: "broadcast",
      title: "Broadcast Packets",
      content: `This is a broadcast (destination: ${BROADCAST_MAC}). Broadcasts must go to ALL ports. Click the 'Flood All Ports' button to send it everywhere.`,
      trigger: {
        type: 'packetCondition',
        condition: (packet) => packet.layer2.dstMAC === BROADCAST_MAC
      },
      requiresAction: true,
    },
    {
      id: "unknown",
      title: "Unknown Destination",
      content: "You don't know where this MAC address is yet. When you don't know, you must flood it to all ports to find the destination.",
      trigger: {
        type: 'packetCondition',
        condition: (packet) => {
          // Show when destination MAC is not in the pre-populated table and not a broadcast
          // Use constants defined at module level to avoid duplication
          const knownMacs = [...PRE_POPULATED_MACS, BROADCAST_MAC];
          return !knownMacs.includes(packet.layer2.dstMAC);
        }
      },
      requiresAction: true,
    },
  ],

  packets: [
    // Packet 1: Guided - known MAC
    createL2Packet("11:22:33:44:55:66", "AA:BB:CC:DD:EE:FF"),

    // Packet 2: Guided - broadcast
    createBroadcastPacket("AA:BB:CC:DD:EE:FF"),

    // Packet 3: Guided - unknown MAC
    createL2Packet("AA:BB:CC:DD:EE:FF", "AB:CD:EF:12:34:56"),

    // Packet 4-8: Player on their own
    createL2Packet("AB:CD:EF:12:34:56", "AA:BB:CC:DD:EE:FF"),
    createL2Packet("11:22:33:44:55:66", "AB:CD:EF:12:34:56"),
    createL2Packet("99:88:77:66:55:44", "11:22:33:44:55:66"),
    createL2Packet("AA:BB:CC:DD:EE:FF", "99:88:77:66:55:44"),
    createBroadcastPacket("11:22:33:44:55:66"),
  ].map((pkt, idx) => ({
    ...pkt,
    ingressPort: ["port2", "port1", "port1", "port3", "port2", "port4", "port1", "port2"][idx],
  })),

  guidedPacketIndices: [0, 1, 2],

  automationEnabled: false,
  availableRuleBlocks: [],

  starThresholds: {
    oneStarAccuracy: 0.875, // 7/8 packets
    twoStarAccuracy: 0.90,
    threeStarAccuracy: 1.0, // Perfect
  },

  passThreshold: 0.875,

  learningOutcomes: [
    "MAC addresses identify network devices",
    "Switches forward based on MAC addresses",
    "Unknown destinations require flooding",
    "Broadcasts go to everyone",
  ],
};

export default level1;
