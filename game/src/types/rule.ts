/**
 * Automation rule types for packet routing
 */

import { MACAddress, IPv4Address, Port, Protocol, VLANId } from './packet';

/** Rule condition types */
export enum ConditionType {
  // MAC-based conditions
  DST_MAC_EQUALS = 'dst_mac_equals',
  DST_MAC_IN_TABLE = 'dst_mac_in_table',
  DST_MAC_BROADCAST = 'dst_mac_broadcast',
  SRC_MAC_EQUALS = 'src_mac_equals',

  // IP-based conditions
  DST_IP_IN_SUBNET = 'dst_ip_in_subnet',
  DST_IP_EQUALS = 'dst_ip_equals',
  SRC_IP_IN_SUBNET = 'src_ip_in_subnet',
  SRC_IP_PRIVATE = 'src_ip_private',
  DEFAULT_ROUTE = 'default_route',

  // VLAN conditions
  VLAN_EQUALS = 'vlan_equals',

  // Protocol/port conditions
  PROTOCOL_EQUALS = 'protocol_equals',
  DST_PORT_EQUALS = 'dst_port_equals',
  SRC_PORT_EQUALS = 'src_port_equals',

  // NAT conditions
  IN_NAT_TABLE = 'in_nat_table',

  // Direction
  DIRECTION = 'direction',
}

/** Rule action types */
export enum ActionType {
  // Forwarding actions
  SEND_TO_PORT = 'send_to_port',
  SEND_TO_INTERFACE = 'send_to_interface',
  SEND_TO_LEARNED_PORT = 'send_to_learned_port',
  FLOOD_ALL_PORTS = 'flood_all_ports',
  DROP_PACKET = 'drop_packet',

  // NAT actions
  APPLY_NAT = 'apply_nat',
  REVERSE_NAT = 'reverse_nat',

  // Combined actions
  ROUTE_AND_NAT = 'route_and_nat',
}

/** Condition parameter values */
export interface ConditionParams {
  mac?: MACAddress;
  ip?: IPv4Address;
  subnet?: string; // CIDR notation
  port?: Port;
  protocol?: Protocol;
  vlan?: VLANId;
  direction?: 'inbound' | 'outbound' | 'internal';
}

/** Action parameter values */
export interface ActionParams {
  port?: string;
  interface?: string;
  ports?: string[];
  natType?: 'source' | 'destination';
}

/** Rule condition */
export interface RuleCondition {
  id: string;
  type: ConditionType;
  params: ConditionParams;
  label: string; // Human-readable description
}

/** Rule action */
export interface RuleAction {
  id: string;
  type: ActionType;
  params: ActionParams;
  label: string; // Human-readable description
}

/** Complete automation rule */
export interface AutomationRule {
  id: string;
  name?: string;
  condition: RuleCondition;
  action: RuleAction;
  enabled: boolean;
  priority: number; // Lower number = higher priority
  matchCount: number; // How many packets matched this rule
}

/** Rule evaluation result */
export interface RuleEvaluation {
  rule: AutomationRule;
  matched: boolean;
  reason?: string;
}

/** Available rule blocks for UI */
export interface RuleBlock {
  id: string;
  type: 'condition' | 'action';
  conditionType?: ConditionType;
  actionType?: ActionType;
  label: string;
  description: string;
  availableIn: number[]; // Level numbers where this block is available
  requiresParams: boolean;
  paramTemplate?: ConditionParams | ActionParams;
}
