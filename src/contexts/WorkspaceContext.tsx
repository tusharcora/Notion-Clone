import React, { createContext, useContext, useState, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

export interface Document {
  _id: Id<"documents">;
  id: string; // For compatibility
  title: string;
  content: string;
  workspaceId: string;
  parentId: string | null;
  icon?: string;
  coverImage?: string;
  isFavorite: boolean;
  isArchived: boolean;
  dueDate?: number; // Unix timestamp
  createdAt: Date;
  updatedAt: Date;
}

export interface Workspace {
  _id: Id<"workspaces">;
  id: string; // For compatibility
  name: string;
  icon: string;
  description?: string;
  createdAt: Date;
}

interface WorkspaceContextType {
  workspaces: Workspace[];
  documents: Document[];
  currentWorkspace: Workspace | null;
  currentDocument: Document | null;
  createWorkspace: (name: string, icon: string, description?: string) => Promise<string>;
  deleteWorkspace: (id: string) => Promise<void>;
  updateWorkspace: (id: string, updates: Partial<Workspace>) => Promise<void>;
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  setCurrentDocument: (document: Document | null) => void;
  createDocument: (workspaceId: string, parentId: string | null, title?: string) => Promise<Document>;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  deleteDocument: (id: string) => void;
  toggleFavorite: (id: string) => void;
  getDocumentsByWorkspace: (workspaceId: string) => Document[];
  getChildDocuments: (parentId: string | null, workspaceId: string) => Document[];
  searchDocuments: (query: string, workspaceId: string) => Document[];
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Convex queries
  const workspacesData = useQuery(api.workspaces.getWorkspaces) ?? [];
  const documentsData = useQuery(api.documents.getDocuments) ?? [];

  // Convex mutations
  const createWorkspaceMutation = useMutation(api.workspaces.createWorkspace);
  const deleteWorkspaceMutation = useMutation(api.workspaces.deleteWorkspace);
  const updateWorkspaceMutation = useMutation(api.workspaces.updateWorkspace);
  const createDocumentMutation = useMutation(api.documents.createDocument);
  const updateDocumentMutation = useMutation(api.documents.updateDocument);
  const deleteDocumentMutation = useMutation(api.documents.deleteDocument);
  const toggleFavoriteMutation = useMutation(api.documents.toggleFavorite);

  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);

  // Transform data to match old interface
  const workspaces: Workspace[] = useMemo(() => 
    workspacesData.map(w => ({
      ...w,
      id: w._id,
      description: w.description,
      createdAt: new Date(w.createdAt),
    })),
    [workspacesData]
  );

  const documents: Document[] = useMemo(() =>
    documentsData.map(d => ({
      ...d,
      id: d._id,
      workspaceId: d.workspaceId,
      parentId: d.parentId ?? null,
      dueDate: d.dueDate,
      createdAt: new Date(d.createdAt),
      updatedAt: new Date(d.updatedAt),
    })),
    [documentsData]
  );

  const createWorkspace = async (name: string, icon: string, description?: string): Promise<string> => {
    const mutationArgs: { name: string; icon: string; description?: string } = { name, icon };
    if (description) {
      mutationArgs.description = description;
    }
    const workspaceId = await createWorkspaceMutation(mutationArgs);
    return workspaceId;
  };

  const deleteWorkspace = async (id: string): Promise<void> => {
    await deleteWorkspaceMutation({ id: id as Id<"workspaces"> });
  };

  const updateWorkspace = async (id: string, updates: Partial<Workspace>): Promise<void> => {
    const mutationArgs: any = {
      id: id as Id<"workspaces">,
    };
    
    if (updates.name !== undefined) {
      mutationArgs.name = updates.name;
    }
    if (updates.icon !== undefined) {
      mutationArgs.icon = updates.icon;
    }
    // Include description if it's being set (use null to clear, undefined is ignored by Convex)
    if ('description' in updates) {
      mutationArgs.description = updates.description ?? null;
    }
    
    await updateWorkspaceMutation(mutationArgs);
  };

  const createDocument = async(workspaceId: string, parentId: string | null, title = ""): Promise<Document> => {
    const documentId = await createDocumentMutation({
      title,
      content: "",
      workspaceId: workspaceId as Id<"workspaces">,
      parentId: parentId ? (parentId as Id<"documents">) : undefined,
    })
    const newDoc: Document = {
      _id: documentId,
      id: documentId,
      title,
      content: "",
      workspaceId,
      parentId,
      isFavorite: false,
      isArchived: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  
    return newDoc;
  };

  const updateDocument = (id: string, updates: Partial<Document>) => {
    updateDocumentMutation({
      id: id as Id<"documents">,
      ...(updates.title !== undefined && { title: updates.title }),
      ...(updates.content !== undefined && { content: updates.content }),
      ...(updates.icon !== undefined && { icon: updates.icon }),
      ...(updates.coverImage !== undefined && { coverImage: updates.coverImage }),
      ...(updates.isFavorite !== undefined && { isFavorite: updates.isFavorite }),
      ...(updates.isArchived !== undefined && { isArchived: updates.isArchived }),
      ...(updates.dueDate !== undefined && { dueDate: updates.dueDate ?? null }),
      ...(updates.parentId !== undefined && { parentId: updates.parentId ? (updates.parentId as Id<"documents">) : null }),
    });
  };

  const deleteDocument = (id: string) => {
    deleteDocumentMutation({ id: id as Id<"documents"> });
  };

  const toggleFavorite = (id: string) => {
    toggleFavoriteMutation({ id: id as Id<"documents"> });
  };

  const getDocumentsByWorkspace = (workspaceId: string): Document[] => {
    return documents.filter(d => d.workspaceId === workspaceId && !d.isArchived);
  };

  const getChildDocuments = (parentId: string | null, workspaceId: string): Document[] => {
    return documents.filter(d => 
      d.parentId === parentId && d.workspaceId === workspaceId && !d.isArchived
    );
  };

  const searchDocuments = (query: string, workspaceId: string): Document[] => {
    const lowerQuery = query.toLowerCase();
    return documents.filter(d => 
      d.workspaceId === workspaceId &&
      !d.isArchived &&
      (d.title.toLowerCase().includes(lowerQuery) || 
       d.content.toLowerCase().includes(lowerQuery))
    );
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        documents,
        currentWorkspace,
        currentDocument,
        createWorkspace,
        deleteWorkspace,
        updateWorkspace,
        setCurrentWorkspace,
        setCurrentDocument,
        createDocument,
        updateDocument,
        deleteDocument,
        toggleFavorite,
        getDocumentsByWorkspace,
        getChildDocuments,
        searchDocuments,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within WorkspaceProvider');
  }
  return context;
};