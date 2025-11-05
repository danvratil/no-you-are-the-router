/**
 * Level 9: VLANs - Virtual Networks
 * Teaching: VLAN tagging, trunk ports, logical isolation
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
  createL3Packet,
} from '../packets';

// Available rule blocks for Level 9
const level9RuleBlocks: RuleBlock[] = [
  {
    id: 'cond-vlan-10',
    type: 'condition',
    conditionType: ConditionType.VLAN_EQUALS,
    label: 'If VLAN = 10 (Office)',
    description: 'Matches packets in VLAN 10',
    paramTemplate: { vlan: 10 },
    availableIn: [9],
    requiresParams: false,
  },
  {
    id: 'cond-vlan-20',
    type: 'condition',
    conditionType: ConditionType.VLAN_EQUALS,
    label: 'If VLAN = 20 (Guest)',
    description: 'Matches packets in VLAN 20',
    paramTemplate: { vlan: 20 },
    availableIn: [9],
    requiresParams: false,
  },
  {
    id: 'cond-dst-in-vlan10',
    type: 'condition',
    conditionType: ConditionType.DST_IP_IN_SUBNET,
    label: 'If dst_ip in 192.168.10.0/24',
    description: 'Matches packets destined for VLAN 10 subnet',
    paramTemplate: { subnet: '192.168.10.0/24' },
    availableIn: [9],
    requiresParams: false,
  },
  {
    id: 'cond-dst-in-vlan20',
    type: 'condition',
    conditionType: ConditionType.DST_IP_IN_SUBNET,
    label: 'If dst_ip in 192.168.20.0/24',
    description: 'Matches packets destined for VLAN 20 subnet',
    paramTemplate: { subnet: '192.168.20.0/24' },
    availableIn: [9],
    requiresParams: false,
  },
  {
    id: 'cond-same-vlan',
    type: 'condition',
    conditionType: ConditionType.SAME_VLAN_SUBNET,
    label: 'If src and dst in same VLAN',
    description: 'Matches intra-VLAN traffic',
    availableIn: [9],
    requiresParams: false,
  },
  {
    id: 'action-send-port',
    type: 'action',
    actionType: ActionType.SEND_TO_PORT,
    label: 'Send to port',
    description: 'Forward to specific port',
    availableIn: [9],
    requiresParams: true,
    paramType: 'port',
  },
  {
    id: 'action-send-trunk',
    type: 'action',
    actionType: ActionType.SEND_TO_PORT,
    label: 'Send to trunk (router)',
    description: 'Send to router for inter-VLAN routing',
    paramTemplate: { port: 'trunk' },
    availableIn: [9],
    requiresParams: false,
  },
  {
    id: 'action-drop',
    type: 'action',
    actionType: ActionType.DROP_PACKET,
    label: 'Drop packet',
    description: 'Block this packet',
    availableIn: [9],
    requiresParams: false,
  },
];

const level9: LevelConfig = {
  id: 9,
  title: "VLANs - Virtual Networks",
  subtitle: "Learn logical network segmentation",
  difficulty: LevelDifficulty.ADVANCED,
  description: "You run a small office with employees and guests. They share the same physical network, but you want to keep them separate for security. VLANs create multiple logical networks on one physical switch.",

  playerDevice: {
    type: DeviceType.SWITCH,
    name: "Switch-01",
    macTable: [],
    vlans: [
      { id: 10, name: "Office", subnet: "192.168.10.0/24" },
      { id: 20, name: "Guest", subnet: "192.168.20.0/24" },
    ],
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
      label: "YOU\n(VLAN Switch)",
    },
    {
      id: "pc-office-a",
      device: {
        type: DeviceType.PC,
        name: "Office PC A",
        mac: "AA:AA:AA:00:00:01",
        ip: "192.168.10.10",
        subnet: "192.168.10.0/24",
        gateway: "192.168.10.1",
        port: "port1",
        vlan: 10,
      },
      position: { x: 100, y: 100 },
      label: "Office A\n192.168.10.10\nVLAN 10",
    },
    {
      id: "pc-office-b",
      device: {
        type: DeviceType.PC,
        name: "Office PC B",
        mac: "AA:AA:AA:00:00:02",
        ip: "192.168.10.11",
        subnet: "192.168.10.0/24",
        gateway: "192.168.10.1",
        port: "port2",
        vlan: 10,
      },
      position: { x: 100, y: 250 },
      label: "Office B\n192.168.10.11\nVLAN 10",
    },
    {
      id: "pc-office-c",
      device: {
        type: DeviceType.PC,
        name: "Office PC C",
        mac: "AA:AA:AA:00:00:03",
        ip: "192.168.10.12",
        subnet: "192.168.10.0/24",
        gateway: "192.168.10.1",
        port: "port3",
        vlan: 10,
      },
      position: { x: 100, y: 400 },
      label: "Office C\n192.168.10.12\nVLAN 10",
    },
    {
      id: "pc-guest-a",
      device: {
        type: DeviceType.PC,
        name: "Guest PC A",
        mac: "BB:BB:BB:00:00:01",
        ip: "192.168.20.10",
        subnet: "192.168.20.0/24",
        gateway: "192.168.20.1",
        port: "port4",
        vlan: 20,
      },
      position: { x: 700, y: 100 },
      label: "Guest A\n192.168.20.10\nVLAN 20",
    },
    {
      id: "pc-guest-b",
      device: {
        type: DeviceType.PC,
        name: "Guest PC B",
        mac: "BB:BB:BB:00:00:02",
        ip: "192.168.20.11",
        subnet: "192.168.20.0/24",
        gateway: "192.168.20.1",
        port: "port5",
        vlan: 20,
      },
      position: { x: 700, y: 250 },
      label: "Guest B\n192.168.20.11\nVLAN 20",
    },
    {
      id: "pc-guest-c",
      device: {
        type: DeviceType.PC,
        name: "Guest PC C",
        mac: "BB:BB:BB:00:00:03",
        ip: "192.168.20.12",
        subnet: "192.168.20.0/24",
        gateway: "192.168.20.1",
        port: "port6",
        vlan: 20,
      },
      position: { x: 700, y: 400 },
      label: "Guest C\n192.168.20.12\nVLAN 20",
    },
    {
      id: "router",
      device: {
        type: DeviceType.ROUTER,
        name: "Router",
        mac: "CC:CC:CC:CC:CC:CC",
        port: "trunk",
      },
      position: { x: 400, y: 550 },
      label: "Router\n(Inter-VLAN)",
    },
  ],

  connections: [
    { id: "conn1", from: "pc-office-a", to: "you", fromPort: "eth0", toPort: "port1" },
    { id: "conn2", from: "pc-office-b", to: "you", fromPort: "eth0", toPort: "port2" },
    { id: "conn3", from: "pc-office-c", to: "you", fromPort: "eth0", toPort: "port3" },
    { id: "conn4", from: "pc-guest-a", to: "you", fromPort: "eth0", toPort: "port4" },
    { id: "conn5", from: "pc-guest-b", to: "you", fromPort: "eth0", toPort: "port5" },
    { id: "conn6", from: "pc-guest-c", to: "you", fromPort: "eth0", toPort: "port6" },
    { id: "conn-trunk", from: "you", to: "router", fromPort: "trunk", toPort: "eth0" },
  ],

  tutorial: [
    {
      id: "intro",
      title: "VLANs - Virtual Networks",
      content: "You run a small office with employees and guests. They share the same physical network, but you want to keep them separate for security. VLANs (Virtual LANs) create multiple logical networks on one physical switch. Devices in VLAN 10 can't talk to VLAN 20 unless traffic goes through a router.",
      packetIndex: 0,
      requiresAction: false,
    },
    {
      id: "intra-vlan",
      title: "Intra-VLAN Traffic",
      content: "This packet is from Office A (VLAN 10) to Office B (VLAN 10) - same VLAN! Forward it normally within VLAN 10 to Port 2.",
      packetIndex: 0,
      requiresAction: true,
    },
    {
      id: "inter-vlan-attempt",
      title: "Inter-VLAN Traffic",
      content: "This packet is from Office A (VLAN 10) to Guest A (VLAN 20) - different VLANs! You cannot forward directly between VLANs. Send it to the trunk port (router) for inter-VLAN routing.",
      packetIndex: 2,
      requiresAction: true,
    },
    {
      id: "inter-vlan-return",
      title: "Return from Router",
      content: "The router routed this packet and sent it back tagged with VLAN 20. Now forward it to the Guest A on Port 4.",
      packetIndex: 3,
      requiresAction: true,
    },
  ],

  packets: [
    // Intra-VLAN traffic (VLAN 10)
    {
      ...createL3Packet("AA:AA:AA:00:00:01", "AA:AA:AA:00:00:02", "192.168.10.10", "192.168.10.11", Protocol.TCP, 10),
      ingressPort: "port1",
    },
    {
      ...createL3Packet("AA:AA:AA:00:00:02", "AA:AA:AA:00:00:01", "192.168.10.11", "192.168.10.10", Protocol.TCP, 10),
      ingressPort: "port2",
    },

    // Inter-VLAN traffic (VLAN 10 → VLAN 20)
    {
      ...createL3Packet("AA:AA:AA:00:00:01", "CC:CC:CC:CC:CC:CC", "192.168.10.10", "192.168.20.10", Protocol.TCP, 10),
      ingressPort: "port1",
    },
    {
      ...createL3Packet("CC:CC:CC:CC:CC:CC", "BB:BB:BB:00:00:01", "192.168.10.10", "192.168.20.10", Protocol.TCP, 20),
      ingressPort: "trunk",
    },

    // Intra-VLAN traffic (VLAN 20)
    {
      ...createL3Packet("BB:BB:BB:00:00:01", "BB:BB:BB:00:00:02", "192.168.20.10", "192.168.20.11", Protocol.TCP, 20),
      ingressPort: "port4",
    },
    {
      ...createL3Packet("BB:BB:BB:00:00:02", "BB:BB:BB:00:00:01", "192.168.20.11", "192.168.20.10", Protocol.TCP, 20),
      ingressPort: "port5",
    },

    // More intra-VLAN (VLAN 10)
    {
      ...createL3Packet("AA:AA:AA:00:00:02", "AA:AA:AA:00:00:03", "192.168.10.11", "192.168.10.12", Protocol.TCP, 10),
      ingressPort: "port2",
    },
    {
      ...createL3Packet("AA:AA:AA:00:00:03", "AA:AA:AA:00:00:02", "192.168.10.12", "192.168.10.11", Protocol.TCP, 10),
      ingressPort: "port3",
    },

    // Inter-VLAN (VLAN 20 → VLAN 10)
    {
      ...createL3Packet("BB:BB:BB:00:00:02", "CC:CC:CC:CC:CC:CC", "192.168.20.11", "192.168.10.12", Protocol.TCP, 20),
      ingressPort: "port5",
    },
    {
      ...createL3Packet("CC:CC:CC:CC:CC:CC", "AA:AA:AA:00:00:03", "192.168.20.11", "192.168.10.12", Protocol.TCP, 10),
      ingressPort: "trunk",
    },

    // More intra-VLAN (VLAN 20)
    {
      ...createL3Packet("BB:BB:BB:00:00:03", "BB:BB:BB:00:00:01", "192.168.20.12", "192.168.20.10", Protocol.TCP, 20),
      ingressPort: "port6",
    },

    // More intra-VLAN (VLAN 10)
    {
      ...createL3Packet("AA:AA:AA:00:00:03", "AA:AA:AA:00:00:01", "192.168.10.12", "192.168.10.10", Protocol.TCP, 10),
      ingressPort: "port3",
    },

    // More inter-VLAN
    {
      ...createL3Packet("AA:AA:AA:00:00:01", "CC:CC:CC:CC:CC:CC", "192.168.10.10", "192.168.20.12", Protocol.TCP, 10),
      ingressPort: "port1",
    },
    {
      ...createL3Packet("CC:CC:CC:CC:CC:CC", "BB:BB:BB:00:00:03", "192.168.10.10", "192.168.20.12", Protocol.TCP, 20),
      ingressPort: "trunk",
    },

    // Final packets
    {
      ...createL3Packet("BB:BB:BB:00:00:02", "BB:BB:BB:00:00:03", "192.168.20.11", "192.168.20.12", Protocol.TCP, 20),
      ingressPort: "port5",
    },
  ],

  guidedPacketIndices: [0, 2, 3],

  automationEnabled: true,
  availableRuleBlocks: level9RuleBlocks,
  maxRecommendedRules: 6,

  starThresholds: {
    oneStarAccuracy: 0.93, // 14/15 packets
    twoStarAccuracy: 0.95,
    threeStarAccuracy: 0.98,
    maxRulesForThreeStars: 6,
  },

  passThreshold: 0.93,

  learningOutcomes: [
    "VLANs provide logical segmentation on physical switches",
    "Traffic doesn't cross VLAN boundaries without routing",
    "Trunk ports carry multiple VLANs (tagged)",
    "Access ports belong to single VLANs (untagged)",
    "VLANs improve security and network organization",
  ],
};

export default level9;
