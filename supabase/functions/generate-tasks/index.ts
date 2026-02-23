import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation and sanitization utilities
const MAX_PROJECT_NAME_LENGTH = 200;
const MAX_FIELD_LENGTH = 2000;
const MAX_QUESTIONNAIRE_FIELDS = 100;

/**
 * Sanitizes a string by removing control characters and limiting length
 */
function sanitize(str: unknown, maxLength: number = MAX_FIELD_LENGTH): string {
  if (str === null || str === undefined) return '';
  if (typeof str !== 'string') {
    str = String(str);
  }
  // Remove control characters (except newlines and tabs), trim whitespace
  return (str as string)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim()
    .slice(0, maxLength);
}

/**
 * Validates and sanitizes the questionnaire object
 */
function sanitizeQuestionnaire(q: unknown): Record<string, unknown> {
  if (!q || typeof q !== 'object' || Array.isArray(q)) {
    return {};
  }
  
  const sanitized: Record<string, unknown> = {};
  const entries = Object.entries(q as Record<string, unknown>);
  
  // Limit number of fields to prevent abuse
  if (entries.length > MAX_QUESTIONNAIRE_FIELDS) {
    throw new Error(`Questionnaire exceeds maximum of ${MAX_QUESTIONNAIRE_FIELDS} fields`);
  }
  
  for (const [key, value] of entries) {
    // Sanitize key name
    const sanitizedKey = sanitize(key, 100);
    if (!sanitizedKey) continue;
    
    // Handle arrays (like primary_goals, required_features)
    if (Array.isArray(value)) {
      sanitized[sanitizedKey] = value
        .slice(0, 50) // Limit array length
        .map(item => sanitize(item, 500));
    } else if (typeof value === 'boolean') {
      sanitized[sanitizedKey] = value;
    } else if (typeof value === 'string') {
      sanitized[sanitizedKey] = sanitize(value, MAX_FIELD_LENGTH);
    } else if (value === null || value === undefined) {
      sanitized[sanitizedKey] = null;
    }
    // Ignore other types (objects, numbers that aren't booleans)
  }
  
  return sanitized;
}

/**
 * Validates the project phase
 */
function validatePhase(phase: unknown): string {
  const validPhases = ['discovery', 'design', 'development', 'review', 'published'];
  const phaseStr = sanitize(phase, 20).toLowerCase();
  return validPhases.includes(phaseStr) ? phaseStr : 'discovery';
}

/**
 * Validates the mode parameter
 */
function validateMode(mode: unknown): string {
  const validModes = ['regenerate', 'add_new'];
  const modeStr = sanitize(mode, 20).toLowerCase();
  return validModes.includes(modeStr) ? modeStr : 'regenerate';
}

/**
 * Validates UUID format
 */
