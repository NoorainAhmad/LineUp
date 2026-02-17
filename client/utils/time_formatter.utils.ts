export const formatMessageTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();

  // Reset hours to compare dates
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const messageDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );

  // Time format for all cases
  const timeStr = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  // Check if it's today
  if (messageDate.getTime() === today.getTime()) {
    return timeStr; // Just show time (e.g., "3:45 PM")
  }

  // Check if it's yesterday
  if (messageDate.getTime() === yesterday.getTime()) {
    return `Yesterday ${timeStr}`; // "Yesterday 3:45 PM"
  }

  // Check if it's within the last 7 days
  const oneWeekAgo = new Date(today);
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  if (messageDate > oneWeekAgo) {
    // Show day name
    const dayName = date.toLocaleDateString([], { weekday: "short" });
    return `${dayName} ${timeStr}`; // e.g., "Mon 3:45 PM"
  }

  // For older messages, show date
  const dateStr = date.toLocaleDateString([], {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });

  return `${dateStr} ${timeStr}`; // e.g., "12/02/24 3:45 PM"
};

// For last message preview (shorter format)
export const formatLastMessageTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();

  // Reset hours to compare dates
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const messageDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );

  // Check if it's today
  if (messageDate.getTime() === today.getTime()) {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }); // "3:45 PM"
  }

  // Check if it's yesterday
  if (messageDate.getTime() === yesterday.getTime()) {
    return "Yesterday"; // Just "Yesterday"
  }

  // Check if it's within the last 7 days
  const oneWeekAgo = new Date(today);
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  if (messageDate > oneWeekAgo) {
    return date.toLocaleDateString([], { weekday: "short" }); // "Mon"
  }

  // For older messages, show date
  return date.toLocaleDateString([], {
    day: "2-digit",
    month: "2-digit",
  }); // "12/02"
};
