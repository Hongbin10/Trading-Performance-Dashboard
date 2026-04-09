// Demo client — reads pre-generated static JSON files instead of a live backend.
// Drop this file into demo/src/api/client.ts

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '') + '/data'

// Map API routes → static JSON files
const ROUTE_MAP: [RegExp, string][] = [
  [/\/api\/strategies\/metrics-with-equity/, '/metrics.json'],
  [/\/api\/strategies\/\d+\/metrics/,        '/metrics.json'],   // filtered client-side
  [/\/api\/strategies/,                      '/strategies.json'],
  [/\/api\/trades\/date-range/,              '/date-range.json'],
  [/\/api\/trades/,                          '/trades.json'],
  [/\/api\/performance\/equity-curve/,       '/equity-curves.json'],
  [/\/api\/performance\/asset-breakdown/,    '/asset-breakdown.json'],
  [/\/api\/performance\/monthly/,            '/monthly-pnl.json'],
]

function resolveFile(url: string): string {
  for (const [pattern, file] of ROUTE_MAP) {
    if (pattern.test(url)) return BASE + file
  }
  throw new Error(`[Demo] No static file mapped for: ${url}`)
}

// ── Filtering helpers ──────────────────────────────────────────────────────────
function parseParams(url: string): URLSearchParams {
  const idx = url.indexOf('?')
  return new URLSearchParams(idx >= 0 ? url.slice(idx + 1) : '')
}

function applyFilters(data: any[], url: string): any[] {
  const p = parseParams(url)

  // Trades filtering
  if (/\/api\/trades/.test(url) && !/date-range/.test(url)) {
    let rows = data
    const strategy  = p.get('strategy')
    const assetClass = p.get('assetClass')
    const direction  = p.get('direction')
    const dateFrom   = p.get('dateFrom')
    const dateTo     = p.get('dateTo')
    const page       = parseInt(p.get('page') ?? '1')
    const pageSize   = parseInt(p.get('pageSize') ?? '50')

    if (strategy)   rows = rows.filter((r: any) => r.strategy   === strategy)
    if (assetClass) rows = rows.filter((r: any) => r.assetClass === assetClass)
    if (direction)  rows = rows.filter((r: any) => r.direction  === direction)
    if (dateFrom)   rows = rows.filter((r: any) => r.tradeDate  >= dateFrom)
    if (dateTo)     rows = rows.filter((r: any) => r.tradeDate  <= dateTo)

    const totalCount = rows.length
    const start = (page - 1) * pageSize
    return [{
      items:      rows.slice(start, start + pageSize),
      totalCount,
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
    }]
  }

  // Equity curves + monthly + asset breakdown — filter by strategy
  if (/\/api\/performance/.test(url)) {
    const strategy = p.get('strategy')
    if (strategy) return data.filter((r: any) => r.strategy === strategy)
  }

  // Single strategy metrics
  if (/\/api\/strategies\/\d+\/metrics/.test(url)) {
    const id = parseInt(url.match(/\/api\/strategies\/(\d+)\/metrics/)![1])
    return data.filter((r: any) => r.strategyId === id)
  }

  return data
}

// ── Axios-compatible client object ─────────────────────────────────────────────
const demoClient = {
  get: async <T = any>(url: string, _config?: any): Promise<{ data: T }> => {
    const file = resolveFile(url)
    const res  = await fetch(file)
    if (!res.ok) throw new Error(`[Demo] Failed to fetch ${file}: ${res.status}`)
    const raw  = await res.json()

    // Wrap single objects in array for uniform filtering
    const arr = Array.isArray(raw) ? raw : [raw]
    const filtered = applyFilters(arr, url)

    // Trades returns a wrapped paged result
    if (/\/api\/trades/.test(url) && !/date-range/.test(url)) {
      return { data: filtered[0] as T }
    }

    // Single-item endpoints
    if (/\/api\/strategies\/\d+\/metrics/.test(url)) {
      return { data: (filtered[0] ?? null) as T }
    }

    return { data: (Array.isArray(raw) ? filtered : filtered[0]) as T }
  },
}

// ── Stubs to keep BackendContext happy ─────────────────────────────────────────
export const BACKENDS = {
  csharp: { label: 'C# ASP.NET Core', url: '' },
  python: { label: 'Python FastAPI',  url: '' },
}

export type BackendKey = keyof typeof BACKENDS
export function setBackend(_key: BackendKey) {}

export const client = demoClient
export default demoClient
