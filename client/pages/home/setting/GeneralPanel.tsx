import React, { useState } from "react";
import { Server, Settings, Globe, Power, Save } from "lucide-react";
import { CurrentUser } from "../../../constants";
import { UserRole } from "../../../types";

export const GeneralPanel: React.FC = () => {
  const [systemName, setSystemName] = useState("LineUp Chat Workspace");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [language, setLanguage] = useState("en-US");
  const [timezone, setTimezone] = useState("UTC");
  const [isDirty, setIsDirty] = useState(false);

  const isMaster = CurrentUser.role === UserRole.MASTER;

  const handleChange = (setter: any, value: any) => {
    setter(value);
    setIsDirty(true);
  };

  const handleSave = () => {
    setIsDirty(false);
    // Logic to persist settings
  };

  if (CurrentUser.role === UserRole.USER) {
    return (
      <div className="h-full flex items-center justify-center p-8 text-center">
        <div className="bg-surface border border-border p-8 rounded-2xl shadow-xl max-w-md">
          <Settings size={48} className="text-secondary mx-auto mb-4" />
          <h3 className="text-xl font-bold text-text-main mb-2">
            Restricted Access
          </h3>
          <p className="text-secondary">
            You do not have permission to view or modify general system
            settings. Please contact an administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 mx-auto space-y-8 pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-text-main mb-2 tracking-tight">
            General Settings
          </h2>
          <p className="text-secondary">
            Basic configuration for the workspace environment.
          </p>
        </div>
        {isDirty && (
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/25 flex items-center gap-2 hover:bg-primary/90 transition-all animate-in zoom-in hover:-translate-y-0.5"
          >
            <Save size={18} />
            Save Changes
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* System Identity */}
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm md:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-500">
              <Server size={22} />
            </div>
            <h3 className="font-bold text-lg text-text-main">
              Workspace Identity
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">
                Workspace Name
              </label>
              <input
                type="text"
                value={systemName}
                onChange={(e) => handleChange(setSystemName, e.target.value)}
                disabled={!isMaster}
                className="w-full bg-input border border-border rounded-xl px-4 py-3 focus:border-primary focus:outline-none disabled:opacity-50 text-text-main font-medium transition-all focus:ring-4 focus:ring-primary/10"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">
                Support Email
              </label>
              <input
                type="email"
                defaultValue="support@lineup24x7.com"
                disabled={!isMaster}
                className="w-full bg-input border border-border rounded-xl px-4 py-3 focus:border-primary focus:outline-none disabled:opacity-50 text-text-main font-medium transition-all focus:ring-4 focus:ring-primary/10"
              />
            </div>
          </div>
        </div>

        {/* Localization */}
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-500">
              <Globe size={22} />
            </div>
            <h3 className="font-bold text-lg text-text-main">Localization</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">
                System Language
              </label>
              <div className="relative">
                <select
                  value={language}
                  onChange={(e) => handleChange(setLanguage, e.target.value)}
                  className="w-full bg-input border border-border rounded-xl px-4 py-3 focus:border-primary focus:outline-none appearance-none text-text-main font-medium cursor-pointer transition-all"
                >
                  <option value="en-US">English (United States)</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-secondary">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">
                Default Timezone
              </label>
              <div className="relative">
                <select
                  value={timezone}
                  onChange={(e) => handleChange(setTimezone, e.target.value)}
                  className="w-full bg-input border border-border rounded-xl px-4 py-3 focus:border-primary focus:outline-none appearance-none text-text-main font-medium cursor-pointer transition-all"
                >
                  <option value="UTC">UTC (Coordinated Universal Time)</option>
                  <option value="EST">EST (Eastern Standard Time)</option>
                  <option value="PST">PST (Pacific Standard Time)</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-secondary">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System State */}
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-red-500/10 rounded-xl text-red-500">
              <Power size={22} />
            </div>
            <h3 className="font-bold text-lg text-text-main">System State</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-surface-hover rounded-xl border border-border transition-colors hover:border-red-500/30">
              <div>
                <p className="font-bold text-text-main">Maintenance Mode</p>
                <p className="text-xs text-secondary mt-1">
                  Prevents non-admin logins.
                </p>
              </div>
              <button
                onClick={() =>
                  isMaster && handleChange(setMaintenanceMode, !maintenanceMode)
                }
                disabled={!isMaster}
                className={`w-14 h-8 rounded-full transition-all duration-300 relative ${maintenanceMode ? "bg-primary shadow-lg shadow-primary/30" : "bg-input border border-border"} ${!isMaster ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <div
                  className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-sm transition-all duration-300 ${maintenanceMode ? "left-7" : "left-1"}`}
                ></div>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/10 text-xs text-secondary leading-relaxed flex gap-3">
              <Settings className="text-orange-500 shrink-0" size={16} />
              <span>
                <span className="font-bold text-orange-500">Caution:</span>{" "}
                Enabling maintenance mode will disconnect all active WebSocket
                connections for standard users immediately.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
