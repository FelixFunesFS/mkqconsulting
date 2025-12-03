export type ProjectStatus = 'discovery' | 'design' | 'development' | 'review' | 'published';

export interface Project {
  id: string;
  clientName: string;
  businessName: string;
  websiteUrl?: string;
  status: ProjectStatus;
  progress: number;
  tasksCompleted: number;
  totalTasks: number;
  startDate: string;
  targetLaunchDate?: string;
  questionnaire?: QuestionnaireData;
  notes?: string;
  monthlyRevenue?: number;
  hostingProvider?: string;
}

export interface QuestionnaireData {
  // Section 1: Company Overview
  businessName: string;
  tagline?: string;
  missionStatement?: string;
  visionStatement?: string;
  coreValues?: string;
  businessOverview?: string;
  usp?: string;
  brandPersonality?: string;
  brandColors?: string;
  brandFonts?: string;
  logoAvailable?: boolean;

  // Section 2: Target Audience
  primaryAudience?: string;
  secondaryAudience?: string;
  competitors?: string[];
  problemsSolved?: string;
  customerSources?: string;

  // Section 3: Products & Services
  productsServices?: string;
  pricingStrategy?: 'public' | 'contact';
  bestSellers?: string;
  serviceArea?: 'local' | 'national' | 'international';
  seasonalOfferings?: string;

  // Section 4: Website Goals
  mainGoal?: string;
  topActions?: string[];
  features?: string[];
  integrations?: string;
  futureAddons?: string;

  // Section 5: Content & Media
  hasExistingCopy?: boolean;
  hasPhotosVideos?: boolean;
  openToStock?: boolean;
  hasBrandGuidelines?: boolean;
  existingMarketing?: string;

  // Section 6: SEO & Marketing
  primaryKeywords?: string;
  targetLocations?: string;
  hasGoogleBusiness?: boolean;
  hasAnalytics?: boolean;
  wantsOngoingSEO?: boolean;

  // Section 7: Compliance
  hasPrivacyPolicy?: boolean;
  hasTerms?: boolean;
  complianceNeeds?: string;
  accessibilityNeeds?: string;

  // Section 8: Design Preferences
  likedWebsites?: string[];
  dislikedWebsites?: string[];
  layoutStyle?: string;
  designElements?: string;

  // Section 9: Technical
  hasDomain?: boolean;
  domainInfo?: string;
  hasHosting?: boolean;
  hostingInfo?: string;
  needsEmail?: boolean;
  maintenancePlan?: 'self' | 'managed';
  expectedTraffic?: string;

  // Section 10: Timeline & Budget
  launchDate?: string;
  criticalDeadlines?: string;
  budgetRange?: string;
  priority?: string[];

  // Section 11: Acknowledgements
  acknowledgementsAccepted?: boolean;
}

export const statusColors: Record<ProjectStatus, string> = {
  discovery: 'bg-info text-info-foreground',
  design: 'bg-accent text-accent-foreground',
  development: 'bg-primary text-primary-foreground',
  review: 'bg-warning text-warning-foreground',
  published: 'bg-success text-success-foreground',
};

export const statusLabels: Record<ProjectStatus, string> = {
  discovery: 'Discovery',
  design: 'Design',
  development: 'Development',
  review: 'Review',
  published: 'Published',
};
