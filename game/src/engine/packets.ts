/**
 * Packet creation, validation, and manipulation
 */

import type {
  Packet,
  PacketValidation,
  MACAddress,
  IPv4Address,
} from '../types';
import { Protocol } from '../types';
import { generatePacketId, isValidMAC, isValidIPv4 } from '../utils/network';

/**
 * Create a basic Layer 2 packet
 */
export function createL2Packet(
  srcMAC: MACAddress,
  dstMAC: MACAddress,
  vlan?: number
): Packet {
  return {
    id: generatePacketId(),
    timestamp: Date.now(),
    layer2: {
      srcMAC,
      dstMAC,
      vlan,
    },
    size: 64, // Minimum Ethernet frame size
  };
}

/**
 * Create a Layer 3 packet (with IP headers)
 */
export function createL3Packet(
  srcMAC: MACAddress,
  dstMAC: MACAddress,
  srcIP: IPv4Address,
  dstIP: IPv4Address,
  protocol: Protocol = Protocol.IP,
  vlan?: number
): Packet {
  return {
    id: generatePacketId(),
    timestamp: Date.now(),
    layer2: {
      srcMAC,
      dstMAC,
      vlan,
    },
    layer3: {
      srcIP,
      dstIP,
      protocol,
      ttl: 64,
    },
    size: 64,
  };
}

/**
 * Create a Layer 4 packet (with transport headers)
 */
export function createL4Packet(
  srcMAC: MACAddress,
  dstMAC: MACAddress,
  srcIP: IPv4Address,
  dstIP: IPv4Address,
  srcPort: number,
  dstPort: number,
  protocol: Protocol.TCP | Protocol.UDP = Protocol.TCP,
  vlan?: number
): Packet {
  return {
    id: generatePacketId(),
    timestamp: Date.now(),
    layer2: {
      srcMAC,
      dstMAC,
      vlan,
    },
    layer3: {
      srcIP,
      dstIP,
      protocol,
      ttl: 64,
    },
    layer4: {
      srcPort,
      dstPort,
    },
    size: 64,
  };
}

/**
 * Create an ARP request packet
 */
export function createARPRequest(
  senderMAC: MACAddress,
  senderIP: IPv4Address,
  targetIP: IPv4Address,
  vlan?: number
): Packet {
  return {
    id: generatePacketId(),
    timestamp: Date.now(),
    layer2: {
      srcMAC: senderMAC,
      dstMAC: 'FF:FF:FF:FF:FF:FF', // Broadcast
      vlan,
    },
    layer3: {
      srcIP: senderIP,
      dstIP: targetIP,
      protocol: Protocol.ARP,
    },
    arp: {
      operation: 'request',
      senderMAC,
      senderIP,
      targetIP,
    },
    size: 64,
  };
}

/**
 * Create an ARP reply packet
 */
export function createARPReply(
  senderMAC: MACAddress,
  senderIP: IPv4Address,
  targetMAC: MACAddress,
  targetIP: IPv4Address,
  vlan?: number
): Packet {
  return {
    id: generatePacketId(),
    timestamp: Date.now(),
    layer2: {
      srcMAC: senderMAC,
      dstMAC: targetMAC,
      vlan,
    },
    layer3: {
      srcIP: senderIP,
      dstIP: targetIP,
      protocol: Protocol.ARP,
    },
    arp: {
      operation: 'reply',
      senderMAC,
      senderIP,
      targetMAC,
      targetIP,
    },
    size: 64,
  };
}

/**
 * Create a broadcast packet
 */
export function createBroadcastPacket(
  srcMAC: MACAddress,
  srcIP?: IPv4Address,
  vlan?: number
): Packet {
  const packet: Packet = {
    id: generatePacketId(),
    timestamp: Date.now(),
    layer2: {
      srcMAC,
      dstMAC: 'FF:FF:FF:FF:FF:FF',
      vlan,
    },
    size: 64,
  };

  if (srcIP) {
    packet.layer3 = {
      srcIP,
      dstIP: '255.255.255.255',
      protocol: Protocol.IP,
      ttl: 64,
    };
  }

  return packet;
}

/**
 * Validate a packet structure
 */
export function validatePacket(packet: Packet): PacketValidation {
  const errors: string[] = [];

  // Validate Layer 2
  if (!isValidMAC(packet.layer2.srcMAC)) {
    errors.push(`Invalid source MAC: ${packet.layer2.srcMAC}`);
  }
  if (!isValidMAC(packet.layer2.dstMAC)) {
    errors.push(`Invalid destination MAC: ${packet.layer2.dstMAC}`);
  }

  // Validate Layer 3 if present
  if (packet.layer3) {
    if (!isValidIPv4(packet.layer3.srcIP)) {
      errors.push(`Invalid source IP: ${packet.layer3.srcIP}`);
    }
    if (!isValidIPv4(packet.layer3.dstIP)) {
      errors.push(`Invalid destination IP: ${packet.layer3.dstIP}`);
    }
  }

  // Validate Layer 4 if present
  if (packet.layer4) {
    if (packet.layer4.srcPort < 0 || packet.layer4.srcPort > 65535) {
      errors.push(`Invalid source port: ${packet.layer4.srcPort}`);
    }
    if (packet.layer4.dstPort < 0 || packet.layer4.dstPort > 65535) {
      errors.push(`Invalid destination port: ${packet.layer4.dstPort}`);
    }
  }

  // Validate ARP if present
  if (packet.arp) {
    if (!isValidMAC(packet.arp.senderMAC)) {
      errors.push(`Invalid ARP sender MAC: ${packet.arp.senderMAC}`);
    }
    if (!isValidIPv4(packet.arp.senderIP)) {
      errors.push(`Invalid ARP sender IP: ${packet.arp.senderIP}`);
    }
    if (!isValidIPv4(packet.arp.targetIP)) {
      errors.push(`Invalid ARP target IP: ${packet.arp.targetIP}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Clone a packet (for modifications)
 */
export function clonePacket(packet: Packet): Packet {
  return JSON.parse(JSON.stringify(packet));
}

/**
 * Check if packet is a broadcast
 */
export function isBroadcast(packet: Packet): boolean {
  return packet.layer2.dstMAC.toUpperCase() === 'FF:FF:FF:FF:FF:FF';
}

/**
 * Check if packet is ARP
 */
export function isARP(packet: Packet): boolean {
  return packet.layer3?.protocol === Protocol.ARP || packet.arp !== undefined;
}

/**
 * Get packet description for UI
 */
export function getPacketDescription(packet: Packet): string {
  if (packet.arp) {
    const op = packet.arp.operation === 'request' ? 'Request' : 'Reply';
    return `ARP ${op}: ${packet.arp.senderIP} → ${packet.arp.targetIP}`;
  }

  if (packet.layer4) {
    return `${packet.layer3?.protocol} ${packet.layer3?.srcIP}:${packet.layer4.srcPort} → ${packet.layer3?.dstIP}:${packet.layer4.dstPort}`;
  }

  if (packet.layer3) {
    return `${packet.layer3.protocol} ${packet.layer3.srcIP} → ${packet.layer3.dstIP}`;
  }

  return `${packet.layer2.srcMAC} → ${packet.layer2.dstMAC}`;
}
