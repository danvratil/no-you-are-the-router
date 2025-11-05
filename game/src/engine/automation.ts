/**
 * Automation rule engine for packet routing
 */

import {
  Packet,
  AutomationRule,
  RuleCondition,
  RuleAction,
  ConditionType,
  ActionType,
  RoutingDecision,
  RuleEvaluation,
  SwitchState,
  RouterState,
  DeviceType,
} from '../types';
import {
  isBroadcastMAC,
  isIPInSubnet,
  isPrivateIP,
  macEquals,
} from '../utils/network';

/**
 * Evaluate if a packet matches a rule condition
 */
export function evaluateCondition(
  condition: RuleCondition,
  packet: Packet,
  deviceState: SwitchState | RouterState
): boolean {
  switch (condition.type) {
    // MAC-based conditions
    case ConditionType.DST_MAC_EQUALS:
      return condition.params.mac
        ? macEquals(packet.layer2.dstMAC, condition.params.mac)
        : false;

    case ConditionType.DST_MAC_BROADCAST:
      return isBroadcastMAC(packet.layer2.dstMAC);

    case ConditionType.DST_MAC_IN_TABLE:
      if (deviceState.type !== DeviceType.SWITCH) return false;
      return deviceState.macTable.some((entry) =>
        macEquals(entry.mac, packet.layer2.dstMAC)
      );

    case ConditionType.SRC_MAC_EQUALS:
      return condition.params.mac
        ? macEquals(packet.layer2.srcMAC, condition.params.mac)
        : false;

    // IP-based conditions
    case ConditionType.DST_IP_EQUALS:
      return (
        condition.params.ip !== undefined &&
        packet.layer3?.dstIP === condition.params.ip
      );

    case ConditionType.DST_IP_IN_SUBNET:
      return (
        condition.params.subnet !== undefined &&
        packet.layer3 !== undefined &&
        isIPInSubnet(packet.layer3.dstIP, condition.params.subnet)
      );

    case ConditionType.SRC_IP_IN_SUBNET:
      return (
        condition.params.subnet !== undefined &&
        packet.layer3 !== undefined &&
        isIPInSubnet(packet.layer3.srcIP, condition.params.subnet)
      );

    case ConditionType.SRC_IP_PRIVATE:
      return packet.layer3 ? isPrivateIP(packet.layer3.srcIP) : false;

    case ConditionType.DEFAULT_ROUTE:
      // Matches anything not matched by more specific rules
      return true;

    // VLAN conditions
    case ConditionType.VLAN_EQUALS:
      return (
        condition.params.vlan !== undefined &&
        packet.layer2.vlan === condition.params.vlan
      );

    // Protocol/port conditions
    case ConditionType.PROTOCOL_EQUALS:
      return (
        condition.params.protocol !== undefined &&
        packet.layer3?.protocol === condition.params.protocol
      );

    case ConditionType.DST_PORT_EQUALS:
      return (
        condition.params.port !== undefined &&
        packet.layer4?.dstPort === condition.params.port
      );

    case ConditionType.SRC_PORT_EQUALS:
      return (
        condition.params.port !== undefined &&
        packet.layer4?.srcPort === condition.params.port
      );

    // NAT conditions
    case ConditionType.IN_NAT_TABLE:
      if (deviceState.type !== DeviceType.ROUTER) return false;
      if (!packet.layer3 || !packet.layer4) return false;
      return deviceState.natTable.some(
        (entry) =>
          entry.externalIP === packet.layer3!.dstIP &&
          entry.externalPort === packet.layer4!.dstPort
      );

    // Direction
    case ConditionType.DIRECTION:
      // Simplified direction detection
      if (!condition.params.direction || !packet.layer3) return false;
      const isPrivate = isPrivateIP(packet.layer3.srcIP);
      if (condition.params.direction === 'outbound') return isPrivate;
      if (condition.params.direction === 'inbound') return !isPrivate;
      return false;

    default:
      return false;
  }
}

/**
 * Execute a rule action and return routing decision
 */
