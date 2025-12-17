import { z } from 'zod'

const SERPAPI_KEY = process.env.SERPAPI_API_KEY
const BASE_URL = 'https://serpapi.com/search.json'

// --- Interfaces based on SerpAPI Response ---

export interface TrendResult {
    query?: string
    value?: number | string
    extracted_value?: number
    link?: string
    date?: string
    timestamp?: string
}

export interface InterestOverTime {
    timeline_data: {
        date: string
        timestamp: string
        values: TrendResult[]
    }[]
}

export interface RelatedTopic {
    topic: {
        value: string
        title: string
        type: string
    }
    value: string
    extracted_value: number
    link: string
}

// --- Tool Functions ---

/**
 * Searches Google Trends for Interest Over Time
 */
export async function searchInterestOverTime(
    queries: string[],
    date: string = 'today 12-m',
    geo: string = ''
) {
    if (!SERPAPI_KEY) throw new Error("SERPAPI_API_KEY is not configured")

    const params = new URLSearchParams({
        engine: 'google_trends',
        api_key: SERPAPI_KEY,
        q: queries.join(','),
        data_type: 'TIMESERIES',
        date,
        geo
    })

    try {
        const res = await fetch(`${BASE_URL}?${params.toString()}`)
        if (!res.ok) throw new Error(`SerpAPI request failed: ${res.statusText}`)

        const data = await res.json()

        if (data.error) throw new Error(data.error)

        // Simplify output for the LLM
        if (data.interest_over_time?.timeline_data) {
             // Return simplified timeline (first and last few points + average/summary if possible)
             // or just the full timeline but mapped to save tokens
             return {
                 meta: data.search_metadata,
                 timeline: data.interest_over_time.timeline_data.map((t: any) => ({
                     date: t.date,
                     values: t.values.map((v: any) => `${v.query}: ${v.extracted_value}`)
                 }))
             }
        }

        return data

    } catch (error) {
        console.error("Trends Error:", error)
        return { error: error instanceof Error ? error.message : "Unknown error" }
    }
}

/**
 * Searches Related Topics/Queries
 */
export async function searchRelated(
    query: string,
    type: 'RELATED_TOPICS' | 'RELATED_QUERIES' = 'RELATED_TOPICS',
    date: string = 'today 12-m',
    geo: string = ''
) {
     if (!SERPAPI_KEY) throw new Error("SERPAPI_API_KEY is not configured")

    const params = new URLSearchParams({
        engine: 'google_trends',
        api_key: SERPAPI_KEY,
        q: query,
        data_type: type,
        date,
        geo
    })

    try {
        const res = await fetch(`${BASE_URL}?${params.toString()}`)
        if (!res.ok) throw new Error(`SerpAPI request failed: ${res.statusText}`)

        const data = await res.json()
        if (data.error) throw new Error(data.error)

        const key = type.toLowerCase()
        if (data[key]) {
            return {
                query,
                rising: data[key].rising?.slice(0, 10), // Limit to top 10 to save tokens
                top: data[key].top?.slice(0, 10)
            }
        }

        return data

    } catch (error) {
        console.error("Trends Related Error:", error)
        return { error: error instanceof Error ? error.message : "Unknown error" }
    }
}

/**
 * Search By Region (Geo Map)
 */
export async function searchGeoMap(
    queries: string[],
    date: string = 'today 12-m',
    geo: string = ''
) {
     if (!SERPAPI_KEY) throw new Error("SERPAPI_API_KEY is not configured")

    // If multiple queries -> GEO_MAP (Compared breakdown)
    // If single query -> GEO_MAP_0 (Interest by region)
    const dataType = queries.length > 1 ? 'GEO_MAP' : 'GEO_MAP_0'

    const params = new URLSearchParams({
        engine: 'google_trends',
        api_key: SERPAPI_KEY,
        q: queries.join(','),
        data_type: dataType,
        date,
        geo
    })

    try {
        const res = await fetch(`${BASE_URL}?${params.toString()}`)
        const data = await res.json()
        if (data.error) throw new Error(data.error)

        // simplify keys
        if (dataType === 'GEO_MAP' && data.compared_breakdown_by_region) {
            return data.compared_breakdown_by_region.slice(0, 20)
        }
        if (dataType === 'GEO_MAP_0' && data.interest_by_region) {
            return data.interest_by_region.slice(0, 20)
        }

        return data
    } catch(error) {
         console.error("Trends Geo Error:", error)
        return { error: error instanceof Error ? error.message : "Unknown error" }
    }
}
