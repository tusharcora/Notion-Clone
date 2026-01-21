import React, { useState, useMemo, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import EmojiIcon from '@/components/EmojiIcon';
import { EMOJI_DATA, EmojiData } from '@/lib/openmoji';

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  selectedEmoji?: string;
  columns?: number;
  maxHeight?: string;
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({
  onSelect,
  selectedEmoji,
  columns = 8,
  maxHeight = '400px',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const filteredEmojis = useMemo(() => {
    if (!searchQuery.trim()) {
      return EMOJI_DATA;
    }

    const query = searchQuery.toLowerCase();
    return EMOJI_DATA.filter((item) => {
      const nameMatch = item.name.toLowerCase().includes(query);
      const keywordMatch = item.keywords.some((keyword) =>
        keyword.toLowerCase().includes(query)
      );
      return nameMatch || keywordMatch;
    });
  }, [searchQuery]);

  const handleEmojiClick = (emoji: string) => {
    onSelect(emoji);
  };

  return (
    <div className="space-y-2 flex flex-col">
      <div className="relative flex-shrink-0">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search emojis..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>
      <div 
        ref={scrollContainerRef}
        data-scrollable
        className="w-full flex-shrink-0 overflow-y-auto overflow-x-hidden overscroll-contain"
        style={{ height: maxHeight }}
        onWheel={(e) => {
          // Ensure wheel events are handled by this container
          e.stopPropagation();
        }}
      >
        <div
          className="grid gap-2 p-1"
          style={{
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          }}
        >
          {filteredEmojis.length === 0 ? (
            <div className="col-span-full py-8 text-center text-muted-foreground text-sm">
              No emojis found
            </div>
          ) : (
            filteredEmojis.map((item: EmojiData) => (
              <button
                key={item.emoji}
                onClick={() => handleEmojiClick(item.emoji)}
                className={`p-2 rounded-md hover:bg-accent transition-colors flex items-center justify-center aspect-square ${
                  selectedEmoji === item.emoji
                    ? 'bg-primary/20 ring-2 ring-primary'
                    : ''
                }`}
                title={item.name}
              >
                <EmojiIcon emoji={item.emoji} size={24} />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default EmojiPicker;
