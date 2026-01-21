import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  workspaces: defineTable({
    name: v.string(),
    icon: v.string(),
    description: v.optional(v.union(v.string(), v.null())),
    createdAt: v.optional(v.number()),  // ✅ Make it optional
  }),
  
  documents: defineTable({
    title: v.string(),
    content: v.string(),
    workspaceId: v.id("workspaces"),
    parentId: v.optional(v.id("documents")),
    icon: v.optional(v.string()),
    coverImage: v.optional(v.union(v.string(), v.null())),
    isFavorite: v.boolean(),
    isArchived: v.boolean(),
    dueDate: v.optional(v.number()),  // Due date timestamp
    createdAt: v.optional(v.number()),  // ✅ Make it optional
    updatedAt: v.optional(v.number()),  // ✅ Make it optional
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_parent", ["parentId"])
    .index("by_workspace_and_parent", ["workspaceId", "parentId"])
    .index("by_due_date", ["dueDate"]),
  
  calendarEvents: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    startTime: v.number(),  // Unix timestamp
    endTime: v.number(),    // Unix timestamp
    workspaceId: v.id("workspaces"),
    documentId: v.optional(v.id("documents")),  // Link to document if it's a due date reminder
    type: v.union(
      v.literal("reminder"),    // Simple reminder
      v.literal("timeblock"),   // Time blocking for work
      v.literal("meeting"),     // Meeting
      v.literal("deadline"),    // Document deadline
      v.literal("task")         // Task
    ),
    color: v.optional(v.string()),  // Hex color for the event
    priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
    isAllDay: v.optional(v.boolean()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_document", ["documentId"])
    .index("by_start_time", ["startTime"])
    .index("by_date_range", ["workspaceId", "startTime", "endTime"]),
});