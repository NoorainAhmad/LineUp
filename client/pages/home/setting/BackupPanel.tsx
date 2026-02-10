import React, { useState } from "react";
import {
  Database,
  Download,
  RotateCcw,
  Plus,
  Clock,
  Cloud,
  HardDrive,
} from "lucide-react";
import { Backup } from "../../../types";

export const BackupPanel: React.FC = () => {
  const [backups, setBackups] = useState<Backup[]>([
    {
      id: "b1",
      name: "Auto-Backup-Daily",
      size: "2.4 GB",
      createdAt: "2023-10-25 00:00",
      status: "COMPLETED",
      type: "FULL",
    },
    {
      id: "b2",
      name: "Pre-Deployment Snapshot",
      size: "156 MB",
      createdAt: "2023-10-24 14:30",
      status: "COMPLETED",
      type: "INCREMENTAL",
    },
    {
      id: "b3",
      name: "Manual-Backup-User",
      size: "2.4 GB",
      createdAt: "2023-10-23 09:15",
      status: "COMPLETED",
      type: "FULL",
    },
  ]);
  const [isCreating, setIsCreating] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleCreateBackup = () => {
    setIsCreating(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsCreating(false);
            const newBackup: Backup = {
              id: Date.now().toString(),
              name: `Manual-Snapshot-${new Date().toLocaleTimeString()}`,
              size: "2.4 GB",
              createdAt: "Just now",
              status: "COMPLETED",
              type: "FULL",
            };
            setBackups([newBackup, ...backups]);
          }, 500);
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  return (
    <div className="p-8 mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-text-main mb-2">
            System Backups
          </h2>
          <p className="text-secondary">
            Manage system snapshots and disaster recovery points.
          </p>
        </div>
        <button
          onClick={handleCreateBackup}
          disabled={isCreating}
          className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-medium shadow-lg flex items-center gap-2 transition-all active:scale-95"
        >
          {isCreating ? (
            <Clock className="animate-spin" size={20} />
          ) : (
            <Plus size={20} />
          )}
          {isCreating ? "Creating Snapshot..." : "Create New Backup"}
        </button>
      </div>

      {isCreating && (
        <div className="bg-surface border border-border rounded-xl p-6 shadow-sm animate-in fade-in">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-bold text-text-main">
              Backing up database and assets...
            </span>
            <span className="text-primary font-mono">{progress}%</span>
          </div>
          <div className="w-full bg-surface-hover rounded-full h-3 overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-surface border border-border p-6 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-full">
            <Cloud size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-secondary uppercase">
              Total Storage Used
            </p>
            <p className="text-xl font-bold text-text-main">45.2 GB / 100 GB</p>
          </div>
        </div>
        <div className="bg-surface border border-border p-6 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 text-purple-500 rounded-full">
            <HardDrive size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-secondary uppercase">
              Retention Policy
            </p>
            <p className="text-xl font-bold text-text-main">30 Days</p>
          </div>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="bg-surface-hover/50 px-6 py-4 border-b border-border flex justify-between items-center">
          <h3 className="font-bold text-text-main">Snapshot History</h3>
          <button className="text-primary text-sm font-medium hover:underline">
            Configure Schedule
          </button>
        </div>

        <div className="divide-y divide-border">
          {backups.map((backup) => (
            <div
              key={backup.id}
              className="p-6 flex items-center justify-between hover:bg-surface-hover transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/10 text-green-500 rounded-lg">
                  <Database size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-text-main">{backup.name}</h4>
                  <div className="flex items-center gap-3 text-sm text-secondary mt-1">
                    <span className="flex items-center gap-1">
                      <Clock size={14} /> {backup.createdAt}
                    </span>
                    <span>•</span>
                    <span className="font-mono">{backup.size}</span>
                    <span>•</span>
                    <span className="bg-surface-hover px-2 py-0.5 rounded text-xs font-bold border border-border">
                      {backup.type}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                <button
                  className="p-2 text-secondary hover:text-primary hover:bg-surface-hover rounded-lg transition-colors"
                  title="Download"
                >
                  <Download size={20} />
                </button>
                <button
                  className="p-2 text-secondary hover:text-red-500 hover:bg-surface-hover rounded-lg transition-colors"
                  title="Restore"
                >
                  <RotateCcw size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
