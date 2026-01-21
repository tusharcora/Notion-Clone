import React, { useState, useEffect } from 'react';
import { getOpenMojiUrl } from '@/lib/openmoji';

interface EmojiDisplayProps {
  emoji: string;
  className?: string;
  size?: number;
  fallback?: boolean;
}

/**
 * Component to display emoji using OpenMoji SVG
 * Falls back to emoji text if image fails to load
 */
const EmojiDisplay: React.FC<EmojiDisplayProps> = ({ 
  emoji, 
  className = '', 
  size = 24,
  fallback = false
}) => {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [emoji]);

  // If we should use fallback or image failed, show emoji text
  if (fallback || imgError) {
    return (
      <span className={className} style={{ fontSize: `${size}px` }}>
        {emoji}
      </span>
    );
  }

  // Try to load OpenMoji SVG
  try {
    const emojiUrl = getOpenMojiUrl(emoji);
    return (
      <img
        src={emojiUrl}
        alt={emoji}
        className={className}
        style={{ width: `${size}px`, height: `${size}px`, objectFit: 'contain' }}
        onError={() => setImgError(true)}
      />
    );
  } catch (error) {
    // If URL generation fails, fall back to emoji text
    return (
      <span className={className} style={{ fontSize: `${size}px` }}>
        {emoji}
      </span>
    );
  }
};

export default EmojiDisplay;