function isValidUUID(id: unknown): boolean {
  if (typeof id !== 'string') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('Missing or invalid Authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized - missing authorization' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    // Create client with user's auth token to validate JWT
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();
    
    if (userError || !user) {
      console.error('JWT verification failed:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized - invalid token' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = user.id;
    console.log('Authenticated user:', userId);

    // Use service role client for database operations
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if user has admin role
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin');

    if (rolesError) {
      console.error('Error checking user role:', rolesError);
      return new Response(
        JSON.stringify({ error: 'Failed to verify permissions' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!roles || roles.length === 0) {
      console.error('User does not have admin role:', userId);
      return new Response(
        JSON.stringify({ error: 'Forbidden - admin access required' }), 
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Admin role verified for user:', userId);

    // Parse and validate request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { projectId, questionnaire, projectName, currentPhase, mode, customPrompt } = requestBody;
    
    // Validate and sanitize custom prompt if provided
    const MAX_CUSTOM_PROMPT_LENGTH = 10000;
    const sanitizedCustomPrompt = customPrompt ? sanitize(customPrompt, MAX_CUSTOM_PROMPT_LENGTH) : null;

    // Validate required fields
    if (!projectId) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: projectId' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!isValidUUID(projectId)) {
      return new Response(
        JSON.stringify({ error: 'Invalid projectId format' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!projectName) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: projectName' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sanitize all inputs
    const sanitizedProjectName = sanitize(projectName, MAX_PROJECT_NAME_LENGTH);
    if (!sanitizedProjectName) {
      return new Response(
        JSON.stringify({ error: 'Project name cannot be empty' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const sanitizedQuestionnaire = sanitizeQuestionnaire(questionnaire);
    const validatedPhase = validatePhase(currentPhase);
    const validatedMode = validateMode(mode);
    
    console.log('Generating tasks for project:', projectId, sanitizedProjectName, 'mode:', validatedMode);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Format questionnaire data for the AI prompt
    const formatQuestionnaire = (q: Record<string, unknown>) => {
      if (!q || Object.keys(q).length === 0) return 'No questionnaire data available';
      
      const sections = [];
      
      // Company Overview
      if (q.company_name || q.industry || q.business_overview) {
        sections.push(`## Company Overview
- Company Name: ${q.company_name || 'Not provided'}
- Industry: ${q.industry || 'Not provided'}
- Years in Business: ${q.years_in_business || 'Not provided'}
- Business Overview: ${q.business_overview || 'Not provided'}
- Mission Statement: ${q.mission_statement || 'Not provided'}
- Vision Statement: ${q.vision_statement || 'Not provided'}
- Core Values: ${q.core_values || 'Not provided'}
- Tagline: ${q.tagline || 'Not provided'}`);
      }

      // Brand Identity
      sections.push(`## Brand Identity
- Existing Logo: ${q.existing_logo ? 'Yes' : 'No - needs logo design'}
- Brand Colors: ${q.brand_colors || 'Not specified'}
- Brand Fonts: ${q.brand_fonts || 'Not specified'}
- Brand Guidelines: ${q.brand_guidelines || 'Not provided'}
- Brand Personality: ${q.brand_personality || 'Not specified'}`);

      // Target Audience
      if (q.target_demographics || q.target_locations || q.geographic_reach) {
        sections.push(`## Target Audience
- Demographics: ${q.target_demographics || 'Not specified'}
- Target Locations: ${q.target_locations || 'Not specified'}
- Geographic Reach: ${q.geographic_reach || 'Not specified'}
- Secondary Audience: ${q.secondary_audience || 'Not specified'}
- Customer Pain Points: ${q.customer_pain_points || 'Not specified'}
- Customer Sources: ${q.customer_sources || 'Not specified'}`);
      }

      // Products/Services
      if (q.main_products_services || q.unique_selling_points) {
        sections.push(`## Products/Services
- Main Products/Services: ${q.main_products_services || 'Not specified'}
- Best Sellers: ${q.best_sellers || 'Not specified'}
- Seasonal Offerings: ${q.seasonal_offerings || 'Not specified'}
- Unique Selling Points: ${q.unique_selling_points || 'Not specified'}
- Pricing Display: ${q.pricing_display || 'Not specified'}
- Competitors: ${q.competitors || 'Not specified'}`);
      }

      // Website Goals
      if (q.primary_goals || q.required_features) {
        const goals = Array.isArray(q.primary_goals) ? q.primary_goals.join(', ') : q.primary_goals;
        const features = Array.isArray(q.required_features) ? q.required_features.join(', ') : q.required_features;
        sections.push(`## Website Goals & Features
- Primary Goals: ${goals || 'Not specified'}
- Required Features: ${features || 'Not specified'}
- Calls to Action: ${q.calls_to_action || 'Not specified'}
- Expected Traffic: ${q.expected_traffic || 'Not specified'}
- Integrations Needed: ${q.integrations_needed || 'Not specified'}
- Future Add-ons: ${q.future_addons || 'Not specified'}`);
      }

      // Content & Media
      sections.push(`## Content & Media
- Content Sections: ${q.content_sections || 'Not specified'}
- Content Ready: ${q.content_ready ? 'Yes' : 'No - needs content creation'}
- Image Sources: ${q.image_sources || 'Not specified'}
- Open to Stock Photos: ${q.open_to_stock ? 'Yes' : 'No'}`);

      // SEO & Marketing
      sections.push(`## SEO & Marketing
- Target Keywords: ${q.target_keywords || 'Not specified'}
- Google Analytics: ${q.google_analytics ? 'Set up' : 'Needs setup'}
- Has Google Business: ${q.has_google_business ? 'Yes' : 'No - needs setup'}
- Wants Ongoing SEO: ${q.wants_ongoing_seo ? 'Yes' : 'No'}
- Social Media Links: ${q.social_media_links || 'Not provided'}
- Existing Marketing: ${q.existing_marketing || 'Not specified'}`);

      // Compliance & Policies
      sections.push(`## Compliance & Policies
- Privacy Policy Needed: ${q.privacy_policy_needed ? 'Yes' : 'No'}
- Terms Needed: ${q.terms_needed ? 'Yes' : 'No'}
- Compliance Needs: ${q.compliance_needs || 'Not specified'}
- Accessibility Requirements: ${q.accessibility_requirements || 'Not specified'}`);

      // Design Preferences
      if (q.design_style || q.liked_websites) {
        sections.push(`## Design Preferences
- Design Style: ${q.design_style || 'Not specified'}
- Design Elements: ${q.design_elements || 'Not specified'}
- Liked Websites: ${q.liked_websites || 'Not specified'}
- Disliked Websites: ${q.disliked_websites || 'Not specified'}
- Example Websites: ${q.example_websites || 'Not specified'}
- Color Preferences: ${q.color_preferences || 'Not specified'}`);
      }

      // Technical & Maintenance
      sections.push(`## Technical & Maintenance
- Domain Status: ${q.domain_status || 'Not specified'}
- Hosting Preference: ${q.hosting_preference || 'Not specified'}
- Maintenance Plan: ${q.maintenance_plan || 'Not specified'}
- Needs Email: ${q.needs_email ? 'Yes' : 'No'}`);

      // Timeline & Budget
      if (q.timeline || q.budget_range || q.launch_date) {
        sections.push(`## Timeline & Budget
- Timeline: ${q.timeline || 'Not specified'}
- Budget Range: ${q.budget_range || 'Not specified'}
- Launch Date: ${q.launch_date || 'Not specified'}
- Critical Deadlines: ${q.critical_deadlines || 'Not specified'}
- Decision Makers: ${q.decision_makers || 'Not specified'}`);
      }

      return sections.join('\n\n');
    };

    // Phase library for custom prompt validation
    const VALID_CUSTOM_PHASES = [
      'content_strategy', 'content_creation', 'social_media', 'email_marketing',
      'paid_ads', 'analytics', 'planning', 'research', 'operations', 'reporting',
      'discovery', 'design', 'development', 'review', 'published'
    ];

    // Fuzzy phase mapping for AI output normalization
    const PHASE_FUZZY_MAP: Record<string, string> = {
      'social': 'social_media', 'social media': 'social_media', 'social posts': 'social_media',
      'content': 'content_creation', 'writing': 'content_creation', 'blog': 'content_creation',
      'blogs': 'content_creation', 'copywriting': 'content_creation',
      'strategy': 'content_strategy', 'content plan': 'content_strategy',
      'email': 'email_marketing', 'emails': 'email_marketing', 'newsletter': 'email_marketing',
      'ads': 'paid_ads', 'advertising': 'paid_ads', 'ppc': 'paid_ads',
      'tracking': 'analytics', 'metrics': 'analytics', 'data': 'analytics',
      'plan': 'planning', 'setup': 'planning', 'kickoff': 'planning',
      'market research': 'research', 'analysis': 'research', 'audit': 'research',
      'process': 'operations', 'workflow': 'operations', 'automation': 'operations',
      'report': 'reporting', 'reports': 'reporting', 'summary': 'reporting',
    };

    function normalizePhase(phase: string, isCustomPrompt: boolean): string {
      const cleaned = sanitize(phase, 50).toLowerCase().replace(/[^a-z_\s]/g, '').trim();
      if (isCustomPrompt) {
        if (VALID_CUSTOM_PHASES.includes(cleaned)) return cleaned;
        const fuzzy = PHASE_FUZZY_MAP[cleaned];
        if (fuzzy) return fuzzy;
        // Try partial match
        for (const [key, value] of Object.entries(PHASE_FUZZY_MAP)) {
          if (cleaned.includes(key) || key.includes(cleaned)) return value;
        }
        return 'planning'; // default fallback
      }
      // For questionnaire mode, keep existing web dev validation
      const validWebDevPhases = ['discovery', 'design', 'development', 'review', 'published'];
      return validWebDevPhases.includes(cleaned) ? cleaned : 'discovery';
    }

    const systemPrompt = sanitizedCustomPrompt
      ? `You are an expert project manager for MKQ Consulting. Your job is to analyze plans, strategies, and content provided by the user and break them into actionable, trackable tasks.

For each task, you MUST return a JSON object with these exact fields:
- title: Brief, actionable task title (max 60 chars)
- description: Clear description of what needs to be done (1-2 sentences)
- phase: MUST be one from the allowed list below
- priority: One of: low, medium, high, critical
- estimated_hours: Number (realistic estimate)
- questionnaire_field: A category label for this task (e.g., "marketing", "content", "seo", "social_media", "email", "strategy", "operations")

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
- discovery: Research, planning, requirements gathering (web dev)
- design: UI/UX design, mockups, prototypes (web dev)
- development: Coding, building, integrating (web dev)
- review: Testing, QA, client review, revisions (web dev)
- published: Launch, deployment, monitoring, maintenance (web dev)

Do NOT invent new phase names. Pick the closest match from this list.

Guidelines:
- Generate as many tasks as needed to fully cover the plan (typically 10-40)
- Each task should be specific and actionable, not vague
- Group related items logically
- Estimate hours realistically
- Distribute across appropriate phases based on the content`
      : `You are an expert web development project manager for MKQ Consulting. Your job is to analyze client questionnaires and generate comprehensive, actionable task lists for web development projects.

You must generate tasks across 5 project phases:
1. **discovery** - Research, planning, requirements gathering
2. **design** - UI/UX design, mockups, prototypes
3. **development** - Coding, building, integrating
4. **review** - Testing, QA, client review, revisions
5. **published** - Launch, deployment, monitoring, maintenance

For each task, you MUST return a JSON object with these exact fields:
- title: Brief, actionable task title (max 60 chars)
- description: Clear description of what needs to be done (1-2 sentences)
- phase: One of: discovery, design, development, review, published
- priority: One of: low, medium, high, critical
- estimated_hours: Number (realistic estimate)
- questionnaire_field: Which questionnaire section this relates to (e.g., "brand_identity", "seo", "content", "technical", "compliance", "design", "goals")

Guidelines:
- Generate 15-25 tasks total, distributed across phases
- Prioritize tasks based on client needs and missing items
- If logo is missing, add logo design tasks
- If content isn't ready, add content creation tasks
- Always include SEO setup, analytics, and compliance tasks
- Add tasks for any integrations or special features mentioned
- Consider the current project phase when setting priorities`;

    const userPrompt = sanitizedCustomPrompt
      ? `Break the following plan/content into actionable tasks for the project "${sanitizedProjectName}".
Prefer assigning tasks to the "${validatedPhase}" phase unless the content clearly belongs elsewhere.

**Plan/Content:**
${sanitizedCustomPrompt}

Generate a JSON array of tasks. Return ONLY the JSON array, no other text.`
      : `Analyze this client questionnaire and generate a comprehensive task list for their web development project.

**Project:** ${sanitizedProjectName}
**Current Phase:** ${validatedPhase}

**Questionnaire Data:**
${formatQuestionnaire(sanitizedQuestionnaire)}

Generate a JSON array of tasks. Return ONLY the JSON array, no other text. Example format:
[
  {
    "title": "Create brand style guide",
    "description": "Document brand colors, fonts, and visual guidelines for consistent design.",
    "phase": "discovery",
    "priority": "high",
    "estimated_hours": 4,
    "questionnaire_field": "brand_identity"
  }
]`;

    console.log('Calling Lovable AI...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    console.log('AI response received');

    const content = aiResponse.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('No content in AI response');
    }

    // Parse the JSON from AI response
    let tasks;
    try {
      // Try to extract JSON array from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        tasks = JSON.parse(jsonMatch[0]);
      } else {
        tasks = JSON.parse(content);
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Failed to parse task list from AI');
    }

    // Validate and sanitize AI-generated tasks
    if (!Array.isArray(tasks)) {
      throw new Error('AI response is not a valid task array');
    }

    const validPhases = ['discovery', 'design', 'development', 'review', 'published'];
    const validPriorities = ['low', 'medium', 'high', 'critical'];

    const validatedTasks = tasks.slice(0, 50).map((task: Record<string, unknown>) => {
      const title = sanitize(task.title, 60);
      const description = sanitize(task.description, 500);
      const phase = normalizePhase(String(task.phase), !!sanitizedCustomPrompt);
      const priority = validPriorities.includes(String(task.priority)) ? String(task.priority) : 'medium';
      const estimatedHours = typeof task.estimated_hours === 'number' 
        ? Math.min(Math.max(task.estimated_hours, 0), 1000) 
        : null;
      const questionnaireField = sanitize(task.questionnaire_field, 50);

      return {
        title: title || 'Untitled Task',
        description,
        phase,
        priority,
        estimated_hours: estimatedHours,
        questionnaire_field: questionnaireField || null,
      };
    }).filter((task: { title: string }) => task.title && task.title !== 'Untitled Task');

    // Handle different modes for task management
    // Custom prompt always uses 'add_new' behavior (never deletes existing tasks)
    if (validatedMode === 'regenerate' && !sanitizedCustomPrompt) {
      // Delete only PENDING AI-generated tasks, preserve completed ones
      const { error: deleteError } = await supabase
        .from('tasks')
        .delete()
        .eq('project_id', projectId)
        .eq('source', 'ai_generated')
        .in('status', ['pending', 'in_progress', 'blocked']);

      if (deleteError) {
        console.error('Error deleting old tasks:', deleteError);
      }
    }
    // For 'add_new' mode, we don't delete anything - just add new tasks

    // Insert new tasks
    const tasksToInsert = validatedTasks.map((task: Record<string, unknown>) => ({
      project_id: projectId,
      title: task.title,
      description: task.description,
      phase: task.phase,
      priority: task.priority,
      status: 'pending',
      estimated_hours: task.estimated_hours,
      source: 'ai_generated',
      questionnaire_field: task.questionnaire_field,
    }));

    const { data: insertedTasks, error: insertError } = await supabase
      .from('tasks')
      .insert(tasksToInsert)
      .select();

    if (insertError) {
      console.error('Error inserting tasks:', insertError);
      throw new Error('Failed to save tasks to database');
    }

    // Note: Project stats (total_tasks, tasks_completed, progress) are now
    // automatically updated by the update_project_task_stats database trigger

    console.log(`Successfully generated ${insertedTasks.length} tasks`);

    return new Response(JSON.stringify({ 
      success: true, 
      tasks: insertedTasks,
      count: insertedTasks.length 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-tasks:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
