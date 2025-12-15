import { prisma } from './db'
import { Platform, ActionType, AlertLevel } from '@prisma/client'

// --- MOCK DATA GENERATOR ---
const generateMockData = (platform: Platform) => {
    const cpc = parseFloat((Math.random() * 5 + 0.5).toFixed(2))
    const roas = parseFloat((Math.random() * 5 + 0.5).toFixed(2))
    const ctr = parseFloat((Math.random() * 3 + 0.5).toFixed(2))

    return {
        cpc,
        roas,
        ctr,
        campaignId: `cmp_${Math.floor(Math.random() * 10000)}`,
        name: `Campanha Mock ${platform} - ${new Date().toISOString().slice(11, 16)}`
    }
}

// --- EVALUATION LOGIC ---
const evaluateRule = (rule: any, data: any): boolean => {
    const { metric, operator, value } = rule.condition as any
    const actualValue = data[metric.toLowerCase()]

    if (actualValue === undefined) return false

    console.log(`[EVAL] Rule: ${rule.name} | ${metric} ${operator} ${value} | Actual: ${actualValue}`)

    switch (operator) {
        case 'GT': return actualValue > value
        case 'LT': return actualValue < value
        case 'EQ': return actualValue === value
        default: return false
    }
}

// --- EXECUTION LOGIC ---
export async function runAutomations(workspaceId?: string) {
    console.log('🚀 Starting Automation Run...')

    const where = { active: true, ...(workspaceId ? { workspaceId } : {}) }
    const rules = await prisma.automationRule.findMany({
        where,
        include: { workspace: true }
    })

    const results = []

    for (const rule of rules) {
        try {
            const data = generateMockData(rule.platform)
            const triggered = evaluateRule(rule, data)

            if (triggered) {
                console.log(`⚡ Rule Triggered: ${rule.name}`)

                const condition = rule.condition as any
                const metric = condition.metric
                const actualValue = data[metric.toLowerCase() as keyof typeof data]

                const message = `Regra "${rule.name}" disparada. ${metric} (${actualValue}) atingiu a condição.`

                await prisma.alert.create({
                    data: {
                        workspaceId: rule.workspaceId,
                        ruleId: rule.id,
                        level: 'WARNING',
                        title: `Automação Executada: ${rule.name}`,
                        message: message + ` Ação: ${rule.action}`,
                    }
                })

                await prisma.auditLog.create({
                    data: {
                        workspaceId: rule.workspaceId,
                        ruleId: rule.id,
                        action: rule.action,
                        entityId: data.campaignId,
                        details: { triggerData: data, condition: rule.condition } as any
                    }
                })

                results.push({ ruleId: rule.id, status: 'TRIGGERED', details: message })
            } else {
                results.push({ ruleId: rule.id, status: 'SKIPPED' })
            }

            await prisma.automationRule.update({
                where: { id: rule.id },
                data: { lastRunAt: new Date() }
            })

        } catch (error: any) {
            console.error(`Error running rule ${rule.id}:`, error)
            results.push({ ruleId: rule.id, status: 'ERROR', error: error.message })
        }
    }

    return results
}
