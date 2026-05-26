import { Settings as SettingsIcon } from "lucide-preact";

export default function SettingsHeader() {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary-100 rounded-lg">
          <SettingsIcon className="text-primary-600" size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Configuracion</h1>
          <p className="text-sm text-gray-500">
            Administra la configuracion del sistema
          </p>
        </div>
      </div>
    </div>
  );
}
