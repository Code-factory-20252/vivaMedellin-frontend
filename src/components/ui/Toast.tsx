"use client"
import React from 'react'
import { Alert, AlertTitle, AlertDescription } from './alert'

type Notice = { id: string; title?: string; description?: string; variant?: 'default' | 'destructive' }

const AlertContext = React.createContext<{
  show: (n: Partial<Notice>) => void
}>({
  show: () => {},
})

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [notices, setNotices] = React.useState<Notice[]>([])

  function show(n: Partial<Notice>) {
    const id = String(Date.now())
    const title = n.title ?? ''
    const description = n.description ?? ''
    const variant = n.variant ?? 'default'

    // If an identical notice (title + description + variant) is already shown, skip to avoid duplicates
    if (notices.some((x) => (x.title ?? '') === title && (x.description ?? '') === description && (x.variant ?? 'default') === variant)) {
      return
    }

    setNotices((s) => [...s, { ...n, id } as Notice])
    setTimeout(() => {
      setNotices((s) => s.filter((x) => x.id !== id))
    }, 4000)
  }

  return (
    <AlertContext.Provider value={{ show }}>
      {children}
      <div aria-live="polite" className="fixed top-6 right-6 z-50 flex flex-col gap-2 w-full max-w-sm">
        {notices.map((n) => (
          <Alert key={n.id} variant={n.variant ?? 'default'}>
            {n.title && <AlertTitle>{n.title}</AlertTitle>}
            {n.description && <AlertDescription>{n.description}</AlertDescription>}
          </Alert>
        ))}
      </div>
    </AlertContext.Provider>
  )
}

export function useAlert() {
  const ctx = React.useContext(AlertContext)
  return ctx
}

export default AlertProvider
