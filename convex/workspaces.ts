import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all workspaces
export const getWorkspaces = query({
  handler: async (ctx) => {
    return await ctx.db.query("workspaces").collect();
  },
});

// Create workspace
export const createWorkspace = mutation({
  args: {
    name: v.string(),
    icon: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const workspaceId = await ctx.db.insert("workspaces", {
      name: args.name,
      icon: args.icon,
      description: args.description,
      createdAt: Date.now(),
    });
    return workspaceId;
  },
});

// Update workspace
export const updateWorkspace = mutation({
  args: {
    id: v.id("workspaces"),
    name: v.optional(v.string()),
    icon: v.optional(v.string()),
    description: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    // Filter out undefined values before patching
    const cleanUpdates: Record<string, any> = {};
    if (updates.name !== undefined) cleanUpdates.name = updates.name;
    if (updates.icon !== undefined) cleanUpdates.icon = updates.icon;
    if ('description' in updates) {
      // Include description even if undefined to clear it
      cleanUpdates.description = updates.description;
    }
    await ctx.db.patch(id, cleanUpdates);
  },
});

// Delete workspace
export const deleteWorkspace = mutation({
  args: { id: v.id("workspaces") },
  handler: async (ctx, args) => {
    // Delete all documents in workspace
    const documents = await ctx.db
      .query("documents")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.id))
      .collect();
    
    for (const doc of documents) {
      await ctx.db.delete(doc._id);
    }
    
    await ctx.db.delete(args.id);
  },
});