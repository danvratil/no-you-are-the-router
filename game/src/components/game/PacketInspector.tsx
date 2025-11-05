/**
 * PacketInspector component displays the current packet's headers
 * with color-coded layers for educational purposes
 */

import React from 'react';
import { Card } from '../ui/Card';
import { useGameStore } from '../../store/gameStore';
import { getPacketDescription } from '../../engine/packets';
import { Protocol } from '../../types';

export function PacketInspector() {
  const currentPacket = useGameStore((state) => state.currentPacket);

  if (!currentPacket) {
    return (
      <Card title="Packet Inspector" className="h-full">
        <div className="flex items-center justify-center h-48 text-gray-400">
          <p>No packet available</p>
        </div>
      </Card>
    );
  }

  const description = getPacketDescription(currentPacket);

  return (
    <Card title="Packet Inspector" className="h-full">
      <div className="space-y-4">
        {/* Packet Description */}
        <div className="bg-gray-50 rounded p-3">
          <p className="text-sm font-medium text-gray-700">Current Packet:</p>
          <p className="text-xs text-gray-600 mt-1 font-mono">{description}</p>
        </div>

        {/* Layer 2 Headers (Blue) */}
        <div className="border-l-4 border-blue-500 pl-3">
          <h4 className="text-sm font-semibold text-blue-700 mb-2">
            Layer 2 (Data Link)
          </h4>
          <div className="space-y-1 text-xs">
            <HeaderField
              label="Src MAC"
              value={currentPacket.layer2.srcMAC}
              color="blue"
            />
            <HeaderField
              label="Dst MAC"
              value={currentPacket.layer2.dstMAC}
              color="blue"
            />
            {currentPacket.layer2.vlan && (
              <HeaderField
                label="VLAN"
                value={currentPacket.layer2.vlan.toString()}
                color="blue"
              />
            )}
          </div>
        </div>

        {/* Layer 3 Headers (Green) */}
        {currentPacket.layer3 && (
          <div className="border-l-4 border-green-500 pl-3">
            <h4 className="text-sm font-semibold text-green-700 mb-2">
              Layer 3 (Network)
            </h4>
            <div className="space-y-1 text-xs">
              <HeaderField
                label="Src IP"
                value={currentPacket.layer3.srcIP}
                color="green"
              />
              <HeaderField
                label="Dst IP"
                value={currentPacket.layer3.dstIP}
                color="green"
              />
              <HeaderField
                label="Protocol"
                value={currentPacket.layer3.protocol}
                color="green"
              />
              {currentPacket.layer3.ttl && (
                <HeaderField
                  label="TTL"
                  value={currentPacket.layer3.ttl.toString()}
                  color="green"
                />
              )}
            </div>
          </div>
        )}

        {/* Layer 4 Headers (Orange) */}
        {currentPacket.layer4 && (
          <div className="border-l-4 border-orange-500 pl-3">
            <h4 className="text-sm font-semibold text-orange-700 mb-2">
              Layer 4 (Transport)
            </h4>
            <div className="space-y-1 text-xs">
              <HeaderField
                label="Src Port"
                value={currentPacket.layer4.srcPort.toString()}
                color="orange"
              />
              <HeaderField
                label="Dst Port"
                value={currentPacket.layer4.dstPort.toString()}
                color="orange"
              />
            </div>
          </div>
        )}

        {/* ARP Data (if present) */}
        {currentPacket.arp && (
          <div className="border-l-4 border-purple-500 pl-3">
            <h4 className="text-sm font-semibold text-purple-700 mb-2">
              ARP Data
            </h4>
            <div className="space-y-1 text-xs">
              <HeaderField
                label="Operation"
                value={currentPacket.arp.operation.toUpperCase()}
                color="purple"
              />
              <HeaderField
                label="Sender MAC"
                value={currentPacket.arp.senderMAC}
                color="purple"
              />
              <HeaderField
                label="Sender IP"
                value={currentPacket.arp.senderIP}
                color="purple"
              />
              {currentPacket.arp.targetMAC && (
                <HeaderField
                  label="Target MAC"
                  value={currentPacket.arp.targetMAC}
                  color="purple"
                />
              )}
              <HeaderField
                label="Target IP"
                value={currentPacket.arp.targetIP}
                color="purple"
              />
            </div>
          </div>
        )}

        {/* Packet Metadata */}
        <div className="bg-gray-50 rounded p-2 text-xs text-gray-600">
          <div className="flex justify-between">
            <span>Size: {currentPacket.size} bytes</span>
            <span>ID: {currentPacket.id.slice(0, 8)}...</span>
          </div>
          {currentPacket.ingressPort && (
            <div className="mt-1">
              Ingress Port: {currentPacket.ingressPort}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

/**
 * Helper component to display a header field with consistent styling
 */
interface HeaderFieldProps {
  label: string;
  value: string;
  color: 'blue' | 'green' | 'orange' | 'purple';
}

function HeaderField({ label, value, color }: HeaderFieldProps) {
  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    orange: 'text-orange-600',
    purple: 'text-purple-600',
  };

  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-600 font-medium">{label}:</span>
      <span className={`font-mono ${colorClasses[color]}`}>{value}</span>
    </div>
  );
}
