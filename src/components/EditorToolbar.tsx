import React, { useState, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import { TextSelection } from 'prosemirror-state';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from '@tiptap/extension-link';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  FileCode,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
} from 'lucide-react';


interface EditorToolbarProps {
  editor: Editor;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({ editor }) => {
  const [updateKey, setUpdateKey] = useState(0);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkInsertDialog, setShowLinkInsertDialog] = useState(false); // For inserting link with text
  const [linkText, setLinkText] = useState(''); // For the text when no selection

  // Force re-render when editor state changes
  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      setUpdateKey(prev => prev + 1);
    };

    const handleSelectionUpdate = () => {
      setUpdateKey(prev => prev + 1);
    };

    editor.on('update', handleUpdate);
    editor.on('selectionUpdate', handleSelectionUpdate);
    editor.on('transaction', handleUpdate);

    return () => {
      editor.off('update', handleUpdate);
      editor.off('selectionUpdate', handleSelectionUpdate);
      editor.off('transaction', handleUpdate);
    };
  }, [editor]);

  if (!editor) {
    return null;
  }

  const ToolbarButton = ({ 
    onClick, 
    isActive, 
    icon: Icon, 
    title 
  }: { 
    onClick: () => void; 
    isActive?: boolean; 
    icon: any; 
    title: string;
  }) => (
    <Button
      variant={isActive ? 'secondary' : 'ghost'}
      size="icon"
      onMouseDown={(e) => {
        e.preventDefault();
        // Ensure editor is focused before executing command
        if (editor && editor.view) {
          editor.view.focus();
        }
        // Use setTimeout to ensure focus happens before command execution
        setTimeout(() => {
          onClick();
        }, 0);
      }}
      title={title}
      className="h-8 w-8"
      type="button"
    >
      <Icon size={16} />
    </Button>
  );

  return (
    <div className="border-b bg-background sticky top-0 z-10">
      <div className="flex items-center gap-1 p-2 flex-wrap">
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          icon={Undo}
          title="Undo (Ctrl+Z / Cmd+Z)"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          icon={Redo}
          title="Redo (Ctrl+Shift+Z / Cmd+Shift+Z)"
        />

        <Separator orientation="vertical" className="h-6 mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          icon={Heading1}
          title="Heading 1"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          icon={Heading2}
          title="Heading 2"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          icon={Heading3}
          title="Heading 3"
        />

        <Separator orientation="vertical" className="h-6 mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          icon={Bold}
          title="Bold"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          icon={Italic}
          title="Italic"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          icon={Underline}
          title="Underline"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          icon={Strikethrough}
          title="Strikethrough"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive('code')}
          icon={FileCode}
          title="Inline Code"
        />
        <Button
          variant={editor.isActive('link') ? 'secondary' : 'ghost'}
          size="icon"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const { from, to, empty } = editor.state.selection;
            
            // If a link is already active, remove it
            if (editor.isActive('link')) {
              editor.chain().focus().unsetLink().run();
              return;
            }
            
            if (!empty) {
              // Text is selected - show dialog for URL
              setLinkUrl('https://');
              setShowLinkDialog(true);
            } else {
              // No selection - show dialog for text and URL
              setLinkText('');
              setLinkUrl('https://');
              setShowLinkInsertDialog(true);
            }
          }}
          title="Link"
          className="h-8 w-8"
          type="button"
        >
          <LinkIcon size={16} />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <Separator orientation="vertical" className="h-6 mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          isActive={editor.isActive({ textAlign: 'left' }) || (!editor.isActive({ textAlign: 'center' }) && !editor.isActive({ textAlign: 'right' }))}
          icon={AlignLeft}
          title="Align Left"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          isActive={editor.isActive({ textAlign: 'center' })}
          icon={AlignCenter}
          title="Align Center"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          isActive={editor.isActive({ textAlign: 'right' })}
          icon={AlignRight}
          title="Align Right"
        />

        <Separator orientation="vertical" className="h-6 mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          icon={List}
          title="Bullet List"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          icon={ListOrdered}
          title="Numbered List"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          icon={Quote}
          title="Quote"
        />
      </div>
      
      {/* Link Dialog - for selected text */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Insert Link</DialogTitle>
            <DialogDescription>
              Enter the URL for the selected text.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="link-url">URL</Label>
              <Input
                id="link-url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleLinkSubmit();
                  } else if (e.key === 'Escape') {
                    setShowLinkDialog(false);
                  }
                }}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowLinkDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleLinkSubmit}>
              Insert Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Link Insert Dialog - for inserting link with text (no selection) */}
      <Dialog open={showLinkInsertDialog} onOpenChange={setShowLinkInsertDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Insert Link</DialogTitle>
            <DialogDescription>
              Enter the link text and URL.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="link-text-insert">Link Text</Label>
              <Input
                id="link-text-insert"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="Enter text for link"
                autoFocus
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="link-url-insert">URL</Label>
              <Input
                id="link-url-insert"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleLinkInsertSubmit();
                  } else if (e.key === 'Escape') {
                    setShowLinkInsertDialog(false);
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowLinkInsertDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleLinkInsertSubmit}>
              Insert Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  function handleLinkSubmit() {
    if (!linkUrl || !linkUrl.trim()) {
      return;
    }
  
    const href = linkUrl.trim().startsWith('http://') || linkUrl.trim().startsWith('https://') 
      ? linkUrl.trim() 
      : `https://${linkUrl.trim()}`;
    
    editor.view.focus();
    
    // Apply link to selection and add space after
    editor
      .chain()
      .focus()
      .setLink({ href })
      .command(({ tr, dispatch }) => {
        if (dispatch) {
          // Insert space with NO marks at the end of selection
          const { $to } = tr.selection;
          tr.insert($to.pos, editor.schema.text(' '));
          // Set cursor after the space
          tr.setSelection(TextSelection.near(tr.doc.resolve($to.pos + 1)));
        }
        return true;
      })
      .run();
    
    setShowLinkDialog(false);
    setLinkUrl('');
  }

  function handleLinkInsertSubmit() {
    if (!linkUrl || !linkUrl.trim() || !linkText || !linkText.trim()) {
      return;
    }
  
    const href = linkUrl.trim().startsWith('http://') || linkUrl.trim().startsWith('https://') 
      ? linkUrl.trim() 
      : `https://${linkUrl.trim()}`;
    
    editor.view.focus();
    
    // Insert the link, then explicitly insert space without marks
    editor
      .chain()
      .focus()
      .insertContent({
        type: 'text',
        text: linkText.trim(),
        marks: [{ type: 'link', attrs: { href } }],
      })
       .command(({ tr, dispatch }) => {
         if (dispatch) {
           // Insert space with NO marks
           const { $to } = tr.selection;
           tr.insert($to.pos, editor.schema.text(' '));
           // Set cursor after the space
           tr.setSelection(TextSelection.near(tr.doc.resolve($to.pos + 1)));
         }
         return true;
       })
      .run();
    
    setShowLinkInsertDialog(false);
    setLinkUrl('');
    setLinkText('');
  }
};

export default EditorToolbar;
