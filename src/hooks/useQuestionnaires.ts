import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { QuestionnaireData } from '@/types/project';

// Map database snake_case to TypeScript camelCase
const mapDbToQuestionnaire = (row: any): QuestionnaireData => ({
  // Section 1: Company Overview & Brand Identity
  companyName: row.company_name || '',
  tagline: row.tagline || '',
  industry: row.industry || '',
  yearsInBusiness: row.years_in_business || '',
  missionStatement: row.mission_statement || '',
  visionStatement: row.vision_statement || '',
  coreValues: row.core_values || '',
  businessOverview: row.business_overview || '',
  uniqueSellingPoints: row.unique_selling_points || '',
  brandPersonality: row.brand_personality || '',
  brandColors: row.brand_colors || '',
  brandFonts: row.brand_fonts || '',
  brandGuidelines: row.brand_guidelines || '',
  existingLogo: row.existing_logo || false,

  // Section 2: Target Audience & Market
  targetDemographics: row.target_demographics || '',
  secondaryAudience: row.secondary_audience || '',
  geographicReach: row.geographic_reach || '',
  customerPainPoints: row.customer_pain_points || '',
  competitors: row.competitors || '',
  customerSources: row.customer_sources || '',

  // Section 3: Products/Services
  mainProductsServices: row.main_products_services || '',
  pricingDisplay: row.pricing_display || '',
  bestSellers: row.best_sellers || '',
  seasonalOfferings: row.seasonal_offerings || '',

  // Section 4: Website Goals & Functionality
  primaryGoals: row.primary_goals || [],
  requiredFeatures: row.required_features || [],
  callsToAction: row.calls_to_action || '',
  integrationsNeeded: row.integrations_needed || '',
  futureAddons: row.future_addons || '',

  // Section 5: Content & Media
  contentSections: row.content_sections || '',
  contentReady: row.content_ready || false,
  imageSources: row.image_sources || '',
  openToStock: row.open_to_stock || false,
  existingMarketing: row.existing_marketing || '',

  // Section 6: SEO & Marketing
  targetKeywords: row.target_keywords || '',
  targetLocations: row.target_locations || '',
  hasGoogleBusiness: row.has_google_business || false,
  googleAnalytics: row.google_analytics || false,
  wantsOngoingSeo: row.wants_ongoing_seo || false,
  socialMediaLinks: row.social_media_links || '',

  // Section 7: Compliance & Policies
  privacyPolicyNeeded: row.privacy_policy_needed ?? true,
  termsNeeded: row.terms_needed ?? true,
  complianceNeeds: row.compliance_needs || '',
  accessibilityRequirements: row.accessibility_requirements || '',

  // Section 8: Design Preferences
  designStyle: row.design_style || '',
  likedWebsites: row.liked_websites || '',
  dislikedWebsites: row.disliked_websites || '',
  colorPreferences: row.color_preferences || '',
  designElements: row.design_elements || '',
  exampleWebsites: row.example_websites || '',

  // Section 9: Technical & Maintenance
  domainStatus: row.domain_status || '',
  hostingPreference: row.hosting_preference || '',
  needsEmail: row.needs_email || false,
  maintenancePlan: row.maintenance_plan || '',
  expectedTraffic: row.expected_traffic || '',

  // Section 10: Timelines & Budget
  timeline: row.timeline || '',
  launchDate: row.launch_date || '',
  criticalDeadlines: row.critical_deadlines || '',
  budgetRange: row.budget_range || '',
  priority: row.priority || '',
  decisionMakers: row.decision_makers || '',

  // Section 11: Assumptions & Limitations
  assumptions: row.assumptions || '',
  limitations: row.limitations || '',
  acknowledgementsAccepted: row.acknowledgements_accepted || false,
  additionalNotes: row.additional_notes || '',
});

