import { prisma } from './db'
import { TriggerType, ActionType, AlertType } from '@prisma/client'

// Mock Data Generator
const generateMockMetrics = (platform: 'META' | 'GOOGLE') => {
    return {
        roas: parseFloat((Math.random() * 5 + 1).toFixed(2)), // 1.0 to 6.0
        cpc: parseFloat((Math.random() * 3 + 0.2).toFixed(2)), // 0.20 to 3.20
        spent: parseFloat((Math.random() * 1000).toFixed(2))
    }
}

export async function checkAutomationRules() {
    console.log('🤖 Engine: Checking rules...')

    // 1. Fetch Active Rules
    const rules = await prisma.automationRule.findMany({
        where: { isActive: true },
        include: { workspace: true }
    })

    const results = []

    for (const rule of rules) {
        // Mock Platform (derive from name or defaults)
        const platform = rule.name.toLowerCase().includes('google') ? 'GOOGLE' : 'META'
        const metrics = generateMockMetrics(platform)
        let triggered = false

        // 2. Evaluate Condition
        if (rule.triggerType === 'META_THRESHOLD') {
            // Assume threshold is ROAS < X
            if (metrics.roas < rule.triggerValue) triggered = true
        } else if (rule.triggerType === 'BUDGET_LIMIT') {
            if (metrics.spent > rule.triggerValue) triggered = true
        }

        if (triggered) {
            console.log(`⚡ Triggered Rule: ${rule.name} (ROAS: ${metrics.roas})`)

            // 3. Execute Action
            if (rule.actionType === 'ALERT') {
                await prisma.alert.create({
                    data: {
                        workspaceId: rule.workspaceId,
                        automationRuleId: rule.id,
                        alertType: 'WARNING',
                        message: `Regra ${rule.name} disparada. Valor atual: ${metrics.roas}`,
                        metadata: metrics as any
                    }
                })
            }

            // Log
            await prisma.auditLog.create({
                data: {
                    workspaceId: rule.workspaceId,
                    action: 'RULE_TRIGGERED',
                    entityType: 'CAMPAIGN',
                    entityId: 'mock_campaign_id',
                    changes: { metrics, ruleId: rule.id } as any
                }
            })

            results.push({ rule: rule.name, status: 'TRIGGERED' })
        } else {
            results.push({ rule: rule.name, status: 'OK' })
        }
    }

    return results
}
