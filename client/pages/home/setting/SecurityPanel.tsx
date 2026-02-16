import React, { useState } from "react";
import { Shield, Key, Lock, Globe, RefreshCw } from "lucide-react";
import { UserRole } from "../../../types";
import { CurrentUser } from "../../../constants";

export const SecurityPanel: React.FC = () => {
  const [twoFactor, setTwoFactor] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [ipWhitelist, setIpWhitelist] = useState(["192.168.1.1", "10.0.0.5"]);
  const [newIp, setNewIp] = useState("");

  const isMaster = CurrentUser.role === UserRole.MASTER;

  const handleAddIp = (e: React.FormEvent) => {
    e.preventDefault();
    if (newIp && !ipWhitelist.includes(newIp)) {
      setIpWhitelist([...ipWhitelist, newIp]);
      setNewIp("");
    }
  };

  const removeIp = (ip: string) => {
    setIpWhitelist(ipWhitelist.filter((item) => item !== ip));
  };

  if (!isMaster) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8">
        <div className="w-20 h-20 bg-surface-hover rounded-full flex items-center justify-center mb-6">
          <Shield size={40} className="text-secondary" />
        </div>
        <h2 className="text-2xl font-bold text-text-main">Access Restricted</h2>
        <p className="text-secondary max-w-md mt-2">
          Security protocols can only be configured by Master Administrators.
          Please contact your system owner.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 mx-auto space-y-8 pb-24">
      <div>
        <h2 className="text-3xl font-black text-text-main mb-2 tracking-tight">
          Security Protocols
        </h2>
        <p className="text-secondary">
          Configure system-wide security, access control, and authentication
          rules.
        </p>
      </div>

      {/* Authentication */}
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
            <Key size={22} />
          </div>
          <h3 className="font-bold text-lg text-text-main">Authentication</h3>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-surface-hover/30 rounded-xl">
            <div>
              <p className="font-bold text-text-main">
                Two-Factor Authentication (2FA)
              </p>
              <p className="text-xs text-secondary mt-1">
                Enforce 2FA for all Admin and Master accounts.
              </p>
            </div>
            <button
              onClick={() => setTwoFactor(!twoFactor)}
              className={`w-14 h-8 rounded-full transition-all duration-300 relative ${twoFactor ? "bg-primary shadow-lg shadow-primary/30" : "bg-input border border-border"}`}
            >
              <div
                className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-sm transition-all duration-300 ${twoFactor ? "left-7" : "left-1"}`}
              ></div>
            </button>
          </div>

          <div className="flex items-center justify-between border-t border-border pt-6">
            <div>
              <p className="font-bold text-text-main">Session Timeout</p>
              <p className="text-xs text-secondary mt-1">
                Automatically log out inactive users (minutes).
              </p>
            </div>
            <div className="flex items-center gap-2 bg-input border border-border rounded-xl px-3 py-2">
              <input
                type="number"
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(parseInt(e.target.value))}
                className="w-16 bg-transparent text-center focus:outline-none font-bold text-text-main"
              />
              <span className="text-xs font-bold text-secondary border-l border-border pl-2">
                min
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border pt-6">
            <div>
              <p className="font-bold text-text-main">Force Password Reset</p>
              <p className="text-xs text-secondary mt-1">
                Require all users to reset passwords on next login.
              </p>
            </div>
            <button className="px-5 py-2.5 bg-surface hover:bg-red-500/10 text-red-500 rounded-xl text-sm font-bold transition-colors border border-border hover:border-red-500/20 active:scale-95 shadow-sm">
              Execute Reset
            </button>
          </div>
        </div>
      </div>

      {/* Network Security */}
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-500">
            <Globe size={22} />
          </div>
          <h3 className="font-bold text-lg text-text-main">Network Access</h3>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="font-bold text-text-main">IP Whitelist</p>
                <p className="text-xs text-secondary mt-1">
                  Restrict Admin access to specific IP addresses.
                </p>
              </div>
              <span className="bg-green-500/10 text-green-500 text-[10px] font-bold px-2 py-1 rounded border border-green-500/20 uppercase tracking-wider">
                Active
              </span>
            </div>

            <div className="space-y-2 mb-4">
              {ipWhitelist.map((ip) => (
                <div
                  key={ip}
                  className="flex items-center justify-between bg-surface-hover px-4 py-3 rounded-xl group border border-transparent hover:border-border transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span className="font-mono text-sm font-medium">{ip}</span>
                  </div>
                  <button
                    onClick={() => removeIp(ip)}
                    className="text-secondary hover:text-red-400 p-1 hover:bg-surface rounded-lg transition-colors"
                  >
                    <XIcon />
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddIp} className="flex gap-3">
              <input
                type="text"
                placeholder="Enter IP Address (e.g. 192.168.1.5)"
                value={newIp}
                onChange={(e) => setNewIp(e.target.value)}
                className="flex-1 bg-input border border-border rounded-xl px-4 py-3 focus:border-primary focus:outline-none transition-all"
              />
              <button
                type="submit"
                disabled={!newIp}
                className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold shadow-lg disabled:opacity-50 disabled:shadow-none transition-all"
              >
                Add
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Audit Log Config */}
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-orange-500/10 rounded-xl text-orange-500">
            <Lock size={22} />
          </div>
          <h3 className="font-bold text-lg text-text-main">
            Audit Configuration
          </h3>
        </div>
        <p className="text-sm text-secondary mb-6 leading-relaxed">
          Security logs are immutable and stored for 90 days by default. Changes
          to encryption keys will force a system-wide re-login.
        </p>
        <button className="w-full py-4 border-2 border-dashed border-border rounded-xl text-secondary hover:bg-surface-hover hover:text-text-main hover:border-primary/50 transition-all flex items-center justify-center gap-2 group font-medium">
          <RefreshCw
            size={18}
            className="group-hover:rotate-180 transition-transform duration-500"
          />
          Rotate Encryption Keys
        </button>
      </div>
    </div>
  );
};

const XIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 18 18" />
  </svg>
);
