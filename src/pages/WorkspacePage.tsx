import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import WorkspaceSidebar from '@/components/WorkspaceSidebar';
import CurrentTime from '@/components/CurrentTime';
import EmojiIcon from '@/components/EmojiIcon';

const WorkspacePage = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const { workspaces, setCurrentWorkspace, getDocumentsByWorkspace, createDocument } = useWorkspace();

  const isLoading = workspaces.length === 0;

  useEffect(() => {
    if (isLoading) return;

    if (!workspaceId) return;
    if (workspaces === undefined) return;

    const workspace = workspaces.find(w => w._id === workspaceId);

    if (!workspace) {
      navigate('/');
      return;
    }

    setCurrentWorkspace(workspace);
  }, [workspaceId, workspaces, setCurrentWorkspace, navigate, isLoading]);

  const workspace = workspaces.find(w => w._id === workspaceId);
  const documents = workspaceId ? getDocumentsByWorkspace(workspaceId) : [];
  const handleCreateDocument = async () => {
    if (!workspace) return;
  
    const doc = await createDocument(workspace._id!, null);
    navigate(`/workspace/${doc.workspaceId}/document/${doc._id}`);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  if (!workspace) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full page-enter">
        <WorkspaceSidebar />
        <SidebarInset className="flex-1 w-full min-w-0">
          <div className="p-10">
            <div className="mb-8">
              <h1 className="text-4xl font-bold flex items-center gap-3">
                <EmojiIcon emoji={workspace.icon} size={48} />
                {workspace.name}
              </h1>
              {workspace.description && (
                <p className="text-muted-foreground mt-2 text-lg">
                  {workspace.description}
                </p>
              )}
              <p className="text-muted-foreground mt-2">
                {documents.length} document{documents.length === 1 ? '' : 's'} in this workspace
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {/* Add Page Card */}
              <button
                onClick={handleCreateDocument}
                className="group rounded-xl border-2 border-dashed border-muted-foreground/30 hover:border-muted-foreground/60 transition-colors p-4 flex flex-col items-center justify-center text-muted-foreground"
              >
                <div className="text-5xl mb-2">+</div>
                <div className="font-medium">New Page</div>
              </button>

              {/* Existing Documents */}
              {documents.map((doc) => (
                <button
                  key={doc._id}
                  onClick={() =>
                    navigate(`/workspace/${doc.workspaceId}/document/${doc._id}`)
                  }
                  className="rounded-xl border border-border bg-background p-4 text-left hover:bg-accent/40 transition-all duration-200 hover:scale-[1.02] hover:shadow-md active:scale-[0.98]"
                >
                  {/* Emoji / icon stays prominent */}
                  <div className="flex items-center justify-center h-32 rounded-lg mb-3">
                    <EmojiIcon emoji={doc.icon || '📄'} size={48} />
                  </div>
                
                  {/* Title is muted / ghosted */}
                  <div className="text-sm text-foreground/50 group-hover:text-foreground/80 truncate transition-colors">
                    {doc.title || 'Untitled document'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </SidebarInset>
      </div>
      <div className="ml-auto mt-2 mr-2">
        <CurrentTime />
      </div>

    </SidebarProvider>
  );
};

export default WorkspacePage;