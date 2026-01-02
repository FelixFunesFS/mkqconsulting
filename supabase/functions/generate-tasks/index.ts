import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { projectId, questionnaire, projectName, currentPhase, mode = 'regenerate' } = await req.json();
    
    console.log('Generating tasks for project:', projectId, projectName, 'mode:', mode);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Format questionnaire data for the AI prompt
    const formatQuestionnaire = (q: any) => {
      if (!q) return 'No questionnaire data available';
      
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

    const systemPrompt = `You are an expert web development project manager for MKQ Consulting. Your job is to analyze client questionnaires and generate comprehensive, actionable task lists for web development projects.

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

    const userPrompt = `Analyze this client questionnaire and generate a comprehensive task list for their web development project.

**Project:** ${projectName}
**Current Phase:** ${currentPhase}

**Questionnaire Data:**
${formatQuestionnaire(questionnaire)}

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

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Handle different modes for task management
    if (mode === 'regenerate') {
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
    const tasksToInsert = tasks.map((task: any) => ({
      project_id: projectId,
      title: task.title,
      description: task.description,
      phase: task.phase,
      priority: task.priority || 'medium',
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