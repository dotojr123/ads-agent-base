export default function SettingsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Configurações</h1>
      <div className="bg-gray-900 border border-gray-800 p-6 rounded">
        <h2 className="font-bold mb-4">Canais de Alerta</h2>
        <div className="space-y-2">
            <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked /> Email
            </label>
            <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked /> In-App Notification
            </label>
        </div>
      </div>
    </div>
  )
}
