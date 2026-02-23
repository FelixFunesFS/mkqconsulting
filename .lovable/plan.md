

## Plan: Fix Marketing Task Card Right-Side Cropping

### Root Cause

The issue is **not** in `TaskCard.tsx` (that fix was correct but insufficient). The cropping comes from the parent layout in `ProjectTasksDialog.tsx`:

```
DialogContent (max-w-[95vw], overflow-hidden)
  -> TabsContent (overflow-hidden)
    -> ScrollArea (overflow-hidden + pr-4 on ROOT)
      -> Viewport (overflow: scroll, w-full)
        -> TaskList -> TaskCard
```

The `pr-4` (right padding) is applied to the `ScrollArea` root which has `overflow-hidden`. This means the padding is outside the visible area of the viewport. The Radix ScrollArea viewport clips content at the root's boundary, cutting off the rightmost ~16px of task cards.

Web dev cards appear fine because their titles are shorter, so the three-dot button stays within bounds. Marketing cards have longer titles that push the layout wider, causing the button to hit the clipping edge.

### The Fix

**File: `src/components/tasks/ProjectTasksDialog.tsx` (line 220)**

Move `pr-4` from the ScrollArea root to the content inside it, so the padding is within the scrollable viewport:

- Change: `<ScrollArea className="h-full pr-4">` 
- To: `<ScrollArea className="h-full">`

**File: `src/components/tasks/TaskList.tsx`**

Add `pr-4` to the outermost wrapper div so the padding is inside the scrollable content:

- Change: `<div className="space-y-4">`
- To: `<div className="space-y-4 pr-4">`

Also add the same padding to the empty state container for consistency.

### Why This Works

By moving the padding inside the scrollable viewport, the task cards have proper breathing room on the right without being clipped by the `overflow-hidden` on the ScrollArea root. This affects all domains equally -- web dev, marketing, and general -- ensuring consistent rendering.

### Files to Modify

| File | Change |
|------|--------|
| `src/components/tasks/ProjectTasksDialog.tsx` | Remove `pr-4` from ScrollArea |
| `src/components/tasks/TaskList.tsx` | Add `pr-4` to the content wrapper div |

