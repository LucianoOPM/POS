import { useState, useMemo } from "preact/hooks";
import { Save } from "lucide-preact";
import { settingsActions } from "@/actions/settings";
import { useAuthStore } from "@/store/authStore";
import SettingField from "../components/SettingField";
import type { Setting, UpdateSettingRequest } from "@/types";

interface Props {
  settings: Setting[];
  onUpdate: () => void;
}

export default function InventorySettings({ settings, onUpdate }: Props) {
  const { session } = useAuthStore();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const initialValues = useMemo(() => {
    const values: Record<string, string> = {};
    settings.forEach((s) => {
      values[s.key] = s.value;
    });
    return values;
  }, [settings]);

  const [formValues, setFormValues] =
    useState<Record<string, string>>(initialValues);

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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">
          Configuracion de Inventario
        </h2>
        <p className="text-sm text-gray-500">Alertas y umbrales de stock</p>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {settings.map((setting) => (
            <SettingField
              key={setting.key}
              setting={setting}
              value={formValues[setting.key] || ""}
              onChange={handleChange}
            />
          ))}
        </div>
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
