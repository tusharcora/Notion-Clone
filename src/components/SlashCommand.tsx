import React, { useState, useEffect, useRef } from 'react';
import { Editor } from '@tiptap/react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
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
import { Button } from '@/components/ui/button';
import {
  Code,
  Minus,
  Eraser,
  CornerDownLeft,
  CheckSquare,
  Square,
  ListTodo,
  Terminal,
  FileCode,
  Hash,
  Heading1,
  Heading2,
  Heading3,
  Strikethrough,
  Type,
  Image,
  Table,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Calendar,
  AlertCircle,
  ChevronDown,
  FileText,
  BookOpen,
  GitBranch,
  Copy,
  Languages,
} from 'lucide-react';

interface SlashCommandProps {
  editor: Editor;
  range: { from: number; to: number };
  query: string;
}

interface CommandItem {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  command: (editor: Editor) => void;
  keywords?: string[];
  group: string;
  slashText: string;
}

export const SLASH_COMMANDS: CommandItem[] = [
  {
    id: 'codeBlock',
    title: 'Code Block',
    description: 'Insert a multi-line code block',
    icon: Code,
    keywords: ['code', 'pre', 'snippet', 'codeblock', 'fenced'],
    group: 'Code',
    slashText: '/codeblock',
    command: (editor) => {
      editor.chain().focus().toggleCodeBlock().run();
    },
  },
  {
    id: 'inlineCode',
    title: 'Inline Code',
    description: 'Insert inline code snippet',
    icon: FileCode,
    keywords: ['inline', 'code', 'snippet', 'monospace'],
    group: 'Code',
    slashText: '/code',
    command: (editor) => {
      // If nothing is selected, insert a placeholder for code
      if (editor.state.selection.empty) {
        editor.chain().focus().toggleCode().run();
      } else {
        // Wrap selected text in code
        editor.chain().focus().toggleCode().run();
      }
    },
  },
  {
    id: 'taskList',
    title: 'Task List',
    description: 'Create a todo list with checkboxes',
    icon: ListTodo,
    keywords: ['todo', 'task', 'checkbox', 'checklist', 'done'],
    group: 'Code',
    slashText: '/tasklist',
    command: (editor) => {
      editor.chain().focus().toggleTaskList().run();
    },
  },
  {
    id: 'orderedList',
    title: 'Numbered List',
    description: 'Create a numbered list',
    icon: Hash,
    keywords: ['ordered', 'numbered', 'list', 'numbers', 'steps'],
    group: 'Code',
    slashText: '/numberedlist',
    command: (editor) => {
      editor.chain().focus().toggleOrderedList().run();
    },
  },
  {
    id: 'bulletList',
    title: 'Bullet List',
    description: 'Create a bulleted list',
    icon: Square,
    keywords: ['bullet', 'list', 'unordered', 'items'],
    group: 'Code',
    slashText: '/bulletlist',
    command: (editor) => {
      editor.chain().focus().toggleBulletList().run();
    },
  },
  {
    id: 'blockquote',
    title: 'Blockquote',
    description: 'Insert a callout or quote block',
    icon: Terminal,
    keywords: ['quote', 'callout', 'note', 'warning', 'blockquote'],
    group: 'Code',
    slashText: '/quote',
    command: (editor) => {
      editor.chain().focus().toggleBlockquote().run();
    },
  },
  {
    id: 'divider',
    title: 'Divider',
    description: 'Insert a horizontal rule',
    icon: Minus,
    keywords: ['hr', 'horizontal', 'rule', 'line', 'separator'],
    group: 'Code',
    slashText: '/divider',
    command: (editor) => {
      editor.chain().focus().setHorizontalRule().run();
    },
  },
  {
    id: 'clearFormatting',
    title: 'Clear Formatting',
    description: 'Remove all formatting from selection',
    icon: Eraser,
    keywords: ['clear', 'formatting', 'reset', 'remove'],
    group: 'Formatting',
    slashText: '/clear',
    command: (editor) => {
      editor.chain().focus().clearNodes().unsetAllMarks().run();
    },
  },
  {
    id: 'hardBreak',
    title: 'Line Break',
    description: 'Add a line break without new paragraph',
    icon: CornerDownLeft,
    keywords: ['break', 'br', 'line', 'newline'],
    group: 'Formatting',
    slashText: '/break',
    command: (editor) => {
      editor.chain().focus().setHardBreak().run();
    },
  },
  {
    id: 'heading1',
    title: 'Heading 1',
    description: 'Large heading',
    icon: Heading1,
    keywords: ['h1', 'heading', 'title', 'large'],
    group: 'Structure',
    slashText: '/h1',
    command: (editor) => {
      editor.chain().focus().toggleHeading({ level: 1 }).run();
    },
  },
  {
    id: 'heading2',
    title: 'Heading 2',
    description: 'Medium heading',
    icon: Heading2,
    keywords: ['h2', 'heading', 'subtitle', 'medium'],
    group: 'Structure',
    slashText: '/h2',
    command: (editor) => {
      editor.chain().focus().toggleHeading({ level: 2 }).run();
    },
  },
  {
    id: 'heading3',
    title: 'Heading 3',
    description: 'Small heading',
    icon: Heading3,
    keywords: ['h3', 'heading', 'small'],
    group: 'Structure',
    slashText: '/h3',
    command: (editor) => {
      editor.chain().focus().toggleHeading({ level: 3 }).run();
    },
  },
  {
    id: 'paragraph',
    title: 'Paragraph',
    description: 'Convert to normal text',
    icon: Type,
    keywords: ['text', 'normal', 'paragraph', 'body'],
    group: 'Structure',
    slashText: '/p',
    command: (editor) => {
      editor.chain().focus().setParagraph().run();
    },
  },
  {
    id: 'strike',
    title: 'Strikethrough',
    description: 'Strike through text',
    icon: Strikethrough,
    keywords: ['strike', 'delete', 'remove', 'cross'],
    group: 'Formatting',
    slashText: '/strike',
    command: (editor) => {
      editor.chain().focus().toggleStrike().run();
    },
  },
  {
    id: 'alignLeft',
    title: 'Align Left',
    description: 'Align text to the left',
    icon: AlignLeft,
    keywords: ['left', 'align', 'justify'],
    group: 'Formatting',
    slashText: '/left',
    command: (editor) => {
      editor.chain().focus().setTextAlign('left').run();
    },
  },
  {
    id: 'alignCenter',
    title: 'Align Center',
    description: 'Center align text',
    icon: AlignCenter,
    keywords: ['center', 'align', 'middle'],
    group: 'Formatting',
    slashText: '/center',
    command: (editor) => {
      editor.chain().focus().setTextAlign('center').run();
    },
  },
  {
    id: 'alignRight',
    title: 'Align Right',
    description: 'Align text to the right',
    icon: AlignRight,
    keywords: ['right', 'align', 'justify'],
    group: 'Formatting',
    slashText: '/right',
    command: (editor) => {
      editor.chain().focus().setTextAlign('right').run();
    },
  },
  // 1. Table
  {
    id: 'table',
    title: 'Table',
    description: 'Insert a 2x2 or 3x3 table',
    icon: Table,
    keywords: ['table', 'grid', 'cells', 'rows', 'columns'],
    group: 'Content',
    slashText: '/table',
    command: (editor) => {
      editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    },
  },
  // 2. Image
  {
    id: 'image',
    title: 'Image',
    description: 'Insert an image from URL',
    icon: Image,
    keywords: ['image', 'picture', 'photo', 'img', 'url'],
    group: 'Content',
    slashText: '/image',
    command: (editor) => {
      const url = window.prompt('Enter image URL:', 'https://');
      if (url && url.trim()) {
        editor.chain().focus().setImage({ src: url.trim() }).insertContent(' ').run();
      }
    },
  },
  // 3. Callout/Alert
  {
    id: 'callout',
    title: 'Callout',
    description: 'Insert a callout or alert box',
    icon: AlertCircle,
    keywords: ['callout', 'alert', 'note', 'warning', 'info', 'tip'],
    group: 'Content',
    slashText: '/callout',
    command: (editor) => {
      const calloutType = window.prompt('Callout type (note/warning/tip):', 'note') || 'note';
      const calloutText = window.prompt('Callout text:', '') || '';
      if (calloutText) {
        // Use blockquote with a special class for callouts
        editor
          .chain()
          .focus()
          .insertContent(`<blockquote class="callout callout-${calloutType}"><p><strong>${calloutType.charAt(0).toUpperCase() + calloutType.slice(1)}:</strong> ${calloutText}</p></blockquote>`)
          .run();
      }
    },
  },
  // 5. Timestamp/Date
  {
    id: 'timestamp',
    title: 'Timestamp',
    description: 'Insert current date and time',
    icon: Calendar,
    keywords: ['timestamp', 'date', 'time', 'now', 'datetime'],
    group: 'Content',
    slashText: '/date',
    command: (editor) => {
      const now = new Date();
      const dateStr = now.toLocaleDateString();
      const timeStr = now.toLocaleTimeString();
      editor
        .chain()
        .focus()
        .insertContent(`${dateStr} ${timeStr} `)
        .run();
    },
  },
  // 6. Code with Language
  {
    id: 'codeLang',
    title: 'Code Block (Language)',
    description: 'Insert a code block with language',
    icon: Languages,
    keywords: ['code', 'language', 'lang', 'syntax', 'highlight'],
    group: 'Code',
    slashText: '/code-lang',
    command: (editor) => {
      // Show prompt immediately while still in user gesture context
      const lang = window.prompt('Language (e.g., javascript, python, typescript):', 'javascript');
      
      if (lang !== null && lang !== '') {
        // Insert code block after prompt returns
        // The deletion of "/code-lang" text is handled in selectItem
        setTimeout(() => {
          editor
            .chain()
            .focus()
            .toggleCodeBlock()
            .run();
          // Note: TipTap's default CodeBlock doesn't support language attribute,
          // but the code block is inserted and user can type code
        }, 10);
      }
    },
  },
  // 8. Collapsible/Details
  {
    id: 'collapsible',
    title: 'Collapsible',
    description: 'Insert a collapsible section',
    icon: ChevronDown,
    keywords: ['collapsible', 'details', 'expand', 'collapse', 'hide', 'show'],
    group: 'Structure',
    slashText: '/collapsible',
    command: (editor) => {
      const summary = window.prompt('Summary/Title:', 'Click to expand') || 'Click to expand';
      // Use heading + paragraph as collapsible section (since <details> isn't in TipTap schema)
      editor
        .chain()
        .focus()
        .insertContent(`<h3 class="collapsible-header">▼ ${summary}</h3><p class="collapsible-content">Content goes here...</p>`)
        .run();
    },
  },
  // 15. File Reference
  {
    id: 'file',
    title: 'File Reference',
    description: 'Insert a file reference or path',
    icon: FileText,
    keywords: ['file', 'path', 'reference', 'attachment', 'document'],
    group: 'Content',
    slashText: '/file',
    command: (editor) => {
      const filePath = window.prompt('File path:', '/path/to/file.js') || '';
      const displayText = window.prompt('Display text (optional):', filePath) || filePath;
      if (filePath) {
        editor
          .chain()
          .focus()
          .toggleCode()
          .insertContent(displayText)
          .toggleCode()
          .insertContent(' ')
          .run();
      }
    },
  },
  // 17. Reference/Citation
  {
    id: 'reference',
    title: 'Reference',
    description: 'Insert a reference or citation',
    icon: BookOpen,
    keywords: ['reference', 'cite', 'citation', 'source', 'link', 'doc'],
    group: 'Content',
    slashText: '/reference',
    command: (editor) => {
      const title = window.prompt('Reference title:', 'Documentation') || 'Reference';
      const url = window.prompt('URL:', 'https://') || '';
      if (url) {
        const href = url.trim().startsWith('http://') || url.trim().startsWith('https://') 
          ? url.trim() 
          : `https://${url.trim()}`;
        // Insert link using TipTap's link extension
        editor
          .chain()
          .focus()
          .insertContent({
            type: 'text',
            text: `[${title}]`,
            marks: [{ type: 'link', attrs: { href, target: '_blank' } }],
          })
          .insertContent(' ')
          .run();
      }
    },
  },
  // 18. Code Diff
  {
    id: 'diff',
    title: 'Code Diff',
    description: 'Insert a code diff block',
    icon: GitBranch,
    keywords: ['diff', 'change', 'git', 'compare', 'before', 'after'],
    group: 'Code',
    slashText: '/diff',
    command: (editor) => {
      // Insert as code block with diff markers
      editor
        .chain()
        .focus()
        .toggleCodeBlock()
        .insertContent('+ Added line\n  Unchanged line\n- Removed line')
        .toggleCodeBlock()
        .insertContent(' ')
        .run();
    },
  },
  // 19. Code Snippet
  {
    id: 'snippet',
    title: 'Code Snippet',
    description: 'Insert a code snippet',
    icon: Copy,
    keywords: ['snippet', 'code', 'copy', 'example', 'clipboard'],
    group: 'Code',
    slashText: '/snippet',
    command: (editor) => {
      const code = window.prompt('Code snippet:', 'console.log("Hello World");') || '';
      if (code) {
        editor
          .chain()
          .focus()
          .toggleCodeBlock()
          .insertContent(code)
          .toggleCodeBlock()
          .insertContent(' ')
          .run();
      }
    },
  },
];

