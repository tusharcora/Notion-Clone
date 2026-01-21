import React, { useState } from 'react';
import { getOpenMojiUrl } from '@/lib/openmoji';

interface EmojiIconProps {
  emoji: string;
  className?: string;
  size?: number;
}

/**
 * Component to display emoji using OpenMoji SVG
 * Falls back to emoji text if image fails to load
 */
const EmojiIcon: React.FC<EmojiIconProps> = ({ 
  emoji, 
  className = '', 
  size = 24
}) => {
  const [imgError, setImgError] = useState(false);
  
  if (imgError || !emoji) {
    return <span className={className} style={{ fontSize: `${size}px` }}>{emoji}</span>;
  }

  return (
    <img
      src={getOpenMojiUrl(emoji)}
      alt={emoji}
      className={className}
      style={{ width: `${size}px`, height: `${size}px`, objectFit: 'contain' }}
      onError={() => setImgError(true)}
    />
  );
};

export default EmojiIcon;
