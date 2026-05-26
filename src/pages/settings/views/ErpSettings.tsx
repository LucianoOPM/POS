import { useState, useMemo } from "preact/hooks";
import { Save, RefreshCw, Wifi, WifiOff } from "lucide-preact";
import { settingsActions } from "@/actions/settings";
import { useAuthStore } from "@/store/authStore";
import SettingField from "../components/SettingField";
import type { Setting, UpdateSettingRequest } from "@/types";

interface Props {
  settings: Setting[];
  onUpdate: () => void;
}

export default function ErpSettings({ settings, onUpdate }: Props) {
  const { session } = useAuthStore();
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "unknown" | "connected" | "disconnected"
  >("unknown");

  const initialValues = useMemo(() => {
    const values: Record<string, string> = {};
    settings.forEach((s) => {
      values[s.key] = s.value;
    });
    return values;
  }, [settings]);

  const [formValues, setFormValues] =
    useState<Record<string, string>>(initialValues);

  const isEnabled = formValues["erp.enabled"] === "true";
  const lastSync = settings.find((s) => s.key === "erp.last_sync")?.value;

  const handleChange = (key: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const changedSettings: UpdateSettingRequest[] = [];

      for (const [key, value] of Object.entries(formValues)) {
        const original = settings.find((s) => s.key === key);
        if (original && original.value !== value) {
          changedSettings.push({
            key,
            value,
            updated_by: session?.user_id || "",
          });
        }
      }

      if (changedSettings.length > 0) {
        await settingsActions.updateSettingsBatch({ settings: changedSettings });
        onUpdate();
        setSaveSuccess(true);
      }
    } catch (error) {
      setSaveError(
        typeof error === "string" ? error : "Error al guardar configuracion"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setConnectionStatus("unknown");
    try {
      const result = await settingsActions.testErpConnection();
      setConnectionStatus(result ? "connected" : "disconnected");
    } catch {
      setConnectionStatus("disconnected");
    } finally {
      setIsTesting(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await settingsActions.triggerErpSync();
      onUpdate();
    } catch (error) {
      setSaveError(
        typeof error === "string" ? error : "Error al sincronizar con ERP"
      );
    } finally {
      setIsSyncing(false);
    }
  };

  // Filter out last_sync from editable settings
  const editableSettings = settings.filter((s) => s.key !== "erp.last_sync");

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Integracion ERP
            </h2>
            <p className="text-sm text-gray-500">
              Conexion con sistema ERP externo
            </p>
          </div>
          {isEnabled && (
            <div className="flex items-center gap-2">
              {connectionStatus === "connected" && (
                <span className="flex items-center gap-1 text-sm text-green-600">
                  <Wifi size={16} />
                  Conectado
                </span>
              )}
              {connectionStatus === "disconnected" && (
                <span className="flex items-center gap-1 text-sm text-red-600">
                  <WifiOff size={16} />
                  Desconectado
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {saveError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{saveError}</p>
          </div>
        )}

        {saveSuccess && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-600">
              Configuracion guardada exitosamente
            </p>
          </div>
        )}

        {/* ERP Status Card */}
        {isEnabled && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">
                  Estado de Sincronizacion
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {lastSync
                    ? `Ultima sincronizacion: ${lastSync}`
                    : "Sin sincronizaciones previas"}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 disabled:opacity-50"
                >
                  {isTesting ? (
                    <span className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Wifi size={14} />
                  )}
                  Probar
                </button>
                <button
                  onClick={handleSync}
                  disabled={isSyncing}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSyncing ? (
                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <RefreshCw size={14} />
                  )}
                  Sincronizar
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {editableSettings.map((setting) => (
            <SettingField
              key={setting.key}
              setting={setting}
              value={formValues[setting.key] || ""}
              onChange={handleChange}
            />
          ))}
        </div>

        {!isEnabled && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-700">
              La integracion ERP esta deshabilitada. Activa el interruptor
              "Habilitar ERP" para configurar la conexion.
            </p>
          </div>
        )}
      </div>

      <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSaving ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save size={18} />
              Guardar Cambios
            </>
          )}
        </button>
      </div>
    </div>
  );
}
