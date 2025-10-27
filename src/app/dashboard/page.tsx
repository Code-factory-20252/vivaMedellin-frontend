import React from 'react'
import DashboardAlert from '@/components/ui/DashboardAlert'

export default function Dashboard() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4">Panel de control</h1>
      <p className="text-gray-700">Bienvenido al panel. Aquí irán tus widgets y métricas.</p>
      <div className="mt-6 w-full max-w-2xl p-4 bg-white rounded shadow">
        <p className="text-sm text-gray-500">Contenido de ejemplo: este es un dashboard genérico.</p>
      </div>
      {/* client-only alert handler reads search params in the browser */}
      <React.Suspense fallback={null}>
        <DashboardAlert />
      </React.Suspense>
    </main>
  )
}
