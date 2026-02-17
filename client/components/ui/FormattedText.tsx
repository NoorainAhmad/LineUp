import React from 'react';

interface FormattedTextProps {
  text: string;
  className?: string;
}

export const FormattedText: React.FC<FormattedTextProps> = ({ text, className = "" }) => {
  // Function to parse and format text with WhatsApp-style syntax
  const formatText = (input: string) => {
    if (!input) return input;

    // Order matters: process from most specific to least
    const patterns = [
      // Monospace: `text` or ```text```
      { regex: /```([^`]+)```/g, format: (match: string, content: string) => (
        <code key={match} className="font-mono bg-black/10 dark:bg-white/10 px-1 rounded text-sm">{content}</code>
      )},
      { regex: /`([^`]+)`/g, format: (match: string, content: string) => (
        <code key={match} className="font-mono bg-black/10 dark:bg-white/10 px-1 rounded text-sm">{content}</code>
      )},
      
      // Strikethrough: ~text~
      { regex: /~([^~]+)~/g, format: (match: string, content: string) => (
        <del key={match} className="line-through">{content}</del>
      )},
      
      // Bold+Italic combined: *_text_* or *_text_*
      { regex: /\*_([^_]+)_\*/g, format: (match: string, content: string) => (
        <strong key={match} className="font-bold italic">{content}</strong>
      )},
      { regex: /_\*([^*]+)\*_/g, format: (match: string, content: string) => (
        <strong key={match} className="font-bold italic">{content}</strong>
      )},
      
      // Bold: *text* or **text**
      { regex: /\*\*([^*]+)\*\*/g, format: (match: string, content: string) => (
        <strong key={match} className="font-bold">{content}</strong>
      )},
      { regex: /\*([^*]+)\*/g, format: (match: string, content: string) => (
        <strong key={match} className="font-bold">{content}</strong>
      )},
      
      // Italic: _text_
      { regex: /_([^_]+)_/g, format: (match: string, content: string) => (
        <em key={match} className="italic">{content}</em>
      )},
    ];

    // Split text into parts and format
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let keyCounter = 0;

    // Helper to process text with patterns
    const processText = (text: string): React.ReactNode[] => {
      const result: React.ReactNode[] = [];
      let remaining = text;

      for (const pattern of patterns) {
        const matches = [...remaining.matchAll(pattern.regex)];
        if (matches.length > 0) {
          let lastMatchEnd = 0;
          
          matches.forEach((match, i) => {
            // Add text before match
            if (match.index! > lastMatchEnd) {
              result.push(remaining.substring(lastMatchEnd, match.index!));
            }
            
            // Add formatted match
            result.push(pattern.format(match[0], match[1]));
            lastMatchEnd = match.index! + match[0].length;
          });
          
          // Add remaining text
          if (lastMatchEnd < remaining.length) {
            result.push(remaining.substring(lastMatchEnd));
          }
          
          // Merge adjacent text nodes
          return result.reduce((acc: React.ReactNode[], curr, i) => {
            if (typeof curr === 'string' && typeof acc[acc.length - 1] === 'string') {
              acc[acc.length - 1] = acc[acc.length - 1] + curr;
            } else {
              acc.push(curr);
            }
            return acc;
          }, []);
        }
      }
      
      return [remaining];
    };

    const processed = processText(input);
    
    return processed.map((part, i) => {
      if (typeof part === 'string') {
        // Handle line breaks in plain text
        return part.split('\n').map((line, j) => (
          <React.Fragment key={`${i}-${j}`}>
            {j > 0 && <br />}
            {line}
          </React.Fragment>
        ));
      }
      return <React.Fragment key={`f-${keyCounter++}`}>{part}</React.Fragment>;
    });
  };

  return (
    <span className={className}>
      {formatText(text)}
    </span>
  );
};