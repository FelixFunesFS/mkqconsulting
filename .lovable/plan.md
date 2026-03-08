

## Assessment: Multiple Clients Per Project

### Current State

**Database Layer: ✅ READY**
- `project_clients` junction table exists with data
- `user_has_project_access()` function works correctly
- RLS policies updated across all related tables (activities, tasks, comments, documents, questionnaires)

**Application Layer: ❌ INCOMPLETE**
- Frontend code still uses single-client model (`project.clientId`)
- Missing hooks to interact with `project_clients` table
- Missing UI component to assign multiple clients
- All dialogs/components reference the deprecated `projects.client_id` column

### The Gap

The database migration was completed, but the UI layer was never updated. This means:

1. **Data Mismatch**: Junction table has relationships, but UI reads from `projects.client_id`
2. **Broken Assignment**: Can't assign multiple clients through the UI
3. **Inconsistent Display**: Components show single client even when multiple are assigned

### What's Needed

**Core Infrastructure (Missing):**

1. **`src/hooks/useProjectClients.ts`**: Hooks to manage many-to-many relationships
   - `useProjectClients(projectId)` - get all clients for a project
   - `useClientProjects(clientId)` - get all projects for a client  
   - `useSyncProjectClients(projectId, clientIds[])` - assign multiple clients atomically

2. **`src/components/projects/MultiClientSelector.tsx`**: Multi-select UI component
   - Popover with checkboxes for all available clients
   - Shows currently selected clients as badges
   - Handles add/remove operations

**Component Updates Required:**

3. **`ProjectEditDialog.tsx`** (line 137-143): Replace `ClientSelector` with `MultiClientSelector`
4. **`ClientProjectsDialog.tsx`**: Query junction table instead of `project.clientId`
5. **`ProjectTasksDialog.tsx`** (line 33-34): Handle multiple clients when showing client info
6. **`AdminClients.tsx`**: Update project assignment logic to use junction table
7. **`src/lib/notifications.ts`**: Already updated to query junction table ✅

**Type System Updates:**

8. **`src/types/project.ts`**: 
   - Keep `clientId?: string` for backward compatibility (deprecated)
   - Add `clientIds?: string[]` for new multi-client model
   - Mark in JSDoc that `clientId` is deprecated

9. **`src/hooks/useProjects.ts`**:
   - Update `mapDbToProject` to optionally fetch client IDs from junction table
   - Keep writing to `client_id` column for now (backward compatibility)

### Migration Strategy

**Phase 1: Build Infrastructure**
- Create `useProjectClients` hook with all CRUD operations
- Create `MultiClientSelector` component with proper UX

**Phase 2: Update Assignment Flows**
- Replace single-client selectors with multi-client versions
- Update dialogs to show multiple clients as badges/lists

**Phase 3: Update Display & Filtering**
- Components that show "the client" need to handle multiple clients
- Update permission checks to use junction table

**Phase 4: Data Cleanup (Optional)**
- Deprecate `projects.client_id` column once all code uses junction table
- Add database constraint to prevent direct writes to `client_id`

### Technical Considerations

**Backward Compatibility:**
- Keep `projects.client_id` populated with "primary" client for now
- This prevents breaking existing queries/reports that depend on it
- Once all code migrated, can remove the column

**Permission Model:**
- RLS already checks junction table via `user_has_project_access()` ✅
- No additional security changes needed

**UX Design:**
- When multiple clients assigned, which email gets notifications? (currently sends to first match)
- Should there be a "primary client" concept for billing/communication?
- How to display multiple clients in project cards (badges? "+2 more"?)

### Answer to Your Question

**Can multiple people be added to a project?**

**Database: YES** - The junction table supports it fully.

**UI: NO** - The interface still only allows assigning one client at a time. The UI components were never updated to use the many-to-many relationship.

**To make it work:** Need to create the missing hooks and components listed above, then update all dialogs/pages that handle client assignment.