// Map TypeScript camelCase to database snake_case
const mapQuestionnaireToDb = (data: Partial<QuestionnaireData>) => ({
  // Section 1
  company_name: data.companyName,
  tagline: data.tagline,
  industry: data.industry,
  years_in_business: data.yearsInBusiness,
  mission_statement: data.missionStatement,
  vision_statement: data.visionStatement,
  core_values: data.coreValues,
  business_overview: data.businessOverview,
  unique_selling_points: data.uniqueSellingPoints,
  brand_personality: data.brandPersonality,
  brand_colors: data.brandColors,
  brand_fonts: data.brandFonts,
  brand_guidelines: data.brandGuidelines,
  existing_logo: data.existingLogo,

  // Section 2
  target_demographics: data.targetDemographics,
  secondary_audience: data.secondaryAudience,
  geographic_reach: data.geographicReach,
  customer_pain_points: data.customerPainPoints,
  competitors: data.competitors,
  customer_sources: data.customerSources,

  // Section 3
  main_products_services: data.mainProductsServices,
  pricing_display: data.pricingDisplay,
  best_sellers: data.bestSellers,
  seasonal_offerings: data.seasonalOfferings,

  // Section 4
  primary_goals: data.primaryGoals,
  required_features: data.requiredFeatures,
  calls_to_action: data.callsToAction,
  integrations_needed: data.integrationsNeeded,
  future_addons: data.futureAddons,

  // Section 5
  content_sections: data.contentSections,
  content_ready: data.contentReady,
  image_sources: data.imageSources,
  open_to_stock: data.openToStock,
  existing_marketing: data.existingMarketing,

  // Section 6
  target_keywords: data.targetKeywords,
  target_locations: data.targetLocations,
  has_google_business: data.hasGoogleBusiness,
  google_analytics: data.googleAnalytics,
  wants_ongoing_seo: data.wantsOngoingSeo,
  social_media_links: data.socialMediaLinks,

  // Section 7
  privacy_policy_needed: data.privacyPolicyNeeded,
  terms_needed: data.termsNeeded,
  compliance_needs: data.complianceNeeds,
  accessibility_requirements: data.accessibilityRequirements,

  // Section 8
  design_style: data.designStyle,
  liked_websites: data.likedWebsites,
  disliked_websites: data.dislikedWebsites,
  color_preferences: data.colorPreferences,
  design_elements: data.designElements,
  example_websites: data.exampleWebsites,

  // Section 9
  domain_status: data.domainStatus,
  hosting_preference: data.hostingPreference,
  needs_email: data.needsEmail,
  maintenance_plan: data.maintenancePlan,
  expected_traffic: data.expectedTraffic,

  // Section 10
  timeline: data.timeline,
  launch_date: data.launchDate,
  critical_deadlines: data.criticalDeadlines,
  budget_range: data.budgetRange,
  priority: data.priority,
  decision_makers: data.decisionMakers,

  // Section 11
  assumptions: data.assumptions,
  limitations: data.limitations,
  acknowledgements_accepted: data.acknowledgementsAccepted,
  additional_notes: data.additionalNotes,
});

// Fetch questionnaire for a specific project
export const useQuestionnaire = (projectId: string | undefined) => {
  return useQuery({
    queryKey: ['questionnaire', projectId],
    queryFn: async () => {
      if (!projectId) return null;
      
      const { data, error } = await supabase
        .from('questionnaires')
        .select('*')
        .eq('project_id', projectId)
        .maybeSingle();

      if (error) throw error;
      return data ? mapDbToQuestionnaire(data) : null;
    },
    enabled: !!projectId,
  });
};

// Create a new questionnaire
export const useCreateQuestionnaire = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, data }: { projectId: string; data: Partial<QuestionnaireData> }) => {
      const dbData = mapQuestionnaireToDb(data);
      const { data: result, error } = await supabase
        .from('questionnaires')
        .insert({ ...dbData, project_id: projectId })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['questionnaire', variables.projectId] });
    },
  });
};

// Update an existing questionnaire
export const useUpdateQuestionnaire = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, data }: { projectId: string; data: Partial<QuestionnaireData> }) => {
      const dbData = mapQuestionnaireToDb(data);
      const { data: result, error } = await supabase
        .from('questionnaires')
        .update(dbData)
        .eq('project_id', projectId)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['questionnaire', variables.projectId] });
    },
  });
};

// Upsert questionnaire (create or update)
export const useUpsertQuestionnaire = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, data }: { projectId: string; data: Partial<QuestionnaireData> }) => {
      // First check if questionnaire exists
      const { data: existing } = await supabase
        .from('questionnaires')
        .select('id')
        .eq('project_id', projectId)
        .maybeSingle();

      const dbData = mapQuestionnaireToDb(data);

      if (existing) {
        const { data: result, error } = await supabase
          .from('questionnaires')
          .update(dbData)
          .eq('project_id', projectId)
          .select()
          .single();
        if (error) throw error;
        return result;
      } else {
        const { data: result, error } = await supabase
          .from('questionnaires')
          .insert({ ...dbData, project_id: projectId })
          .select()
          .single();
        if (error) throw error;
        return result;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['questionnaire', variables.projectId] });
    },
  });
};
