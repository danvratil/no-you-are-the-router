/**
 * Core packet types and interfaces for the networking game
 */

/** MAC address format: XX:XX:XX:XX:XX:XX */
export type MACAddress = string;

/** IPv4 address format: X.X.X.X */
export type IPv4Address = string;

/** Port number (0-65535) */
export type Port = number;

/** VLAN ID (1-4094) */
export type VLANId = number;

/** Network protocol types */
export enum Protocol {
  TCP = 'TCP',
  UDP = 'UDP',
  ICMP = 'ICMP',
  ARP = 'ARP',
  IP = 'IP',
}

/** Layer 2 (Data Link) headers */
export interface Layer2Headers {
  srcMAC: MACAddress;
  dstMAC: MACAddress;
  vlan?: VLANId;
}

/** Layer 3 (Network) headers */
export interface Layer3Headers {
  srcIP: IPv4Address;
  dstIP: IPv4Address;
  protocol: Protocol;
  ttl?: number;
}

/** Layer 4 (Transport) headers */
export interface Layer4Headers {
  srcPort: Port;
  dstPort: Port;
}

/** ARP packet specific data */
export interface ARPData {
  operation: 'request' | 'reply';
  senderMAC: MACAddress;
  senderIP: IPv4Address;
  targetMAC?: MACAddress;
  targetIP: IPv4Address;
}

/** Complete packet structure */
export interface Packet {
  id: string;
  timestamp: number;

  // Layer headers
  layer2: Layer2Headers;
  layer3?: Layer3Headers;
  layer4?: Layer4Headers;

  // Special packet types
  arp?: ARPData;

  // Metadata
  size: number; // in bytes
  ingressPort?: string; // port it arrived on
  payload?: string; // optional payload data
}

/** Packet creation result */
export interface PacketValidation {
  valid: boolean;
  errors: string[];
}

/** Direction of packet flow */
export enum PacketDirection {
  INBOUND = 'inbound',
  OUTBOUND = 'outbound',
  INTERNAL = 'internal',
}

/** Packet routing decision */
export interface RoutingDecision {
  action: 'forward' | 'flood' | 'drop';
  port?: string;
  ports?: string[];
  reason: string;
  applyNAT?: boolean;
  natType?: 'source' | 'destination';
}

/** Packet routing result */
export interface RoutingResult {
  success: boolean;
  decision: RoutingDecision;
  message: string;
  correctDecision?: RoutingDecision;
}
