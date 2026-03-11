

## Final Fix: Task Card Cropping (For Real This Time)

### Why the last 5 fixes didn't work

Looking at the actual code, **the root cause fix was never applied**. Every conversation discussed it, planned it, but only the TaskCard changes were saved. The scroll-area.tsx file is completely untouched -- it's identical to the default shadcn/ui component.

The critical issue: Radix UI's ScrollArea Viewport injects an internal div with `display: table` inline style. In table layout, content expands to fit text instead of being constrained by container width. This overrides every flex-based fix applied to TaskCard (`min-w-0`, `break-words`, `shrink-0`).

### The Fix (2 files, 2 lines each)

**File 1: `src/components/ui/scroll-area.tsx` (line 11) -- THE CRITICAL FIX**

Override the Radix-injected `display: table` on the internal wrapper div:

- Before: `className="h-full w-full rounded-[inherit]"`
- After: `className="h-full w-full rounded-[inherit] [&>div]:!block"`

This single change makes all the existing TaskCard fixes (min-w-0, break-words, shrink-0) actually work.

**File 2: `src/components/tasks/TaskCard.tsx` (line 35) -- SAFETY NET**

Add `overflow-hidden` to the card root as defense-in-depth:

- Before: `'group rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/30'`
- After: `'group rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/30 overflow-hidden'`

The DropdownMenu uses a portal so it renders outside this div and won't be clipped.

### How to verify it worked

After implementation, open a project with Marketing tasks (long titles). The three-dot menu button should be fully visible on every card, and long titles should wrap to a second line instead of pushing content off-screen.

### Why it will work this time

The existing TaskCard fixes are correct -- they just need the scroll area to use block layout instead of table layout. With `display: block`, the container constrains its children to its width, allowing `min-w-0` to let the title shrink and `break-words` to wrap the text. This is standard CSS behavior.

