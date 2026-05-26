import { Eye, EyeOff } from "lucide-preact";
import { useState } from "preact/hooks";
import type { SettingFieldProps } from "@/types";

export default function SettingField({
  setting,
  value,
  onChange,
  error,
}: SettingFieldProps) {
  const [showSensitive, setShowSensitive] = useState(false);

  const renderInput = () => {
    switch (setting.value_type) {
      case "boolean":
        return (
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={value === "true"}
              onChange={(e) =>
                onChange(
                  setting.key,
                  e.currentTarget.checked ? "true" : "false"
                )
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
          </label>
        );

      case "number":
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(setting.key, e.currentTarget.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
            step={setting.key.includes("tax") ? "0.01" : "1"}
          />
        );

      default:
        if (setting.is_sensitive) {
          return (
            <div className="relative">
              <input
                type={showSensitive ? "text" : "password"}
                value={value}
                onChange={(e) => onChange(setting.key, e.currentTarget.value)}
                className="w-full p-2 pr-10 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                placeholder={setting.is_sensitive ? "********" : ""}
              />
              <button
                type="button"
                onClick={() => setShowSensitive(!showSensitive)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showSensitive ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          );
        }

        // Multi-line for longer text fields
        if (
          setting.key.includes("footer") ||
          setting.key.includes("message") ||
          setting.key.includes("address")
        ) {
          return (
            <textarea
              value={value}
              onChange={(e) => onChange(setting.key, e.currentTarget.value)}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none resize-none"
            />
          );
        }

        return (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(setting.key, e.currentTarget.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
          />
        );
    }
  };

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {setting.label}
      </label>
      {setting.description && (
        <p className="text-xs text-gray-500">{setting.description}</p>
      )}
      <div className="mt-1">{renderInput()}</div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
