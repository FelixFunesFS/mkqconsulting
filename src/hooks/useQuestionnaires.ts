import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { QuestionnaireData } from '@/types/project';

// Map database snake_case to TypeScript camelCase
const mapDbToQuestionnaire = (row: any): QuestionnaireData => ({
  // Section 1: Company Overview
  businessName: row.company_name || '',
  tagline: row.tagline || '',
  missionStatement: row.mission_statement || '',
  visionStatement: row.vision_statement || '',
  coreValues: row.core_values || '',
  businessOverview: row.business_overview || '',
  usp: row.unique_selling_points || '',
  brandPersonality: row.brand_personality || '',
  brandColors: row.brand_colors || '',
  brandFonts: row.brand_fonts || '',
  logoAvailable: row.existing_logo || false,

  // Section 2: Target Audience
  primaryAudience: row.target_demographics || '',
  secondaryAudience: row.secondary_audience || '',
  competitors: row.competitors ? (Array.isArray(row.competitors) ? row.competitors : [row.competitors]) : [],
  problemsSolved: row.customer_pain_points || '',
  customerSources: row.customer_sources || '',

  // Section 3: Products & Services
  productsServices: row.main_products_services || '',
  pricingStrategy: row.pricing_display === 'Contact for quote' ? 'contact' : 'public',
  bestSellers: row.best_sellers || '',
  serviceArea: row.geographic_reach?.includes('Local') ? 'local' : row.geographic_reach?.includes('national') ? 'national' : 'international',
  seasonalOfferings: row.seasonal_offerings || '',

  // Section 4: Website Goals
  mainGoal: row.primary_goals?.[0] || '',
  topActions: row.calls_to_action ? row.calls_to_action.split(',').map((s: string) => s.trim()) : [],
  features: row.required_features || [],
  integrations: row.integrations_needed || '',
  futureAddons: row.future_addons || '',

  // Section 5: Content & Media
  hasExistingCopy: row.content_ready || false,
  hasPhotosVideos: !!row.image_sources,
  openToStock: row.open_to_stock || false,
  hasBrandGuidelines: !!row.brand_guidelines,
  existingMarketing: row.existing_marketing || '',

  // Section 6: SEO & Marketing
  primaryKeywords: row.target_keywords || '',
  targetLocations: row.target_locations || '',
  hasGoogleBusiness: row.has_google_business || false,
  hasAnalytics: row.google_analytics || false,
  wantsOngoingSEO: row.wants_ongoing_seo || false,

  // Section 7: Compliance
  hasPrivacyPolicy: row.privacy_policy_needed ?? true,
  hasTerms: row.terms_needed ?? true,
  complianceNeeds: row.compliance_needs || '',
  accessibilityNeeds: row.accessibility_requirements || '',

  // Section 8: Design Preferences
  likedWebsites: row.liked_websites ? row.liked_websites.split(',').map((s: string) => s.trim()) : [],
  dislikedWebsites: row.disliked_websites ? row.disliked_websites.split(',').map((s: string) => s.trim()) : [],
  layoutStyle: row.design_style || '',
  designElements: row.design_elements || '',

  // Section 9: Technical
  hasDomain: !!row.domain_status,
  domainInfo: row.domain_status || '',
  hasHosting: !!row.hosting_preference,
  hostingInfo: row.hosting_preference || '',
  needsEmail: row.needs_email || false,
  maintenancePlan: row.maintenance_plan?.includes('self') ? 'self' : 'managed',
  expectedTraffic: row.expected_traffic || '',

  // Section 10: Timeline & Budget
  launchDate: row.launch_date || '',
  criticalDeadlines: row.critical_deadlines || '',
  budgetRange: row.budget_range || '',
  priority: row.priority ? row.priority.split(',').map((s: string) => s.trim()) : [],

  // Section 11: Acknowledgements
  acknowledgementsAccepted: row.acknowledgements_accepted || false,
});

// Map TypeScript camelCase to database snake_case
const mapQuestionnaireToDb = (data: Partial<QuestionnaireData>) => ({
  // Section 1
  company_name: data.businessName,
  tagline: data.tagline,
  mission_statement: data.missionStatement,
  vision_statement: data.visionStatement,
  core_values: data.coreValues,
  business_overview: data.businessOverview,
  unique_selling_points: data.usp,
  brand_personality: data.brandPersonality,
  brand_colors: data.brandColors,
  brand_fonts: data.brandFonts,
  existing_logo: data.logoAvailable,

  // Section 2
  target_demographics: data.primaryAudience,
  secondary_audience: data.secondaryAudience,
  competitors: data.competitors?.join(', '),
  customer_pain_points: data.problemsSolved,
  customer_sources: data.customerSources,

  // Section 3
  main_products_services: data.productsServices,
  pricing_display: data.pricingStrategy === 'contact' ? 'Contact for quote' : 'Public',
  best_sellers: data.bestSellers,
  geographic_reach: data.serviceArea === 'local' ? 'Local' : data.serviceArea === 'national' ? 'National' : 'International',
  seasonal_offerings: data.seasonalOfferings,

  // Section 4
  primary_goals: data.mainGoal ? [data.mainGoal] : [],
  calls_to_action: data.topActions?.join(', '),
  required_features: data.features,
  integrations_needed: data.integrations,
  future_addons: data.futureAddons,

  // Section 5
  content_ready: data.hasExistingCopy,
  image_sources: data.hasPhotosVideos ? 'Available' : '',
  open_to_stock: data.openToStock,
  brand_guidelines: data.hasBrandGuidelines ? 'Available' : '',
  existing_marketing: data.existingMarketing,

  // Section 6
  target_keywords: data.primaryKeywords,
  target_locations: data.targetLocations,
  has_google_business: data.hasGoogleBusiness,
  google_analytics: data.hasAnalytics,
  wants_ongoing_seo: data.wantsOngoingSEO,

  // Section 7
  privacy_policy_needed: data.hasPrivacyPolicy,
  terms_needed: data.hasTerms,
  compliance_needs: data.complianceNeeds,
  accessibility_requirements: data.accessibilityNeeds,

  // Section 8
  liked_websites: data.likedWebsites?.join(', '),
  disliked_websites: data.dislikedWebsites?.join(', '),
  design_style: data.layoutStyle,
  design_elements: data.designElements,

  // Section 9
  domain_status: data.domainInfo,
  hosting_preference: data.hostingInfo,
  needs_email: data.needsEmail,
  maintenance_plan: data.maintenancePlan === 'self' ? 'Self-managed' : 'Managed',
  expected_traffic: data.expectedTraffic,

  // Section 10
  launch_date: data.launchDate || null,
  critical_deadlines: data.criticalDeadlines,
  budget_range: data.budgetRange,
  priority: data.priority?.join(', '),

  // Section 11
  acknowledgements_accepted: data.acknowledgementsAccepted,
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
        .insert({ ...dbData, project_id: projectId } as any)
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
        .update(dbData as any)
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
          .update(dbData as any)
          .eq('project_id', projectId)
          .select()
          .single();
        if (error) throw error;
        return result;
      } else {
        const { data: result, error } = await supabase
          .from('questionnaires')
          .insert({ ...dbData, project_id: projectId } as any)
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
