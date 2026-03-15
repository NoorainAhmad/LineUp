// utils/messageStatus.ts
//
// Pure function — no API calls, no side effects.
// Works entirely from data already in the chat/message objects.
// Call this in the render path to decide which tick icon to show.

export type MessageDisplayStatus = "sending" | "sent" | "delivered" | "read";

interface MessageForStatus {
  id: string;        // JSON always delivers this as string
  senderId: string;
  isPending?: boolean;
  createdAt: string | Date;
}

interface MemberPointers {
  user: { id: string };
  lastDeliveredSeq: string | null;   // string from JSON
  lastReadSeq: string | null;        // string from JSON
  joinedAt: string | Date;
}

interface ChatForStatus {
  isGroup: boolean;
  members: MemberPointers[];
}

/**
 * Derives the display status for a message from the sequence pointers
 * stored on each ChatMember. Pure computation — no DB calls.
 *
 * Logic:
 *   SENDING   → message is optimistic (not yet in DB)
 *   SENT      → in DB, but ≥1 recipient hasn't delivered yet
 *   DELIVERED → ALL recipients have lastDeliveredSeq >= message.id
 *   READ      → ALL recipients have lastReadSeq >= message.id
 *
 * Recipients = chat members excluding the sender.
 * Members who joined AFTER the message was sent are excluded —
 * they don't block old messages from reaching DELIVERED/READ.
 */
export function getMessageStatus(
  message: MessageForStatus,
  chat: ChatForStatus,
  currentUserId: string,
): MessageDisplayStatus {
  // Optimistic message — not yet persisted
  if (message.isPending) return "sending";

  const msgSeq = BigInt(message.id);
  const msgCreatedAt = new Date(message.createdAt).getTime();

  // Members who should be counted for this message:
  // - Not the sender
  // - Joined before or at the time the message was created
  //   (members who joined later weren't there to receive it)
  const recipients = chat.members.filter((m) => {
    if (m.user.id === currentUserId) return false;
    const joinedAt = new Date(m.joinedAt).getTime();
    return joinedAt <= msgCreatedAt;
  });

  // Edge case: sender is the only member (or only member at message time)
  if (recipients.length === 0) return "read";

  // Check READ: ALL recipients must have lastReadSeq >= msgSeq
  const allRead = recipients.every(
        (m) => m.lastReadSeq !== null && BigInt(m.lastReadSeq) >= msgSeq,
    );
  if (allRead) return "read";

  // Check DELIVERED: ALL recipients must have lastDeliveredSeq >= msgSeq
  const allDelivered = recipients.every(
        (m) => m.lastDeliveredSeq !== null && BigInt(m.lastDeliveredSeq) >= msgSeq,
    );
  if (allDelivered) return "delivered";

  // Otherwise: at least one recipient hasn't fetched this message yet
  return "sent";
}
