import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get calendar events for a workspace in a date range
export const getCalendarEvents = query({
  args: {
    workspaceId: v.id("workspaces"),
    startDate: v.number(),  // Unix timestamp
    endDate: v.number(),    // Unix timestamp
  },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query("calendarEvents")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => 
        q.or(
          // Events that start in range
          q.and(
            q.gte(q.field("startTime"), args.startDate),
            q.lte(q.field("startTime"), args.endDate)
          ),
          // Events that end in range
          q.and(
            q.gte(q.field("endTime"), args.startDate),
            q.lte(q.field("endTime"), args.endDate)
          ),
          // Events that span the entire range
          q.and(
            q.lte(q.field("startTime"), args.startDate),
            q.gte(q.field("endTime"), args.endDate)
          )
        )
      )
      .collect();
    
    return events;
  },
});

// Get all calendar events for a workspace
export const getAllCalendarEvents = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("calendarEvents")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();
  },
});

// Create calendar event
export const createCalendarEvent = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    startTime: v.number(),
    endTime: v.number(),
    workspaceId: v.id("workspaces"),
    documentId: v.optional(v.id("documents")),
    type: v.union(
      v.literal("reminder"),
      v.literal("timeblock"),
      v.literal("meeting"),
      v.literal("deadline"),
      v.literal("task")
    ),
    color: v.optional(v.string()),
    priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
    isAllDay: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const eventId = await ctx.db.insert("calendarEvents", {
      title: args.title,
      description: args.description,
      startTime: args.startTime,
      endTime: args.endTime,
      workspaceId: args.workspaceId,
      documentId: args.documentId,
      type: args.type,
      color: args.color,
      priority: args.priority,
      isAllDay: args.isAllDay ?? false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return eventId;
  },
});

// Update calendar event
export const updateCalendarEvent = mutation({
  args: {
    id: v.id("calendarEvents"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    startTime: v.optional(v.number()),
    endTime: v.optional(v.number()),
    type: v.optional(v.union(
      v.literal("reminder"),
      v.literal("timeblock"),
      v.literal("meeting"),
      v.literal("deadline"),
      v.literal("task")
    )),
    color: v.optional(v.string()),
    priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
    isAllDay: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Delete calendar event
export const deleteCalendarEvent = mutation({
  args: { id: v.id("calendarEvents") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Get events for a specific day
export const getEventsForDay = query({
  args: {
    workspaceId: v.id("workspaces"),
    date: v.number(),  // Unix timestamp (start of day)
  },
  handler: async (ctx, args) => {
    const startOfDay = args.date;
    const endOfDay = startOfDay + 24 * 60 * 60 * 1000; // Add 24 hours
    
    const events = await ctx.db
      .query("calendarEvents")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => 
        q.or(
          // Events that start on this day
          q.and(
            q.gte(q.field("startTime"), startOfDay),
            q.lt(q.field("startTime"), endOfDay)
          ),
          // All-day events
          q.and(
            q.eq(q.field("isAllDay"), true),
            q.lte(q.field("startTime"), endOfDay),
            q.gte(q.field("endTime"), startOfDay)
          ),
          // Events that span this day
          q.and(
            q.lte(q.field("startTime"), startOfDay),
            q.gte(q.field("endTime"), endOfDay)
          )
        )
      )
      .collect();
    
    return events;
  },
});