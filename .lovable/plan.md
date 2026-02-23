

## Plan: Consistent Phase Library for AI Task Generation

### The Problem

If AI freely generates phase names, you'll get inconsistency across projects ("Social Media" vs "Social" vs "Social Posts"). This makes filtering, reporting, and navigation unreliable.

### The Solution: A Fixed Phase Library

Define a master list of allowed phases organized by domain. The AI **must** pick from this list -- it cannot invent new phase names. This keeps every project consistent while supporting multiple service areas.

### Phase Library

| Domain | Phases |
|--------|--------|
| Web Development | discovery, design, development, review, published |
| Marketing | content_strategy, content_creation, social_media, email_marketing, paid_ads, analytics |
| General | planning, research, operations, reporting |

Each phase gets a human-readable label (e.g., `content_creation` displays as "Content Creation").

### Changes Required

**1. Create `src/types/phases.ts`** -- Single source of truth for all phases

Define the complete phase library with labels and display order. Includes:
- `ALL_PHASES` array with id, label, and domain
- `WEB_DEV_PHASES` and `MARKETING_PHASES` subsets for convenience
- `getPhaseLabel(phase)` helper function
- A formatted string for injection into AI prompts

**2. Update `supabase/functions/generate-tasks/index.ts`**

- For custom prompt mode: include the full phase library in the system prompt with the instruction "You MUST only use phases from this list. Do not invent new phase names."
- For questionnaire mode: keep existing behavior (web dev phases only)
- Validate AI output: if a returned phase isn't in the library, map it to the closest match or default to "planning"

**3. Update `src/components/tasks/TaskList.tsx`**

- Replace the hardcoded `phases` array with dynamic logic:
  - Scan the project's tasks to find which phases are actually used
  - Order them using the phase library's defined order
  - Only show tabs for phases that have tasks (no empty tabs cluttering the UI)

**4. Update `src/components/tasks/GenerateFromPromptDialog.tsx`**

- Remove the single phase selector
- The AI determines the right phases from the content, constrained to the phase library
- Simpler UX: just paste and generate

**5. Update `src/components/tasks/TaskEditDialog.tsx`**

- Phase dropdown shows: standard web dev phases + any custom phases already used in the project
- Uses labels from the phase library

**6. Update `src/components/tasks/TaskCreateDialog.tsx`**

- Same dynamic phase dropdown as edit dialog

**7. Update `src/components/tasks/ClientTaskList.tsx`** (client portal)

- Same dynamic tab logic as admin TaskList

### How the AI Prompt Works

The system prompt for custom prompt mode will include:

```
You MUST assign each task to one of these phases only:
- content_strategy: Planning content pillars, calendars, themes
- content_creation: Writing blogs, articles, long-form content
- social_media: Social posts, reels, carousels, community management
- email_marketing: Newsletters, drip campaigns, automations
- paid_ads: Ad creation, targeting, budget management
- analytics: Tracking, reporting, performance review
- planning: General project planning and coordination
- research: Market research, competitor analysis
- operations: Process setup, tooling, workflows
- reporting: Status reports, client updates, summaries

Do NOT invent new phase names. Pick the closest match from this list.
```

For questionnaire-based generation, the prompt stays unchanged (web dev phases only).

### Validation in the Edge Function

After the AI returns tasks, validate each phase:
1. Check if the phase is in the allowed list
2. If not, attempt a fuzzy match (e.g., "Social" maps to "social_media")
3. If no match, default to "planning"

This ensures the database always contains clean, consistent phase values.

### Files to Create/Modify

| File | Action |
|------|--------|
| `src/types/phases.ts` | **Create** -- Phase library with labels, domains, ordering |
| `supabase/functions/generate-tasks/index.ts` | Update custom prompt system message + add phase validation |
| `src/components/tasks/TaskList.tsx` | Dynamic tabs from task data using phase library |
| `src/components/tasks/GenerateFromPromptDialog.tsx` | Remove phase selector |
| `src/components/tasks/TaskEditDialog.tsx` | Dynamic phase dropdown from library |
| `src/components/tasks/TaskCreateDialog.tsx` | Dynamic phase dropdown from library |
| `src/components/tasks/ClientTaskList.tsx` | Dynamic tabs matching admin view |

### What Stays the Same

- Questionnaire-based generation still defaults to the 5 web dev phases
- Project pipeline status (Discovery through Published) is unchanged -- that's the project lifecycle, separate from task phases
- Database schema unchanged (`phase` is already `text`)
- Existing tasks with web dev phases continue to work as-is
