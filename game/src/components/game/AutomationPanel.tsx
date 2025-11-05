/**
 * Automation panel for building routing rules
 */

import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import type { AutomationRule } from '../../types';
import { ConditionType, ActionType } from '../../types';

export function AutomationPanel() {
  const { level, progress, addRule, removeRule, updateRule } = useGameStore();
  const [showBuilder, setShowBuilder] = useState(false);

  if (!level.automationEnabled) {
    return null;
  }

  const conditionBlocks = level.availableRuleBlocks.filter(
    (b) => b.type === 'condition'
  );
  const actionBlocks = level.availableRuleBlocks.filter(
    (b) => b.type === 'action'
  );

  const handleAddRule = (conditionType: ConditionType, actionType: ActionType) => {
    const condition = conditionBlocks.find((b) => b.conditionType === conditionType);
    const action = actionBlocks.find((b) => b.actionType === actionType);

    if (!condition || !action) return;

    const rule: AutomationRule = {
      id: `rule_${Date.now()}`,
      condition: {
        id: `cond_${Date.now()}`,
        type: conditionType,
        params: {},
        label: condition.label,
      },
      action: {
        id: `act_${Date.now()}`,
        type: actionType,
        params: {},
        label: action.label,
      },
      enabled: true,
      priority: progress.rules.length,
      matchCount: 0,
    };

    addRule(rule);
    setShowBuilder(false);
  };

  return (
    <Card title="Automation Rules" className="h-full">
      <div className="space-y-4">
        {/* Rules List */}
        {progress.rules.length > 0 ? (
          <div className="space-y-2">
            {progress.rules.map((rule, index) => (
              <div
                key={rule.id}
                className={`border-2 rounded-lg p-3 ${
                  rule.enabled
                    ? 'border-purple-300 bg-purple-50'
                    : 'border-gray-300 bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-gray-600 mb-1">
                      Rule #{index + 1}
                    </div>
                    <div className="text-sm space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-blue-600 font-mono">IF</span>
                        <span>{rule.condition.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-600 font-mono">THEN</span>
                        <span>{rule.action.label}</span>
                      </div>
                    </div>
                    {rule.matchCount > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        Matched {rule.matchCount} packets
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => updateRule(rule.id, { enabled: !rule.enabled })}
                      className="text-xs px-2 py-1 rounded bg-gray-200 hover:bg-gray-300"
                      title={rule.enabled ? 'Disable' : 'Enable'}
                    >
                      {rule.enabled ? 'ON' : 'OFF'}
                    </button>
                    <button
                      onClick={() => removeRule(rule.id)}
                      className="text-xs px-2 py-1 rounded bg-red-200 hover:bg-red-300"
                      title="Delete"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-4 text-sm">
            No rules yet. Create rules to automate routing!
          </div>
        )}

        {/* Add Rule Button */}
        {!showBuilder && (
          <Button
            onClick={() => setShowBuilder(true)}
            variant="secondary"
            className="w-full"
          >
            + Add Rule
          </Button>
        )}

        {/* Rule Builder */}
        {showBuilder && (
          <div className="border-2 border-dashed border-purple-300 rounded-lg p-4 space-y-3">
            <div className="text-sm font-semibold">Create New Rule</div>

            {/* Quick Templates */}
            <div className="space-y-2">
              <div className="text-xs text-gray-600">Quick templates:</div>

              {/* Template: MAC in table → learned port */}
              {conditionBlocks.find((b) => b.conditionType === ConditionType.DST_MAC_IN_TABLE) &&
                actionBlocks.find((b) => b.actionType === ActionType.SEND_TO_LEARNED_PORT) && (
                  <button
                    onClick={() =>
                      handleAddRule(
                        ConditionType.DST_MAC_IN_TABLE,
                        ActionType.SEND_TO_LEARNED_PORT
                      )
                    }
                    className="w-full text-left p-2 rounded bg-white border hover:border-purple-400 text-sm"
                  >
                    <div className="font-semibold text-purple-700">Known MAC Rule</div>
                    <div className="text-xs text-gray-600">
                      If MAC in table → Send to learned port
                    </div>
                  </button>
                )}

              {/* Template: Broadcast → flood */}
              {conditionBlocks.find((b) => b.conditionType === ConditionType.DST_MAC_BROADCAST) &&
                actionBlocks.find((b) => b.actionType === ActionType.FLOOD_ALL_PORTS) && (
                  <button
                    onClick={() =>
                      handleAddRule(
                        ConditionType.DST_MAC_BROADCAST,
                        ActionType.FLOOD_ALL_PORTS
                      )
                    }
                    className="w-full text-left p-2 rounded bg-white border hover:border-purple-400 text-sm"
                  >
                    <div className="font-semibold text-purple-700">Broadcast Rule</div>
                    <div className="text-xs text-gray-600">
                      If broadcast → Flood all ports
                    </div>
                  </button>
                )}

              {/* Template: Private IP → Apply NAT */}
              {conditionBlocks.find((b) => b.conditionType === ConditionType.SRC_IP_PRIVATE) &&
                actionBlocks.find((b) => b.actionType === ActionType.APPLY_NAT) && (
                  <button
                    onClick={() =>
                      handleAddRule(ConditionType.SRC_IP_PRIVATE, ActionType.APPLY_NAT)
                    }
                    className="w-full text-left p-2 rounded bg-white border hover:border-purple-400 text-sm"
                  >
                    <div className="font-semibold text-purple-700">NAT Rule</div>
                    <div className="text-xs text-gray-600">
                      If private IP → Apply NAT
                    </div>
                  </button>
                )}
            </div>

            <Button
              onClick={() => setShowBuilder(false)}
              variant="secondary"
              size="sm"
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        )}

        {/* Tips */}
        {level.maxRecommendedRules && (
          <div className="text-xs text-gray-600 bg-yellow-50 p-2 rounded">
            Tip: Try to use {level.maxRecommendedRules} or fewer rules for 3 stars!
          </div>
        )}
      </div>
    </Card>
  );
}
