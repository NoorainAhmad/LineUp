import React, { useMemo } from 'react';
import { Link as LinkIcon, Phone, Mail, Code, MessageCircle } from 'lucide-react';
import { FormattedText } from './FormattedText';


// Uses [\s\S]+? to match preview that may contain newlines
const STATUS_REPLY_REGEX = /^\[Status Reply(?:\|([a-zA-Z0-9_-]+))?: ([\s\S]+?)\]\n([\s\S]*)$/;

// Extract the actual reply
export const extractReplyMessage = (content: string): string => {
  const match = content.match(STATUS_REPLY_REGEX);
  if (match) {
    return match[3]; // Return the actual reply message
  }
  return content; // Return original if not a status reply
};

interface TextMessageProps {
  msg: {
    content: string;
    id?: string;
  };
  searchQuery?: string;
  onStatusClick?: (statusId: string) => void;
}

// Types of detected entities
type EntityType = 'url' | 'phone' | 'email';

interface DetectedEntity {
  type: EntityType;
  text: string;
  index: number;
  length: number;
  href?: string;
}

const TextMessage: React.FC<TextMessageProps> = ({ msg, searchQuery = '', onStatusClick }) => {

  // Detect entities (URLs, phones, emails) - NO code detection
  const entities = useMemo(() => {
    const detected: DetectedEntity[] = [];
    const text = msg.content;

    // URL detection
    const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+\.[^\s]+)|([a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?(?:\/[^\s]*)?)/gi;

    // Phone number detection
    const phoneRegex = /(?:\+?(\d{1,3}))?[-.\s]?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{4,9}/g;

    // Email detection
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

    let match: any;

    // Find URLs
    while ((match = urlRegex.exec(text)) !== null) {
      const url = match[0];
      // Skip if it looks like an email
      if (url.includes('@')) continue;

      const isAlreadyDetected = detected.some(e =>
        (e.index <= match.index && e.index + e.length > match.index) ||
        (match.index <= e.index && match.index + url.length > e.index)
      );

      if (!isAlreadyDetected) {
        let href = url;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          href = url.startsWith('www.') ? 'http://' + url : 'http://' + url;
        }

        detected.push({
          type: 'url',
          text: url,
          index: match.index,
          length: url.length,
          href
        });
      }
    }

    // Find phone numbers
    while ((match = phoneRegex.exec(text)) !== null) {
      const phone = match[0];
      if (phone.length < 10) continue;

      const isAlreadyDetected = detected.some((e: any) =>
        (e.index <= match.index && e.index + e.length > match.index) ||
        (match.index <= e.index && match.index + phone.length > e.index)
      );

      if (!isAlreadyDetected) {
        detected.push({
          type: 'phone',
          text: phone,
          index: match.index,
          length: phone.length,
          href: (phone.length >= 10 && phone.length <= 14) ? `tel:${phone.replace(/[^\d+]/g, '')}` : phone
        });
      }
    }

    // Find emails
    while ((match = emailRegex.exec(text)) !== null) {
      const email = match[0];
      const isAlreadyDetected = detected.some(e =>
        (e.index <= match.index && e.index + e.length > match.index) ||
        (match.index <= e.index && match.index + email.length > e.index)
      );

      if (!isAlreadyDetected) {
        detected.push({
          type: 'email',
          text: email,
          index: match.index,
          length: email.length,
          href: `mailto:${email}`
        });
      }
    }

    // Sort by index
    return detected.sort((a, b) => a.index - b.index);
  }, [msg.content]);

  // Highlight search terms
  const HighlightedText = ({ text }: { text: string }) => {
    if (!searchQuery.trim()) {
      return <FormattedText text={text} />;
    }

    const escapedHighlight = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const parts = text.split(new RegExp(`(${escapedHighlight})`, "gi"));

    return (
      <>
        {parts.map((part, i) => {
          if (part.toLowerCase() === searchQuery.toLowerCase()) {
            return (
              <span
                key={i}
                className="bg-yellow-300 text-black px-0.5 rounded-xs shadow-sm"
              >
                {part}
              </span>
            );
          }
          return <FormattedText key={i} text={part} />;
        })}
      </>
    );
  };

  // Render text with entities
  const renderContent = () => {
    if (entities.length === 0) {
      return (
        <p className="text-sm sm:text-[15px] leading-relaxed wrap-break-word whitespace-pre-wrap">
          <HighlightedText text={msg.content} />
        </p>
      );
    }

    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    entities.forEach((entity, idx) => {
      // Add text before entity
      if (entity.index > lastIndex) {
        const textBefore = msg.content.substring(lastIndex, entity.index);
        elements.push(
          <span key={`text-${idx}`}>
            <HighlightedText text={textBefore} />
          </span>
        );
      }

      // Add entity
      const entityText = msg.content.substring(entity.index, entity.index + entity.length);

      // For entities, we DON'T apply formatting - just show plain text
      // This prevents conflicts between formatting and links
      const entityContent = searchQuery &&
        entityText.toLowerCase().includes(searchQuery.toLowerCase()) ? (
        <span className="bg-yellow-300 text-black px-0.5 rounded-xs shadow-sm">
          {entityText}
        </span>
      ) : (
        entityText
      );

      switch (entity.type) {
        case 'url':
          elements.push(
            <a
              key={`entity-${idx}`}
              href={entity.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-0.5 group"
              title="Open link"
            >
              <span>{entityContent}</span>
            </a>
          );
          break;

        case 'phone':
          elements.push(
            <a
              key={`entity-${idx}`}
              href={entity.href}
              className="text-green-600 dark:text-green-400 hover:underline inline-flex items-center gap-0.5 group"
              title="Call this number"
            >
              <span>{entityContent}</span>
            </a>
          );
          break;

        case 'email':
          elements.push(
            <a
              key={`entity-${idx}`}
              href={entity.href}
              className="text-purple-600 dark:text-purple-400 hover:underline inline-flex items-center gap-0.5 group"
              title="Send email"
            >
              <span>{entityContent}</span>
            </a>
          );
          break;
      }

      lastIndex = entity.index + entity.length;
    });

    // Add remaining text
    if (lastIndex < msg.content.length) {
      const textAfter = msg.content.substring(lastIndex);
      elements.push(
        <span key="text-end">
          <HighlightedText text={textAfter} />
        </span>
      );
    }

    return (
      <p className="text-sm sm:text-[15px] leading-relaxed wrap-break-word whitespace-pre-wrap">
        {elements}
      </p>
    );
  };

  // Check if this is a status reply message
  const statusReplyMatch = useMemo(() => {
    return msg.content.match(STATUS_REPLY_REGEX);
  }, [msg.content]);

  if (statusReplyMatch) {
    const statusId = statusReplyMatch[1]; // may be undefined for old format
    const statusPreview = statusReplyMatch[2];
    const replyMessage = statusReplyMatch[3];

    const isClickable = statusId && onStatusClick;

    return (
      <div className="px-3 py-2">
        {/* Status reply quote bubble */}
        <div
          className={`bg-primary/10 dark:bg-primary/20 border-l-4 border-primary rounded-lg px-3 py-2 mb-2 ${isClickable ? "cursor-pointer hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors" : ""
            }`}
          onClick={isClickable ? () => onStatusClick(statusId) : undefined}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <MessageCircle size={12} className="text-primary" />
            <span className="text-[11px] font-semibold text-primary uppercase tracking-wide">
              Status Reply
            </span>
            {isClickable && (
              <span className="text-[10px] text-primary/60 ml-auto">
                Tap to view
              </span>
            )}
          </div>
          <p className="text-xs text-secondary leading-snug line-clamp-2">
            {statusPreview}
          </p>
        </div>
        {/* Actual reply message */}
        <p className="text-sm sm:text-[15px] leading-relaxed wrap-break-word whitespace-pre-wrap">
          <HighlightedText text={replyMessage} />
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 py-2">
      {renderContent()}
    </div>
  );
};

export default TextMessage;
