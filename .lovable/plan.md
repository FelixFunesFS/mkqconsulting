

## Improve Phase Selector in Task Edit Dialog

The edit dialog already has a phase selector, but it uses a flat ungrouped list of phases — unlike the create dialog which now groups them by domain (Web Dev / Marketing / General). This makes it harder to find the right phase.

### Change

**`src/components/tasks/TaskEditDialog.tsx`**
- Replace the flat phase list with the same grouped-by-domain dropdown used in `TaskCreateDialog`
- Import `groupPhasesByDomain` and `DOMAIN_LABELS` from `@/types/phases`
- Add domain section headers in the `SelectContent`
- Make the phase selector full-width and visually prominent (matching create dialog styling)

One small change, no new files needed.

