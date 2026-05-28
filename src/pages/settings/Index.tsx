import { useState } from "preact/hooks";
import useSWR from "swr";
import { settingsActions } from "@/actions/settings";
import type { SettingsByCategory, SettingsCategory } from "@/types";
import SettingsTabs from "./components/SettingsTabs";
import SettingsHeader from "./components/SettingsHeader";
import ErpSettings from "./views/ErpSettings";
import BusinessSettings from "./views/BusinessSettings";
import SalesSettings from "./views/SalesSettings";
import InventorySettings from "./views/InventorySettings";
import ReceiptSettings from "./views/ReceiptSettings";

export default function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsCategory>("business");

  const { data, mutate, isLoading } = useSWR<SettingsByCategory>(
    "settings",
    () => settingsActions.getSettings()
  );

  const renderTabContent = () => {
    if (isLoading || !data) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }

    switch (activeTab) {
      case "erp":
        return <ErpSettings settings={data.erp} onUpdate={mutate} />;
      case "business":
        return <BusinessSettings settings={data.business} onUpdate={mutate} />;
      case "sales":
        return <SalesSettings settings={data.sales} onUpdate={mutate} />;
      case "inventory":
        return (
          <InventorySettings settings={data.inventory} onUpdate={mutate} />
        );
      case "receipt":
        return <ReceiptSettings settings={data.receipt} onUpdate={mutate} />;
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50">
      <SettingsHeader />

      <div className="flex-1 flex min-h-0">
        {/* Sidebar Tabs */}
        <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-y-auto">{renderTabContent()}</div>
      </div>
    </div>
  );
}
