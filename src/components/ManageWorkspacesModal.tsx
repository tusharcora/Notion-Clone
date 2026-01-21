import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Trash2, Save } from 'lucide-react';
import { useWorkspace, Workspace } from '@/contexts/WorkspaceContext';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import EmojiIcon from './EmojiIcon';
import EmojiPicker from './EmojiPicker';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ManageWorkspacesModal = ({ open, onOpenChange }: Props) => {
  const { workspaces, updateWorkspace, deleteWorkspace } = useWorkspace();
  const [editing, setEditing] = useState<Record<string, { name?: string; description?: string }>>({});
  const [workspaceToDelete, setWorkspaceToDelete] = useState<Workspace | null>(null);

  const hasChanges = (workspaceId: string) => {
    const edited = editing[workspaceId];
    if (!edited) return false;
    const workspace = workspaces.find(w => w.id === workspaceId);
    if (!workspace) return false;
    
    const nameChanged = edited.name !== undefined && edited.name !== workspace.name;
    const descriptionChanged = edited.description !== undefined && edited.description !== (workspace.description ?? '');
    
    return nameChanged || descriptionChanged;
  };

  const handleSave = (workspaceId: string) => {
    const edited = editing[workspaceId];
    const workspace = workspaces.find(w => w.id === workspaceId);
    if (!workspace || !edited) return;

    const updates: Partial<Workspace> = {};
    
    if (edited.name !== undefined && edited.name !== workspace.name) {
      updates.name = edited.name;
    }
    
    // Handle description: normalize for comparison
    if (edited.description !== undefined) {
      const trimmedNew = edited.description.trim();
      const trimmedCurrent = (workspace.description || '').trim();
      
      // Normalize: treat empty string as undefined for comparison
      const normalizedNew = trimmedNew || undefined;
      const normalizedCurrent = trimmedCurrent || undefined;
      
      // Only update if values are different
      // Use null instead of undefined to clear the field (Convex requires null to clear optional fields)
      if (normalizedNew !== normalizedCurrent) {
        updates.description = normalizedNew ?? null;
      }
    }

    if (Object.keys(updates).length > 0) {
      updateWorkspace(workspaceId, updates);
      setEditing((prev) => {
        const newEditing = { ...prev };
        delete newEditing[workspaceId];
        return newEditing;
      });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Manage workspaces</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {workspaces.map((workspace) => (
              <div
                key={workspace.id}
                className="space-y-3 rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  {/* Emoji */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="hover:bg-accent rounded-lg p-2 transition-colors flex items-center justify-center min-w-[48px] h-12">
                        <EmojiIcon emoji={workspace.icon} size={28} />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent 
                      className="!w-[min(384px,calc(100vw-2rem))] max-h-[min(50vh,calc(100vh-8rem))] !p-3 flex flex-col"
                      collisionPadding={16}
                      avoidCollisions={true}
                      sideOffset={8}
                      onWheel={(e) => {
                        // Allow wheel events to propagate to scrollable children
                        const target = e.currentTarget;
                        const scrollableElement = target.querySelector('[data-scrollable]') as HTMLElement;
                        if (scrollableElement) {
                          e.stopPropagation();
                        }
                      }}
                    >
                      <div className="space-y-2 flex flex-col">
                        <p className="text-sm font-medium flex-shrink-0">Choose an emoji</p>
                        <EmojiPicker
                          onSelect={(emoji) => {
                            updateWorkspace(workspace.id, { icon: emoji });
                          }}
                          selectedEmoji={workspace.icon}
                          columns={8}
                          maxHeight="calc(50vh - 100px)"
                        />
                      </div>
                    </PopoverContent>
                  </Popover>

                  {/* Name */}
                  <Input
                    value={editing[workspace.id]?.name ?? workspace.name}
                    onChange={(e) =>
                      setEditing((prev) => ({
                        ...prev,
                        [workspace.id]: { ...prev[workspace.id], name: e.target.value },
                      }))
                    }
                    placeholder="Workspace name"
                    className="flex-1"
                  />

                  {/* Save */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleSave(workspace.id)}
                    disabled={!hasChanges(workspace.id)}
                    title="Save changes"
                  >
                    <Save className={`h-4 w-4 ${hasChanges(workspace.id) ? 'text-primary' : 'text-muted-foreground'}`} />
                  </Button>

                  {/* Delete */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setWorkspaceToDelete(workspace)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <Textarea
                    value={editing[workspace.id]?.description ?? workspace.description ?? ''}
                    onChange={(e) => {
                      const value = e.target.value.slice(0, 200);
                      setEditing((prev) => ({
                        ...prev,
                        [workspace.id]: { ...prev[workspace.id], description: value },
                      }));
                    }}
                    placeholder="Add a description (optional)"
                    className="min-h-[80px] resize-none"
                    maxLength={200}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {((editing[workspace.id]?.description ?? workspace.description ?? '')?.length || 0)}/200
                  </p>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {workspaceToDelete && (
        <ConfirmDeleteModal
          open={!!workspaceToDelete}
          onOpenChange={(open) => !open && setWorkspaceToDelete(null)}
          title="Delete workspace?"
          description={`Are you sure you want to delete "${workspaceToDelete.name}"? This action cannot be undone and all documents in this workspace will be deleted.`}
          onConfirm={() => {
            deleteWorkspace(workspaceToDelete.id);
            setWorkspaceToDelete(null);
          }}
        />
      )}
    </>
  );
};

export default ManageWorkspacesModal;
