

## Problem

When you click "Add Task" in the task dialog, the phase defaults to the **project's pipeline status** (e.g. "Published" for Drake Fitness). Since you're adding tasks quickly without changing it, every task lands in the "Published" phase.

The root cause is in `ProjectTasksDialog.tsx` line 300:
```tsx
currentPhase={project.status}  // "published" for Drake Fitness
```

This gets passed to `TaskCreateDialog` which uses it as the default phase selection.

## Fix

**1. Default to the currently viewed phase tab instead of project status**

Pass the active phase tab from `TaskList` up to the create dialog, so new tasks default to whichever phase tab you're currently looking at. This is the most intuitive behavior — if you're on the "Design" tab and click "Add Task", the new task should default to "Design".

**2. Group phases by domain in the create dialog dropdown**

The flat list of 16 phases is hard to scan. Group them with domain headers (Web Dev / Marketing / General) so it's clear which section you're picking.

**3. Make the phase selector more visually prominent**

Move the Phase selector to full-width above the priority selector and add a subtle highlight/border so it's not easy to skip past.

### Changes

- **`TaskList.tsx`**: Pass `activePhase` to the `onAddTask` callback so the parent knows which tab is active
- **`ProjectTasksDialog.tsx`**: Receive the active phase from TaskList and pass it to TaskCreateDialog
- **`TaskCreateDialog.tsx`**: Group phases by domain in the dropdown with section headers; make phase field full-width and more prominent

