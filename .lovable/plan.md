

## Plan: AI Task Generation from Custom Prompt

### The Problem

Currently, AI task generation only works from questionnaire data. You need the ability to paste any content (like a marketing plan, content calendar, or strategy document) and have AI break it into actionable, trackable tasks within the existing task system.

### UX Approach

Rather than cluttering the task toolbar with another button, the cleanest approach is to add a **"Generate from Prompt"** button alongside the existing "Regenerate Tasks" and "Add Task" buttons. When clicked, it opens a dialog with:

1. A textarea to paste your content/plan
2. A phase selector (which phase should the generated tasks land in)
3. A "Generate" button

The generated tasks get added to the project as `ai_generated` source tasks, fitting seamlessly into the existing phase tabs.

### Changes Required

**1. Update the Edge Function: `supabase/functions/generate-tasks/index.ts`**

- Accept a new optional `customPrompt` field in the request body
- When `customPrompt` is provided, use it instead of the questionnaire-based prompt
- The system prompt shifts to: "Break this plan/content into actionable tasks with titles, descriptions, phases, priorities, and time estimates"
- Validate/sanitize the custom prompt (max ~10,000 chars)
- Keep the same task output format so everything works with existing DB insert logic

**2. Create a new dialog: `src/components/tasks/GenerateFromPromptDialog.tsx`**

- A dialog with:
  - A large textarea (placeholder: "Paste your marketing plan, content calendar, or any plan you want turned into tasks...")
  - A phase selector dropdown (default to current project phase)
  - Generate button with loading state
- On submit, calls the generate-tasks edge function with `customPrompt` instead of questionnaire

**3. Update `src/components/tasks/TaskList.tsx`**

- Add a new "Generate from Prompt" button (with a `Wand2` or `FileText` icon) in the toolbar
- Wire it to open the new dialog
- Add `onGenerateFromPrompt` callback prop

**4. Update `src/components/tasks/ProjectTasksDialog.tsx`**

- Add state and handler for the new dialog
- Pass the callback down to TaskList

**5. Update `src/hooks/useTasks.ts`**

- Extend `useGenerateTasks` to accept an optional `customPrompt` parameter

### Task Generation Flow

```text
User clicks "Generate from Prompt"
  -> Dialog opens with textarea + phase picker
  -> User pastes marketing plan content
  -> Clicks "Generate"
  -> Edge function receives customPrompt
  -> AI analyzes content, returns structured tasks
  -> Tasks inserted with source = 'ai_generated'
  -> Tasks appear in the phase tabs
```

### How AI Handles the Custom Prompt

The edge function will use a different system prompt when `customPrompt` is present:

> "You are a project manager. Analyze the following plan/content and break it into actionable tasks. Each task should be specific, time-boxed, and assigned to the appropriate project phase. Group related items and estimate hours realistically."

The user prompt will include:
- The pasted content
- The project name (for context)
- The preferred phase (as a hint for where most tasks should land)

### Files to Create/Modify

| File | Action |
|------|--------|
| `supabase/functions/generate-tasks/index.ts` | Add `customPrompt` path |
| `src/components/tasks/GenerateFromPromptDialog.tsx` | New dialog component |
| `src/components/tasks/TaskList.tsx` | Add button + callback |
| `src/components/tasks/ProjectTasksDialog.tsx` | Wire up dialog state |
| `src/hooks/useTasks.ts` | Add `customPrompt` to mutation params |

