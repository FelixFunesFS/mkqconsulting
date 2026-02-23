
## Plan: Fix Task Card Edit Button Visibility

### The Problem

The three-dot edit menu on task cards is hidden (`opacity-0`) until hover and can get visually squeezed by long task titles. Marketing phase tasks tend to have longer titles than web dev tasks, making this worse. On touch devices, the hover-to-reveal pattern doesn't work at all.

### The Fix

Two small changes to `src/components/tasks/TaskCard.tsx`:

**1. Always show the menu button (remove opacity trick)**

Replace the hover-only visibility (`opacity-0 group-hover:opacity-100`) with always-visible styling. The button is already small (`h-6 w-6`) and unobtrusive -- hiding it creates accessibility and discoverability problems.

**2. Prevent the button from being squeezed**

Add `shrink-0` to the menu button so it never gets compressed by long titles. This ensures the 24px button always has its full space regardless of title length.

### Changes

| File | Change |
|------|--------|
| `src/components/tasks/TaskCard.tsx` | Remove `opacity-0 group-hover:opacity-100` from the menu trigger button, add `shrink-0` to prevent it from being squeezed |

### What Changes Visually

- The three-dot menu icon is always visible (subtle ghost button)
- Works on mobile/touch where hover isn't available
- Long marketing task titles no longer push the button off-screen
- No layout or spacing changes to the card itself
