import React, { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Link from '@tiptap/extension-link';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import Image from '@tiptap/extension-image';
import { Document, useWorkspace } from '@/contexts/WorkspaceContext';
import EditorToolbar from '@/components/EditorToolbar';
import SlashCommand, { SLASH_COMMANDS } from '@/components/SlashCommand';

interface DocumentEditorProps {
  document: Document;
  setSaveStatus: React.Dispatch<React.SetStateAction<'saving' | 'saved'>>;
}

const DocumentEditor: React.FC<DocumentEditorProps> = ({ document, setSaveStatus }) => {
  const { updateDocument } = useWorkspace();
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);
  const lastSavedContent = useRef(document.content);
  const isTyping = useRef(false);
  const [slashCommand, setSlashCommand] = useState<{
    range: { from: number; to: number };
    query: string;
    position?: { top: number; left: number };
  } | null>(null);
  const slashCommandRef = useRef<{ range: { from: number; to: number }; query: string } | null>(null);
  const editorRef = useRef<any>(null);
  const [linkTooltip, setLinkTooltip] = useState<{ url: string; x: number; y: number } | null>(null);


  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'cursor-pointer',
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse border border-border my-4',
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: 'border-b border-border',
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-border bg-muted px-4 py-2 font-semibold',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-border px-4 py-2',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph', 'tableCell'],
      }),
      TaskList,
      TaskItem,
      Placeholder.configure({
        placeholder: 'Start writing or type "/" for commands...',
      }),
    ],
    content: document.content || "",
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none max-w-none',
      },
      handleDOMEvents: {
        click: (view, event) => {
          const target = event.target as HTMLElement;
          const linkElement = target.closest('a');
          
          if (linkElement) {
            const href = linkElement.getAttribute('href');
            if (href) {
              // Single click: show URL in an alert
              event.preventDefault();
              event.stopPropagation();
              alert(`Link: ${href}`);
              return true;
            }
          }
          return false;
        },
        dblclick: (view, event) => {
          const target = event.target as HTMLElement;
          const linkElement = target.closest('a');
          
          if (linkElement) {
            const href = linkElement.getAttribute('href');
            if (href) {
              // Double click: navigate to the link
              event.preventDefault();
              event.stopPropagation();
              window.open(href, '_blank', 'noopener,noreferrer');
              return true;
            }
          }
          return false;
        },
      },
      handleKeyDown: (view, event) => {
        // Handle Enter key when slash command menu is open
        if (event.key === 'Enter' && slashCommandRef.current) {
          const { state } = view;
          const { selection } = state;
          const { $from } = selection;
          const range = slashCommandRef.current.range;
          const textAfterSlash = state.doc.textBetween(range.from + 1, $from.pos, '').trim();
          
          // Check if typed text matches a slash command
          if (textAfterSlash) {
            // Normalize: remove leading slashes and convert to lowercase
            const normalizedText = textAfterSlash.toLowerCase().replace(/^\/+/, '');
            
            // Find matching command by slashText (without leading slash) or id
            const matchingCommand = SLASH_COMMANDS.find((cmd) => {
              const cmdSlashText = cmd.slashText.replace(/^\/+/, '').toLowerCase();
              return cmdSlashText === normalizedText || cmd.id.toLowerCase() === normalizedText;
            });
            
            if (matchingCommand && editorRef.current) {
              event.preventDefault();
              // Delete the "/" and typed text, then execute command
              const endPos = range.from + 1 + textAfterSlash.length;
              view.dispatch(
                view.state.tr.delete(range.from, endPos)
              );
              
              // Close menu first
              setSlashCommand(null);
              slashCommandRef.current = null;
              
              // Execute command after deletion
              setTimeout(() => {
                if (editorRef.current) {
                  matchingCommand.command(editorRef.current);
                }
              }, 0);
              
              return true;
            }
          }
        }
        
        // Handle slash command
        if (event.key === '/') {
          const { state } = view;
          const { selection } = state;
          const { $from } = selection;
          const textBefore = $from.nodeBefore?.textContent || '';
          
          // Check if we're at the start of a paragraph or after whitespace
          if ($from.parentOffset === 0 || textBefore.match(/\s$/)) {
            const range = {
              from: $from.pos,
              to: $from.pos + 1, // Include the "/"
            };
            // Get position for menu placement - calculate after "/" is inserted
            // Use setTimeout to allow "/" to be inserted first, then calculate position
            slashCommandRef.current = { range, query: '' };
            // Position will be calculated in handleUpdate, but set initial state
            // so menu appears immediately after "/" is typed
            requestAnimationFrame(() => {
              // Calculate position after "/" is inserted
              const coords = view.coordsAtPos(range.from); // Position of "/"
              const editorElement = view.dom.closest('.ProseMirror') as HTMLElement;
              const editorContainer = editorElement?.closest('.max-w-4xl') as HTMLElement;
              if (editorElement && editorContainer) {
                const editorRect = editorContainer.getBoundingClientRect();
                // Calculate line height from the coordinates
                const lineHeight = coords.bottom - coords.top;
                // Position menu below the "/" character - use bottom coordinate + gap
                const position = {
                  top: coords.bottom - editorRect.top + 8,
                  left: coords.left - editorRect.left,
                };
                setSlashCommand({ range, query: '', position });
              } else {
                setSlashCommand({ range, query: '' });
              }
            });
            return false; // Allow "/" to be inserted
          }
        }
        
        // Handle keyboard shortcuts for formatting
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        const modKey = isMac ? event.metaKey : event.ctrlKey;
        
        if (modKey && event.key.toLowerCase() === 'b') {
          event.preventDefault();
          view.dispatch(
            view.state.tr.setMeta('keyboard', true).setMeta('format', 'bold')
          );
          return true;
        }
        
        if (modKey && event.key.toLowerCase() === 'i') {
          event.preventDefault();
          view.dispatch(
            view.state.tr.setMeta('keyboard', true).setMeta('format', 'italic')
          );
          return true;
        }
        
        if (modKey && event.key.toLowerCase() === 'u') {
          event.preventDefault();
          view.dispatch(
            view.state.tr.setMeta('keyboard', true).setMeta('format', 'underline')
          );
          return true;
        }
        
        return false;
      },
    },
  });

  // Store editor in ref for access in handleKeyDown
  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  useEffect(() => {
    if (!editor) return;
  
    // Update editor classes based on active marks for cursor styling
    const updateEditorClasses = () => {
      const editorElement = editor.view.dom.closest('.ProseMirror') as HTMLElement;
      if (!editorElement) return;
      
      // Remove formatting classes
      editorElement.classList.remove('prosemirror-bold-active', 'prosemirror-italic-active');
      
      // Add classes based on active marks
      if (editor.isActive('bold')) {
        editorElement.classList.add('prosemirror-bold-active');
      }
      if (editor.isActive('italic')) {
        editorElement.classList.add('prosemirror-italic-active');
      }
    };

    // Handle keyboard shortcuts via transaction metadata
    const handleTransaction = ({ transaction, editor }: any) => {
      if (transaction.getMeta('format')) {
        const format = transaction.getMeta('format');
        if (format === 'bold') {
          editor.chain().focus().toggleBold().run();
        } else if (format === 'italic') {
          editor.chain().focus().toggleItalic().run();
        } else if (format === 'underline') {
          editor.chain().focus().toggleUnderline().run();
        }
      }
      
      // Update classes after transaction
      updateEditorClasses();
    };

    const handleUpdate = ({ editor }: any) => {
      const html = editor.getHTML();
      isTyping.current = true;

      // Update editor classes based on active marks
      updateEditorClasses();

      // Update slash command query if active
      if (slashCommandRef.current) {
        const { state, view } = editor.view;
        const { $from } = state.selection;
        const range = slashCommandRef.current.range;
        
        // Check if range.from is still within the document bounds
        if (range.from >= state.doc.content.size) {
          setSlashCommand(null);
          slashCommandRef.current = null;
          return;
        }
        
        // Check if the "/" character still exists
        try {
          const charAtSlash = state.doc.textBetween(range.from, range.from + 1, '');
          if (charAtSlash !== '/') {
            setSlashCommand(null);
            slashCommandRef.current = null;
            return;
          }
        } catch (e) {
          setSlashCommand(null);
          slashCommandRef.current = null;
          return;
        }
        
        // Check if cursor moved before the "/"
        if ($from.pos < range.from) {
          setSlashCommand(null);
          slashCommandRef.current = null;
          return;
        }
        
        // Get text between "/" and cursor position
        const textAfterSlash = state.doc.textBetween(range.from + 1, $from.pos, '');
        
        // Close menu if space or newline was typed
        if (textAfterSlash.includes(' ') || textAfterSlash.includes('\n')) {
          setSlashCommand(null);
          slashCommandRef.current = null;
          return;
        }
        
        // Update query and position
        slashCommandRef.current.query = textAfterSlash;
        const coords = view.coordsAtPos(range.from);
        const editorElement = view.dom.closest('.ProseMirror') as HTMLElement;
        const editorContainer = editorElement?.closest('.max-w-4xl') as HTMLElement;
        
        if (editorElement && editorContainer) {
          const editorRect = editorContainer.getBoundingClientRect();
          const position = {
            top: coords.bottom - editorRect.top + 8,
            left: coords.left - editorRect.left,
          };
          setSlashCommand({ range, query: textAfterSlash, position });
        } else {
          setSlashCommand({ range, query: textAfterSlash });
        }
      }

      // Only update save status and save if slash command menu is not open
      if (!slashCommandRef.current) {
        setSaveStatus('saving');
        if (saveTimeout.current) {
          clearTimeout(saveTimeout.current);
        }
  
        saveTimeout.current = setTimeout(() => {
          if (html !== lastSavedContent.current) {
            updateDocument(document.id, { content: html });
            lastSavedContent.current = html;
          }
          isTyping.current = false;
        }, 600); // ← save ONLY after pause
      }
    };
  
    editor.on('transaction', handleTransaction);
    editor.on('update', handleUpdate);
    editor.on('selectionUpdate', updateEditorClasses);
  
    // Initial class update
    updateEditorClasses();
  
    return () => {
      editor.off('transaction', handleTransaction);
      editor.off('update', handleUpdate);
      editor.off('selectionUpdate', updateEditorClasses);
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current);
      }
    };
  }, [editor, document.id, updateDocument]);  
  
  // Close slash menu when toolbar buttons are clicked
  useEffect(() => {
    if (!slashCommand) return;
    
    const handleToolbarClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Check if click is on a toolbar button
      if (target.closest('.sticky') && target.closest('button')) {
        // Close menu when toolbar button is clicked
        setSlashCommand(null);
        if (slashCommandRef.current) {
          slashCommandRef.current = null;
        }
      }
    };
    
    // Listen for clicks on the document
    window.document.addEventListener('click', handleToolbarClick);
    
    return () => {
      window.document.removeEventListener('click', handleToolbarClick);
    };
  }, [slashCommand]);
  
  useEffect(() => {
    if (!editor) return;
  
    if (isTyping.current) return;
  
    const current = editor.getHTML();
  
    if (
      document.content &&
      document.content !== current &&
      document.content !== lastSavedContent.current
    ) {
      lastSavedContent.current = document.content;
  
      editor.commands.setContent(document.content, {
        emitUpdate: false,
      });
    }
  }, [document.id, document.content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="relative z-0 border-b bg-background">
      <EditorToolbar editor={editor || null} />
      <div className="flex-1 overflow-y-auto relative">
        <div className="max-w-4xl mx-auto py-8 px-6 relative">
          <EditorContent editor={editor} />
          {slashCommand && editor && (
            <div 
              className="absolute z-50" 
              style={slashCommand.position ? { 
                top: `${slashCommand.position.top}px`, 
                left: `${slashCommand.position.left}px` 
              } : undefined}
            >
              <SlashCommand
                editor={editor}
                range={slashCommand.range}
                query={slashCommand.query || ''}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentEditor;
