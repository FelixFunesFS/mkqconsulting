

## Plan: Two-Level Phase Navigation for Tasks

### The Problem

With phases spanning Web Development, Marketing, and General domains, the tab bar can show 10+ tabs that get cut off, especially on mobile. You can't see or access all phases.

### The Solution: Domain Filter + Phase Tabs

Add a simple domain selector row above the phase tabs. Only phases for the selected domain are shown as tabs, keeping the bar to 3-6 items max.

```text
[Web Development]  [Marketing]  [General]     <-- domain selector (compact toggle group)
[Discovery] [Design] [Development] ...         <-- phase tabs (filtered to selected domain)
```

- The domain selector only shows domains that have tasks (no empty categories)
- Defaults to the domain containing the most tasks
- Phase tabs remain exactly as they are today, just filtered
- Mobile-friendly: domain buttons are small, phase tabs stay short

### Changes Required

**1. Update `src/components/tasks/TaskList.tsx`**

- Group active phases by domain using the phase library
- Add a `domainFilter` state (defaults to whichever domain has the most tasks)
- Render a row of small toggle buttons for each domain that has tasks (e.g., "Web Dev", "Marketing", "General")
- Filter the phase tabs to only show phases from the selected domain
- Show task counts per domain on the toggle buttons (e.g., "Marketing (12)")
- Keep all existing functionality (action buttons, stats, task cards) unchanged

**2. Update `src/components/tasks/ClientTaskList.tsx`**

- Same domain grouping logic for the client portal view
- Group the scrollable phase sections under domain headers
- Each domain header shows its name and overall progress (e.g., "Marketing -- 4/12 tasks")
- Collapsible domain sections so clients can focus on one area

**3. Update `src/types/phases.ts`**

- Add a helper function `groupPhasesByDomain(phases)` that returns phases organized by domain
- Add domain labels map: `{ web_dev: "Web Development", marketing: "Marketing", general: "General" }`

### Visual Layout (Admin TaskList)

```text
+--------------------------------------------------+
| [Regenerate] [Add Task] [From Prompt] [Checklist] |
|                              8 of 24 completed    |
+--------------------------------------------------+
| Web Dev (12)  |  Marketing (8)  |  General (4)    |  <-- domain toggles
+--------------------------------------------------+
| [Content Strategy] [Content Creation] [Social..] |  <-- phase tabs (filtered)
+--------------------------------------------------+
| Task cards for selected phase...                  |
+--------------------------------------------------+
```

### Visual Layout (Client TaskList)

The client view already uses a scrollable list with phase sections rather than tabs, so the change is lighter:

- Add domain header dividers between groups of phases
- e.g., "--- Web Development ---" then Discovery, Design sections, then "--- Marketing ---" then Content Strategy, Social Media sections

### Technical Details

**New helper in `src/types/phases.ts`:**

```
DOMAIN_LABELS = { web_dev: "Web Dev", marketing: "Marketing", general: "General" }

groupPhasesByDomain(phases: PhaseDefinition[]):
  -> Record<string, PhaseDefinition[]>
  Groups the provided phases by their domain property
```

**State management in TaskList:**

- `domainFilter`: which domain is currently selected
- Auto-selects the domain with the most tasks on initial render
- When switching domains, auto-selects the first phase tab in that domain

### Files to Modify

| File | Change |
|------|--------|
| `src/types/phases.ts` | Add `DOMAIN_LABELS` and `groupPhasesByDomain` helper |
| `src/components/tasks/TaskList.tsx` | Add domain toggle row, filter phase tabs by domain |
| `src/components/tasks/ClientTaskList.tsx` | Add domain headers between phase groups |

### What Stays the Same

- All action buttons (Regenerate, Add Task, From Prompt, Checklist)
- Task cards, status changes, edit/delete
- Phase tab behavior (click to view tasks in that phase)
- The phase library and AI generation logic
