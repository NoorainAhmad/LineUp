import React, { useState, useEffect, useRef } from "react";
import { Terminal, Download, Pause, Play, Trash2 } from "lucide-react";
import { SystemLog } from "../../../types";

export const LogsPanel: React.FC = () => {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [filter, setFilter] = useState<"ALL" | "ERROR" | "WARN">("ALL");
  const scrollRef = useRef<HTMLDivElement>(null);

  const generateLog = (): SystemLog => {
    const levels: SystemLog["level"][] = [
      "INFO",
      "INFO",
      "INFO",
      "SUCCESS",
      "WARN",
      "ERROR",
    ];
    const modules = ["AUTH", "DB", "API", "WORKER", "GATEWAY"];
    const messages = [
      "User authentication attempt",
      "Database query execution time > 100ms",
      "Received webhook payload",
      "Cache key invalidated",
      "Connection reset by peer",
      "Failed to sync with replica",
      "Backup job completed successfully",
      "Rate limit exceeded for IP 192.168.1.x",
      "New session established",
    ];

    const level = levels[Math.floor(Math.random() * levels.length)];
    return {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      level: level,
      module: modules[Math.floor(Math.random() * modules.length)],
      message:
        messages[Math.floor(Math.random() * messages.length)] +
        (level === "ERROR" ? " - Critical Failure" : ""),
    };
  };

  // Initial Logs
  useEffect(() => {
    const initialLogs = Array.from({ length: 15 }, generateLog);
    setLogs(initialLogs);
  }, []);

  // Live Stream
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setLogs((prev) => [...prev.slice(-99), generateLog()]); // Keep last 100
    }, 1500);
    return () => clearInterval(interval);
  }, [isPaused]);

  // Auto Scroll
  useEffect(() => {
    if (!isPaused && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isPaused]);

  const filteredLogs =
    filter === "ALL" ? logs : logs.filter((l) => l.level === filter);

  const formatTime = (isoString: string) => {
    try {
      return isoString.split("T")[1].substring(0, 8); // HH:mm:ss
    } catch (e) {
      return isoString;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] text-gray-300 font-mono text-sm pb-16 md:pb-0">
      {/* Toolbar */}
      <div className="min-h-14 bg-[#252526] border-b border-[#333] flex items-center justify-between px-2 sm:px-4 shrink-0 gap-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 shrink-0">
          <Terminal size={18} className="text-primary" />
          <span className="font-bold text-white hidden sm:inline">
            System Output
          </span>
          <span className="font-bold text-white sm:hidden">Logs</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <div className="flex bg-[#333] rounded-lg p-0.5">
            <button
              onClick={() => setFilter("ALL")}
              className={`px-2 sm:px-3 py-1 rounded-md text-[10px] sm:text-xs font-bold transition-colors ${filter === "ALL" ? "bg-primary text-white" : "hover:text-white"}`}
            >
              ALL
            </button>
            <button
              onClick={() => setFilter("ERROR")}
              className={`px-2 sm:px-3 py-1 rounded-md text-[10px] sm:text-xs font-bold transition-colors ${filter === "ERROR" ? "bg-red-500 text-white" : "hover:text-white"}`}
            >
              ERRORS
            </button>
          </div>

          <div className="flex items-center border-l border-[#444] pl-2 gap-1">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-1.5 hover:bg-[#333] rounded text-white"
              title={isPaused ? "Resume" : "Pause"}
            >
              {isPaused ? <Play size={16} /> : <Pause size={16} />}
            </button>
            <button
              onClick={() => setLogs([])}
              className="p-1.5 hover:bg-[#333] rounded text-white"
              title="Clear"
            >
              <Trash2 size={16} />
            </button>
            <button
              className="p-1.5 hover:bg-[#333] rounded text-white hidden sm:block"
              title="Download"
            >
              <Download size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Log Window */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-0.5 sm:space-y-1 custom-scrollbar"
      >
        {filteredLogs.map((log) => (
          <div
            key={log.id}
            className="flex flex-col sm:flex-row sm:gap-4 hover:bg-[#2a2a2a] p-1.5 sm:p-1 rounded leading-tight group border-b border-[#333] sm:border-0 last:border-0"
          >
            {/* Metadata Row */}
            <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 sm:w-auto shrink-0 mb-1 sm:mb-0 select-none">
              <span className="font-mono tabular-nums opacity-70 w-15 sm:w-24">
                {formatTime(log.timestamp)}
              </span>
              <span
                className={`font-bold w-10 sm:w-16 shrink-0 ${
                  log.level === "INFO"
                    ? "text-blue-400"
                    : log.level === "WARN"
                      ? "text-yellow-400"
                      : log.level === "ERROR"
                        ? "text-red-500"
                        : "text-green-400"
                }`}
              >
                {log.level}
              </span>
              <span className="text-purple-400 font-bold w-16 sm:w-24 truncate">
                [{log.module}]
              </span>
            </div>

            {/* Message */}
            <span className="text-gray-300 wrap-break-word text-sm flex-1 leading-normal">
              {log.message}
            </span>
          </div>
        ))}
        {filteredLogs.length === 0 && (
          <div className="text-gray-600 text-center mt-10 italic text-sm">
            No logs found matching filter.
          </div>
        )}
      </div>
    </div>
  );
};
