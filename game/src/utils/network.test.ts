import { describe, it, expect } from 'vitest';
import {
  isBroadcastMAC,
  isPrivateIP,
  ipToNumber,
  numberToIP,
  isIPInSubnet,
  isValidMAC,
  isValidIPv4,
  macEquals,
  longestPrefixMatch,
} from './network';

describe('Network Utilities', () => {
  describe('isBroadcastMAC', () => {
    it('should identify broadcast MAC address', () => {
      expect(isBroadcastMAC('FF:FF:FF:FF:FF:FF')).toBe(true);
      expect(isBroadcastMAC('ff:ff:ff:ff:ff:ff')).toBe(true);
    });

    it('should reject non-broadcast MAC addresses', () => {
      expect(isBroadcastMAC('AA:BB:CC:DD:EE:FF')).toBe(false);
      expect(isBroadcastMAC('00:00:00:00:00:00')).toBe(false);
    });
  });

  describe('isPrivateIP', () => {
    it('should identify private IP addresses', () => {
      expect(isPrivateIP('192.168.1.1')).toBe(true);
      expect(isPrivateIP('10.0.0.1')).toBe(true);
      expect(isPrivateIP('172.16.0.1')).toBe(true);
      expect(isPrivateIP('172.31.255.255')).toBe(true);
    });

    it('should reject public IP addresses', () => {
      expect(isPrivateIP('8.8.8.8')).toBe(false);
      expect(isPrivateIP('1.1.1.1')).toBe(false);
      expect(isPrivateIP('203.0.113.1')).toBe(false);
    });
  });

  describe('ipToNumber and numberToIP', () => {
    it('should convert IP to number and back', () => {
      const ip = '192.168.1.1';
      const num = ipToNumber(ip);
      expect(num).toBe(3232235777);
      expect(numberToIP(num)).toBe(ip);
    });

    it('should handle edge cases', () => {
      expect(ipToNumber('0.0.0.0')).toBe(0);
      expect(numberToIP(0)).toBe('0.0.0.0');
      expect(ipToNumber('255.255.255.255')).toBe(4294967295);
    });
  });

  describe('isIPInSubnet', () => {
    it('should correctly match IPs in subnet', () => {
      expect(isIPInSubnet('192.168.1.10', '192.168.1.0/24')).toBe(true);
      expect(isIPInSubnet('192.168.1.255', '192.168.1.0/24')).toBe(true);
      expect(isIPInSubnet('10.0.0.1', '10.0.0.0/8')).toBe(true);
    });

    it('should reject IPs outside subnet', () => {
      expect(isIPInSubnet('192.168.2.1', '192.168.1.0/24')).toBe(false);
      expect(isIPInSubnet('10.1.0.1', '192.168.1.0/24')).toBe(false);
    });

    it('should handle /32 and /0 subnets', () => {
      expect(isIPInSubnet('192.168.1.1', '192.168.1.1/32')).toBe(true);
      expect(isIPInSubnet('192.168.1.2', '192.168.1.1/32')).toBe(false);
      expect(isIPInSubnet('1.2.3.4', '0.0.0.0/0')).toBe(true);
    });
  });

  describe('isValidMAC', () => {
    it('should validate correct MAC addresses', () => {
      expect(isValidMAC('AA:BB:CC:DD:EE:FF')).toBe(true);
      expect(isValidMAC('00:00:00:00:00:00')).toBe(true);
      expect(isValidMAC('FF:FF:FF:FF:FF:FF')).toBe(true);
    });

    it('should reject invalid MAC addresses', () => {
      expect(isValidMAC('AA:BB:CC:DD:EE')).toBe(false);
      expect(isValidMAC('AA:BB:CC:DD:EE:FF:00')).toBe(false);
      expect(isValidMAC('AABBCCDDEEFF')).toBe(false);
      expect(isValidMAC('GG:HH:II:JJ:KK:LL')).toBe(false);
    });
  });

  describe('isValidIPv4', () => {
    it('should validate correct IPv4 addresses', () => {
      expect(isValidIPv4('192.168.1.1')).toBe(true);
      expect(isValidIPv4('0.0.0.0')).toBe(true);
      expect(isValidIPv4('255.255.255.255')).toBe(true);
    });

    it('should reject invalid IPv4 addresses', () => {
      expect(isValidIPv4('256.1.1.1')).toBe(false);
      expect(isValidIPv4('192.168.1')).toBe(false);
      expect(isValidIPv4('192.168.1.1.1')).toBe(false);
      expect(isValidIPv4('abc.def.ghi.jkl')).toBe(false);
    });
  });

  describe('macEquals', () => {
    it('should compare MAC addresses case-insensitively', () => {
      expect(macEquals('AA:BB:CC:DD:EE:FF', 'aa:bb:cc:dd:ee:ff')).toBe(true);
      expect(macEquals('AA:BB:CC:DD:EE:FF', 'AA:BB:CC:DD:EE:FF')).toBe(true);
    });

    it('should detect different MAC addresses', () => {
      expect(macEquals('AA:BB:CC:DD:EE:FF', '11:22:33:44:55:66')).toBe(false);
    });
  });

  describe('longestPrefixMatch', () => {
    it('should find longest matching prefix', () => {
      const routes = ['192.168.1.0/24', '192.168.0.0/16', '0.0.0.0/0'];
      expect(longestPrefixMatch('192.168.1.10', routes)).toBe('192.168.1.0/24');
      expect(longestPrefixMatch('192.168.2.10', routes)).toBe('192.168.0.0/16');
      expect(longestPrefixMatch('10.0.0.1', routes)).toBe('0.0.0.0/0');
    });

    it('should return null when no match', () => {
      const routes = ['192.168.1.0/24'];
      expect(longestPrefixMatch('10.0.0.1', routes)).toBe(null);
    });

    it('should prefer more specific routes', () => {
      const routes = ['192.168.1.0/24', '192.168.1.128/25'];
      expect(longestPrefixMatch('192.168.1.200', routes)).toBe('192.168.1.128/25');
      expect(longestPrefixMatch('192.168.1.50', routes)).toBe('192.168.1.0/24');
    });
  });
});
