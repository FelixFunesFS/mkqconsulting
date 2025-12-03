import { useState } from 'react';
import { QuestionnaireData } from '@/types/project';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import {
  Building2,
  Users,
  Package,
  Target,
  FileText,
  Search,
  Shield,
  Palette,
  Settings,
  Clock,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
} from 'lucide-react';

interface QuestionnaireFormProps {
  initialData?: Partial<QuestionnaireData>;
  onSubmit: (data: QuestionnaireData) => void;
  onCancel: () => void;
}

const sections = [
  { id: 1, title: 'Company Overview', icon: Building2 },
  { id: 2, title: 'Target Audience', icon: Users },
  { id: 3, title: 'Products & Services', icon: Package },
  { id: 4, title: 'Website Goals', icon: Target },
  { id: 5, title: 'Content & Media', icon: FileText },
  { id: 6, title: 'SEO & Marketing', icon: Search },
  { id: 7, title: 'Compliance', icon: Shield },
  { id: 8, title: 'Design Preferences', icon: Palette },
  { id: 9, title: 'Technical', icon: Settings },
  { id: 10, title: 'Timeline & Budget', icon: Clock },
  { id: 11, title: 'Acknowledgements', icon: CheckCircle2 },
];

const websiteFeatures = [
  'E-commerce / Online store',
  'Online booking/scheduling',
  'Blog / News section',
  'Portfolio / Gallery',
  'Contact form',
  'Live chat',
  'Multilingual support',
  'Membership / Login',
];

