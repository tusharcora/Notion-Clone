import React, { useState } from 'react';
import { Document, useWorkspace } from '@/contexts/WorkspaceContext';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Star, Image, Smile, Trash2, Calendar as CalendarIcon, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import EmojiIcon from '@/components/EmojiIcon';
import EmojiPicker from '@/components/EmojiPicker';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';
const COVER_IMAGES = [
  'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800',
  'https://images.unsplash.com/photo-1557683316-973673baf926?w=800',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
  'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=800',
];

interface DocumentHeaderProps {
  document: Document;
  saveStatus: 'saving' | 'saved';
}

const DocumentHeader: React.FC<DocumentHeaderProps> = ({ document, saveStatus }) => {
  const { updateDocument, toggleFavorite } = useWorkspace();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(document.title || "");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleTitleChange = () => {
    const trimmed = title.trim();
  
    if (trimmed !== document.title) {
      updateDocument(document.id, { title: trimmed });
    }
  
    setIsEditingTitle(false);
  };

  const handleIconSelect = (icon: string) => {
    updateDocument(document.id, { icon });
  };

  const handleCoverSelect = (coverImage: string) => {
    updateDocument(document.id, { coverImage });
  };

  const handleRemoveCover = () => {
    updateDocument(document.id, { coverImage: null });
  };

  const handleArchive = () => {
    updateDocument(document.id, { isArchived: true });
  };

  const handleDueDateChange = (date: Date | undefined) => {
    updateDocument(document.id, { dueDate: date ? date.getTime() : null });
  };

  const handleRemoveDueDate = () => {
    updateDocument(document.id, { dueDate: null });
  };

  return (
    <div className="border-b bg-background">
      {typeof document.coverImage === 'string' && (
        <div className="relative h-48 overflow-hidden group">
          <img 
            src={document.coverImage} 
            alt="Cover" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="secondary" size="sm">
                  <Image size={16} className="mr-2" />
                  Change Cover
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="grid grid-cols-2 gap-2">
                  {COVER_IMAGES.map((img) => (
                    <button
                      key={img}
                      onClick={() => handleCoverSelect(img)}
                      className="h-24 rounded-md overflow-hidden border-2 border-transparent hover:border-primary transition-all"
                    >
                      <img src={img} alt="Cover" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            <Button variant="secondary" size="sm" onClick={handleRemoveCover}>
              Remove
            </Button>
          </div>
        </div>
      )}

      <div className="p-6 space-y-4">
        <div className="flex items-start gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <button className="hover:bg-accent rounded-lg p-2 transition-colors flex items-center justify-center">
                <EmojiIcon emoji={document.icon || '📄'} size={64} />
              </button>
            </PopoverTrigger>
            <PopoverContent 
              className="!w-[min(384px,calc(100vw-2rem))] max-h-[min(50vh,calc(100vh-8rem))] !p-3 flex flex-col overflow-hidden"
              collisionPadding={16}
              avoidCollisions={true}
              sideOffset={8}
            >
              <div className="space-y-2 flex flex-col flex-1 min-h-0">
                <p className="text-sm font-medium flex-shrink-0">Choose an icon</p>
                <div className="flex-1 min-h-0 overflow-hidden">
                  <EmojiPicker
                    onSelect={handleIconSelect}
                    selectedEmoji={document.icon || '📄'}
                    columns={8}
                    maxHeight="calc(50vh - 100px)"
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <div className="flex-1 space-y-2">
            {isEditingTitle ? (
              <Input
                value={title}
                placeholder="Untitled Document"
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleTitleChange();
                  if (e.key === 'Escape') {
                    setTitle(document.title || "");
                    setIsEditingTitle(false);
                  }
                }}
                className="text-4xl font-bold border-none shadow-none focus-visible:ring-0 px-0 h-auto placeholder:text-muted-foreground"
                autoFocus
              />
            ) : (
              <h1
                onClick={() => setIsEditingTitle(true)}
                className="text-4xl font-bold cursor-text hover:bg-accent/50 rounded px-2 -mx-2 transition-colors text-muted-foreground"
              >
                {document.title || "Untitled Document"}
              </h1>
            )}
            <div className="flex items-center gap-4 text-sm text-muted-foreground px-2 flex-wrap">
              <span>
              {saveStatus === 'saving'
                ? 'Saving…'
                : `Last edited ${format(new Date(document.updatedAt), 'PPp')}`}
              </span>
              {document.dueDate && (
                <div className="flex items-center gap-2 px-2 py-1 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md">
                  <CalendarIcon className="h-3 w-3 text-red-600 dark:text-red-400" />
                  <span className="text-red-700 dark:text-red-300 text-xs font-medium">
                    Due: {format(new Date(document.dueDate), 'MMM d, yyyy')}
                  </span>
                  <button
                    onClick={handleRemoveDueDate}
                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => toggleFavorite(document.id)}
            className={document.isFavorite ? 'text-yellow-500' : ''}
          >
            <Star size={20} fill={document.isFavorite ? 'currentColor' : 'none'} />
          </Button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <SidebarTrigger />
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm">
                <CalendarIcon size={16} className="mr-2" />
                {document.dueDate ? 'Change Due Date' : 'Set Due Date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={document.dueDate ? new Date(document.dueDate) : undefined}
                onSelect={(date) => handleDueDateChange(date)}
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                initialFocus
              />
              {document.dueDate && (
                <div className="p-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={handleRemoveDueDate}
                  >
                    Remove Due Date
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
          {!document.coverImage && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Image size={16} className="mr-2" />
                  Add Cover
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="grid grid-cols-2 gap-2">
                  {COVER_IMAGES.map((img) => (
                    <button
                      key={img}
                      onClick={() => handleCoverSelect(img)}
                      className="h-24 rounded-md overflow-hidden border-2 border-transparent hover:border-primary transition-all"
                    >
                      <img src={img} alt="Cover" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDeleteModal(true)}
            className="text-red-500 hover:text-red-600 hover:bg-destructive/20"
          >
            <Trash2 size={16} className="mr-2" />
            Trash
          </Button>
        </div>
      </div>
      <ConfirmDeleteModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        title="Archive document?"
        description="This document will be moved to trash. You can restore it later."
        onConfirm={handleArchive}
      />
    </div>
  );
};

export default DocumentHeader;
