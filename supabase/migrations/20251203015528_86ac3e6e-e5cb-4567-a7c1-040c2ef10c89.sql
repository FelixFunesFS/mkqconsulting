-- Add display_order column to projects for drag-and-drop reordering
ALTER TABLE public.projects ADD COLUMN display_order integer DEFAULT 0;

-- Create task_templates table for reusable checklists
CREATE TABLE public.task_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text NOT NULL,
  phase text NOT NULL DEFAULT 'review',
  priority task_priority DEFAULT 'high',
  estimated_hours numeric,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.task_templates ENABLE ROW LEVEL SECURITY;

-- Allow all access (same pattern as other tables)
CREATE POLICY "Allow all access to task_templates" ON public.task_templates FOR ALL USING (true) WITH CHECK (true);

-- Seed pre-launch checklist templates
INSERT INTO public.task_templates (name, description, category, phase, priority, estimated_hours, display_order) VALUES
-- Technical
('Create XML Sitemap', 'Generate and submit XML sitemap to search engines', 'technical', 'review', 'high', 1, 1),
('Configure robots.txt', 'Set up robots.txt with proper crawl directives', 'technical', 'review', 'high', 0.5, 2),
('Create 404 Error Page', 'Design custom 404 page with navigation back to site', 'technical', 'review', 'medium', 1, 3),
('Add Favicon & App Icons', 'Create favicon, apple-touch-icon, and PWA icons', 'technical', 'review', 'medium', 1, 4),
('SSL Certificate Active', 'Verify HTTPS is working on all pages', 'technical', 'review', 'critical', 0.5, 5),

-- SEO
('Meta Titles & Descriptions', 'Add unique meta titles (<60 chars) and descriptions (<160 chars) to all pages', 'seo', 'review', 'high', 2, 10),
('Open Graph Tags', 'Add OG tags for social media sharing preview', 'seo', 'review', 'medium', 1, 11),
('Canonical URLs', 'Set canonical URLs to prevent duplicate content issues', 'seo', 'review', 'high', 1, 12),
('Structured Data (Schema)', 'Add JSON-LD schema markup for rich snippets', 'seo', 'review', 'medium', 2, 13),
('Google Search Console', 'Submit site to Google Search Console', 'seo', 'review', 'high', 0.5, 14),

-- Accessibility
('ARIA Labels', 'Add ARIA labels to interactive elements and landmarks', 'accessibility', 'review', 'high', 2, 20),
('Alt Text for Images', 'Ensure all images have descriptive alt text', 'accessibility', 'review', 'high', 1, 21),
('Keyboard Navigation', 'Test all functionality is accessible via keyboard', 'accessibility', 'review', 'high', 1, 22),
('Color Contrast Check', 'Verify WCAG AA contrast ratios (4.5:1 for text)', 'accessibility', 'review', 'medium', 1, 23),
('Screen Reader Testing', 'Test with screen reader (VoiceOver/NVDA)', 'accessibility', 'review', 'medium', 1, 24),

-- Performance
('Image Optimization', 'Compress images, use WebP format, proper sizing', 'performance', 'review', 'high', 2, 30),
('Lazy Loading', 'Implement lazy loading for images and heavy content', 'performance', 'review', 'medium', 1, 31),
('Core Web Vitals Check', 'Test LCP, FID, CLS scores in PageSpeed Insights', 'performance', 'review', 'high', 1, 32),
('Minify CSS/JS', 'Ensure production build has minified assets', 'performance', 'review', 'medium', 0.5, 33),

-- Links & Content
('Broken Link Check', 'Scan all internal and external links for 404s', 'links', 'review', 'high', 1, 40),
('External Links Target', 'External links open in new tab with rel="noopener"', 'links', 'review', 'low', 0.5, 41),
('Spelling & Grammar', 'Proofread all content for errors', 'links', 'review', 'medium', 2, 42),

-- Forms & Functionality
('Form Validation', 'Test all forms have proper validation and error messages', 'forms', 'review', 'high', 1, 50),
('Form Success Messages', 'Verify confirmation messages appear after submission', 'forms', 'review', 'medium', 0.5, 51),
('Spam Protection', 'Add honeypot or reCAPTCHA to forms', 'forms', 'review', 'medium', 1, 52),
('Contact Form Test', 'Test contact form delivers to correct email', 'forms', 'review', 'critical', 0.5, 53),

-- Legal & Compliance
('Privacy Policy', 'Add privacy policy page and link in footer', 'legal', 'review', 'high', 0.5, 60),
('Cookie Consent Banner', 'Implement cookie consent for GDPR compliance', 'legal', 'review', 'high', 1, 61),
('Terms of Service', 'Add terms of service if applicable', 'legal', 'review', 'medium', 0.5, 62),

-- Analytics
('Google Analytics Setup', 'Install and verify GA4 tracking', 'analytics', 'review', 'high', 1, 70),
('Conversion Tracking', 'Set up goal/event tracking for key actions', 'analytics', 'review', 'medium', 1, 71),
('Backup Strategy', 'Document backup and recovery procedures', 'analytics', 'review', 'medium', 0.5, 72);