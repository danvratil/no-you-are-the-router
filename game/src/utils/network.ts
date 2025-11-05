/**
 * Network utility functions for IP calculations, subnet matching, etc.
 */

import type { IPv4Address, MACAddress } from '../types';

/**
 * Check if a MAC address is a broadcast address
 */
export function isBroadcastMAC(mac: MACAddress): boolean {
  return mac.toUpperCase() === 'FF:FF:FF:FF:FF:FF';
}

/**
 * Check if an IP address is private (RFC 1918)
 */
export function isPrivateIP(ip: IPv4Address): boolean {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4) return false;

  // 10.0.0.0/8
  if (parts[0] === 10) return true;

  // 172.16.0.0/12
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;

  // 192.168.0.0/16
  if (parts[0] === 192 && parts[1] === 168) return true;

  return false;
}

/**
 * Convert IP address to 32-bit number
 */
export function ipToNumber(ip: IPv4Address): number {
  const parts = ip.split('.').map(Number);
  return (parts[0] << 24) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
}

/**
 * Convert 32-bit number to IP address
 */
export function numberToIP(num: number): IPv4Address {
  return [
    (num >>> 24) & 0xff,
    (num >>> 16) & 0xff,
    (num >>> 8) & 0xff,
    num & 0xff,
  ].join('.');
}

/**
 * Check if an IP is in a subnet (CIDR notation)
 */
export function isIPInSubnet(ip: IPv4Address, cidr: string): boolean {
  const [subnet, prefixStr] = cidr.split('/');
  const prefix = parseInt(prefixStr, 10);

  const ipNum = ipToNumber(ip);
  const subnetNum = ipToNumber(subnet);

  // Create mask
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;

  return (ipNum & mask) === (subnetNum & mask);
}

/**
 * Get network address from CIDR
 */
export function getNetworkAddress(cidr: string): IPv4Address {
  const [subnet, prefixStr] = cidr.split('/');
  const prefix = parseInt(prefixStr, 10);
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  const subnetNum = ipToNumber(subnet);

  return numberToIP(subnetNum & mask);
}

/**
 * Check if MAC address is valid format
 */
export function isValidMAC(mac: string): boolean {
  const macRegex = /^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/;
  return macRegex.test(mac);
}

/**
 * Check if IPv4 address is valid format
 */
export function isValidIPv4(ip: string): boolean {
  const parts = ip.split('.');
  if (parts.length !== 4) return false;

  return parts.every((part) => {
    const num = parseInt(part, 10);
    return num >= 0 && num <= 255 && part === num.toString();
  });
}

/**
 * Generate a random MAC address
 */
export function generateMAC(): MACAddress {
  return Array.from({ length: 6 }, () =>
    Math.floor(Math.random() * 256)
      .toString(16)
      .padStart(2, '0')
      .toUpperCase()
  ).join(':');
}

/**
 * Compare two MAC addresses (case-insensitive)
 */
export function macEquals(mac1: MACAddress, mac2: MACAddress): boolean {
  return mac1.toUpperCase() === mac2.toUpperCase();
}

/**
 * Longest prefix match for routing
 * Returns the best matching CIDR from a list
 */
export function longestPrefixMatch(
  ip: IPv4Address,
  cidrs: string[]
): string | null {
  let bestMatch: string | null = null;
  let bestPrefix = -1;

  for (const cidr of cidrs) {
    const [, prefixStr] = cidr.split('/');
    const prefix = parseInt(prefixStr, 10);

    if (isIPInSubnet(ip, cidr) && prefix > bestPrefix) {
      bestMatch = cidr;
      bestPrefix = prefix;
    }
  }

  return bestMatch;
}

/**
 * Generate a unique packet ID
 */
export function generatePacketId(): string {
  return `pkt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Calculate 5-tuple hash for NAT (protocol, srcIP, srcPort, dstIP, dstPort)
 */
export function calculate5TupleHash(
  protocol: string,
  srcIP: IPv4Address,
  srcPort: number,
  dstIP: IPv4Address,
  dstPort: number
): string {
  return `${protocol}:${srcIP}:${srcPort}:${dstIP}:${dstPort}`;
}
