/**
 * Core routing logic for switches and routers
 */

import type {
  Packet,
  RoutingDecision,
  RoutingResult,
  SwitchState,
  RouterState,
  MACTableEntry,
  NATTableEntry,
} from '../types';
import {
  isBroadcastMAC,
  isPrivateIP,
  isIPInSubnet,
  longestPrefixMatch,
  macEquals,
} from '../utils/network';
import { isARP } from './packets';

/**
 * Route a packet through a switch (Layer 2)
 */
export function routePacketSwitch(
  packet: Packet,
  switchState: SwitchState
): RoutingResult {
  const dstMAC = packet.layer2.dstMAC;
  const packetVLAN = packet.layer2.vlan;

  // Handle broadcast packets
  if (isBroadcastMAC(dstMAC)) {
    return {
      success: true,
      decision: {
        action: 'flood',
        ports: switchState.ports
          .filter((p) => p.enabled)
          .filter((p) => !packetVLAN || !p.vlan || p.vlan === packetVLAN)
          .filter((p) => p.id !== packet.ingressPort)
          .map((p) => p.id),
        reason: 'Broadcast packet - flood to all ports',
      },
      message: 'Correct! Broadcast packets must be flooded to all ports.',
      correctDecision: {
        action: 'flood',
        ports: switchState.ports
          .filter((p) => p.enabled)
          .filter((p) => !packetVLAN || !p.vlan || p.vlan === packetVLAN)
          .filter((p) => p.id !== packet.ingressPort)
          .map((p) => p.id),
        reason: 'Broadcast packet',
      },
    };
  }

  // Look up destination MAC in table
  const macEntry = switchState.macTable.find((entry) => {
    const macMatch = macEquals(entry.mac, dstMAC);
    const vlanMatch = !packetVLAN || !entry.vlan || entry.vlan === packetVLAN;
    return macMatch && vlanMatch;
  });

  if (macEntry) {
    // Found in MAC table - forward to specific port
    return {
      success: true,
      decision: {
        action: 'forward',
        port: macEntry.port,
        reason: `Destination MAC ${dstMAC} found in table on port ${macEntry.port}`,
      },
      message: `Correct! MAC ${dstMAC} is on port ${macEntry.port}.`,
      correctDecision: {
        action: 'forward',
        port: macEntry.port,
        reason: 'MAC found in table',
      },
    };
  }

  // Unknown destination - flood
  return {
    success: true,
    decision: {
      action: 'flood',
      ports: switchState.ports
        .filter((p) => p.enabled)
        .filter((p) => !packetVLAN || !p.vlan || p.vlan === packetVLAN)
        .filter((p) => p.id !== packet.ingressPort)
        .map((p) => p.id),
      reason: `Destination MAC ${dstMAC} not in table - flood`,
    },
    message: 'Correct! Unknown MAC - flood to learn where it is.',
    correctDecision: {
      action: 'flood',
      reason: 'Unknown MAC',
    },
  };
}

/**
 * Route a packet through a router (Layer 3)
 */
export function routePacketRouter(
  packet: Packet,
  routerState: RouterState
): RoutingResult {
  // ARP packets are handled at Layer 2
  if (isARP(packet)) {
    // Routers respond to ARP for their own IPs
    // For simplicity, forward ARP on the interface it arrived on
    return {
      success: true,
      decision: {
        action: 'forward',
        port: packet.ingressPort || 'LAN',
        reason: 'ARP packet',
      },
      message: 'ARP handled.',
      correctDecision: {
        action: 'forward',
        port: packet.ingressPort || 'LAN',
        reason: 'ARP',
      },
    };
  }

  if (!packet.layer3) {
    return {
      success: false,
      decision: {
        action: 'drop',
        reason: 'No Layer 3 headers - router needs IP addresses',
      },
      message: 'Wrong! Routers need IP addresses to route packets.',
      correctDecision: {
        action: 'drop',
        reason: 'No IP headers',
      },
    };
  }

  const dstIP = packet.layer3.dstIP;

  // Check if destination is directly connected
  for (const [ifName, ifConfig] of Object.entries(routerState.interfaces)) {
    if (isIPInSubnet(dstIP, ifConfig.subnet)) {
      return {
        success: true,
        decision: {
          action: 'forward',
          port: ifName,
          reason: `Destination ${dstIP} is in directly connected subnet ${ifConfig.subnet}`,
        },
        message: `Correct! ${dstIP} is on ${ifName} (${ifConfig.subnet}).`,
        correctDecision: {
          action: 'forward',
          port: ifName,
          reason: 'Directly connected',
        },
      };
    }
  }

  // Check routing table
  const cidrs = routerState.routingTable.map((entry) => entry.destination);
  const matchedRoute = longestPrefixMatch(dstIP, cidrs);

  if (matchedRoute) {
    const route = routerState.routingTable.find(
      (r) => r.destination === matchedRoute
    )!;
    return {
      success: true,
      decision: {
        action: 'forward',
        port: route.interface,
        reason: `Matched route ${route.destination} → ${route.interface}`,
        applyNAT: routerState.natEnabled &&
          route.interface === 'WAN' &&
          packet.layer3 &&
          isPrivateIP(packet.layer3.srcIP),
      },
      message: `Correct! Route ${matchedRoute} sends to ${route.interface}.`,
      correctDecision: {
        action: 'forward',
        port: route.interface,
        reason: 'Routing table match',
      },
    };
  }

  // No route found
  return {
    success: false,
    decision: {
      action: 'drop',
      reason: `No route to ${dstIP}`,
    },
    message: `Wrong! No route to ${dstIP} - packet dropped.`,
    correctDecision: {
      action: 'drop',
      reason: 'No route',
    },
  };
}

