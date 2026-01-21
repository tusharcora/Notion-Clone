import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import WorkspaceSidebar from '@/components/WorkspaceSidebar';
import DocumentEditor from '@/components/DocumentEditor';
import DocumentHeader from '@/components/DocumentHeader';

const DocumentPage = () => {
  const { workspaceId, documentId } = useParams<{ workspaceId: string; documentId: string }>();
  const navigate = useNavigate();
  const { workspaces, documents, setCurrentWorkspace, setCurrentDocument } = useWorkspace();
  const [saveStatus, setSaveStatus] = React.useState<'saving' | 'saved'>('saved');
  const savingStartedAt = React.useRef<number | null>(null);

  // Check if data is still loading
  const isLoading = workspaces.length === 0 || documents.length === 0;

  useEffect(() => {
    // Don't check for workspace/document until data has loaded
    if (isLoading) return;

    const workspace = workspaces.find(w => w._id === workspaceId);
    const document = documents.find(d => d._id === documentId);

    if (document?.updatedAt) {
      setSaveStatus('saved');
    }
    
    if (!workspace || !document) {
      navigate('/');
      return;
    }

    setCurrentWorkspace(workspace);
    setCurrentDocument(document);

    return () => {
      setCurrentDocument(null);
    };
  }, [workspaceId, documentId, workspaces, documents, setCurrentWorkspace, setCurrentDocument, navigate, isLoading]);

  const document = documents.find(d => d._id === documentId);

  // Show loading state while data is loading
  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  if (!document) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full document-page-enter">
        <WorkspaceSidebar />
        <SidebarInset className="flex-1 w-full min-w-0">
          <div className="flex flex-col h-full document-content-enter">
            <DocumentHeader document={document} saveStatus={saveStatus}/>
            <DocumentEditor document={document} setSaveStatus={setSaveStatus}/>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default DocumentPage;