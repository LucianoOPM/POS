import { useState, useEffect } from "preact/hooks";
import useSWR from "swr";
import { printingActions } from "@/actions/printing";
import type { PrinterConfig } from "@/types";

const ADAPTER_OPTIONS = [
  { value: "console", label: "Consola (muestra en terminal, para desarrollo)" },
  { value: "preview", label: "Preview (solo historial, sin imprimir)" },
  { value: "tcp", label: "TCP ESC/POS (impresora de red)" },
];

const WIDTH_OPTIONS = [
  { value: 32, label: "32 caracteres (papel estrecho)" },
  { value: 40, label: "40 caracteres (estándar 80mm)" },
  { value: 48, label: "48 caracteres (papel ancho)" },
];

export default function PrinterConfigForm() {
  const { data: config, mutate } = useSWR("printer_config", () =>
    printingActions.getPrinterConfig()
  );

  const [form, setForm] = useState<PrinterConfig>({
    adapter_type: "console",
    paper_width: 40,
    tcp_host: "",
    tcp_port: 9100,
    business_name: "Mi Negocio",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ text: string; ok: boolean } | null>(null);

  useEffect(() => {
    if (config) setForm(config);
  }, [config]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMsg(null);
    try {
      await printingActions.configurePrinter(form);
      await mutate();
      setSaveMsg({ text: "Configuración guardada correctamente.", ok: true });
    } catch {
      setSaveMsg({ text: "Error al guardar la configuración.", ok: false });
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMsg(null), 3000);
    }
  };

  return (
    <div className="max-w-lg space-y-5 py-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre del negocio
        </label>
        <input
          type="text"
          value={form.business_name}
          onInput={(e) =>
            setForm({ ...form, business_name: (e.target as HTMLInputElement).value })
          }
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Mi Negocio"
        />
        <p className="text-xs text-gray-400 mt-1">Aparece en el encabezado del ticket.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Adaptador</label>
        <select
          value={form.adapter_type}
          onChange={(e) =>
            setForm({
              ...form,
              adapter_type: (e.target as HTMLSelectElement).value as PrinterConfig["adapter_type"],
            })
          }
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {ADAPTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ancho del papel
        </label>
        <select
          value={form.paper_width}
          onChange={(e) =>
            setForm({ ...form, paper_width: Number((e.target as HTMLSelectElement).value) })
          }
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {WIDTH_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {form.adapter_type === "tcp" && (
        <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Host</label>
            <input
              type="text"
              placeholder="192.168.1.100"
              value={form.tcp_host ?? ""}
              onInput={(e) =>
                setForm({ ...form, tcp_host: (e.target as HTMLInputElement).value })
              }
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Puerto</label>
            <input
              type="number"
              placeholder="9100"
              value={form.tcp_port ?? 9100}
              onInput={(e) =>
                setForm({
                  ...form,
                  tcp_port: Number((e.target as HTMLInputElement).value) || 9100,
                })
              }
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            />
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 pt-2">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-5 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSaving ? "Guardando…" : "Guardar configuración"}
        </button>
        {saveMsg && (
          <p className={`text-sm ${saveMsg.ok ? "text-green-600" : "text-red-500"}`}>
            {saveMsg.text}
          </p>
        )}
      </div>
    </div>
  );
}