/**
 * Learn MAC address from packet
 */
export function learnMAC(
  packet: Packet,
  ingressPort: string,
  macTable: MACTableEntry[]
): MACTableEntry[] {
  const srcMAC = packet.layer2.srcMAC;
  const vlan = packet.layer2.vlan;

  // Check if already in table
  const existing = macTable.find((entry) => {
    const macMatch = macEquals(entry.mac, srcMAC);
    const vlanMatch = !vlan || !entry.vlan || entry.vlan === vlan;
    return macMatch && vlanMatch;
  });

  if (existing) {
    // Update timestamp and port if changed
    if (existing.port !== ingressPort) {
      existing.port = ingressPort;
      existing.timestamp = Date.now();
    }
    return macTable;
  }

  // Add new entry
  const newEntry: MACTableEntry = {
    mac: srcMAC,
    port: ingressPort,
    vlan,
    timestamp: Date.now(),
    learned: true,
  };

  return [...macTable, newEntry];
}

/**
 * Apply source NAT (outbound)
 */
export function applySourceNAT(
  packet: Packet,
  routerState: RouterState
): { packet: Packet; natEntry: NATTableEntry } | null {
  if (!packet.layer3 || !packet.layer4 || !routerState.publicIP) {
    return null;
  }

  const { srcIP, protocol } = packet.layer3;
  const { srcPort } = packet.layer4;

  // Generate unique external port
  const existingPorts = routerState.natTable.map((e) => e.externalPort);
  let externalPort = 1024 + Math.floor(Math.random() * 64512);
  while (existingPorts.includes(externalPort)) {
    externalPort = 1024 + Math.floor(Math.random() * 64512);
  }

  // Create NAT entry
  const natEntry: NATTableEntry = {
    internalIP: srcIP,
    internalPort: srcPort,
    externalIP: routerState.publicIP,
    externalPort,
    protocol: protocol as 'TCP' | 'UDP',
    state: 'ESTAB',
    timestamp: Date.now(),
  };

  // Rewrite packet
  const newPacket = {
    ...packet,
    layer3: {
      ...packet.layer3,
      srcIP: routerState.publicIP,
    },
    layer4: {
      ...packet.layer4,
      srcPort: externalPort,
    },
  };

  return { packet: newPacket, natEntry };
}

/**
 * Apply destination NAT (inbound)
 */
export function applyDestinationNAT(
  packet: Packet,
  routerState: RouterState
): Packet | null {
  if (!packet.layer3 || !packet.layer4) {
    return null;
  }

  const { dstIP } = packet.layer3;
  const { dstPort } = packet.layer4;

  // Look up NAT table
  const natEntry = routerState.natTable.find(
    (entry) =>
      entry.externalIP === dstIP &&
      entry.externalPort === dstPort &&
      entry.protocol === packet.layer3!.protocol
  );

  if (!natEntry) {
    return null; // No NAT entry - should drop
  }

  // Rewrite packet
  return {
    ...packet,
    layer3: {
      ...packet.layer3,
      dstIP: natEntry.internalIP,
    },
    layer4: {
      ...packet.layer4,
      dstPort: natEntry.internalPort,
    },
  };
}

/**
 * Check if packet should be dropped by firewall
 */
export function checkFirewall(
  packet: Packet,
  routerState: RouterState,
  direction: 'inbound' | 'outbound'
): boolean {
  for (const rule of routerState.firewallRules) {
    // Check direction
    if (rule.direction && rule.direction !== 'both' && rule.direction !== direction) {
      continue;
    }

    // Check protocol
    if (rule.protocol && packet.layer3?.protocol !== rule.protocol) {
      continue;
    }

    // Check destination port
    if (rule.dstPort !== undefined && packet.layer4?.dstPort !== rule.dstPort) {
      continue;
    }

    // Rule matches
    if (rule.action === 'deny') {
      return true; // Drop packet
    }
  }

  return false; // Allow packet
}

/**
 * Validate a player's routing decision
 */
export function validateDecision(
  _packet: Packet,
  playerDecision: RoutingDecision,
  correctDecision: RoutingDecision
): { correct: boolean; message: string } {
  if (playerDecision.action !== correctDecision.action) {
    return {
      correct: false,
      message: `Wrong action! Expected ${correctDecision.action}, got ${playerDecision.action}. ${correctDecision.reason}`,
    };
  }

  if (correctDecision.action === 'forward' && correctDecision.port) {
    if (playerDecision.port !== correctDecision.port) {
      return {
        correct: false,
        message: `Wrong port! Expected ${correctDecision.port}, got ${playerDecision.port}. ${correctDecision.reason}`,
      };
    }
  }

  return {
    correct: true,
    message: `Correct! ${correctDecision.reason}`,
  };
}
