import React, { useState } from "react";
import {
  Activity,
  Database,
  FileText,
  Settings,
  Server,
  ChevronRight,
  Search,
  LayoutDashboard,
  Lock,
} from "lucide-react";

interface SettingsListProps {
  activeCategory: string;
  onSelectCategory: (category: string) => void;
}

export const SettingsList: React.FC<SettingsListProps> = ({
  activeCategory,
  onSelectCategory,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const sections = [
    {
      title: "Monitoring",
      items: [
        {
          id: "system-dashboard",
          label: "System Dashboard",
          icon: LayoutDashboard,
          description: "Real-time metrics",
        },
        {
          id: "system-logs",
          label: "System Logs",
          icon: FileText,
          description: "Audit & events",
        },
      ],
    },
    {
      title: "Configuration",
      items: [
        {
          id: "system-general",
          label: "General",
          icon: Settings,
          description: "Environment setup",
        },
        {
          id: "system-security",
          label: "Security",
          icon: Lock,
          description: "Access control",
        },
        {
          id: "system-backups",
          label: "Backups",
          icon: Database,
          description: "Disaster recovery",
        },
      ],
    },
  ];

  const filteredSections = sections
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) =>
          item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <div className="flex flex-col h-full bg-surface border-r border-border w-full md:w-95 lg:w-105 relative z-20">
      {/* Header */}
      <div className="h-20 px-6 flex items-center justify-between shrink-0 bg-surface border-b border-border/50">
        <h1 className="text-2xl font-black text-text-main tracking-tight">
          System
        </h1>
        <div className="w-10 h-10 rounded-xl bg-surface-hover flex items-center justify-center text-secondary">
          <Server size={22} />
        </div>
      </div>

      {/* Search */}
      <div className="px-6 py-4 bg-surface">
        <div className="relative group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-primary transition-colors"
            size={18}
          />
          <input
            type="text"
            placeholder="Find a setting..."
            className="w-full bg-surface-hover text-text-main placeholder-secondary pl-12 pr-10 py-3 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all border border-transparent focus:border-primary/30"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-surface px-3 pb-4 space-y-6">
        {filteredSections.map((section, idx) => (
          <div
            key={idx}
            className="animate-in slide-in-from-bottom-2 duration-300"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <h3 className="px-3 mb-2 text-xs font-bold text-secondary uppercase tracking-wider opacity-70">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = activeCategory === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => onSelectCategory(item.id)}
                    className={`group relative p-3 flex items-center gap-4 cursor-pointer transition-all rounded-xl border border-transparent ${
                      isActive
                        ? "bg-primary/5 dark:bg-primary/10 border-primary/10"
                        : "hover:bg-surface-hover"
                    }`}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-primary rounded-r-full"></div>
                    )}

                    <div
                      className={`p-2.5 rounded-xl transition-colors ${isActive ? "bg-primary text-white shadow-lg shadow-primary/30" : "bg-surface-hover text-secondary group-hover:text-primary"}`}
                    >
                      <item.icon size={20} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <span
                          className={`font-bold text-sm ${isActive ? "text-primary" : "text-text-main"}`}
                        >
                          {item.label}
                        </span>
                        {isActive && (
                          <ChevronRight size={14} className="text-primary" />
                        )}
                      </div>
                      <p
                        className={`text-xs truncate ${isActive ? "text-text-main/70" : "text-secondary"}`}
                      >
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {filteredSections.length === 0 && (
          <div className="p-8 text-center text-secondary">
            <p>No settings found.</p>
          </div>
        )}
      </div>

      {/* System Footer */}
      <div className="p-4 border-t border-border bg-surface">
        <div className="bg-surface-hover/50 rounded-2xl p-4 border border-border flex items-center gap-4 relative overflow-hidden group cursor-default">
          <div className="absolute inset-0 bg-linear-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center shrink-0">
            <Activity size={20} className="text-green-500 animate-pulse-fast" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-secondary uppercase tracking-wider mb-0.5">
              System Status
            </p>
            <p className="text-sm font-bold text-text-main">LineUp v2.4.0</p>
          </div>
        </div>
      </div>
    </div>
  );
};
