/**
 * TOOLS - Definição e registro de ferramentas do agente
 */

import * as facebookApi from './facebook-api'
import * as googleApi from './google-api'

// Definição das ferramentas no formato OpenAI
export const tools = [
  // --- FACEBOOK ADS TOOLS ---
  {
    type: 'function',
    function: {
      name: 'fb_get_ad_accounts',
      description: 'Lista todas as contas de anúncios acessíveis no Facebook/Meta.',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
    }
  },
  {
    type: 'function',
    function: {
      name: 'fb_get_campaigns',
      description: 'Lista todas as campanhas da conta de anúncios Meta. Pode filtrar por status.',
      parameters: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            description: 'Filtrar por status: ACTIVE, PAUSED, DELETED, ARCHIVED',
          },
        },
        required: [],
      },
    }
  },
  {
    type: 'function',
    function: {
      name: 'fb_get_campaign_insights',
      description: 'Obtém métricas detalhadas de uma campanha Meta (ROAS, CPC, CTR, etc).',
      parameters: {
        type: 'object',
        properties: {
          campaign_id: {
            type: 'string',
            description: 'ID da campanha',
          },
          date_preset: {
            type: 'string',
            description: 'Período: today, yesterday, last_7d, last_14d, last_30d, this_month, last_month',
            default: 'last_7d',
          },
        },
        required: ['campaign_id'],
      },
    }
  },
  {
    type: 'function',
    function: {
      name: 'fb_get_adsets',
      description: 'Lista os conjuntos de anúncios (AdSets) do Meta.',
      parameters: {
        type: 'object',
        properties: {
          campaign_id: {
            type: 'string',
            description: 'ID da campanha (opcional)',
          },
        },
        required: [],
      },
    }
  },
  {
    type: 'function',
    function: {
      name: 'fb_create_campaign',
      description: 'Cria uma nova campanha Meta com estrutura simplificada 2025 (Advantage+).',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          objective: { type: 'string', default: 'OUTCOME_SALES' },
          status: { type: 'string', default: 'PAUSED' },
        },
        required: ['name'],
      },
    }
  },
  {
    type: 'function',
    function: {
      name: 'fb_pause_campaign',
      description: 'Pausa uma campanha Meta ativa.',
      parameters: {
        type: 'object',
        properties: {
          campaign_id: { type: 'string' },
        },
        required: ['campaign_id'],
      },
    }
  },

  // --- GOOGLE ADS TOOLS ---
  {
    type: 'function',
    function: {
      name: 'google_get_campaigns',
      description: 'Lista todas as campanhas da conta Google Ads.',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
    }
  },
  {
    type: 'function',
    function: {
      name: 'google_get_campaign_insights',
      description: 'Obtém métricas de uma campanha Google Ads.',
      parameters: {
        type: 'object',
        properties: {
          campaign_id: { type: 'string' },
          date_preset: { type: 'string', default: 'LAST_7_DAYS' }
        },
        required: ['campaign_id'],
      },
    }
  },
  {
    type: 'function',
    function: {
      name: 'google_create_campaign',
      description: 'Cria uma nova campanha Google Ads (Search, PMax, etc).',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          budget: { type: 'number', description: 'Orçamento diário' },
          type: { type: 'string', description: 'SEARCH ou PERFORMANCE_MAX', default: 'SEARCH' }
        },
        required: ['name', 'budget'],
      },
    }
  },
]

// Executor de ferramentas
export async function executeTool(
  toolName: string,
  input: Record<string, unknown>,
  config?: { facebook?: facebookApi.FacebookConfig, google?: googleApi.GoogleConfig }
): Promise<object> {
  try {
    // --- FACEBOOK HANDLERS ---
    if (toolName.startsWith('fb_')) {
        const fbConfig = config?.facebook
        if (!fbConfig) return { error: 'Configuração do Facebook não encontrada.' }

        switch (toolName) {
            case 'fb_get_ad_accounts':
                return await facebookApi.getAdAccounts(fbConfig)
            case 'fb_get_campaigns':
                return await facebookApi.getCampaigns(input.status as string | undefined, fbConfig)
            case 'fb_get_campaign_insights':
                return await facebookApi.getCampaignInsights(input.campaign_id as string, (input.date_preset as string) || 'last_7d', fbConfig)
            case 'fb_get_adsets':
                return await facebookApi.getAdSets(input.campaign_id as string | undefined, fbConfig)
            case 'fb_create_campaign':
                return await facebookApi.createCampaign(
                    input.name as string,
                    (input.objective as string) || 'OUTCOME_SALES',
                    (input.status as string) || 'PAUSED',
                    [],
                    fbConfig
                )
            case 'fb_pause_campaign':
                return await facebookApi.pauseCampaign(input.campaign_id as string, fbConfig)
            default:
                return { error: `Ferramenta Meta não encontrada: ${toolName}` }
        }
    }

    // --- GOOGLE HANDLERS ---
    if (toolName.startsWith('google_')) {
        const googleConfig = config?.google
        // For Mock, we don't strictly enforce config presence but usually we would

        switch(toolName) {
            case 'google_get_campaigns':
                return await googleApi.getCampaigns(googleConfig)
            case 'google_get_campaign_insights':
                return await googleApi.getCampaignInsights(
                    input.campaign_id as string,
                    input.date_preset as string || 'LAST_7_DAYS',
                    googleConfig
                )
            case 'google_create_campaign':
                return await googleApi.createCampaign(
                    input.name as string,
                    input.budget as number,
                    input.type as string || 'SEARCH',
                    googleConfig
                )
            default:
                return { error: `Ferramenta Google não encontrada: ${toolName}` }
        }
    }

    return { error: `Ferramenta não reconhecida: ${toolName}` }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    return { error: errorMessage }
  }
}
