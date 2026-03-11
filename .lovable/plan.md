

## Fix: David Drake Can't See Drake Fitness + Enable Multi-Client Access

### Root Cause
David Drake's client record is properly linked to his user account, but he has **zero entries** in the `project_clients` junction table. RLS checks `user_has_project_access()` which queries `project_clients`, so he sees no projects.

### Current `project_clients` data:
- Drake Fitness → M Funes only
- Visions of Hope → Helen Harris
- The Village House → Helen Harris
- David Drake → **nothing**

### Plan

**Step 1: Data Fix**
- Insert David Drake into `project_clients` for Drake Fitness (alongside M Funes who stays)

**Step 2: Create `src/hooks/useProjectClients.ts`**
- `useProjectClients(projectId)` — fetch all clients for a project via junction table
- `useClientProjects(clientId)` — fetch all projects for a client
- `useSyncProjectClients()` — atomically replace client assignments (delete all + insert new)
- Invalidates both `project-clients` and `projects` query keys

**Step 3: Create `src/components/projects/MultiClientSelector.tsx`**
- Popover with checkbox list of all clients
- Selected clients shown as badges with remove buttons
- Search/filter for client list

**Step 4: Update `ProjectEditDialog.tsx`**
- Replace single `ClientSelector` with `MultiClientSelector`
- On save, call `useSyncProjectClients` with selected client IDs
- Also keep writing to legacy `projects.client_id` (first selected client) for backward compat

**Step 5: Update `ClientProjectsDialog.tsx`**
- Read assignments from `project_clients` junction table instead of `project.clientId`
- Toggle adds/removes rows in junction table

**Step 6: Update `ProjectCard.tsx` display**
- Show multiple client badges where client name is displayed
- Handle overflow with "+N more" pattern

### What stays the same
- RLS policies — already use `user_has_project_access()` via junction table
- `projects.client_id` column — kept for backward compatibility, written as "primary" client
- Client dashboard (`ClientDashboard.tsx`) — already works since RLS handles filtering

