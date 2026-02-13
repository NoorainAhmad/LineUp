import React, { useMemo } from 'react';
import { Link as LinkIcon, Phone, Mail, Globe, Code } from 'lucide-react';

interface TextMessageProps {
  msg: {
    content: string;
    id?: string;
  };
  searchQuery?: string;
}

// Types of detected entities
type EntityType = 'url' | 'phone' | 'email' | 'code';

interface DetectedEntity {
  type: EntityType;
  text: string;
  index: number;
  length: number;
  href?: string;
}

const TextMessage: React.FC<TextMessageProps> = ({ msg, searchQuery = '' }) => {
  
  // Detect all entities in the text
  const entities = useMemo(() => {
    const detected: DetectedEntity[] = [];
    const text = msg.content;
    
    // URL detection - improved regex for better URL matching
    const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+\.[^\s]+)|([a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?(?:\/[^\s]*)?)/gi;
    
    // Phone number detection (international format)
    const phoneRegex = /(?:\+?(\d{1,3}))?[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g;
    
    // Email detection
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    
    // Code/special characters detection (sequences of special chars or code-like patterns)
    const codeRegex = /[{}[\]()<>$&@!`~|\\/^+=;:#%'"*]{2,}|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|https?:\/\/[^\s]+/g;
    
    let match: any;
    
    // Find URLs
    while ((match = urlRegex.exec(text)) !== null) {
      // Avoid duplicates and overlapping matches
      const url = match[0];
      const isAlreadyDetected = detected.some(e => 
        (e.index <= match.index && e.index + e.length > match.index) ||
        (match.index <= e.index && match.index + url.length > e.index)
      );
      
      if (!isAlreadyDetected) {
        let href = url;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          if (url.startsWith('www.')) {
            href = 'http://' + url;
          } else if (url.includes('.') && !url.includes('@')) {
            // Likely a domain without protocol
            href = 'http://' + url;
          }
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
    
    // Reset lastIndex for other regex
    urlRegex.lastIndex = 0;
    
    // Find phone numbers
    while ((match = phoneRegex.exec(text)) !== null) {
      const phone = match[0];
      const isAlreadyDetected = detected.some(e => 
        (e.index <= match.index && e.index + e.length > match.index) ||
        (match.index <= e.index && match.index + phone.length > e.index)
      );
      
      if (!isAlreadyDetected && phone.length >= 10) { // Minimum reasonable phone length
        detected.push({
          type: 'phone',
          text: phone,
          index: match.index,
          length: phone.length,
          href: `tel:${phone.replace(/[^\d+]/g, '')}`
        });
      }
    }
    
    phoneRegex.lastIndex = 0;
    
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
    
    emailRegex.lastIndex = 0;

    // Find code-like patterns
    while ((match = codeRegex.exec(text)) !== null) {
      const code = match[0];
      const isAlreadyDetected = detected.some(e => 
        (e.index <= match.index && e.index + e.length > match.index) ||
        (match.index <= e.index && match.index + code.length > e.index)
      );
      
      if (!isAlreadyDetected) {
        detected.push({
          type: 'code',
          text: code,
          index: match.index,
          length: code.length
        });
      }
    }
    
    codeRegex.lastIndex = 0;
    
    // Sort by index
    return detected.sort((a, b) => a.index - b.index);
  }, [msg.content]);

  // Highlight search terms
  const HighlightedText = ({ text }: { text: string }) => {
    if (!searchQuery.trim()) {
      return <>{text}</>;
    }
    
    const escapedHighlight = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const parts = text.split(new RegExp(`(${escapedHighlight})`, "gi"));

    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === searchQuery.toLowerCase() ? (
            <span
              key={i}
              className="bg-yellow-300 text-black rounded-xs shadow-sm"
            >
              {part}
            </span>
          ) : (
            part
          ),
        )}
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

      // Add entity with appropriate styling and link
      const entityText = msg.content.substring(entity.index, entity.index + entity.length);
      
      // Check if entity itself contains search highlight
      const shouldHighlight = searchQuery && 
        entityText.toLowerCase().includes(searchQuery.toLowerCase());

      const entityContent = shouldHighlight ? (
        <HighlightedText text={entityText} />
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
              <LinkIcon size={12} className="opacity-60 group-hover:opacity-100" />
              {entityContent}
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
              <Phone size={12} className="opacity-60 group-hover:opacity-100" />
              {entityContent}
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
              <Mail size={12} className="opacity-60 group-hover:opacity-100" />
              {entityContent}
            </a>
          );
          break;
          
        default:
          elements.push(
            <span key={`entity-${idx}`} className="inline-flex items-center gap-0.5">
              <Code size={12} className="opacity-60" />
              {entityContent}
            </span>
          );
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

  return (
    <div className="px-4 py-2">
      {renderContent()}
    </div>
  );
};

export default TextMessage;