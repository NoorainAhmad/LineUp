import React, { useState, useEffect } from "react";
import {
  Activity,
  HardDrive,
  Cpu,
  Zap,
  Wifi,
  Clock,
  Server,
} from "lucide-react";

export const DashboardPanel: React.FC = () => {
  const [metrics, setMetrics] = useState({
    cpu: 12,
    memory: 45,
    disk: 28,
    networkIn: 1.2,
    networkOut: 0.8,
    uptime: "14d 2h 12m",
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) => ({
        ...prev,
        cpu: Math.min(100, Math.max(5, prev.cpu + (Math.random() * 10 - 5))),
        memory: Math.min(
          100,
          Math.max(20, prev.memory + (Math.random() * 4 - 2)),
        ),
        networkIn: Math.abs(prev.networkIn + (Math.random() * 0.5 - 0.25)),
        networkOut: Math.abs(prev.networkOut + (Math.random() * 0.5 - 0.25)),
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 md:p-8 mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="bg-linear-to-r from-surface to-surface-hover border border-border p-6 rounded-2xl shadow-sm">
        <h2 className="text-3xl font-black text-text-main mb-2 tracking-tight">
          System Dashboard
        </h2>
        <p className="text-secondary max-w-2xl text-lg">
          Real-time performance monitoring and resource usage analytics.
        </p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Cpu}
          label="CPU Load"
          value={`${metrics.cpu.toFixed(1)}%`}
          color="text-blue-500"
          bg="bg-blue-500/10"
          border="border-blue-500/20"
        />
        <StatCard
          icon={Zap}
          label="Memory Usage"
          value={`${metrics.memory.toFixed(1)}%`}
          color="text-purple-500"
          bg="bg-purple-500/10"
          border="border-purple-500/20"
        />
        <StatCard
          icon={HardDrive}
          label="Disk Usage"
          value={`${metrics.disk}%`}
          color="text-orange-500"
          bg="bg-orange-500/10"
          border="border-orange-500/20"
        />
        <StatCard
          icon={Clock}
          label="System Uptime"
          value={metrics.uptime}
          color="text-green-500"
          bg="bg-green-500/10"
          border="border-green-500/20"
        />
      </div>

      {/* Graphs Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm hover:border-primary/20 transition-colors">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-lg text-text-main flex items-center gap-2">
              <Server size={20} className="text-secondary" />
              Resource Utilization
            </h3>
            <span className="text-xs font-bold text-green-500 bg-green-500/10 border border-green-500/20 px-2 py-1 rounded-md flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              Live
            </span>
          </div>

          <div className="space-y-8">
            <ProgressBar
              label="CPU Core 1"
              value={metrics.cpu}
              color="bg-blue-500"
            />
            <ProgressBar
              label="CPU Core 2"
              value={metrics.cpu * 0.8}
              color="bg-blue-500"
            />
            <ProgressBar
              label="Memory (RAM)"
              value={metrics.memory}
              color="bg-purple-500"
            />
            <ProgressBar
              label="NVMe Storage"
              value={metrics.disk}
              color="bg-orange-500"
            />
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm hover:border-primary/20 transition-colors flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-lg text-text-main flex items-center gap-2">
              <Wifi size={20} className="text-secondary" />
              Network Traffic
            </h3>
            <span className="text-xs font-mono font-medium text-secondary bg-surface-hover border border-border px-2 py-1 rounded-md">
              eth0
            </span>
          </div>

          <div className="flex-1 flex flex-col justify-center gap-6">
            <NetworkCard
              type="Inbound"
              value={metrics.networkIn}
              color="text-green-500"
              bg="bg-green-500/10"
              barColor="bg-green-500/50"
            />
            <NetworkCard
              type="Outbound"
              value={metrics.networkOut}
              color="text-blue-500"
              bg="bg-blue-500/10"
              barColor="bg-blue-500/50"
              rotate
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color, bg, border }: any) => (
  <div
    className={`bg-surface border ${border || "border-border"} rounded-2xl p-5 flex items-center gap-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-1`}
  >
    <div className={`p-3.5 rounded-xl ${bg} ${color}`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-xs font-bold text-secondary uppercase tracking-wider mb-0.5">
        {label}
      </p>
      <p className="text-2xl font-black text-text-main font-mono tracking-tight">
        {value}
      </p>
    </div>
  </div>
);

const ProgressBar = ({ label, value, color }: any) => (
  <div className="group">
    <div className="flex justify-between mb-2">
      <span className="text-sm font-bold text-text-main">{label}</span>
      <span className="text-sm font-mono font-medium text-secondary">
        {value.toFixed(1)}%
      </span>
    </div>
    <div className="w-full bg-surface-hover rounded-full h-2.5 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ease-out ${color} group-hover:brightness-110`}
        style={{ width: `${value}%` }}
      ></div>
    </div>
  </div>
);

const NetworkCard = ({ type, value, color, bg, barColor, rotate }: any) => (
  <div className="flex items-center justify-between p-5 bg-surface-hover/30 border border-border rounded-xl">
    <div className="flex items-center gap-4">
      <div className={`p-2.5 ${bg} rounded-xl ${color}`}>
        <Activity size={24} className={rotate ? "rotate-180" : ""} />
      </div>
      <div>
        <p className="text-xs text-secondary font-bold uppercase">{type}</p>
        <p className="text-2xl font-black font-mono text-text-main">
          {value.toFixed(2)} MB/s
        </p>
      </div>
    </div>
    <div className="h-12 w-32 flex items-end gap-1 opacity-80">
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className={`flex-1 ${barColor} rounded-t-sm transition-all duration-300`}
          style={{ height: `${Math.random() * 100}%` }}
        ></div>
      ))}
    </div>
  </div>
);
