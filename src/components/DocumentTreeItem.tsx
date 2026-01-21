import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useWorkspace, Document } from '@/contexts/WorkspaceContext';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronDown, FileText, Plus, Trash2, Star } from 'lucide-react';
import EmojiIcon from '@/components/EmojiIcon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { cn } from '@/lib/utils';

interface DocumentTreeItemProps {
  document: Document;
  level: number;
  searchMode?: boolean;
}

const DocumentTreeItem: React.FC<DocumentTreeItemProps> = ({ document, level, searchMode = false }) => {
  const navigate = useNavigate();
  const { workspaceId, documentId } = useParams<{ workspaceId: string; documentId: string }>();
  const { getChildDocuments, createDocument, deleteDocument, toggleFavorite, documents, updateDocument: updateDocumentContext } = useWorkspace();
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const children = getChildDocuments(document.id, document.workspaceId);
  const hasChildren = children.length > 0;
  const isActive = documentId === document.id;
  const updateDocument = useMutation(api.documents.updateDocument);

  // Check if a document is a descendant of another document
  const isDescendant = (parentId: string, childId: string): boolean => {
    const child = documents.find(d => d.id === childId);
    if (!child || !child.parentId) return false;
    if (child.parentId === parentId) return true;
    return isDescendant(parentId, child.parentId);
  };

  const handleClick = () => {
    navigate(`/workspace/${document.workspaceId}/document/${document.id}`);
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const [isCreating, setIsCreating] = useState(false);
  const handleAddChild = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isCreating) return;
    setIsCreating(true);
    
    try {
      const newDoc = await createDocument(document.workspaceId, document.id, 'Untitled');
      setIsExpanded(true);
      navigate(`/workspace/${document.workspaceId}/document/${newDoc.id}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(document.id);
    toast({
      title: document.isFavorite ? 'Removed from favorites' : 'Added to favorites',
      description: `"${document.title || "Untitled Document"}"`,
    });
  };

  // Drag handlers
  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', document.id);
    e.dataTransfer.setData('application/json', JSON.stringify({ type: 'document', id: document.id }));
    // Store in a global variable for cross-component access
    (window as any).__draggedDocumentId = document.id;
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.stopPropagation();
    setIsDragging(false);
    (window as any).__draggedDocumentId = null;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    
    const draggedId = e.dataTransfer.getData('text/plain') || (window as any).__draggedDocumentId;
    if (draggedId && draggedId !== document.id && !isDescendant(document.id, draggedId)) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const draggedId = e.dataTransfer.getData('text/plain') || (window as any).__draggedDocumentId;
    if (!draggedId || draggedId === document.id) return;
    
    // Prevent dropping on descendants
    if (isDescendant(document.id, draggedId)) {
      toast({
        title: 'Invalid operation',
        description: 'Cannot move a document into its own descendant',
        variant: 'destructive',
      });
      return;
    }

    // Update the dragged document's parentId
    updateDocumentContext(draggedId, { parentId: document.id });
    toast({
      title: 'Document moved',
      description: `"${documents.find(d => d.id === draggedId)?.title || 'Document'}" moved under "${document.title || 'Untitled Document'}"`,
    });
    
    setIsExpanded(true);
    (window as any).__draggedDocumentId = null;
  };

  return (
    <div>
      <div
        draggable={!searchMode}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "group flex items-center gap-1 px-2 py-1.5 rounded-md cursor-pointer transition-all duration-200",
          isActive && 'bg-accent',
          !isActive && !isDragOver && 'hover:bg-accent/50',
          isDragOver && 'bg-primary/20 border-2 border-primary border-dashed',
          isDragging && 'opacity-50'
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
      >
        {!searchMode && hasChildren && (
          <button
            onClick={handleToggle}
            className="p-0.5 hover:bg-accent-foreground/10 rounded"
          >
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        )}
        {!searchMode && !hasChildren && <div className="w-5" />}
        
        <button
          onClick={handleClick}
          className="flex items-center gap-2 flex-1 min-w-0 text-left"
        >
          <span className="text-sm flex-shrink-0">
            {document.icon ? (
              <EmojiIcon emoji={document.icon} size={16} />
            ) : (
              <FileText size={16} />
            )}
          </span>
          <span className="text-sm truncate">{document.title || "Untitled Document"}</span>
        </button>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <span className="text-lg">•••</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleToggleFavorite}>
                <Star size={16} className="mr-2" />
                {document.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleAddChild}>
                <Plus size={16} className="mr-2" />
                Add sub-page
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                <Trash2 size={16} className="mr-2" />
                Trash
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {!searchMode && isExpanded && hasChildren && (
        <div>
          {children.map((child) => (
            <DocumentTreeItem
              key={child.id}
              document={child}
              level={level + 1}
            />
          ))}
        </div>
      )}
      <ConfirmDeleteModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        title="Move to Trash?"
        description={`Are you sure you want to move "${
          document.title || 'Untitled Document'
        }" to Trash? You can restore this item from Trash later.`}
        onConfirm={() => {
          updateDocument({
            id: document._id,
            isArchived: true,
          });

          toast({
            title: 'Moved to Trash',
            description: `"${document.title || 'Untitled Document'}" was moved to trash`,
          });

          if (isActive) {
            navigate(`/workspace/${String(document.workspaceId)}`);
          }
        }}
      />
    </div>
  );
};

export default DocumentTreeItem;
