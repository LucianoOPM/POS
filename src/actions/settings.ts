import { invoke } from "@tauri-apps/api/core";
import type {
  SettingsByCategory,
  Setting,
  UpdateSettingRequest,
  UpdateSettingsBatchRequest,
  UpdateSettingsResponse,
} from "@/types";

export const settingsActions = {
  /** Get all settings grouped by category */
  getSettings: async (): Promise<SettingsByCategory> => {
    return await invoke<SettingsByCategory>("get_settings");
  },

  /** Get settings for a specific category */
  getSettingsByCategory: async (category: string): Promise<Setting[]> => {
    return await invoke<Setting[]>("get_settings_by_category", { category });
  },

  /** Get a single setting by key */
  getSetting: async (key: string): Promise<Setting> => {
    return await invoke<Setting>("get_setting", { key });
  },

  /** Update a single setting */
  updateSetting: async (data: UpdateSettingRequest): Promise<Setting> => {
    return await invoke<Setting>("update_setting", { data });
  },

  /** Update multiple settings at once */
  updateSettingsBatch: async (
    data: UpdateSettingsBatchRequest
  ): Promise<UpdateSettingsResponse> => {
    return await invoke<UpdateSettingsResponse>("update_settings_batch", {
      data,
    });
  },

  /** Test ERP connection */
  testErpConnection: async (): Promise<boolean> => {
    return await invoke<boolean>("test_erp_connection");
  },

  /** Trigger manual ERP sync */
  triggerErpSync: async (): Promise<string> => {
    return await invoke<string>("trigger_erp_sync");
  },
};
