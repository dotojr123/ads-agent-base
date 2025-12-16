/**
 * TOOLS - Definição e registro de ferramentas do agente
 */

import * as facebookApi from './facebook-api'

// Definição das ferramentas no formato OpenAI
export const tools = [
  {
    type: 'function',
    function: {
      name: 'get_ad_accounts',
      description: 'Lista todas as contas de anúncios acessíveis com o token atual. Use para verificar se o token está funcionando e quais contas estão disponíveis.',
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
      name: 'get_campaigns',
      description: 'Lista todas as campanhas da conta de anúncios. Pode filtrar por status (ACTIVE, PAUSED, etc).',
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
      name: 'get_campaign_insights',
      description: 'Obtém métricas detalhadas de uma campanha específica: impressões, cliques, gastos, CTR, CPC, CPM, conversões, etc.',
      parameters: {
        type: 'object',
        properties: {
          campaign_id: {
            type: 'string',
            description: 'ID da campanha para buscar insights',
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
      name: 'get_adsets',
      description: 'Lista os conjuntos de anúncios (AdSets). Pode filtrar por campanha específica.',
      parameters: {
        type: 'object',
        properties: {
          campaign_id: {
            type: 'string',
            description: 'ID da campanha para filtrar AdSets (opcional)',
          },
        },
        required: [],
      },
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_ads',
      description: 'Lista os anúncios. Pode filtrar por AdSet específico.',
      parameters: {
        type: 'object',
        properties: {
          adset_id: {
            type: 'string',
            description: 'ID do AdSet para filtrar anúncios (opcional)',
          },
        },
        required: [],
      },
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_ad_creatives',
      description: 'Lista os criativos (imagens/vídeos) disponíveis na conta para serem usados em anúncios.',
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
      name: 'create_campaign',
      description: 'Cria uma nova campanha. Por padrão cria como PAUSADA para revisão.',
      parameters: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Nome da campanha',
          },
          objective: {
            type: 'string',
            description: 'Objetivo: OUTCOME_SALES, OUTCOME_LEADS, OUTCOME_AWARENESS, OUTCOME_ENGAGEMENT, OUTCOME_TRAFFIC',
            default: 'OUTCOME_SALES',
          },
          status: {
            type: 'string',
            description: 'Status inicial: PAUSED ou ACTIVE',
            default: 'PAUSED',
          },
        },
        required: ['name'],
      },
    }
  },
  {
    type: 'function',
    function: {
      name: 'create_adset',
      description: 'Cria um novo conjunto de anúncios (AdSet) dentro de uma campanha.',
      parameters: {
        type: 'object',
        properties: {
          campaign_id: {
            type: 'string',
            description: 'ID da campanha onde criar o AdSet',
          },
          name: {
            type: 'string',
            description: 'Nome do AdSet',
          },
          daily_budget: {
            type: 'number',
            description: 'Orçamento diário em reais (ex: 50 para R$ 50)',
          },
          optimization_goal: {
            type: 'string',
            description: 'Objetivo de otimização: OFFSITE_CONVERSIONS, LINK_CLICKS, IMPRESSIONS, REACH',
            default: 'OFFSITE_CONVERSIONS',
          },
        },
        required: ['campaign_id', 'name', 'daily_budget'],
      },
    }
  },
  {
    type: 'function',
    function: {
      name: 'create_ad',
      description: 'Cria um novo anúncio (Ad) dentro de um AdSet. Requer um creative_id existente.',
      parameters: {
        type: 'object',
        properties: {
          adset_id: {
            type: 'string',
            description: 'ID do AdSet onde criar o anúncio',
          },
          name: {
            type: 'string',
            description: 'Nome do anúncio',
          },
          creative_id: {
            type: 'string',
            description: 'ID do criativo (imagem/vídeo) para usar no anúncio. Use get_ad_creatives para encontrar.',
          },
          status: {
            type: 'string',
            description: 'Status: PAUSED ou ACTIVE',
            default: 'PAUSED',
          },
        },
        required: ['adset_id', 'name', 'creative_id'],
      },
    }
  },
  {
    type: 'function',
    function: {
      name: 'pause_campaign',
      description: 'Pausa uma campanha ativa.',
      parameters: {
        type: 'object',
        properties: {
          campaign_id: {
            type: 'string',
            description: 'ID da campanha para pausar',
          },
        },
        required: ['campaign_id'],
      },
    }
  },
  {
    type: 'function',
    function: {
      name: 'activate_campaign',
      description: 'Ativa uma campanha pausada.',
      parameters: {
        type: 'object',
        properties: {
          campaign_id: {
            type: 'string',
            description: 'ID da campanha para ativar',
          },
        },
        required: ['campaign_id'],
      },
    }
  },
  {
    type: 'function',
    function: {
      name: 'update_budget',
      description: 'Atualiza o orçamento diário de uma campanha ou AdSet.',
      parameters: {
        type: 'object',
        properties: {
          entity_id: {
            type: 'string',
            description: 'ID da campanha ou AdSet',
          },
          daily_budget: {
            type: 'number',
            description: 'Novo orçamento diário em reais',
          },
          entity_type: {
            type: 'string',
            description: 'Tipo: campaign ou adset',
            default: 'adset',
          },
        },
        required: ['entity_id', 'daily_budget'],
      },
    }
  },
]

// Executor de ferramentas
export async function executeTool(
  toolName: string,
  input: Record<string, unknown>,
  config?: facebookApi.FacebookConfig
): Promise<object> {
  try {
    switch (toolName) {
      case 'get_ad_accounts':
        return await facebookApi.getAdAccounts(config)

      case 'get_campaigns':
        return await facebookApi.getCampaigns(input.status as string | undefined, config)

      case 'get_campaign_insights':
        return await facebookApi.getCampaignInsights(
          input.campaign_id as string,
          (input.date_preset as string) || 'last_7d',
          config
        )

      case 'get_adsets':
        return await facebookApi.getAdSets(input.campaign_id as string | undefined, config)

      case 'get_ads':
        return await facebookApi.getAds(input.adset_id as string | undefined, config)

      case 'get_ad_creatives':
        return await facebookApi.getAdCreatives(config)

      case 'create_campaign':
        return await facebookApi.createCampaign(
          input.name as string,
          (input.objective as string) || 'OUTCOME_SALES',
          (input.status as string) || 'PAUSED',
          [], // specialAdCategories default
          config
        )

      case 'create_adset':
        return await facebookApi.createAdSet(
          input.campaign_id as string,
          input.name as string,
          input.daily_budget as number,
          (input.optimization_goal as string) || 'OFFSITE_CONVERSIONS',
          'IMPRESSIONS', // billingEvent default
          {}, // targeting default
          config
        )

      case 'create_ad':
        return await facebookApi.createAd(
          input.adset_id as string,
          input.name as string,
          input.creative_id as string,
          (input.status as string) || 'PAUSED',
          config
        )

      case 'pause_campaign':
        return await facebookApi.pauseCampaign(input.campaign_id as string, config)

      case 'activate_campaign':
        return await facebookApi.activateCampaign(input.campaign_id as string, config)

      case 'update_budget':
        return await facebookApi.updateBudget(
          input.entity_id as string,
          input.daily_budget as number,
          (input.entity_type as 'campaign' | 'adset') || 'adset',
          config
        )

      default:
        return { error: `Ferramenta não encontrada: ${toolName}` }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    return { error: errorMessage }
  }
}
