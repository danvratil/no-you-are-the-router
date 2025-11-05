/**
 * DeviceState component - Displays device state tables
 * Shows MAC table for switches, routing/NAT tables for routers
 */

import { Card } from '../ui/Card';
import { useGameStore } from '../../store/gameStore';
import type { SwitchState, RouterState } from '../../types';
import { DeviceType } from '../../types';

export function DeviceState() {
  const level = useGameStore((state) => state.level);
  const device = level.playerDevice;

  if (!device) {
    return null;
  }

  return (
    <Card title="Your State">
      {device.type === DeviceType.SWITCH && <SwitchStateView device={device as SwitchState} />}
      {device.type === DeviceType.ROUTER && <RouterStateView device={device as RouterState} />}
    </Card>
  );
}

/** Switch state display */
function SwitchStateView({ device }: { device: SwitchState }) {
  return (
    <div className="space-y-4">
      {/* MAC Address Table */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-2">MAC Address Table</h4>
        {device.macTable.length === 0 ? (
          <p className="text-sm text-gray-500 italic">Empty - no learned MACs yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 font-medium text-gray-700">MAC Address</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Port</th>
                  {device.vlans.length > 0 && (
                    <th className="text-left py-2 px-3 font-medium text-gray-700">VLAN</th>
                  )}
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Type</th>
                </tr>
              </thead>
              <tbody>
                {device.macTable.map((entry, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-3 font-mono text-xs text-blue-600">
                      {entry.mac}
                    </td>
                    <td className="py-2 px-3 text-gray-800">{entry.port}</td>
                    {device.vlans.length > 0 && (
                      <td className="py-2 px-3 text-gray-800">
                        {entry.vlan !== undefined ? entry.vlan : '-'}
                      </td>
                    )}
                    <td className="py-2 px-3">
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          entry.learned
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {entry.learned ? 'Learned' : 'Static'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* VLAN Information */}
      {device.vlans.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">VLANs</h4>
          <div className="flex flex-wrap gap-2">
            {device.vlans.map((vlan) => (
              <span
                key={vlan}
                className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
              >
                VLAN {vlan}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Ports */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Ports</h4>
        <div className="space-y-1">
          {device.ports.map((port) => (
            <div
              key={port.id}
              className="flex items-center justify-between text-sm py-1 px-2 bg-gray-50 rounded"
            >
              <span className="font-medium text-gray-800">{port.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600">
                  {port.type === 'trunk' ? 'Trunk' : `VLAN ${port.vlan || 1}`}
                </span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    port.enabled ? 'bg-green-500' : 'bg-gray-400'
                  }`}
                  title={port.enabled ? 'Enabled' : 'Disabled'}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Router state display */
function RouterStateView({ device }: { device: RouterState }) {
  return (
    <div className="space-y-4">
      {/* Interfaces */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Interfaces</h4>
        <div className="space-y-2">
          {Object.entries(device.interfaces).map(([name, iface]) => (
            <div
              key={name}
              className="text-sm p-2 bg-gray-50 rounded border border-gray-200"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-gray-800">{name}</span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    iface.enabled ? 'bg-green-500' : 'bg-gray-400'
                  }`}
                  title={iface.enabled ? 'Up' : 'Down'}
                />
              </div>
              <div className="text-xs text-gray-600 space-y-0.5 ml-2">
                <div>
                  IP: <span className="font-mono text-green-600">{iface.ip}</span>
                </div>
                <div>
                  Subnet: <span className="font-mono">{iface.subnet}</span>
                </div>
                <div>
                  MAC: <span className="font-mono text-blue-600">{iface.mac}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Routing Table */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Routing Table</h4>
        {device.routingTable.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No routes configured</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-2 font-medium text-gray-700">Destination</th>
                  <th className="text-left py-2 px-2 font-medium text-gray-700">Next Hop</th>
                  <th className="text-left py-2 px-2 font-medium text-gray-700">Interface</th>
                  <th className="text-left py-2 px-2 font-medium text-gray-700">Metric</th>
                </tr>
              </thead>
              <tbody>
                {device.routingTable.map((entry, index) => (
                  <tr
                    key={index}
                    className={`border-b border-gray-100 hover:bg-gray-50 ${
                      entry.isDefault ? 'bg-yellow-50' : ''
                    }`}
                  >
                    <td className="py-2 px-2 font-mono text-green-600">
                      {entry.destination}
                      {entry.isDefault && (
                        <span className="ml-1 text-xs text-yellow-600">(default)</span>
                      )}
                    </td>
                    <td className="py-2 px-2 font-mono text-gray-700">
                      {entry.nextHop === 'direct' ? (
                        <span className="text-blue-600">Direct</span>
                      ) : (
                        entry.nextHop
                      )}
                    </td>
                    <td className="py-2 px-2 text-gray-800">{entry.interface}</td>
                    <td className="py-2 px-2 text-gray-600">{entry.metric}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* NAT Table */}
      {device.natEnabled && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            NAT Table
            {device.publicIP && (
              <span className="ml-2 text-xs font-normal text-gray-600">
                (Public IP: <span className="font-mono text-green-600">{device.publicIP}</span>)
              </span>
            )}
          </h4>
          {device.natTable.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No active NAT sessions</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-2 font-medium text-gray-700">
                      Internal
                    </th>
                    <th className="text-center py-2 px-1 font-medium text-gray-700"></th>
                    <th className="text-left py-2 px-2 font-medium text-gray-700">
                      External
                    </th>
                    <th className="text-left py-2 px-2 font-medium text-gray-700">Proto</th>
                    <th className="text-left py-2 px-2 font-medium text-gray-700">State</th>
                  </tr>
                </thead>
                <tbody>
                  {device.natTable.map((entry, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 px-2 font-mono text-blue-600">
                        {entry.internalIP}:{entry.internalPort}
                      </td>
                      <td className="py-2 px-1 text-center text-gray-500">↔</td>
                      <td className="py-2 px-2 font-mono text-green-600">
                        {entry.externalIP}:{entry.externalPort}
                      </td>
                      <td className="py-2 px-2 text-gray-700">{entry.protocol}</td>
                      <td className="py-2 px-2">
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${
                            entry.state === 'ESTAB'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {entry.state}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Firewall Rules */}
      {device.firewallRules.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Firewall Rules</h4>
          <div className="space-y-1">
            {device.firewallRules.map((rule) => (
              <div
                key={rule.id}
                className="text-xs p-2 bg-gray-50 rounded border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-800">
                    {rule.protocol || 'ANY'} {rule.dstPort ? `:${rule.dstPort}` : ''}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded ${
                      rule.action === 'allow'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {rule.action.toUpperCase()}
                  </span>
                </div>
                {(rule.srcIP || rule.dstIP || rule.direction) && (
                  <div className="text-gray-600 mt-1">
                    {rule.srcIP && <span>From: {rule.srcIP} </span>}
                    {rule.dstIP && <span>To: {rule.dstIP} </span>}
                    {rule.direction && <span>({rule.direction})</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
