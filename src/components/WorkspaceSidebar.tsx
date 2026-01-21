import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useTheme } from '@/components/ThemeProvider';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Search, Star, Moon, Sun, Settings, Trash2, ChevronDown, Calendar, Home } from 'lucide-react';
import DocumentTreeItem from '@/components/DocumentTreeItem';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import ManageWorkspacesModal from '@/components/ManageWorkspacesModal';
import TrashModal from '@/components/TrashModal';
import EmojiIcon from '@/components/EmojiIcon';
import EmojiPicker from '@/components/EmojiPicker';

const WorkspaceSidebar = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { 
    currentWorkspace, 
    createDocument, 
    getChildDocuments, 
    documents,
    getDocumentsByWorkspace,
    workspaces,
    setCurrentWorkspace,
    createWorkspace
  } = useWorkspace();
  const [searchQuery, setSearchQuery] = useState('');
  const [showManageWorkspaces, setShowManageWorkspaces] = useState(false);
  const [showCreateWorkspaceDialog, setShowCreateWorkspaceDialog] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [newWorkspaceDescription, setNewWorkspaceDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('🏠');

  const [isCreating, setIsCreating] = useState(false);
  const [showTrash, setShowTrash] = useState(false);

const handleCreateDocument = async () => {
  if (isCreating) return; // Prevent double clicks
  
  console.log("1. Starting document creation");
  console.log("2. workspaceId:", workspaceId);
  
  if (!workspaceId) {
    console.error("No workspace ID found!");
    return;
  }
  
  setIsCreating(true);
  
  try {
    console.log("3. Calling createDocument...");
    const newDoc = await createDocument(workspaceId, null, 'Untitled');
    console.log("4. Document created:", newDoc);
    console.log("5. Navigating to:", `/workspace/${workspaceId}/document/${newDoc._id}`);
    
    navigate(`/workspace/${workspaceId}/document/${newDoc._id}`);
    
    console.log("6. Navigation called");
  } finally {
    setIsCreating(false);
  }
};

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const rootDocuments = workspaceId ? getChildDocuments(null, workspaceId) : [];
  const favoriteDocuments = workspaceId 
    ? getDocumentsByWorkspace(workspaceId).filter(d => d.isFavorite)
    : [];

  const filteredDocuments = searchQuery.trim()
    ? documents.filter(d => 
        d.workspaceId === workspaceId &&
        !d.isArchived &&
        d.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim()) return;
    
    try {
      const description = newWorkspaceDescription.trim();
      const workspaceId = await createWorkspace(
        newWorkspaceName.trim(), 
        selectedIcon, 
        description || undefined
      );
      setShowCreateWorkspaceDialog(false);
      setNewWorkspaceName('');
      setNewWorkspaceDescription('');
      setSelectedIcon('🏠');
      navigate(`/workspace/${workspaceId}`);
    } catch (error) {
      console.error('Error creating workspace:', error);
    }
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center justify-between mb-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                {currentWorkspace && (
                  <>
                    <EmojiIcon emoji={currentWorkspace.icon} size={28} />
                    <span className="font-semibold text-lg">{currentWorkspace.name}</span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="bottom"
              align="start"
              sideOffset={8}
              alignOffset={0}
              className="
                z-50
                rounded-xl
                border border-border
                bg-popover
                p-2
                shadow-lg
                animate-in
                fade-in
                zoom-in-95
                w-56
              "
            >
              {workspaces.map((workspace) => (
                <DropdownMenuItem
                  key={workspace.id}
                  onClick={() => {
                    setCurrentWorkspace(workspace);
                    navigate(`/workspace/${workspace._id}`);
                  }}
                  className={`
                    flex items-center gap-3
                    rounded-lg
                    px-3 py-2
                    cursor-pointer
                    bg-transparent
                    transition-all
                    ${
                      currentWorkspace?.id === workspace._id
                        ? 'text-foreground font-medium'
                        : 'text-foreground/70 hover:bg-accent'
                    }
                  `}
                >
                  <EmojiIcon emoji={workspace.icon} size={20} />
                  <span className="truncate">{workspace.name}</span>
                </DropdownMenuItem>
              ))}
              <div className="my-2 h-px bg-border" />
                    <DropdownMenuItem
                      onClick={() => {
                        setNewWorkspaceName('');
                        setNewWorkspaceDescription('');
                        setSelectedIcon('🏠');
                        setShowCreateWorkspaceDialog(true);
                      }}
                className="
                  flex items-center gap-3
                  rounded-lg
                  px-3 py-2
                  cursor-pointer
                  bg-transparent
                  text-foreground
                  transition-all
                  hover:bg-accent
                "
              >
                <Plus className="h-4 w-4 opacity-80" />
                <span>Add workspace</span>
              </DropdownMenuItem>
              <div className="my-2 h-px bg-border" />
              <DropdownMenuItem
                onClick={() => setShowManageWorkspaces(true)}
                className="
                  flex items-center gap-3
                  rounded-lg
                  px-3 py-2
                  cursor-pointer
                  bg-transparent
                  text-foreground
                  transition-all
                  hover:bg-accent
                "
              >
                <Settings className="h-4 w-4 opacity-80" />
                <span>Manage workspaces</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-8 w-8"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {workspaceId && (
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => navigate(`/workspace/${workspaceId}`)}>
                    <Home className="h-4 w-4" />
                    <span>Home</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              {workspaceId && (
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => navigate(`/workspace/${workspaceId}/calendar`)}>
                    <Calendar className="h-4 w-4" />
                    <span>Calendar</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleCreateDocument}>
                  <Plus className="h-4 w-4" />
                  <span>New Page</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {searchQuery.trim() && (
          <SidebarGroup>
            <SidebarGroupLabel>Search Results</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="space-y-1">
                {filteredDocuments.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    No documents found
                  </div>
                ) : (
                  filteredDocuments.map((doc) => (
                    <DocumentTreeItem
                      key={doc._id}
                      document={doc}
                      level={0}
                      searchMode
                    />
                  ))
                )}
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {!searchQuery.trim() && favoriteDocuments.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>
              <Star className="h-4 w-4 mr-1" />
              Favorites
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="space-y-1">
                {favoriteDocuments.map((doc) => (
                  <DocumentTreeItem
                    key={doc._id}
                    document={doc}
                    level={0}
                  />
                ))}
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {!searchQuery.trim() && (
          <SidebarGroup>
            <SidebarGroupLabel>Pages</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="space-y-1">
                {rootDocuments.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    No pages yet. Create your first page!
                  </div>
                ) : (
                  rootDocuments.map((doc) => (
                    <DocumentTreeItem
                      key={doc._id}
                      document={doc}
                      level={0}
                    />
                  ))
                )}
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => setShowTrash(true)} className="text-red-500 hover:text-red-600 hover:bg-destructive/20">
              <Trash2 className="h-4 w-4" />
              <span>Trash</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <ManageWorkspacesModal
        open={showManageWorkspaces}
        onOpenChange={setShowManageWorkspaces}
      />
      <TrashModal
        open={showTrash}
        onOpenChange={setShowTrash}
      />
      <Dialog open={showCreateWorkspaceDialog} onOpenChange={setShowCreateWorkspaceDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Workspace</DialogTitle>
            <DialogDescription>
              Create a new workspace to organize your documents and notes
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="workspace-name">Workspace Name</Label>
              <Input
                id="workspace-name"
                placeholder="e.g., Personal, Work, Projects"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newWorkspaceName.trim()) {
                    handleCreateWorkspace();
                  }
                }}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workspace-description">Description (Optional)</Label>
              <div className="space-y-1">
                <Textarea
                  id="workspace-description"
                  placeholder="Add a description for this workspace..."
                  value={newWorkspaceDescription}
                  onChange={(e) => setNewWorkspaceDescription(e.target.value.slice(0, 200))}
                  className="min-h-[80px] resize-none"
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {newWorkspaceDescription.length}/200
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Choose an Icon</Label>
              <EmojiPicker
                onSelect={setSelectedIcon}
                selectedEmoji={selectedIcon}
                columns={5}
                maxHeight="300px"
              />
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setShowCreateWorkspaceDialog(false)}>
              Cancel
            </Button>
            <Button 
              type="button"
              onClick={handleCreateWorkspace}
              disabled={!newWorkspaceName.trim()}
            >
              Create Workspace
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Sidebar>
  );
};

export default WorkspaceSidebar;
