'use client'

import { useState, useEffect } from 'react'

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/alerts').then(res => res.json()).then(setAlerts)
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Alertas</h1>
      <div className="space-y-4">
        {alerts.map(alert => (
            <div key={alert.id} className="bg-gray-900 border border-gray-800 p-4 rounded-lg flex gap-4">
                <div className={`w-1 bg-${alert.alertType === 'CRITICAL' ? 'red' : 'yellow'}-500 rounded`}></div>
                <div>
                    <h3 className="font-bold">{alert.message}</h3>
                    <p className="text-xs text-gray-500">{new Date(alert.triggeredAt).toLocaleString()}</p>
                    {alert.metadata && (
                        <pre className="mt-2 text-xs bg-black/30 p-2 rounded text-gray-400">
                            {JSON.stringify(alert.metadata, null, 2)}
                        </pre>
                    )}
                </div>
            </div>
        ))}
        {alerts.length === 0 && <div className="text-gray-500 text-center">Nenhum alerta.</div>}
      </div>
    </div>
  )
}
