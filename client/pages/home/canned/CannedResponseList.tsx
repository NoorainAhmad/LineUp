import React, { useState } from "react";
import { Search, Zap, Plus, Command } from "lucide-react";
import { CannedResponse } from "../../../types";

interface CannedResponseListProps {
  responses: CannedResponse[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onCreate: () => void;
}

export const CannedResponseList: React.FC<CannedResponseListProps> = ({
  responses,
  selectedId,
  onSelect,
  onCreate,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredResponses = responses.filter(
    (r) =>
      r.command.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex flex-col h-full bg-surface border-r border-border w-full md:w-95 lg:w-105 relative z-20">
      {/* Header */}
      <div className="h-20 px-6 flex items-center justify-between shrink-0 bg-surface border-b border-border/50">
        <h1 className="text-2xl font-black text-text-main tracking-tight">
          Responses
        </h1>
        <div className="flex gap-2 text-icon">
          <button
            onClick={onCreate}
            className="p-2 hover:bg-surface-hover rounded-full transition-colors text-primary bg-primary/5"
            title="Add New Response"
          >
            <Plus size={22} />
          </button>
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
            placeholder="Search commands..."
            className="w-full bg-surface-hover text-text-main placeholder-secondary pl-12 pr-10 py-3 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all border border-transparent focus:border-primary/30"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-surface px-3 pb-4 space-y-1">
        {filteredResponses.map((item) => {
          const isSelected = selectedId === item.id;
          return (
            <div
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`group relative p-3 flex items-start gap-4 cursor-pointer transition-colors rounded-xl ${
                isSelected
                  ? "bg-primary/5 dark:bg-primary/10"
                  : "hover:bg-surface-hover"
              }`}
            >
              {isSelected && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-primary rounded-r-full"></div>
              )}

              <div
                className={`mt-1 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${isSelected ? "bg-primary text-white shadow-lg shadow-primary/30" : "bg-surface-hover text-secondary group-hover:bg-primary/10 group-hover:text-primary"}`}
              >
                <Zap size={18} fill={isSelected ? "currentColor" : "none"} />
              </div>

              <div className="flex-1 min-w-0 max-w-64">
                <div className="flex justify-between items-center mb-1">
                  <span
                    className={`font-mono text-sm font-bold truncate ${isSelected ? "text-primary" : "text-text-main"}`}
                  >
                    {item.command}
                  </span>
                </div>

                <p className="text-secondary text-xs font-medium uppercase tracking-wider mb-1 opacity-80 truncate">
                  {item.description}
                </p>
                <p
                  className={`text-sm truncate ${isSelected ? "text-text-main/80" : "text-secondary group-hover:text-text-main/80"}`}
                >
                  {item.text}
                </p>
              </div>
            </div>
          );
        })}

        {filteredResponses.length === 0 && (
          <div className="flex flex-col items-center justify-center p-8 mt-10 text-center text-secondary">
            <div className="w-16 h-16 bg-surface-hover rounded-full flex items-center justify-center mb-4">
              <Command size={24} className="opacity-50" />
            </div>
            <p className="font-medium">No responses found</p>
            <p className="text-sm opacity-70">
              Create a new one to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
