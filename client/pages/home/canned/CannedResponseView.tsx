import React, { useState, useEffect } from "react";
import {
  Save,
  Trash2,
  Command,
  AlignLeft,
  Info,
  Zap,
  MessageSquare,
  ArrowLeft,
  Check,
} from "lucide-react";
import { CannedResponse } from "../../../types";
import { useAuth } from "@/contexts/AuthContext";

interface CannedResponseDetails {
  command: string;
  description: string;
  text: string;
  userId: string;
}

interface CannedResponseViewProps {
  response?: CannedResponse | null;
  onSave: (response: CannedResponseDetails) => void;
  onDelete: (id: string) => void;
  onCancel: () => void;
}

export const CannedResponseView: React.FC<CannedResponseViewProps> = ({
  response,
  onSave,
  onDelete,
  onCancel,
}) => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    command: "",
    description: "",
    text: "",
    userId: user?.id || "",
  });

  const isCreating = !response;

  useEffect(() => {
    if (response) {
      setFormData({
        command: response.command,
        description: response.description,
        text: response.text,
        userId: response.userId,
      });
    } else {
      setFormData({
        command: "/",
        description: "",
        text: "",
        userId: user?.id || "",
      });
    }
  }, [response]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.command.startsWith("/")) return;
    onSave(formData);
  };

  return (
    <div className="flex-1 h-full bg-background relative overflow-hidden flex flex-col animate-in fade-in duration-300">
      {/* Mobile Header */}
      <div className="md:hidden h-16 flex items-center px-4 bg-surface border-b border-border z-20 shrink-0 justify-between">
        <div className="flex items-center">
          <button
            onClick={onCancel}
            className="p-2 -ml-2 text-secondary hover:text-text-main"
          >
            <ArrowLeft size={20} />
          </button>
          <span className="font-bold text-text-main ml-2">
            {isCreating ? "New Response" : "Edit Response"}
          </span>
        </div>
        {!isCreating && (
          <button
            onClick={() => {
              if (window.confirm("Delete?")) onDelete(response!.id);
            }}
            className="text-red-500 p-2"
          >
            <Trash2 size={20} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Decorative Header */}
        <div className="h-32 w-full bg-linear-to-br from-yellow-400/20 via-orange-500/10 to-background relative overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 10% 20%, rgba(255, 180, 0, 0.1) 0%, transparent 20%)`,
            }}
          ></div>
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-linear-to-t from-background to-transparent"></div>
        </div>

        <div className="mx-auto px-4 md:px-8 pb-12 -mt-24 relative z-10">
          <div className="flex flex-col gap-6">
            {/* Main Card */}
            <div className="bg-surface border border-border rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm">
              <div className="p-6 md:p-8 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                    <Zap size={32} fill="currentColor" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-black text-text-main tracking-tight">
                      {formData.command || "New Command"}
                    </h1>
                    <p className="text-secondary font-medium">
                      {formData.description || "Quick reply configuration"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 self-end md:self-auto">
                  {!isCreating && (
                    <button
                      onClick={() => {
                        if (window.confirm("Delete this response?"))
                          onDelete(response!.id);
                      }}
                      className="p-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors border border-transparent hover:border-red-500/20 hidden md:flex"
                      title="Delete"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                  <button
                    onClick={handleSubmit}
                    disabled={
                      !formData.command.startsWith("/") || !formData.text
                    }
                    className="px-6 py-3 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-lg active:scale-95 transition-all flex items-center gap-2"
                  >
                    <Save size={18} />
                    Save Response
                  </button>
                </div>
              </div>

              <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: Form */}
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-xs font-bold text-secondary uppercase tracking-wider">
                      <Command size={14} />
                      Trigger Command
                    </label>
                    <input
                      type="text"
                      value={formData.command}
                      onChange={(e) =>
                        setFormData({ ...formData, command: e.target.value })
                      }
                      className="w-full bg-input border border-border rounded-xl px-4 py-3 text-text-main font-mono text-lg font-bold focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all placeholder-secondary/50"
                      placeholder="/command"
                    />
                    <p className="text-xs text-secondary flex items-center gap-1">
                      <Info size={12} />
                      Must start with a forward slash (e.g., /greet)
                    </p>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-xs font-bold text-secondary uppercase tracking-wider">
                      <Info size={14} />
                      Description
                    </label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="w-full bg-input border border-border rounded-xl px-4 py-3 text-text-main focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all placeholder-secondary/50"
                      placeholder="e.g., Standard greeting for new leads"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-xs font-bold text-secondary uppercase tracking-wider">
                      <AlignLeft size={14} />
                      Response Content
                    </label>
                    <textarea
                      value={formData.text}
                      onChange={(e) =>
                        setFormData({ ...formData, text: e.target.value })
                      }
                      className="w-full bg-input border border-border rounded-xl px-4 py-3 text-text-main min-h-45 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all resize-none placeholder-secondary/50 leading-relaxed"
                      placeholder="Type the message that will be sent..."
                    />
                  </div>
                </div>

                {/* Right: Preview */}
                <div className="flex flex-col h-full">
                  <label className="flex items-center gap-2 text-xs font-bold text-secondary uppercase tracking-wider mb-3">
                    <MessageSquare size={14} />
                    Live Preview
                  </label>

                  <div className="flex-1 bg-surface-hover/50 border-2 border-dashed border-border rounded-2xl p-6 flex items-center justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] bg-size-[16px_16px] pointer-events-none"></div>

                    {formData.text ? (
                      <div className="max-w-[85%] bg-bubble-out text-text-main p-3 rounded-2xl rounded-tr-sm shadow-md relative animate-in zoom-in-95 duration-200">
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">
                          {formData.text}
                        </p>
                        <div className="flex items-center justify-end gap-1 mt-1 opacity-70">
                          <span className="text-[10px] uppercase">
                            10:42 AM
                          </span>
                          <Check size={12} className="text-primary" />
                        </div>

                        {/* Mock Tail */}
                        <div className="absolute top-0 -right-2 w-4 h-4 bg-bubble-out [clip-path:polygon(0_0,0%_100%,100%_0)]"></div>
                      </div>
                    ) : (
                      <div className="text-center text-secondary opacity-50">
                        <MessageSquare size={48} className="mx-auto mb-2" />
                        <p className="text-sm font-medium">
                          Preview will appear here
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 p-4 bg-primary/5 border border-primary/10 rounded-xl flex gap-3">
                    <div className="p-2 bg-primary/10 rounded-full text-primary shrink-0 h-fit">
                      <Zap size={16} fill="currentColor" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-text-main">
                        Pro Tip
                      </h4>
                      <p className="text-xs text-secondary mt-1">
                        Type{" "}
                        <span className="font-mono bg-surface border border-border px-1 py-0.5 rounded text-primary">
                          {formData.command || "/..."}
                        </span>{" "}
                        in any chat window to instantly insert this message.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
