export interface PhaseDefinition {
  id: string;
  label: string;
  domain: 'web_dev' | 'marketing' | 'general';
  order: number;
}

export const ALL_PHASES: PhaseDefinition[] = [
  // Web Development
  { id: 'discovery', label: 'Discovery', domain: 'web_dev', order: 1 },
  { id: 'design', label: 'Design', domain: 'web_dev', order: 2 },
  { id: 'development', label: 'Development', domain: 'web_dev', order: 3 },
  { id: 'review', label: 'Review', domain: 'web_dev', order: 4 },
  { id: 'published', label: 'Published', domain: 'web_dev', order: 5 },

  // Marketing
  { id: 'content_strategy', label: 'Content Strategy', domain: 'marketing', order: 10 },
  { id: 'content_creation', label: 'Content Creation', domain: 'marketing', order: 11 },
  { id: 'social_media', label: 'Social Media', domain: 'marketing', order: 12 },
  { id: 'email_marketing', label: 'Email Marketing', domain: 'marketing', order: 13 },
  { id: 'paid_ads', label: 'Paid Ads', domain: 'marketing', order: 14 },
  { id: 'analytics', label: 'Analytics', domain: 'marketing', order: 15 },

  // General
  { id: 'planning', label: 'Planning', domain: 'general', order: 20 },
  { id: 'research', label: 'Research', domain: 'general', order: 21 },
  { id: 'operations', label: 'Operations', domain: 'general', order: 22 },
  { id: 'reporting', label: 'Reporting', domain: 'general', order: 23 },
];

const phaseMap = new Map(ALL_PHASES.map((p) => [p.id, p]));

export const WEB_DEV_PHASES = ALL_PHASES.filter((p) => p.domain === 'web_dev');
export const MARKETING_PHASES = ALL_PHASES.filter((p) => p.domain === 'marketing');
export const GENERAL_PHASES = ALL_PHASES.filter((p) => p.domain === 'general');

/** Get human-readable label for a phase id. Falls back to title-casing the id. */
export function getPhaseLabel(phaseId: string): string {
  const def = phaseMap.get(phaseId);
  if (def) return def.label;
  // Fallback: title-case the id
  return phaseId
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Get the sort order for a phase. Unknown phases sort to the end. */
export function getPhaseOrder(phaseId: string): number {
  return phaseMap.get(phaseId)?.order ?? 999;
}

/** All valid phase IDs as a Set for quick lookup */
export const VALID_PHASE_IDS = new Set(ALL_PHASES.map((p) => p.id));

/**
 * Compute which phases to display, ordered by library order.
 * Returns only phases that have at least one task.
 */
export function getActivePhases(tasks: { phase: string }[]): PhaseDefinition[] {
  const usedPhaseIds = new Set(tasks.map((t) => t.phase));
  const result: PhaseDefinition[] = [];

  for (const phase of ALL_PHASES) {
    if (usedPhaseIds.has(phase.id)) {
      result.push(phase);
    }
  }

  // Add any unknown phases that exist in tasks (shouldn't happen but safety net)
  for (const id of usedPhaseIds) {
    if (!phaseMap.has(id)) {
      result.push({ id, label: getPhaseLabel(id), domain: 'general', order: 999 });
    }
  }

  return result.sort((a, b) => a.order - b.order);
}

/**
 * Get all phases available for dropdowns: web dev phases + any custom phases used in the project.
 */
export function getAvailablePhasesForDropdown(tasks: { phase: string }[]): PhaseDefinition[] {
  const active = getActivePhases(tasks);
  const activeIds = new Set(active.map((p) => p.id));

  // Always include all library phases
  const result = [...ALL_PHASES];

  // Add any unknown phases from tasks
  for (const p of active) {
    if (!VALID_PHASE_IDS.has(p.id)) {
      result.push(p);
    }
  }

  return result.sort((a, b) => a.order - b.order);
}

/** Formatted phase list for injection into AI prompts */
export const PHASE_LIBRARY_PROMPT = `You MUST assign each task to one of these phases only:
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
- discovery: Research, planning, requirements gathering (web dev)
- design: UI/UX design, mockups, prototypes (web dev)
- development: Coding, building, integrating (web dev)
- review: Testing, QA, client review, revisions (web dev)
- published: Launch, deployment, monitoring, maintenance (web dev)

Do NOT invent new phase names. Pick the closest match from this list.`;
