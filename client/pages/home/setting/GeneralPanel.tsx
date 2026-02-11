import React, { useEffect, useState } from "react";
import { Server, Settings, Globe, Power, Save, Building } from "lucide-react";
import { User, UserRole, System } from "../../../types";
import { useAuth } from "@/contexts/AuthContext";
import { SystemService } from "@/services/system.service";
import { UserService } from "@/services/user.service";

export const GeneralPanel: React.FC = () => {
  const { user: CurrentUser } = useAuth();

  // State management for all system settings - USING ONLY YOUR VARIABLES
  const [allBranches, setAllBranches] = useState<User[]>([]);
  const [activeBranch, setActiveBranch] = useState<User | null>(null);
  const [activeBranchId, setActiveBranchId] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [systemVersion, setSystemVersion] = useState("");
  const [systemEmail, setSystemEmail] = useState("");
  const [systemPhone, setSystemPhone] = useState("");
  const [systemTimezone, setSystemTimezone] = useState("");
  const [systemLanguage, setSystemLanguage] = useState("");
  const [systemMaintenance, setSystemMaintenance] = useState(false);

  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const response = await SystemService.getSystemSettings();
      if (response) {
        setAllBranches(response.allBranches || []);
        setActiveBranch(response.activeBranch);
        setActiveBranchId(response.activeBranchId || "");
        setWorkspaceName(response.workspaceName || "LineUp Workspace");
        setSystemEmail(response.systemEmail || "support@lineup24x7.com");
        setSystemPhone(response.systemPhone || "+1 (555) 123-4567");
        setSystemTimezone(response.systemTimezone || "UTC");
        setSystemLanguage(response.systemLanguage || "en-US");
        setSystemMaintenance(response.systemMaintenance || false);
        setSystemVersion(response.systemVersion || "v1.0.0");
      }
    } catch (error) {
      console.error("Error fetching system settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const users = await UserService.getAllUsers();
      if (users) {
        setAllBranches(
          users?.filter((user) => user.role === UserRole.BRANCH) || [],
        );
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
    }
  };

  const saveSettings = async () => {
    setIsLoading(true);
    setSaveSuccess(false);
    try {
      const systemPayload = {
        activeBranchId,
        workspaceName,
        systemVersion,
        systemEmail,
        systemPhone,
        systemTimezone,
        systemLanguage,
        systemMaintenance,
      };

      const response = await SystemService.updateSystemSettings(systemPayload);

      if (response) {
        setSaveSuccess(true);
        setIsDirty(false);
        fetchSettings();
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Error saving system settings:", error);
      alert("Failed to save settings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchBranches();
  }, []);

  const isDeveloper = CurrentUser?.role === UserRole.DEVELOPER;

  const handleChange = (setter: any, value: any) => {
    setter(value);
    setIsDirty(true);
  };

  if (!isDeveloper) {
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
    <div className="p-4 md:p-8 mx-auto space-y-8 pb-24 relative">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-50 rounded-2xl">
          <div className="bg-surface p-6 rounded-2xl shadow-2xl flex items-center gap-4">
            <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-text-main font-medium">
              Loading settings...
            </span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-text-main mb-2 tracking-tight">
            General Settings
          </h2>
          <p className="text-secondary">
            Basic configuration for the workspace environment.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saveSuccess && (
            <div className="px-4 py-2 bg-green-500/10 text-green-500 rounded-xl font-medium text-sm animate-in fade-in flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              Settings saved successfully!
            </div>
          )}
          {isDirty && (
            <button
              onClick={saveSettings}
              disabled={isLoading}
              className="px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/25 flex items-center gap-2 hover:bg-primary/90 transition-all animate-in zoom-in hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={18} />
              Save Changes
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Workspace Identity */}
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
                value={workspaceName}
                onChange={(e) => handleChange(setWorkspaceName, e.target.value)}
                disabled={!isDeveloper}
                className="w-full bg-input border border-border rounded-xl px-4 py-3 focus:border-primary focus:outline-none disabled:opacity-50 text-text-main font-medium transition-all focus:ring-4 focus:ring-primary/10"
                placeholder="Enter workspace name"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">
                System Version
              </label>
              <input
                type="text"
                value={systemVersion} 
                onChange={(e) => handleChange(setSystemVersion, e.target.value)}
                className="w-full bg-input/50 border border-border rounded-xl px-4 py-3 text-text-main font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">
                Support Email
              </label>
              <input
                type="email"
                value={systemEmail}
                onChange={(e) => handleChange(setSystemEmail, e.target.value)}
                disabled={!isDeveloper}
                className="w-full bg-input border border-border rounded-xl px-4 py-3 focus:border-primary focus:outline-none disabled:opacity-50 text-text-main font-medium transition-all focus:ring-4 focus:ring-primary/10"
                placeholder="support@example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">
                Support Phone
              </label>
              <input
                type="tel"
                value={systemPhone}
                onChange={(e) => handleChange(setSystemPhone, e.target.value)}
                disabled={!isDeveloper}
                className="w-full bg-input border border-border rounded-xl px-4 py-3 focus:border-primary focus:outline-none disabled:opacity-50 text-text-main font-medium transition-all focus:ring-4 focus:ring-primary/10"
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>
        </div>

        {/* Active Branch Selection */}
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-500">
              <Building size={22} />
            </div>
            <h3 className="font-bold text-lg text-text-main">Active Branch</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">
                Select Active Branch
              </label>
              <div className="relative">
                <select
                  value={activeBranchId}
                  onChange={(e) => {
                    handleChange(setActiveBranchId, e.target.value);
                    const branch = allBranches.find(
                      (b) => b.id === e.target.value,
                    );
                    setActiveBranch(branch || null);
                  }}
                  disabled={!isDeveloper || allBranches.length === 0}
                  className="w-full bg-input border border-border rounded-xl px-4 py-3 focus:border-primary focus:outline-none appearance-none text-text-main font-medium cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Select a branch...</option>
                  {allBranches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}{" "}
                      {branch.location ? `• ${branch.location}` : ""}
                    </option>
                  ))}
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

            {activeBranch && (
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Building size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-text-main">
                      {activeBranch.name}
                    </p>
                    <p className="text-xs text-secondary">
                      {activeBranch.location || "No location"} •{" "}
                      {activeBranch.phone}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {allBranches.length === 0 && (
              <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl text-sm">
                <p className="text-amber-600 dark:text-amber-400 font-medium">
                  No branches available
                </p>
                <p className="text-xs text-secondary mt-1">
                  Create a branch user first to set as active branch.
                </p>
              </div>
            )}
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
                  value={systemLanguage}
                  onChange={(e) =>
                    handleChange(setSystemLanguage, e.target.value)
                  }
                  disabled={!isDeveloper}
                  className="w-full bg-input border border-border rounded-xl px-4 py-3 focus:border-primary focus:outline-none appearance-none text-text-main font-medium cursor-pointer transition-all disabled:opacity-50"
                >
                  <option value="en-US">English (United States)</option>
                  <option value="en-GB">English (United Kingdom)</option>
                  <option value="es">Español (Spanish)</option>
                  <option value="fr">Français (French)</option>
                  <option value="de">Deutsch (German)</option>
                  <option value="it">Italiano (Italian)</option>
                  <option value="pt">Português (Portuguese)</option>
                  <option value="hi">हिन्दी (Hindi)</option>
                  <option value="zh">中文 (Chinese)</option>
                  <option value="ja">日本語 (Japanese)</option>
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
                System Timezone
              </label>
              <div className="relative">
                <select
                  value={systemTimezone}
                  onChange={(e) =>
                    handleChange(setSystemTimezone, e.target.value)
                  }
                  disabled={!isDeveloper}
                  className="w-full bg-input border border-border rounded-xl px-4 py-3 focus:border-primary focus:outline-none appearance-none text-text-main font-medium cursor-pointer transition-all disabled:opacity-50"
                >
                  <option value="UTC">UTC (Coordinated Universal Time)</option>
                  <option value="America/New_York">EST (Eastern Time)</option>
                  <option value="America/Chicago">CST (Central Time)</option>
                  <option value="America/Denver">MST (Mountain Time)</option>
                  <option value="America/Los_Angeles">
                    PST (Pacific Time)
                  </option>
                  <option value="Europe/London">GMT (London)</option>
                  <option value="Europe/Paris">CET (Paris/Berlin)</option>
                  <option value="Asia/Dubai">GST (Dubai)</option>
                  <option value="Asia/Kolkata">IST (India)</option>
                  <option value="Asia/Tokyo">JST (Tokyo)</option>
                  <option value="Australia/Sydney">AEST (Sydney)</option>
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
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm md:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-red-500/10 rounded-xl text-red-500">
              <Power size={22} />
            </div>
            <h3 className="font-bold text-lg text-text-main">System State</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    isDeveloper &&
                    handleChange(setSystemMaintenance, !systemMaintenance)
                  }
                  disabled={!isDeveloper}
                  className={`w-14 h-8 rounded-full transition-all duration-300 relative ${
                    systemMaintenance
                      ? "bg-primary shadow-lg shadow-primary/30"
                      : "bg-input border border-border"
                  } ${!isDeveloper ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <div
                    className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-sm transition-all duration-300 ${
                      systemMaintenance ? "left-7" : "left-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/10 text-xs text-secondary leading-relaxed flex gap-3">
              <Settings className="text-orange-500 shrink-0" size={16} />
              <div>
                <span className="font-bold text-orange-500">Caution:</span>
                <p className="mt-1">
                  Enabling maintenance mode will disconnect all active WebSocket
                  connections for standard users immediately.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
