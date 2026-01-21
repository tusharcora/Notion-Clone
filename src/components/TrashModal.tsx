import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText, RotateCcw, Trash2 } from 'lucide-react';
import { useWorkspace, Document } from '@/contexts/WorkspaceContext';
import { useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import EmojiIcon from '@/components/EmojiIcon';
import { useState } from 'react';

interface TrashModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TrashModal = ({ open, onOpenChange }: TrashModalProps) => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const { documents, updateDocument, deleteDocument } = useWorkspace();
  const { toast } = useToast();
  const [deleteModalDoc, setDeleteModalDoc] = useState<Document | null>(null);

  // Get archived documents for the current workspace
  const archivedDocuments = workspaceId
    ? documents.filter((d) => d.workspaceId === workspaceId && d.isArchived)
    : [];

  const handleRestore = (doc: Document) => {
    updateDocument(doc.id, {
      isArchived: false,
    });
    toast({
      title: 'Document restored',
      description: `"${doc.title || 'Untitled Document'}" has been restored`,
    });
  };

  const handlePermanentDelete = (doc: Document) => {
    deleteDocument(doc.id);
    toast({
      title: 'Document permanently deleted',
      description: `"${doc.title || 'Untitled Document'}" has been permanently deleted`,
    });
    setDeleteModalDoc(null);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Trash
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4">
            {archivedDocuments.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <Trash2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Trash is empty</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {archivedDocuments.map((doc) => (
                  <div
                    key={doc._id}
                    className="flex items-center gap-3 rounded-lg border p-3 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center justify-center">
                      {doc.icon ? (
                        <EmojiIcon emoji={doc.icon} size={20} />
                      ) : (
                        <FileText className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {doc.title || 'Untitled Document'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Deleted {new Date(doc.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRestore(doc)}
                        className="h-8"
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Restore
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteModalDoc(doc)}
                        className="h-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {deleteModalDoc && (
        <ConfirmDeleteModal
          open={!!deleteModalDoc}
          onOpenChange={(open) => !open && setDeleteModalDoc(null)}
          title="Permanently delete document?"
          description={`Are you sure you want to permanently delete "${
            deleteModalDoc.title || 'Untitled Document'
          }"? This action cannot be undone.`}
          onConfirm={() => handlePermanentDelete(deleteModalDoc)}
        />
      )}
    </>
  );
};

export default TrashModal;
