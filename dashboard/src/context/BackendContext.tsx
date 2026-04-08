import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { BACKENDS, setBackend, type BackendKey } from '../api/client'

interface BackendContextValue {
  current:  BackendKey
  label:    string
  switchTo: (key: BackendKey) => void
}

const BackendContext = createContext<BackendContextValue>({
  current:  'csharp',
  label:    BACKENDS.csharp.label,
  switchTo: () => {},
})

export function BackendProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<BackendKey>(() => {
    // Persist last-used backend across page reloads
    return (localStorage.getItem('backend') as BackendKey) ?? 'csharp'
  })

  const switchTo = useCallback((key: BackendKey) => {
    setBackend(key)
    setCurrent(key)
    localStorage.setItem('backend', key)
    // Reload so all hooks re-fetch from the new backend
    window.location.reload()
  }, [])

  return (
    <BackendContext.Provider value={{ current, label: BACKENDS[current].label, switchTo }}>
      {children}
    </BackendContext.Provider>
  )
}

export const useBackend = () => useContext(BackendContext)
