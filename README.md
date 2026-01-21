# Notion-style Workspace (Convex)

Collaborative workspace that feels like a light Notion clone: create workspaces, write and nest documents with a rich text editor, favorite/archive items, and sync due dates with a calendar view powered by Convex.

## What you can do
- Create multiple **workspaces** (each with name + emoji icon)
- Inside a workspace, create **documents** and organize them in a **nested tree**
- Edit documents with a **rich text editor** (slash commands + formatting toolbar)
- Mark documents as **favorites**, **archive** them, and manage a **trash** view
- Assign **due dates** to documents and see them reflected in the **calendar**
- Plan your week with calendar **events** (reminders, time blocks, meetings, deadlines, tasks)

## Features
- Workspace dashboard with emoji icons and quick creation
- Nested documents with a Tiptap-based editor, toolbar, slash commands, cover images, and favorites/archiving
- Calendar with reminders, time blocks, meetings, deadlines, and document-linked tasks
- React Router navigation, light/dark theme, toasts, and shadcn/ui component system

## Feature details

### Workspaces
- **Workspace picker / landing page**: create a workspace and jump straight in.
- **Workspace-scoped data**: documents + calendar events are filtered by `workspaceId`.

### Documents
- **Hierarchy (tree)**: documents can have an optional `parentId` to support nested pages.
- **Metadata**:
  - **Favorites**: quick access to important pages.
  - **Archive + Trash flow**: hide pages without losing them permanently.
  - **Icons + covers**: personalize pages (emoji + optional cover image).
  - **Due dates**: timestamp-based due date field for reminders/deadlines.
- **Editing experience**:
  - **Autosave-style UX**: the UI tracks save state as edits happen.
  - **Slash commands + toolbar**: insert common blocks/formatting quickly.

### Calendar
- **Multiple views**: day/week/month/agenda.
- **Event types**: reminder, timeblock, meeting, deadline, task.
- **Filtering + focus mode**: hide/show event types and optionally focus on “today”.
- **Document integration**:
  - Document due dates can be surfaced alongside events.
  - Events can optionally link to a specific document (`documentId`).

### UI/UX
- **Responsive layout**: sidebar + content area patterns for workspace/document pages.
- **Theme support**: light/dark mode with persisted preference.
- **Toasts and dialogs**: confirmations (delete/archive), creation flows, quick feedback.

## Tech Stack
- React 18 + TypeScript + Vite
- Convex (data + functions)
- Tailwind CSS + shadcn/ui
- TanStack Query, React Router, Tiptap

## Requirements
- Node.js 18+ and npm (or bun)
- Convex account (free) and Convex CLI (`npm create convex@latest` or `npm install -g convex`)

## Quick Start
```sh
git clone <your-fork-url>
cd <repo>
npm install
```

### Link to your Convex deployment (.env.local)
The frontend reads `import.meta.env.VITE_CONVEX_URL` when creating the Convex client (`src/main.tsx`).

1) Sign in at https://dashboard.convex.dev/ and create a deployment (Dev is fine).
2) Copy the Deployment URL (looks like `https://<slug>.convex.cloud`).
3) Create `.env.local` in the project root:
```
VITE_CONVEX_URL="https://<your-deployment>.convex.cloud"
# Optional: useful for CLI tooling
# CONVEX_DEPLOYMENT="<team-slug>/<deployment-name>"
```
4) Keep this file out of git (already covered by `.gitignore` via `*.local`).

### Run locally
In one terminal (provisions/updates Convex functions and keeps them in sync):
```sh
npx convex dev
```

In another terminal (Vite dev server):
```sh
npm run dev
# Open http://localhost:5173
```

### Other scripts
- `npm run build` – typecheck then build for production
- `npm run lint` – ESLint
- `npm run preview` – preview the production build

## Project Structure
- `src/` – React app (routes in `pages/`, shared UI in `components/`, context in `contexts/WorkspaceContext.tsx`)
- `convex/` – Convex schema and server functions (`schema.ts`, `documents.ts`, `workspaces.ts`, `calendar.ts`)
- `convex/_generated/` – Auto-generated Convex client bindings (do not edit)

## Data model (Convex)
Defined in `convex/schema.ts`:
- `workspaces`
  - `name`, `icon`, optional `description`, optional `createdAt`
- `documents`
  - `title`, `content`, `workspaceId`, optional `parentId`, optional `icon`, optional `coverImage`
  - `isFavorite`, `isArchived`, optional `dueDate`, optional `createdAt`, optional `updatedAt`
  - Indexes for workspace + parent traversal and due dates
- `calendarEvents`
  - `title`, optional `description`, `startTime`, `endTime`, `workspaceId`
  - optional `documentId`, `type`, optional `color`, optional `priority`, optional `isAllDay`
  - Indexes for workspace, document, start time, and date range queries

## Convex functions (where to look)
- `convex/workspaces.ts`: create/list/update workspace operations
- `convex/documents.ts`: create/update/move/archive/favorite document operations
- `convex/calendar.ts`: create/update/delete/query calendar events

## Environment variables
- `VITE_CONVEX_URL` (**required**): Convex deployment URL used by the frontend client
- `CONVEX_DEPLOYMENT` (optional): helps Convex CLI target the right deployment

## Deploying
- Keep `VITE_CONVEX_URL` pointing at your desired Convex deployment (e.g., Production).
- Run `npm run build` and host the `dist/` output on your static host of choice.

## Troubleshooting
- `VITE_CONVEX_URL` missing: ensure `.env.local` exists and restart `npm run dev`.
- Convex auth or deployment prompts: run `npx convex dev --once` to log in and pick the correct deployment.
