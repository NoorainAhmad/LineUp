import React from "react";
import { DashboardPanel } from "./DashboardPanel";
import { LogsPanel } from "./LogsPanel";
import { BackupPanel } from "./BackupPanel";
import { SecurityPanel } from "./SecurityPanel";
import { GeneralPanel } from "./GeneralPanel";
import { AlertTriangle, ArrowLeft } from "lucide-react";

interface SettingsViewProps {
  activeCategory: string;
  onBack: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  activeCategory,
  onBack,
}) => {
  const renderContent = () => {
    switch (activeCategory) {
      case "system-dashboard":
        return <DashboardPanel />;
      case "system-logs":
        return <LogsPanel />;
      case "system-backups":
        return <BackupPanel />;
      case "system-security":
        return <SecurityPanel />;
      case "system-general":
        return <GeneralPanel />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-50">
            <div className="w-20 h-20 bg-surface-hover rounded-full flex items-center justify-center mb-4">
              <AlertTriangle size={40} className="text-yellow-500" />
            </div>
            <h2 className="text-2xl font-bold text-text-main">
              Module Unavailable
            </h2>
            <p className="text-secondary max-w-sm mx-auto mt-2">
              This configuration module is currently being updated or does not
              exist.
            </p>
          </div>
        );
    }
  };

  const getTitle = () => {
    switch (activeCategory) {
      case "system-dashboard":
        return "System Dashboard";
      case "system-logs":
        return "System Logs";
      case "system-backups":
        return "Backups & Recovery";
      case "system-security":
        return "Security Protocols";
      case "system-general":
        return "General Settings";
      default:
        return "Settings";
    }
  };

  return (
    <div className="flex-1 h-full bg-background overflow-hidden flex flex-col relative animate-in fade-in duration-300">
      {/* Mobile Header */}
      <div className="md:hidden h-20 flex items-center px-6 bg-surface border-b border-border z-20 shrink-0 sticky top-0">
        <button
          onClick={onBack}
          className="p-2 -ml-2 text-secondary hover:text-text-main hover:bg-surface-hover rounded-full transition-colors mr-2"
        >
          <ArrowLeft size={22} />
        </button>
        <span className="font-bold text-lg text-text-main truncate">
          {getTitle()}
        </span>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {renderContent()}
      </div>
    </div>
  );
};
