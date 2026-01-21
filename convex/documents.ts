import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all documents
export const getDocuments = query({
  handler: async (ctx) => {
    return await ctx.db.query("documents").collect();
  },
});

// Get documents by workspace
export const getDocumentsByWorkspace = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("documents")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.eq(q.field("isArchived"), false))
      .collect();
  },
});

// Get child documents
export const getChildDocuments = query({
  args: {
    parentId: v.union(v.id("documents"), v.null()),
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const docs = await ctx.db
      .query("documents")
      .withIndex("by_workspace_and_parent", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("parentId", args.parentId)
      )
      .filter((q) => q.eq(q.field("isArchived"), false))
      .collect();
    return docs;
  },
});

// Create document
export const createDocument = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    workspaceId: v.id("workspaces"),
    parentId: v.optional(v.id("documents")),
    icon: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const documentId = await ctx.db.insert("documents", {
      title: args.title,
      content: args.content,
      workspaceId: args.workspaceId,
      parentId: args.parentId,
      icon: args.icon,
      isFavorite: false,
      isArchived: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return documentId;
  },
});

// Update document
export const updateDocument = mutation({
  args: {
    id: v.id("documents"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    icon: v.optional(v.string()),
    coverImage: v.optional(v.union(v.string(), v.null())),
    isFavorite: v.optional(v.boolean()),
    isArchived: v.optional(v.boolean()),
    dueDate: v.optional(v.union(v.number(), v.null())),
    parentId: v.optional(v.union(v.id("documents"), v.null())),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Delete document (recursive)
export const deleteDocument = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    // Helper to recursively delete children
    const deleteRecursive = async (docId: string) => {
      const children = await ctx.db
        .query("documents")
        .withIndex("by_parent", (q) => q.eq("parentId", docId as any))
        .collect();
      
      for (const child of children) {
        await deleteRecursive(child._id);
      }
      
      await ctx.db.delete(docId as any);
    };
    
    await deleteRecursive(args.id);
  },
});

// Toggle favorite
export const toggleFavorite = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.id);
    if (!doc) throw new Error("Document not found");
    
    await ctx.db.patch(args.id, {
      isFavorite: !doc.isFavorite,
    });
  },
});