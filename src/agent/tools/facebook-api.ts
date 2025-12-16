/**
 * FACEBOOK ADS API - Funções de integração
 */

const META_API_VERSION = 'v24.0'
const META_BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`

export interface FacebookConfig {
  accessToken?: string
  adAccountId?: string
  pageId?: string
  pixelId?: string
}

function getAccessToken(config?: FacebookConfig): string {
  // 1. Tenta pegar do config (passado pelo frontend)
  if (config?.accessToken) return config.accessToken

  // 2. Fallback para .env
  const token = process.env.META_ACCESS_TOKEN
  if (!token) {
    throw new Error('Token de acesso não configurado. Por favor, configure no painel de configurações.')
  }
  return token
}

function getAdAccountId(config?: FacebookConfig): string {
  // 1. Tenta pegar do config
  if (config?.adAccountId) return config.adAccountId

  // 2. Fallback para .env
  const accountId = process.env.META_AD_ACCOUNT_ID
  if (!accountId) {
    throw new Error('ID da Conta de Anúncios não configurado. Por favor, configure no painel de configurações.')
  }
  return accountId
}

/**
 * Helper para tratamento de erros da API
 */
async function handleResponse(response: Response, context: string) {
  const data = await response.json()

  if (data.error) {
    // Tratamento específico para erros comuns
    if (data.error.code === 190) { // Token expirado ou inválido
      throw new Error(`Token do Facebook expirado ou inválido. Por favor, renove o token nas configurações. (Erro 190)`)
    }
    if (data.error.code === 100) { // Parâmetros inválidos
      throw new Error(`Parâmetro inválido na requisição do Facebook: ${data.error.message} (Erro 100)`)
    }
    if (data.error.code === 17) { // Rate limit
      throw new Error(`Limite de requisições do Facebook atingido. Aguarde alguns minutos. (Erro 17)`)
    }

    throw new Error(`Erro na API do Facebook (${context}): ${data.error.message}`)
  }

  return data
}

/**
 * Listar contas de anúncios acessíveis
 */
export async function getAdAccounts(config?: FacebookConfig): Promise<object> {
  const token = getAccessToken(config)

  const url = `${META_BASE_URL}/me/adaccounts?fields=id,name,account_status,currency&access_token=${token}`

  const response = await fetch(url)
  return handleResponse(response, 'getAdAccounts')
}

/**
 * Listar campanhas
 */
export async function getCampaigns(status?: string, config?: FacebookConfig): Promise<object> {
  const token = getAccessToken(config)
  const accountId = getAdAccountId(config)

  let url = `${META_BASE_URL}/${accountId}/campaigns?fields=id,name,status,objective,daily_budget,lifetime_budget,created_time&access_token=${token}`

  if (status) {
    url += `&filtering=[{"field":"effective_status","operator":"IN","value":["${status}"]}]`
  }

  const response = await fetch(url)
  return handleResponse(response, 'getCampaigns')
}

/**
 * Obter insights de uma campanha
 */
export async function getCampaignInsights(
  campaignId: string,
  datePreset: string = 'last_7d',
  config?: FacebookConfig
): Promise<object> {
  const token = getAccessToken(config)

  const url = `${META_BASE_URL}/${campaignId}/insights?fields=campaign_name,impressions,clicks,spend,ctr,cpc,cpm,actions,cost_per_action_type,frequency,reach&date_preset=${datePreset}&access_token=${token}`

  const response = await fetch(url)
  return handleResponse(response, 'getCampaignInsights')
}

/**
 * Listar AdSets de uma campanha
 */
export async function getAdSets(campaignId?: string, config?: FacebookConfig): Promise<object> {
  const token = getAccessToken(config)
  const accountId = getAdAccountId(config)

  let url: string

  if (campaignId) {
    url = `${META_BASE_URL}/${campaignId}/adsets?fields=id,name,status,optimization_goal,daily_budget,targeting&access_token=${token}`
  } else {
    url = `${META_BASE_URL}/${accountId}/adsets?fields=id,name,status,optimization_goal,daily_budget,campaign_id&access_token=${token}`
  }

  const response = await fetch(url)
  return handleResponse(response, 'getAdSets')
}

/**
 * Listar Ads de um AdSet
 */
export async function getAds(adsetId?: string, config?: FacebookConfig): Promise<object> {
  const token = getAccessToken(config)
  const accountId = getAdAccountId(config)

  let url: string

  if (adsetId) {
    url = `${META_BASE_URL}/${adsetId}/ads?fields=id,name,status,creative&access_token=${token}`
  } else {
    url = `${META_BASE_URL}/${accountId}/ads?fields=id,name,status,adset_id&access_token=${token}`
  }

  const response = await fetch(url)
  return handleResponse(response, 'getAds')
}

/**
 * Listar Criativos (AdCreatives)
 */
export async function getAdCreatives(config?: FacebookConfig): Promise<object> {
  const token = getAccessToken(config)
  const accountId = getAdAccountId(config)

  // Limita a 20 para não sobrecarregar
  const url = `${META_BASE_URL}/${accountId}/adcreatives?fields=id,name,title,body,image_url,status&limit=20&access_token=${token}`

  const response = await fetch(url)
  return handleResponse(response, 'getAdCreatives')
}

/**
 * Criar campanha
 */
export async function createCampaign(
  name: string,
  objective: string = 'OUTCOME_SALES',
  status: string = 'PAUSED',
  specialAdCategories: string[] = [],
  config?: FacebookConfig
): Promise<object> {
  const token = getAccessToken(config)
  const accountId = getAdAccountId(config)

  const url = `${META_BASE_URL}/${accountId}/campaigns`

  const body = {
    name,
    objective,
    status,
    special_ad_categories: specialAdCategories,
    access_token: token,
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  return handleResponse(response, 'createCampaign')
}

/**
 * Criar AdSet
 */
export async function createAdSet(
  campaignId: string,
  name: string,
  dailyBudget: number,
  optimizationGoal: string = 'OFFSITE_CONVERSIONS',
  billingEvent: string = 'IMPRESSIONS',
  targeting: object = {},
  config?: FacebookConfig
): Promise<object> {
  const token = getAccessToken(config)
  const accountId = getAdAccountId(config)

  const defaultTargeting = {
    geo_locations: { countries: ['BR'] },
    age_min: 18,
    age_max: 65,
    ...targeting,
  }

  const url = `${META_BASE_URL}/${accountId}/adsets`

  const body = {
    name,
    campaign_id: campaignId,
    daily_budget: dailyBudget * 100, // Converter para centavos
    optimization_goal: optimizationGoal,
    billing_event: billingEvent,
    targeting: defaultTargeting,
    status: 'PAUSED',
    access_token: token,
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  return handleResponse(response, 'createAdSet')
}

/**
 * Criar Ad
 */
export async function createAd(
  adsetId: string,
  name: string,
  creativeId: string,
  status: string = 'PAUSED',
  config?: FacebookConfig
): Promise<object> {
  const token = getAccessToken(config)
  const accountId = getAdAccountId(config)

  const url = `${META_BASE_URL}/${accountId}/ads`

  const body = {
    name,
    adset_id: adsetId,
    creative: { creative_id: creativeId },
    status,
    access_token: token,
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  return handleResponse(response, 'createAd')
}

/**
 * Pausar campanha
 */
export async function pauseCampaign(campaignId: string, config?: FacebookConfig): Promise<object> {
  const token = getAccessToken(config)

  const url = `${META_BASE_URL}/${campaignId}`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      status: 'PAUSED',
      access_token: token,
    }),
  })

  await handleResponse(response, 'pauseCampaign')

  return { success: true, campaignId, status: 'PAUSED' }
}

/**
 * Ativar campanha
 */
export async function activateCampaign(campaignId: string, config?: FacebookConfig): Promise<object> {
  const token = getAccessToken(config)

  const url = `${META_BASE_URL}/${campaignId}`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      status: 'ACTIVE',
      access_token: token,
    }),
  })

  await handleResponse(response, 'activateCampaign')

  return { success: true, campaignId, status: 'ACTIVE' }
}

/**
 * Atualizar budget
 */
export async function updateBudget(
  entityId: string,
  dailyBudget: number,
  entityType: 'campaign' | 'adset' = 'adset',
  config?: FacebookConfig
): Promise<object> {
  const token = getAccessToken(config)

  const url = `${META_BASE_URL}/${entityId}`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      daily_budget: dailyBudget * 100, // Converter para centavos
      access_token: token,
    }),
  })

  await handleResponse(response, 'updateBudget')

  return { success: true, entityId, entityType, newBudget: dailyBudget }
}
