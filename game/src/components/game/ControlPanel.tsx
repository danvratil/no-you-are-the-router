/**
 * Control panel for manual packet routing
 */

import { useGameStore } from '../../store/gameStore';
import { Card } from '../ui/Card';
import type { RoutingDecision } from '../../types';
import { DeviceType } from '../../types';
import { Button } from '../ui/Button';

export function ControlPanel() {
  const { currentPacket, level, feedback, routePacket } = useGameStore();

  if (!currentPacket) {
    return (
      <Card title="Control Panel" className="h-full">
        <div className="text-center text-gray-500 py-8">
          No packet to route
        </div>
      </Card>
    );
  }

  const deviceState = level.playerDevice;
  const isSwitch = deviceState.type === DeviceType.SWITCH;

  // Get available ports
  const ports = isSwitch
    ? (deviceState as any).ports || []
    : Object.keys((deviceState as any).interfaces || {});

  const handleRoute = (decision: RoutingDecision) => {
    routePacket(decision, true);
  };

  return (
    <Card title="Control Panel" className="h-full">
      <div className="space-y-4">
        {/* Current Packet Display */}
        <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-3">
          <div className="text-xs text-gray-600 mb-1">Current Packet:</div>
          <div className="font-mono text-sm">
            {currentPacket.layer2.srcMAC} → {currentPacket.layer2.dstMAC}
          </div>
          {currentPacket.layer3 && (
            <div className="font-mono text-sm text-green-700">
              {currentPacket.layer3.srcIP} → {currentPacket.layer3.dstIP}
            </div>
          )}
        </div>

        {/* Routing Options */}
        <div>
          <div className="text-sm font-semibold mb-2">Route to:</div>
          <div className="grid grid-cols-2 gap-2">
            {/* Port/Interface buttons */}
            {ports.map((port: any) => {
              const portId = typeof port === 'string' ? port : port.id;
              const portName = typeof port === 'string' ? port : port.name;
              const isIngress = portId === currentPacket.ingressPort;

              return (
                <Button
                  key={portId}
                  onClick={() =>
                    handleRoute({
                      action: 'forward',
                      port: portId,
                      reason: `Manual route to ${portName}`,
                    })
                  }
                  variant={isIngress ? 'secondary' : 'primary'}
                  disabled={isIngress || !!feedback}
                  className={isIngress ? 'opacity-50 cursor-not-allowed' : ''}
                >
                  {portName}
                  {isIngress && ' (ingress)'}
                </Button>
              );
            })}

            {/* Flood option */}
            {isSwitch && (
              <Button
                onClick={() =>
                  handleRoute({
                    action: 'flood',
                    ports: (deviceState as any).ports
                      .filter((p: any) => p.id !== currentPacket.ingressPort)
                      .map((p: any) => p.id),
                    reason: 'Manual flood',
                  })
                }
                variant="secondary"
                disabled={!!feedback}
                className="col-span-2"
              >
                🌊 Flood All Ports
              </Button>
            )}

            {/* Drop option */}
            <Button
              onClick={() =>
                handleRoute({
                  action: 'drop',
                  reason: 'Manual drop',
                })
              }
              variant="danger"
              disabled={!!feedback}
              className="col-span-2"
            >
              ❌ Drop Packet
            </Button>
          </div>
        </div>

        {/* Feedback Display */}
        {feedback && (
          <div
            className={`p-3 rounded-lg border-2 ${
              feedback.success
                ? 'bg-green-50 border-green-500'
                : 'bg-red-50 border-red-500'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">
                {feedback.success ? '✓' : '✗'}
              </span>
              <span className="font-semibold">
                {feedback.success ? 'Correct!' : 'Incorrect'}
              </span>
            </div>
            <div className="text-sm">{feedback.message}</div>
          </div>
        )}
      </div>
    </Card>
  );
}