const SlashCommand: React.FC<SlashCommandProps> = ({ editor, range, query }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const commandListRef = useRef<HTMLDivElement>(null);
  
  // Prompt state management
  const [promptState, setPromptState] = useState<{
    type: string | null;
    open: boolean;
    values: Record<string, string>;
    onSubmit: ((values: Record<string, string>) => void) | null;
    onCancel?: () => void;
  }>({
    type: null,
    open: false,
    values: {},
    onSubmit: null,
  });

  const filteredCommands = React.useMemo(() => {
    // If query is empty or just whitespace, show all commands
    if (!query || !query.trim()) {
      return SLASH_COMMANDS;
    }

    const lowerQuery = query.toLowerCase().trim();
    // Remove leading slashes from query for better matching
    const normalizedQuery = lowerQuery.replace(/^\/+/, '').trim();
    
    // If normalized query is empty after removing slashes, show all commands
    if (!normalizedQuery) {
      return SLASH_COMMANDS;
    }
    
    const filtered = SLASH_COMMANDS.filter((cmd) => {
      // Match title (case-insensitive partial match)
      const matchesTitle = cmd.title.toLowerCase().includes(normalizedQuery);
      
      // Match description (case-insensitive partial match)
      const matchesDescription = cmd.description.toLowerCase().includes(normalizedQuery);
      
      // Match keywords (case-insensitive partial match)
      const matchesKeywords = cmd.keywords?.some((kw) =>
        kw.toLowerCase().includes(normalizedQuery)
      ) || false;
      
      // Match slashText (remove leading slash for comparison)
      const cmdSlashText = cmd.slashText.replace(/^\/+/, '').toLowerCase();
      const matchesSlashText = cmdSlashText.includes(normalizedQuery) || 
                               cmdSlashText.startsWith(normalizedQuery);
      
      // Also match command ID
      const matchesId = cmd.id.toLowerCase().includes(normalizedQuery);
      
      return matchesTitle || matchesDescription || matchesKeywords || matchesSlashText || matchesId;
    });
    
    return filtered;
  }, [query]);

  // Helper to create submit handlers for different prompt types
  const createPromptSubmitHandler = (commandId: string, editor: Editor, rangeToDelete?: { from: number; to: number }) => {
    return (values: Record<string, string>) => {
      // Delete the command text after dialog submission
      if (rangeToDelete) {
        editor
          .chain()
          .focus()
          .deleteRange({ from: rangeToDelete.from, to: rangeToDelete.to })
          .run();
      }
      
      // Execute command logic based on commandId
      switch (commandId) {
        case 'image':
          if (values.url?.trim()) {
            editor.chain().focus().setImage({ src: values.url.trim() }).insertContent(' ').run();
          }
          break;
        case 'codeLang':
          editor.chain().focus().toggleCodeBlock().run();
          break;
        case 'callout':
          if (values.text?.trim()) {
            const calloutType = values.type || 'note';
            editor
              .chain()
              .focus()
              .insertContent(`<blockquote class="callout callout-${calloutType}"><p><strong>${calloutType.charAt(0).toUpperCase() + calloutType.slice(1)}:</strong> ${values.text}</p></blockquote>`)
              .run();
          }
          break;
        case 'collapsible':
          const summary = values.summary || 'Click to expand';
          editor
            .chain()
            .focus()
            .insertContent(`<h3 class="collapsible-header">▼ ${summary}</h3><p class="collapsible-content">Content goes here...</p>`)
            .run();
          break;
        case 'file':
          if (values.path?.trim()) {
            const displayText = values.displayText || values.path;
            editor
              .chain()
              .focus()
              .toggleCode()
              .insertContent(displayText)
              .toggleCode()
              .insertContent(' ')
              .run();
          }
          break;
        case 'reference':
          if (values.url?.trim()) {
            const title = values.title || 'Reference';
            const href = values.url.trim().startsWith('http://') || values.url.trim().startsWith('https://') 
              ? values.url.trim() 
              : `https://${values.url.trim()}`;
            editor
              .chain()
              .focus()
              .insertContent({
                type: 'text',
                text: `[${title}]`,
                marks: [{ type: 'link', attrs: { href, target: '_blank' } }],
              })
              .insertContent(' ')
              .run();
          }
          break;
        case 'snippet':
          if (values.code?.trim()) {
            editor
              .chain()
              .focus()
              .toggleCodeBlock()
              .insertContent(values.code)
              .toggleCodeBlock()
              .insertContent(' ')
              .run();
          }
          break;
      }
      // Note: State is closed in handlePromptSubmit, no need to close here
    };
  };
  
  // Helper to get default values for prompts
  const getDefaultPromptValues = (commandId: string): Record<string, string> => {
    switch (commandId) {
      case 'image':
        return { url: 'https://' };
      case 'codeLang':
        return { language: 'javascript' };
      case 'callout':
        return { type: 'note', text: '' };
      case 'collapsible':
        return { summary: 'Click to expand' };
      case 'file':
        return { path: '/path/to/file.js', displayText: '' };
      case 'reference':
        return { title: 'Documentation', url: 'https://' };
      case 'snippet':
        return { code: 'console.log("Hello World");' };
      default:
        return {};
    }
  };

  const selectItem = (index: number) => {
    const command = filteredCommands[index];
    if (command) {
      // Calculate the end position (after "/" and query)
      const endPos = range.from + 1 + query.length;
      const rangeToDelete = { from: range.from, to: endPos };
      
      // Check if command needs a prompt
      const commandId = command.id;
      const needsPrompt = ['codeLang', 'image', 'callout', 'collapsible', 'file', 'reference', 'snippet'].includes(commandId);
      
      if (needsPrompt) {
        // For prompt commands, show dialog without deleting text first
        // The text will be deleted when dialog submits
        const onSubmitCallback = createPromptSubmitHandler(commandId, editor, rangeToDelete);
        setPromptState({
          type: commandId,
          open: true,
          values: getDefaultPromptValues(commandId),
          onSubmit: onSubmitCallback,
          onCancel: () => {
            // Delete text on cancel too
            editor
              .chain()
              .focus()
              .deleteRange({ from: rangeToDelete.from, to: rangeToDelete.to })
              .run();
            setPromptState({ type: null, open: false, values: {}, onSubmit: null });
          },
        });
      } else {
        // For commands without prompts, delete first then execute
        editor
          .chain()
          .focus()
          .deleteRange({ from: range.from, to: endPos })
          .run();
        
        try {
          command.command(editor);
        } catch (error) {
          console.error('Error executing command:', error);
        }
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev === 0 ? filteredCommands.length - 1 : prev - 1
        );
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev === filteredCommands.length - 1 ? 0 : prev + 1
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        selectItem(selectedIndex);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        // Don't delete "/" when escaping, just let the menu close naturally
        // The "/" will remain in the text
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, filteredCommands, editor, range]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Scroll selected item into view
  useEffect(() => {
    const list = commandListRef.current;
    if (list) {
      const selectedElement = list.querySelector(
        `[data-index="${selectedIndex}"]`
      ) as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  // Group commands by category
  const groupedCommands = React.useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    filteredCommands.forEach((cmd) => {
      if (!groups[cmd.group]) {
        groups[cmd.group] = [];
      }
      groups[cmd.group].push(cmd);
    });
    return groups;
  }, [filteredCommands]);

  // Flatten commands to calculate indices correctly
  const flatCommands = React.useMemo(() => {
    return filteredCommands;
  }, [filteredCommands]);

  // Hide menu if no commands match and query is not empty
  if (filteredCommands.length === 0 && query && query.trim()) {
    return null;
  }

  const handlePromptSubmit = () => {
    // Use the latest promptState by accessing it directly
    setPromptState((currentState) => {
      if (currentState.onSubmit) {
        currentState.onSubmit(currentState.values);
        return { type: null, open: false, values: {}, onSubmit: null };
      } else {
        console.error('No onSubmit handler for prompt:', currentState);
        return currentState;
      }
    });
  };

  return (
    <>
      <div className="z-50" data-slash-command>
      <Command className="border rounded-lg shadow-lg w-80 max-h-[300px] overflow-hidden bg-popover">
        <CommandList
          ref={commandListRef}
          className="max-h-[300px] overflow-y-auto"
        >
          <CommandEmpty>No commands found</CommandEmpty>
          {Object.entries(groupedCommands).map(([groupName, commands]) => (
            <CommandGroup key={groupName} heading={groupName}>
              {commands.map((cmd) => {
                const index = flatCommands.findIndex((c) => c.id === cmd.id);
                const Icon = cmd.icon;
                return (
                  <CommandItem
                    key={cmd.id}
                    data-index={index}
                    value={cmd.title}
                    onSelect={() => selectItem(index)}
                    className={index === selectedIndex ? 'bg-accent' : ''}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span>{cmd.title}</span>
                        <span className="text-xs text-muted-foreground font-mono">
                          {cmd.slashText}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {cmd.description}
                      </span>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          ))}
        </CommandList>
      </Command>
    </div>
    
    {/* Prompt Dialogs */}
    {/* Image Prompt */}
    <Dialog open={promptState.open && promptState.type === 'image'} onOpenChange={(open) => !open && promptState.onCancel?.()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Insert Image</DialogTitle>
          <DialogDescription>Enter the image URL</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="image-url">URL</Label>
            <Input
              id="image-url"
              value={promptState.values.url || ''}
              onChange={(e) => setPromptState({ ...promptState, values: { ...promptState.values, url: e.target.value } })}
              placeholder="https://example.com/image.png"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handlePromptSubmit();
                }
              }}
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={promptState.onCancel}>Cancel</Button>
          <Button onClick={handlePromptSubmit}>Insert</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Code Language Prompt */}
    <Dialog open={promptState.open && promptState.type === 'codeLang'} onOpenChange={(open) => !open && promptState.onCancel?.()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Code Block</DialogTitle>
          <DialogDescription>Enter the programming language</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="code-lang">Language</Label>
            <Input
              id="code-lang"
              value={promptState.values.language || ''}
              onChange={(e) => setPromptState({ ...promptState, values: { ...promptState.values, language: e.target.value } })}
              placeholder="javascript, python, typescript, etc."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handlePromptSubmit();
                }
              }}
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={promptState.onCancel}>Cancel</Button>
          <Button onClick={handlePromptSubmit}>Insert</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Callout Prompt */}
    <Dialog open={promptState.open && promptState.type === 'callout'} onOpenChange={(open) => !open && promptState.onCancel?.()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Insert Callout</DialogTitle>
          <DialogDescription>Create a callout or alert box</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="callout-type">Type</Label>
            <Input
              id="callout-type"
              value={promptState.values.type || ''}
              onChange={(e) => setPromptState({ ...promptState, values: { ...promptState.values, type: e.target.value } })}
              placeholder="note, warning, or tip"
              autoFocus
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="callout-text">Text</Label>
            <Input
              id="callout-text"
              value={promptState.values.text || ''}
              onChange={(e) => setPromptState({ ...promptState, values: { ...promptState.values, text: e.target.value } })}
              placeholder="Callout message"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handlePromptSubmit();
                }
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={promptState.onCancel}>Cancel</Button>
          <Button onClick={handlePromptSubmit}>Insert</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Collapsible Prompt */}
    <Dialog open={promptState.open && promptState.type === 'collapsible'} onOpenChange={(open) => !open && promptState.onCancel?.()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Insert Collapsible Section</DialogTitle>
          <DialogDescription>Enter the summary/title for the collapsible section</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="collapsible-summary">Summary/Title</Label>
            <Input
              id="collapsible-summary"
              value={promptState.values.summary || ''}
              onChange={(e) => setPromptState({ ...promptState, values: { ...promptState.values, summary: e.target.value } })}
              placeholder="Click to expand"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handlePromptSubmit();
                }
              }}
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={promptState.onCancel}>Cancel</Button>
          <Button onClick={handlePromptSubmit}>Insert</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* File Reference Prompt */}
    <Dialog open={promptState.open && promptState.type === 'file'} onOpenChange={(open) => !open && promptState.onCancel?.()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Insert File Reference</DialogTitle>
          <DialogDescription>Enter the file path</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="file-path">File Path</Label>
            <Input
              id="file-path"
              value={promptState.values.path || ''}
              onChange={(e) => setPromptState({ ...promptState, values: { ...promptState.values, path: e.target.value } })}
              placeholder="/path/to/file.js"
              autoFocus
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="file-display">Display Text (optional)</Label>
            <Input
              id="file-display"
              value={promptState.values.displayText || ''}
              onChange={(e) => setPromptState({ ...promptState, values: { ...promptState.values, displayText: e.target.value } })}
              placeholder="Leave empty to use file path"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handlePromptSubmit();
                }
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={promptState.onCancel}>Cancel</Button>
          <Button onClick={handlePromptSubmit}>Insert</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Reference/Citation Prompt */}
    <Dialog open={promptState.open && promptState.type === 'reference'} onOpenChange={(open) => !open && promptState.onCancel?.()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Insert Reference</DialogTitle>
          <DialogDescription>Enter the reference title and URL</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="ref-title">Title</Label>
            <Input
              id="ref-title"
              value={promptState.values.title || ''}
              onChange={(e) => setPromptState({ ...promptState, values: { ...promptState.values, title: e.target.value } })}
              placeholder="Documentation"
              autoFocus
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ref-url">URL</Label>
            <Input
              id="ref-url"
              value={promptState.values.url || ''}
              onChange={(e) => setPromptState({ ...promptState, values: { ...promptState.values, url: e.target.value } })}
              placeholder="https://example.com"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handlePromptSubmit();
                }
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={promptState.onCancel}>Cancel</Button>
          <Button onClick={handlePromptSubmit}>Insert</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Code Snippet Prompt */}
    <Dialog open={promptState.open && promptState.type === 'snippet'} onOpenChange={(open) => !open && promptState.onCancel?.()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Insert Code Snippet</DialogTitle>
          <DialogDescription>Enter the code snippet</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="snippet-code">Code</Label>
            <Input
              id="snippet-code"
              value={promptState.values.code || ''}
              onChange={(e) => setPromptState({ ...promptState, values: { ...promptState.values, code: e.target.value } })}
              placeholder="console.log('Hello World');"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  e.preventDefault();
                  handlePromptSubmit();
                }
              }}
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={promptState.onCancel}>Cancel</Button>
          <Button onClick={handlePromptSubmit}>Insert</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default SlashCommand;
