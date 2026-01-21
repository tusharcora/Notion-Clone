import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import EmojiIcon from '@/components/EmojiIcon';
import EmojiPicker from '@/components/EmojiPicker';

const Index = () => {
  const navigate = useNavigate();
  const { workspaces, createWorkspace } = useWorkspace();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('🏠');

  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a workspace name',
        variant: 'destructive',
      });
      return;
    }
  
    await createWorkspace(newWorkspaceName.trim(), selectedIcon);
    
    toast({
      title: 'Success',
      description: `Workspace "${newWorkspaceName}" created successfully`,
    });
    
    setOpen(false);
    setNewWorkspaceName('');
    setSelectedIcon('🏠');

  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-muted p-6">
      <div className="max-w-6xl w-full space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Notion Clone
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your all-in-one workspace for notes, documents, and knowledge management
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workspaces.map((workspace) => (
            <Card 
              key={workspace.id}
              className="cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2 hover:border-primary/50"
              onClick={() => navigate(`/workspace/${workspace.id}`)}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <EmojiIcon emoji={workspace.icon} size={48} />
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-xl">{workspace.name}</CardTitle>
                    <CardDescription>
                      {new Date(workspace.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {workspace.description ? (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {workspace.description}
                  </p>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText size={16} />
                    <span>Click to open workspace</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Card className="cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2 border-dashed hover:border-primary/50 flex items-center justify-center min-h-[200px]">
                <CardContent className="flex flex-col items-center justify-center gap-4 p-6">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Plus size={32} className="text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-lg">Create Workspace</p>
                    <p className="text-sm text-muted-foreground">Start a new workspace</p>
                  </div>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Workspace</DialogTitle>
                <DialogDescription>
                  Create a new workspace to organize your documents and notes
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Workspace Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Personal, Work, Projects"
                    value={newWorkspaceName}
                    onChange={(e) => setNewWorkspaceName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateWorkspace()}
                  />
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
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateWorkspace}>Create Workspace</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>Built with React, TypeScript, and Tailwind CSS</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