export function QuestionnaireForm({ initialData, onSubmit, onCancel }: QuestionnaireFormProps) {
  const [currentSection, setCurrentSection] = useState(1);
  const [data, setData] = useState<Partial<QuestionnaireData>>(initialData || {});

  const updateField = (field: keyof QuestionnaireData, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleFeature = (feature: string) => {
    const current = data.features || [];
    const updated = current.includes(feature)
      ? current.filter((f) => f !== feature)
      : [...current, feature];
    updateField('features', updated);
  };

  const handleSubmit = () => {
    onSubmit(data as QuestionnaireData);
  };

  const renderSection = () => {
    switch (currentSection) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name *</Label>
              <Input
                id="businessName"
                value={data.businessName || ''}
                onChange={(e) => updateField('businessName', e.target.value)}
                placeholder="Enter your exact legal business name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tagline">Tagline/Slogan</Label>
              <Input
                id="tagline"
                value={data.tagline || ''}
                onChange={(e) => updateField('tagline', e.target.value)}
                placeholder="Your company tagline"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="missionStatement">Mission Statement</Label>
              <Textarea
                id="missionStatement"
                value={data.missionStatement || ''}
                onChange={(e) => updateField('missionStatement', e.target.value)}
                placeholder="What is your company's mission?"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="visionStatement">Vision Statement</Label>
              <Textarea
                id="visionStatement"
                value={data.visionStatement || ''}
                onChange={(e) => updateField('visionStatement', e.target.value)}
                placeholder="What is your company's vision for the future?"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="coreValues">Core Values</Label>
              <Textarea
                id="coreValues"
                value={data.coreValues || ''}
                onChange={(e) => updateField('coreValues', e.target.value)}
                placeholder="List your core values (e.g., integrity, innovation, customer focus)"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessOverview">Brief Business Overview</Label>
              <Textarea
                id="businessOverview"
                value={data.businessOverview || ''}
                onChange={(e) => updateField('businessOverview', e.target.value)}
                placeholder="1-3 sentences about what you do"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="usp">Unique Selling Proposition (USP)</Label>
              <Textarea
                id="usp"
                value={data.usp || ''}
                onChange={(e) => updateField('usp', e.target.value)}
                placeholder="Why should customers choose you over competitors?"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brandPersonality">Brand Personality</Label>
              <Input
                id="brandPersonality"
                value={data.brandPersonality || ''}
                onChange={(e) => updateField('brandPersonality', e.target.value)}
                placeholder="e.g., professional, playful, luxury, minimalist"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brandColors">Brand Colors</Label>
                <Input
                  id="brandColors"
                  value={data.brandColors || ''}
                  onChange={(e) => updateField('brandColors', e.target.value)}
                  placeholder="e.g., #FF5733, Navy Blue"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="brandFonts">Brand Fonts</Label>
                <Input
                  id="brandFonts"
                  value={data.brandFonts || ''}
                  onChange={(e) => updateField('brandFonts', e.target.value)}
                  placeholder="e.g., Helvetica, Roboto"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="logoAvailable"
                checked={data.logoAvailable || false}
                onCheckedChange={(checked) => updateField('logoAvailable', checked)}
              />
              <Label htmlFor="logoAvailable">Logo files available</Label>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="primaryAudience">Primary Target Audience</Label>
              <Textarea
                id="primaryAudience"
                value={data.primaryAudience || ''}
                onChange={(e) => updateField('primaryAudience', e.target.value)}
                placeholder="Demographics, location, preferences"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="secondaryAudience">Secondary Audience</Label>
              <Textarea
                id="secondaryAudience"
                value={data.secondaryAudience || ''}
                onChange={(e) => updateField('secondaryAudience', e.target.value)}
                placeholder="If applicable"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="competitors">Top 3-5 Competitors (with website links)</Label>
              <Textarea
                id="competitors"
                value={(data.competitors || []).join('\n')}
                onChange={(e) => updateField('competitors', e.target.value.split('\n').filter(Boolean))}
                placeholder="One competitor per line with their website URL"
                rows={5}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="problemsSolved">What problems do you solve for customers?</Label>
              <Textarea
                id="problemsSolved"
                value={data.problemsSolved || ''}
                onChange={(e) => updateField('problemsSolved', e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerSources">Where do most customers come from?</Label>
              <Input
                id="customerSources"
                value={data.customerSources || ''}
                onChange={(e) => updateField('customerSources', e.target.value)}
                placeholder="Word-of-mouth, Google, social media, ads, etc."
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="productsServices">List of Products/Services</Label>
              <Textarea
                id="productsServices"
                value={data.productsServices || ''}
                onChange={(e) => updateField('productsServices', e.target.value)}
                placeholder="List with short descriptions"
                rows={5}
              />
            </div>
            <div className="space-y-3">
              <Label>Pricing Strategy</Label>
              <RadioGroup
                value={data.pricingStrategy || ''}
                onValueChange={(value) => updateField('pricingStrategy', value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="public" id="public" />
                  <Label htmlFor="public">Display pricing publicly</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="contact" id="contact" />
                  <Label htmlFor="contact">Contact for quote</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bestSellers">Best-Selling Products/Services</Label>
              <Textarea
                id="bestSellers"
                value={data.bestSellers || ''}
                onChange={(e) => updateField('bestSellers', e.target.value)}
                rows={2}
              />
            </div>
            <div className="space-y-3">
              <Label>Service Area</Label>
              <RadioGroup
                value={data.serviceArea || ''}
                onValueChange={(value) => updateField('serviceArea', value as any)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="local" id="local" />
                  <Label htmlFor="local">Local</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="national" id="national" />
                  <Label htmlFor="national">National</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="international" id="international" />
                  <Label htmlFor="international">International</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor="seasonalOfferings">Seasonal or Limited-Time Offerings</Label>
              <Textarea
                id="seasonalOfferings"
                value={data.seasonalOfferings || ''}
                onChange={(e) => updateField('seasonalOfferings', e.target.value)}
                rows={2}
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="mainGoal">Main Goal of the Website</Label>
              <Input
                id="mainGoal"
                value={data.mainGoal || ''}
                onChange={(e) => updateField('mainGoal', e.target.value)}
                placeholder="e.g., sell online, generate leads, provide information"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="topActions">Top 3 Actions You Want Visitors to Take</Label>
              <Textarea
                id="topActions"
                value={(data.topActions || []).join('\n')}
                onChange={(e) => updateField('topActions', e.target.value.split('\n').filter(Boolean))}
                placeholder="One action per line (e.g., call, purchase, fill out a form)"
                rows={3}
              />
            </div>
            <div className="space-y-3">
              <Label>Required Features</Label>
              <div className="grid grid-cols-2 gap-3">
                {websiteFeatures.map((feature) => (
                  <div key={feature} className="flex items-center space-x-2">
                    <Checkbox
                      id={feature}
                      checked={(data.features || []).includes(feature)}
                      onCheckedChange={() => toggleFeature(feature)}
                    />
                    <Label htmlFor={feature} className="text-sm font-normal">
                      {feature}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="integrations">Must-have Integrations</Label>
              <Input
                id="integrations"
                value={data.integrations || ''}
                onChange={(e) => updateField('integrations', e.target.value)}
                placeholder="CRM, payment processors, social media feeds, etc."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="futureAddons">Future Add-ons You're Considering</Label>
              <Textarea
                id="futureAddons"
                value={data.futureAddons || ''}
                onChange={(e) => updateField('futureAddons', e.target.value)}
                rows={2}
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="hasExistingCopy"
                checked={data.hasExistingCopy || false}
                onCheckedChange={(checked) => updateField('hasExistingCopy', checked)}
              />
              <Label htmlFor="hasExistingCopy">Do you have existing copy/text for the site?</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="hasPhotosVideos"
                checked={data.hasPhotosVideos || false}
                onCheckedChange={(checked) => updateField('hasPhotosVideos', checked)}
              />
              <Label htmlFor="hasPhotosVideos">Do you have high-quality photos/videos?</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="openToStock"
                checked={data.openToStock || false}
                onCheckedChange={(checked) => updateField('openToStock', checked)}
              />
              <Label htmlFor="openToStock">Open to stock images temporarily?</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="hasBrandGuidelines"
                checked={data.hasBrandGuidelines || false}
                onCheckedChange={(checked) => updateField('hasBrandGuidelines', checked)}
              />
              <Label htmlFor="hasBrandGuidelines">Do you have brand guidelines or style guides?</Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="existingMarketing">Existing marketing material to reference</Label>
              <Textarea
                id="existingMarketing"
                value={data.existingMarketing || ''}
                onChange={(e) => updateField('existingMarketing', e.target.value)}
                placeholder="Brochures, social media, etc."
                rows={2}
              />
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="primaryKeywords">Primary Keywords (SEO)</Label>
              <Textarea
                id="primaryKeywords"
                value={data.primaryKeywords || ''}
                onChange={(e) => updateField('primaryKeywords', e.target.value)}
                placeholder="Keywords you want to rank for"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetLocations">Target Locations for Local SEO</Label>
              <Input
                id="targetLocations"
                value={data.targetLocations || ''}
                onChange={(e) => updateField('targetLocations', e.target.value)}
                placeholder="Cities, regions, or areas"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="hasGoogleBusiness"
                checked={data.hasGoogleBusiness || false}
                onCheckedChange={(checked) => updateField('hasGoogleBusiness', checked)}
              />
              <Label htmlFor="hasGoogleBusiness">Existing Google Business Profile?</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="hasAnalytics"
                checked={data.hasAnalytics || false}
                onCheckedChange={(checked) => updateField('hasAnalytics', checked)}
              />
              <Label htmlFor="hasAnalytics">Google Analytics or Search Console set up?</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="wantsOngoingSEO"
                checked={data.wantsOngoingSEO || false}
                onCheckedChange={(checked) => updateField('wantsOngoingSEO', checked)}
              />
              <Label htmlFor="wantsOngoingSEO">Want ongoing SEO/content services after launch?</Label>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="hasPrivacyPolicy"
                checked={data.hasPrivacyPolicy || false}
                onCheckedChange={(checked) => updateField('hasPrivacyPolicy', checked)}
              />
              <Label htmlFor="hasPrivacyPolicy">Do you already have a Privacy Policy?</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="hasTerms"
                checked={data.hasTerms || false}
                onCheckedChange={(checked) => updateField('hasTerms', checked)}
              />
              <Label htmlFor="hasTerms">Do you already have Terms & Conditions?</Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="complianceNeeds">Industry-specific Compliance Needs</Label>
              <Input
                id="complianceNeeds"
                value={data.complianceNeeds || ''}
                onChange={(e) => updateField('complianceNeeds', e.target.value)}
                placeholder="GDPR, HIPAA, etc."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accessibilityNeeds">Accessibility Requirements</Label>
              <Input
                id="accessibilityNeeds"
                value={data.accessibilityNeeds || ''}
                onChange={(e) => updateField('accessibilityNeeds', e.target.value)}
                placeholder="ADA/WCAG compliance"
              />
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="likedWebsites">Websites You Like (3-5)</Label>
              <Textarea
                id="likedWebsites"
                value={(data.likedWebsites || []).join('\n')}
                onChange={(e) => updateField('likedWebsites', e.target.value.split('\n').filter(Boolean))}
                placeholder="One URL per line, explain what you like about each"
                rows={5}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dislikedWebsites">Websites You Dislike (1-3)</Label>
              <Textarea
                id="dislikedWebsites"
                value={(data.dislikedWebsites || []).join('\n')}
                onChange={(e) => updateField('dislikedWebsites', e.target.value.split('\n').filter(Boolean))}
                placeholder="One URL per line, explain why"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="layoutStyle">Preferred Layout Style</Label>
              <Input
                id="layoutStyle"
                value={data.layoutStyle || ''}
                onChange={(e) => updateField('layoutStyle', e.target.value)}
                placeholder="minimalist, image-heavy, text-rich, colorful, corporate, etc."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="designElements">Specific Design Elements Wanted</Label>
              <Input
                id="designElements"
                value={data.designElements || ''}
                onChange={(e) => updateField('designElements', e.target.value)}
                placeholder="animations, parallax scroll, etc."
              />
            </div>
          </div>
        );

      case 9:
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="hasDomain"
                checked={data.hasDomain || false}
                onCheckedChange={(checked) => updateField('hasDomain', checked)}
              />
              <Label htmlFor="hasDomain">Do you have an existing domain?</Label>
            </div>
            {data.hasDomain && (
              <div className="space-y-2">
                <Label htmlFor="domainInfo">Domain Registrar Info</Label>
                <Input
                  id="domainInfo"
                  value={data.domainInfo || ''}
                  onChange={(e) => updateField('domainInfo', e.target.value)}
                  placeholder="Domain name and registrar"
                />
              </div>
            )}
            <div className="flex items-center space-x-2">
              <Switch
                id="hasHosting"
                checked={data.hasHosting || false}
                onCheckedChange={(checked) => updateField('hasHosting', checked)}
              />
              <Label htmlFor="hasHosting">Do you have website hosting?</Label>
            </div>
            {data.hasHosting && (
              <div className="space-y-2">
                <Label htmlFor="hostingInfo">Hosting Provider Info</Label>
                <Input
                  id="hostingInfo"
                  value={data.hostingInfo || ''}
                  onChange={(e) => updateField('hostingInfo', e.target.value)}
                  placeholder="Provider name"
                />
              </div>
            )}
            <div className="flex items-center space-x-2">
              <Switch
                id="needsEmail"
                checked={data.needsEmail || false}
                onCheckedChange={(checked) => updateField('needsEmail', checked)}
              />
              <Label htmlFor="needsEmail">Do you need email setup?</Label>
            </div>
            <div className="space-y-3">
              <Label>Website Maintenance Plan</Label>
              <RadioGroup
                value={data.maintenancePlan || ''}
                onValueChange={(value) => updateField('maintenancePlan', value as any)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="self" id="self" />
                  <Label htmlFor="self">Update website myself</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="managed" id="managed" />
                  <Label htmlFor="managed">Need ongoing maintenance</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor="expectedTraffic">Expected Monthly Traffic</Label>
              <Input
                id="expectedTraffic"
                value={data.expectedTraffic || ''}
                onChange={(e) => updateField('expectedTraffic', e.target.value)}
                placeholder="Estimate monthly visitors if known"
              />
            </div>
          </div>
        );

      case 10:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="launchDate">Desired Launch Date</Label>
              <Input
                id="launchDate"
                type="date"
                value={data.launchDate || ''}
                onChange={(e) => updateField('launchDate', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="criticalDeadlines">Critical Deadlines</Label>
              <Textarea
                id="criticalDeadlines"
                value={data.criticalDeadlines || ''}
                onChange={(e) => updateField('criticalDeadlines', e.target.value)}
                placeholder="Events, product launches, seasonal sales, etc."
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budgetRange">Budget Range</Label>
              <Input
                id="budgetRange"
                value={data.budgetRange || ''}
                onChange={(e) => updateField('budgetRange', e.target.value)}
                placeholder="e.g., $2,000 - $5,000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority Order (Rank: speed, quality, low cost)</Label>
              <Input
                id="priority"
                value={(data.priority || []).join(', ')}
                onChange={(e) => updateField('priority', e.target.value.split(',').map((s) => s.trim()))}
                placeholder="e.g., quality, speed, low cost"
              />
            </div>
          </div>
        );

      case 11:
        return (
          <div className="space-y-6">
            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <h4 className="font-semibold mb-3">Please acknowledge the following:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Stock images and placeholder copy will be used if no content is provided.</li>
                <li>• SEO results require ongoing effort post-launch.</li>
                <li>• Legal documents provided are assumed compliant for your jurisdiction.</li>
                <li>• Website speed, hosting performance, and uptime may depend on third-party providers.</li>
                <li>• Browser/device compatibility will be tested on major, modern browsers.</li>
              </ul>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="acknowledgementsAccepted"
                checked={data.acknowledgementsAccepted || false}
                onCheckedChange={(checked) => updateField('acknowledgementsAccepted', !!checked)}
              />
              <Label htmlFor="acknowledgementsAccepted">
                I understand and accept these assumptions and limitations
              </Label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const currentSectionData = sections[currentSection - 1];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            Section {currentSection} of {sections.length}
          </span>
          <span className="text-sm font-medium">
            {Math.round((currentSection / sections.length) * 100)}% complete
          </span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-info transition-all duration-300"
            style={{ width: `${(currentSection / sections.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Section Navigation */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = section.id === currentSection;
          const isCompleted = section.id < currentSection;
          return (
            <button
              key={section.id}
              onClick={() => setCurrentSection(section.id)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : isCompleted
                  ? 'bg-success/20 text-success'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden md:inline">{section.title}</span>
            </button>
          );
        })}
      </div>

      {/* Section Content */}
      <div className="rounded-xl border border-border bg-card p-6 mb-6 animate-fade-in">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <currentSectionData.icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold">{currentSectionData.title}</h2>
            <p className="text-sm text-muted-foreground">
              Section {currentSection} of {sections.length}
            </p>
          </div>
        </div>
        {renderSection()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentSection((prev) => Math.max(1, prev - 1))}
          disabled={currentSection === 1}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          {currentSection === sections.length ? (
            <Button onClick={handleSubmit} disabled={!data.acknowledgementsAccepted}>
              <Sparkles className="h-4 w-4 mr-2" />
              Submit Questionnaire
            </Button>
          ) : (
            <Button onClick={() => setCurrentSection((prev) => Math.min(sections.length, prev + 1))}>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
