import { describe, it, expect } from 'vitest';
import {
  createL2Packet,
  createL3Packet,
  createL4Packet,
  createARPRequest,
  createARPReply,
  validatePacket,
  isBroadcast,
  isARP,
} from './packets';
import { Protocol } from '../types';

describe('Packet Engine', () => {
  describe('createL2Packet', () => {
    it('should create valid Layer 2 packet', () => {
      const packet = createL2Packet('AA:BB:CC:DD:EE:FF', '11:22:33:44:55:66');

      expect(packet.layer2.srcMAC).toBe('AA:BB:CC:DD:EE:FF');
      expect(packet.layer2.dstMAC).toBe('11:22:33:44:55:66');
      expect(packet.id).toBeDefined();
      expect(packet.timestamp).toBeGreaterThan(0);
      expect(packet.size).toBe(64);
    });

    it('should support VLAN tagging', () => {
      const packet = createL2Packet('AA:BB:CC:DD:EE:FF', '11:22:33:44:55:66', 10);
      expect(packet.layer2.vlan).toBe(10);
    });
  });

  describe('createL3Packet', () => {
    it('should create valid Layer 3 packet', () => {
      const packet = createL3Packet(
        'AA:BB:CC:DD:EE:FF',
        '11:22:33:44:55:66',
        '192.168.1.10',
        '192.168.1.20'
      );

      expect(packet.layer2).toBeDefined();
      expect(packet.layer3).toBeDefined();
      expect(packet.layer3?.srcIP).toBe('192.168.1.10');
      expect(packet.layer3?.dstIP).toBe('192.168.1.20');
      expect(packet.layer3?.ttl).toBe(64);
    });
  });

  describe('createL4Packet', () => {
    it('should create valid Layer 4 packet with TCP', () => {
      const packet = createL4Packet(
        'AA:BB:CC:DD:EE:FF',
        '11:22:33:44:55:66',
        '192.168.1.10',
        '192.168.1.20',
        12345,
        80,
        Protocol.TCP
      );

      expect(packet.layer4).toBeDefined();
      expect(packet.layer4?.srcPort).toBe(12345);
      expect(packet.layer4?.dstPort).toBe(80);
      expect(packet.layer3?.protocol).toBe(Protocol.TCP);
    });
  });

  describe('createARPRequest', () => {
    it('should create valid ARP request', () => {
      const packet = createARPRequest(
        'AA:BB:CC:DD:EE:FF',
        '192.168.1.10',
        '192.168.1.20'
      );

      expect(packet.arp).toBeDefined();
      expect(packet.arp?.operation).toBe('request');
      expect(packet.layer2.dstMAC).toBe('FF:FF:FF:FF:FF:FF'); // Broadcast
      expect(packet.arp?.targetIP).toBe('192.168.1.20');
    });
  });

  describe('createARPReply', () => {
    it('should create valid ARP reply', () => {
      const packet = createARPReply(
        'AA:BB:CC:DD:EE:FF',
        '192.168.1.10',
        '11:22:33:44:55:66',
        '192.168.1.20'
      );

      expect(packet.arp).toBeDefined();
      expect(packet.arp?.operation).toBe('reply');
      expect(packet.layer2.dstMAC).toBe('11:22:33:44:55:66'); // Unicast
      expect(packet.arp?.targetMAC).toBe('11:22:33:44:55:66');
    });
  });

  describe('validatePacket', () => {
    it('should validate correct packets', () => {
      const packet = createL3Packet(
        'AA:BB:CC:DD:EE:FF',
        '11:22:33:44:55:66',
        '192.168.1.10',
        '192.168.1.20'
      );

      const validation = validatePacket(packet);
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect invalid MAC addresses', () => {
      const packet = createL2Packet('INVALID_MAC', '11:22:33:44:55:66');
      const validation = validatePacket(packet);

      expect(validation.valid).toBe(false);
      expect(validation.errors.some((e) => e.includes('MAC'))).toBe(true);
    });

    it('should detect invalid IP addresses', () => {
      const packet = createL3Packet(
        'AA:BB:CC:DD:EE:FF',
        '11:22:33:44:55:66',
        '999.999.999.999',
        '192.168.1.20'
      );
      const validation = validatePacket(packet);

      expect(validation.valid).toBe(false);
      expect(validation.errors.some((e) => e.includes('IP'))).toBe(true);
    });
  });

  describe('isBroadcast', () => {
    it('should identify broadcast packets', () => {
      const broadcast = createL2Packet('AA:BB:CC:DD:EE:FF', 'FF:FF:FF:FF:FF:FF');
      expect(isBroadcast(broadcast)).toBe(true);

      const unicast = createL2Packet('AA:BB:CC:DD:EE:FF', '11:22:33:44:55:66');
      expect(isBroadcast(unicast)).toBe(false);
    });
  });

  describe('isARP', () => {
    it('should identify ARP packets', () => {
      const arpPacket = createARPRequest('AA:BB:CC:DD:EE:FF', '192.168.1.10', '192.168.1.20');
      expect(isARP(arpPacket)).toBe(true);

      const normalPacket = createL3Packet(
        'AA:BB:CC:DD:EE:FF',
        '11:22:33:44:55:66',
        '192.168.1.10',
        '192.168.1.20'
      );
      expect(isARP(normalPacket)).toBe(false);
    });
  });
});