export function executeAction(
  action: RuleAction,
  packet: Packet,
  deviceState: SwitchState | RouterState
): RoutingDecision | null {
  switch (action.type) {
    case ActionType.SEND_TO_PORT:
      if (!action.params.port) return null;
      return {
        action: 'forward',
        port: action.params.port,
        reason: `Rule: ${action.label}`,
      };

    case ActionType.SEND_TO_INTERFACE:
      if (!action.params.interface) return null;
      return {
        action: 'forward',
        port: action.params.interface,
        reason: `Rule: ${action.label}`,
      };

    case ActionType.SEND_TO_LEARNED_PORT:
      if (deviceState.type !== DeviceType.SWITCH) return null;
      const macEntry = deviceState.macTable.find((entry) =>
        macEquals(entry.mac, packet.layer2.dstMAC)
      );
      if (!macEntry) return null;
      return {
        action: 'forward',
        port: macEntry.port,
        reason: 'Rule: Send to learned port',
      };

    case ActionType.FLOOD_ALL_PORTS:
      const ports =
        deviceState.type === DeviceType.SWITCH
          ? deviceState.ports
              .filter((p) => p.enabled)
              .filter((p) => p.id !== packet.ingressPort)
              .map((p) => p.id)
          : [];
      return {
        action: 'flood',
        ports,
        reason: 'Rule: Flood all ports',
      };

    case ActionType.DROP_PACKET:
      return {
        action: 'drop',
        reason: 'Rule: Drop packet',
      };

    case ActionType.APPLY_NAT:
      return {
        action: 'forward',
        port: action.params.interface || 'WAN',
        reason: 'Rule: Apply NAT',
        applyNAT: true,
        natType: 'source',
      };

    case ActionType.REVERSE_NAT:
      return {
        action: 'forward',
        port: action.params.interface || 'LAN',
        reason: 'Rule: Reverse NAT',
        applyNAT: true,
        natType: 'destination',
      };

    case ActionType.ROUTE_AND_NAT:
      if (!action.params.interface) return null;
      return {
        action: 'forward',
        port: action.params.interface,
        reason: 'Rule: Route with NAT',
        applyNAT: true,
      };

    default:
      return null;
  }
}

/**
 * Evaluate all rules and return the first matching decision
 */
export function evaluateRules(
  packet: Packet,
  rules: AutomationRule[],
  deviceState: SwitchState | RouterState
): { decision: RoutingDecision | null; matchedRule: AutomationRule | null } {
  // Sort rules by priority (lower number = higher priority)
  const sortedRules = [...rules]
    .filter((r) => r.enabled)
    .sort((a, b) => a.priority - b.priority);

  for (const rule of sortedRules) {
    if (evaluateCondition(rule.condition, packet, deviceState)) {
      const decision = executeAction(rule.action, packet, deviceState);
      if (decision) {
        return { decision, matchedRule: rule };
      }
    }
  }

  return { decision: null, matchedRule: null };
}

/**
 * Get all evaluations for debugging/UI
 */
export function evaluateAllRules(
  packet: Packet,
  rules: AutomationRule[],
  deviceState: SwitchState | RouterState
): RuleEvaluation[] {
  return rules.map((rule) => ({
    rule,
    matched: evaluateCondition(rule.condition, packet, deviceState),
    reason: rule.enabled ? undefined : 'Rule disabled',
  }));
}

/**
 * Validate rule configuration
 */
export function validateRule(rule: AutomationRule): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check condition has required params
  switch (rule.condition.type) {
    case ConditionType.DST_MAC_EQUALS:
    case ConditionType.SRC_MAC_EQUALS:
      if (!rule.condition.params.mac) {
        errors.push('Condition requires MAC address');
      }
      break;
    case ConditionType.DST_IP_IN_SUBNET:
    case ConditionType.SRC_IP_IN_SUBNET:
      if (!rule.condition.params.subnet) {
        errors.push('Condition requires subnet (CIDR)');
      }
      break;
  }

  // Check action has required params
  switch (rule.action.type) {
    case ActionType.SEND_TO_PORT:
      if (!rule.action.params.port) {
        errors.push('Action requires port');
      }
      break;
    case ActionType.SEND_TO_INTERFACE:
      if (!rule.action.params.interface) {
        errors.push('Action requires interface');
      }
      break;
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Detect rule conflicts or inefficiencies
 */
export function analyzeRules(rules: AutomationRule[]): {
  warnings: string[];
  suggestions: string[];
} {
  const warnings: string[] = [];
  const suggestions: string[] = [];

  const sortedRules = [...rules].sort((a, b) => a.priority - b.priority);

  // Check for unreachable rules
  for (let i = 0; i < sortedRules.length; i++) {
    const rule = sortedRules[i];

    // Check if a previous rule would always match first
    for (let j = 0; j < i; j++) {
      const prevRule = sortedRules[j];
      if (prevRule.condition.type === ConditionType.DEFAULT_ROUTE) {
        warnings.push(
          `Rule "${rule.name || rule.id}" may never execute - earlier rule catches all packets`
        );
      }
    }
  }

  // Suggest combining similar rules
  if (rules.length > 5) {
    suggestions.push(
      'Consider combining similar rules to improve efficiency'
    );
  }

  return { warnings, suggestions };
}
