/**
 * MOCK implementation of Google Ads API
 * In a real scenario, this would use google-ads-api library
 *
 * TODO: Replace mock returns with real API calls using 'google-ads-api'
 * Requires: Google Ads Developer Token, Client Customer ID, OAuth Refresh Token
 */

export interface GoogleConfig {
    accessToken?: string
    refreshToken?: string
    customerId?: string
    developerToken?: string
}

export async function getCampaigns(config?: GoogleConfig) {
    // Mock response
    return {
        campaigns: [
            { id: '12345', name: 'Search - Institucional', status: 'ENABLED', type: 'SEARCH', budget: 50 },
            { id: '67890', name: 'PMax - Vendas', status: 'ENABLED', type: 'PERFORMANCE_MAX', budget: 150 },
        ]
    }
}

export async function getCampaignInsights(campaignId: string, datePreset: string, config?: GoogleConfig) {
    // Mock metrics based on 2025 benchmarks
    return {
        campaign_id: campaignId,
        impressions: 15000,
        clicks: 450,
        cost: 450.00,
        conversions: 25,
        ctr: '3.00%',
        cpc: '1.00',
        roas: '4.5'
    }
}

export async function createCampaign(name: string, budget: number, type: string, config?: GoogleConfig) {
    return {
        success: true,
        id: Math.floor(Math.random() * 100000).toString(),
        name,
        status: 'PAUSED', // Always create paused for review
        message: 'Campanha criada com sucesso (Simulação)'
    }
}

export async function updateBudget(campaignId: string, amount: number, config?: GoogleConfig) {
    return {
        success: true,
        id: campaignId,
        new_budget: amount,
        message: `Orçamento atualizado para R$ ${amount}`
    }
}
