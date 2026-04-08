import axios from 'axios'

// baseURL is set dynamically via setBackend() — see BackendContext
export const client = axios.create({
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
})

client.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('[API]', err.response?.status, err.config?.url)
    return Promise.reject(err)
  }
)

export const BACKENDS = {
  csharp: { label: 'C# ASP.NET Core', url: 'http://localhost:5000' },
  python: { label: 'Python FastAPI',  url: 'http://localhost:8000' },
} as const

export type BackendKey = keyof typeof BACKENDS

export function setBackend(key: BackendKey) {
  client.defaults.baseURL = BACKENDS[key].url
}

// Default to C# on load
setBackend('csharp')

export default client
