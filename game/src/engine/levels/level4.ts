/**
 * Level 4: ARP - The Missing Link
 * Teaching: ARP (Address Resolution Protocol), IP→MAC translation
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
  createARPRequest,
  createARPReply,
  createL3Packet,
} from '../packets';

const level4: LevelConfig = {
  id: 4,
  title: "ARP - The Missing Link",
  subtitle: "Learn how IP addresses map to MAC addresses",
  difficulty: LevelDifficulty.INTERMEDIATE,
  description: "Switches work with MAC addresses, but computers think in IP addresses. ARP bridges this gap.",

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
      label: "PC-A\n192.168.1.10\nAA:BB:CC:DD:EE:FF",
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
      label: "PC-B\n192.168.1.11\n11:22:33:44:55:66",
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
      label: "PC-C\n192.168.1.12\nAB:CD:EF:12:34:56",
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
      label: "PC-D\n192.168.1.13\n99:88:77:66:55:44",
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
      title: "The ARP Protocol",
      content: "Switches work with MAC addresses, but computers think in IP addresses. How does a computer find the MAC address for an IP? Meet ARP - Address Resolution Protocol. When PC-A wants to send to 192.168.1.12 but doesn't know its MAC, it broadcasts: 'Who has 192.168.1.12?' The device with that IP replies: 'That's me, my MAC is AB:CD:EF:12:34:56.'",
      packetIndex: 0,
      requiresAction: false,
    },
    {
      id: "arp-request",
      title: "ARP Request",
      content: "This is an ARP request asking 'Who has 192.168.1.12?' It's a broadcast, so flood it to all ports!",
      packetIndex: 0,
      requiresAction: true,
    },
    {
      id: "arp-reply",
      title: "ARP Reply",
      content: "PC-C responded! This ARP reply says '192.168.1.12 is at AB:CD:EF:12:34:56'. Forward it to PC-A.",
      packetIndex: 1,
      requiresAction: true,
    },
    {
      id: "data-after-arp",
      title: "Data After ARP",
      content: "Now PC-A knows the MAC address and can send data directly. Forward it normally!",
      packetIndex: 2,
      requiresAction: true,
    },
  ],

  packets: [
    // ARP sequence 1: PC-A wants to talk to PC-C (192.168.1.12)
    {
      ...createARPRequest("AA:BB:CC:DD:EE:FF", "192.168.1.10", "192.168.1.12"),
      ingressPort: "port1",
    },
    {
      ...createARPReply("AB:CD:EF:12:34:56", "192.168.1.12", "AA:BB:CC:DD:EE:FF", "192.168.1.10"),
      ingressPort: "port3",
    },
    {
      ...createL3Packet("AA:BB:CC:DD:EE:FF", "AB:CD:EF:12:34:56", "192.168.1.10", "192.168.1.12", Protocol.TCP),
      ingressPort: "port1",
    },

    // ARP sequence 2: PC-B wants to talk to PC-D (192.168.1.13)
    {
      ...createARPRequest("11:22:33:44:55:66", "192.168.1.11", "192.168.1.13"),
      ingressPort: "port2",
    },
    {
      ...createARPReply("99:88:77:66:55:44", "192.168.1.13", "11:22:33:44:55:66", "192.168.1.11"),
      ingressPort: "port4",
    },
    {
      ...createL3Packet("11:22:33:44:55:66", "99:88:77:66:55:44", "192.168.1.11", "192.168.1.13", Protocol.TCP),
      ingressPort: "port2",
    },

    // More data packets
    {
      ...createL3Packet("AB:CD:EF:12:34:56", "AA:BB:CC:DD:EE:FF", "192.168.1.12", "192.168.1.10", Protocol.TCP),
      ingressPort: "port3",
    },
    {
      ...createL3Packet("99:88:77:66:55:44", "11:22:33:44:55:66", "192.168.1.13", "192.168.1.11", Protocol.TCP),
      ingressPort: "port4",
    },

    // ARP sequence 3: PC-D wants to talk to PC-A
    {
      ...createARPRequest("99:88:77:66:55:44", "192.168.1.13", "192.168.1.10"),
      ingressPort: "port4",
    },
    {
      ...createARPReply("AA:BB:CC:DD:EE:FF", "192.168.1.10", "99:88:77:66:55:44", "192.168.1.13"),
      ingressPort: "port1",
    },
    {
      ...createL3Packet("99:88:77:66:55:44", "AA:BB:CC:DD:EE:FF", "192.168.1.13", "192.168.1.10", Protocol.TCP),
      ingressPort: "port4",
    },

    // Final data packet
    {
      ...createL3Packet("AA:BB:CC:DD:EE:FF", "99:88:77:66:55:44", "192.168.1.10", "192.168.1.13", Protocol.TCP),
      ingressPort: "port1",
    },
  ],

  guidedPacketIndices: [0, 1, 2],

  automationEnabled: false,
  availableRuleBlocks: [],

  starThresholds: {
    oneStarAccuracy: 0.90, // 11/12 packets
    twoStarAccuracy: 0.95,
    threeStarAccuracy: 1.0,
  },

  passThreshold: 0.916, // 11/12

  learningOutcomes: [
    "ARP translates IP addresses to MAC addresses",
    "ARP is a broadcast-then-reply protocol",
    "ARP happens BEFORE normal data transmission",
    "IP layer exists above MAC layer",
  ],
};

export default level4;
