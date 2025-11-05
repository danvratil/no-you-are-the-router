/**
 * Network device types (Switch, Router, etc.)
 */

import type { MACAddress, IPv4Address, Port, VLANId } from './packet';

/** Device types */
export enum DeviceType {
  SWITCH = 'switch',
  ROUTER = 'router',
  PC = 'pc',
  SERVER = 'server',
}

/** Port configuration */
export interface DevicePort {
  id: string;
  name: string;
  type: 'access' | 'trunk';
  vlan?: VLANId;
  enabled: boolean;
  connectedDevice?: string;
}

/** MAC address table entry */
export interface MACTableEntry {
  mac: MACAddress;
  port: string;
  vlan?: VLANId;
  timestamp: number;
  learned: boolean; // true if dynamically learned, false if static
}

/** Routing table entry */
export interface RoutingTableEntry {
  destination: string; // CIDR notation (e.g., "192.168.1.0/24")
  nextHop: IPv4Address | 'direct';
  interface: string;
  metric: number;
  isDefault?: boolean;
}

/** NAT table entry (5-tuple) */
export interface NATTableEntry {
  internalIP: IPv4Address;
  internalPort: Port;
  externalIP: IPv4Address;
  externalPort: Port;
  protocol: 'TCP' | 'UDP';
  state: 'ESTAB' | 'SYN_SENT' | 'CLOSING';
  timestamp: number;
}

/** Firewall rule */
export interface FirewallRule {
  id: string;
  protocol?: 'TCP' | 'UDP' | 'ICMP';
  srcIP?: string; // CIDR
  dstIP?: string; // CIDR
  srcPort?: Port;
  dstPort?: Port;
  action: 'allow' | 'deny';
  direction?: 'inbound' | 'outbound' | 'both';
}

/** Switch state */
export interface SwitchState {
  type: DeviceType.SWITCH;
  name: string;
  ports: DevicePort[];
  macTable: MACTableEntry[];
  vlans: VLANId[];
}

/** Router state */
export interface RouterState {
  type: DeviceType.ROUTER;
  name: string;
  interfaces: {
    [key: string]: {
      ip: IPv4Address;
      subnet: string; // CIDR
      mac: MACAddress;
      enabled: boolean;
    };
  };
  routingTable: RoutingTableEntry[];
  natTable: NATTableEntry[];
  natEnabled: boolean;
  firewallRules: FirewallRule[];
  publicIP?: IPv4Address;
}

/** Generic device (PC, Server) */
export interface GenericDevice {
  type: DeviceType.PC | DeviceType.SERVER;
  name: string;
  mac: MACAddress;
  ip: IPv4Address;
  subnet: string;
  gateway: IPv4Address;
  port: string; // port it's connected to
  vlan?: VLANId;
}

/** Union type for all devices */
export type Device = SwitchState | RouterState | GenericDevice;

/** Network node for topology visualization */
export interface NetworkNode {
  id: string;
  device: Device;
  position: { x: number; y: number };
  label: string;
}

/** Network connection/edge */
export interface NetworkConnection {
  id: string;
  from: string; // node id
  to: string; // node id
  fromPort?: string;
  toPort?: string;
  label?: string;
}
