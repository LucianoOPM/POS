/**
 * Tipos relacionados con la configuracion del sistema
 */

/** Configuracion individual */
export interface Setting {
  id: number;
  key: string;
  value: string;
  category: string;
  value_type: "string" | "number" | "boolean" | "json";
  label: string;
  description: string | null;
  is_sensitive: boolean;
  updated_at: string;
  updated_by: string | null;
}

/** Configuraciones agrupadas por categoria */
export interface SettingsByCategory {
  erp: Setting[];
  business: Setting[];
  sales: Setting[];
  inventory: Setting[];
  receipt: Setting[];
}

/** Categorias de configuracion disponibles */
export type SettingsCategory =
  | "erp"
  | "business"
  | "sales"
  | "inventory"
  | "receipt";

/** Informacion de categoria para UI */
export interface SettingsCategoryInfo {
  id: SettingsCategory;
  label: string;
  description: string;
  icon: string;
}

/** Request para actualizar una configuracion */
export interface UpdateSettingRequest {
  key: string;
  value: string;
  updated_by: string;
}

/** Request para actualizar multiples configuraciones */
export interface UpdateSettingsBatchRequest {
  settings: UpdateSettingRequest[];
}

/** Respuesta de actualizacion de configuraciones */
export interface UpdateSettingsResponse {
  updated_count: number;
  settings: Setting[];
}

/** Props para el componente SettingField */
export interface SettingFieldProps {
  setting: Setting;
  value: string;
  onChange: (key: string, value: string) => void;
  error?: string;
}
