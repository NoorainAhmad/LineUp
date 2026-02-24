import React from "react";

interface LogoutModalProps {
  onClose: () => void;
  onLogoutDevice: () => void;
  isLoading?: boolean;
}

export const LogoutModal: React.FC<LogoutModalProps> = ({
  onClose,
  onLogoutDevice,
  isLoading = false,
}) => {
  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-surface border border-border rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 animate-in fade-in zoom-in">
        <h2 className="text-xl font-semibold text-text-main mb-2">
          Logout from your account
        </h2>
        <p className="text-secondary mb-6">
          Are you sure you want to logout from this device?
        </p>

        <div className="space-y-3">
          <button
            onClick={onLogoutDevice}
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-medium transition-colors border border-primary/20"
          >
            Logout from this device
          </button>

          <button
            onClick={onClose}
            className="w-full py-2 text-secondary hover:text-text-main transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
