import React from "react";
import { Check, CheckCheck, Clock3 } from "lucide-react";
import type { MessageDisplayStatus } from "@/utils/messageStatus";

interface MessageStatusIconProps {
  status: MessageDisplayStatus;
  size?: number;
}

export const MessageStatusIcon: React.FC<MessageStatusIconProps> = ({
  status,
  size = 14,
}) => {
  if (status === "sending") {
    return <Clock3 size={size} className="opacity-50" />;
  }
  if (status === "sent") {
    // Single tick — grey
    return <Check size={size} className="text-bubble-meta opacity-70" />;
  }
  if (status === "delivered") {
    // Double tick — grey
    return <CheckCheck size={size} className="text-bubble-meta opacity-70" />;
  }
  if (status === "read") {
    // Double tick — blue
    return <CheckCheck size={size} className="text-blue-400" />;
  }
  return null;
};