import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Banner */}
      <div className="h-2 shrink-0 bg-[#CCFF00]" />
      
      <div className="flex-1 bg-background overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* Back Link */}
          <Link 
            to="/auth" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 sm:mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Link>

          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mb-6 sm:mb-8">Last Updated: January 12, 2026</p>

          <div className="prose prose-sm max-w-none space-y-5 sm:space-y-6 text-foreground">
            <section>
              <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">1. Introduction</h2>
              <p className="text-muted-foreground">
                MKQ Consulting LLC ("we," "our," or "us") respects your privacy and is committed to protecting your personal data. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website 
                at www.mkqconsulting.com and use our client portal services.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">2. Information We Collect</h2>
              <h3 className="text-lg font-medium mb-2">Personal Data</h3>
              <p className="text-muted-foreground mb-3">We may collect personally identifiable information, including but not limited to:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Name and contact information (email address, phone number)</li>
                <li>Company name and business information</li>
                <li>Account credentials (username, password)</li>
                <li>Project-related documents and communications</li>
                <li>Billing and payment information</li>
              </ul>
              
              <h3 className="text-lg font-medium mb-2 mt-4">Usage Data</h3>
              <p className="text-muted-foreground">We automatically collect certain information when you access our services, including:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>IP address and browser type</li>
                <li>Pages visited and time spent on our platform</li>
                <li>Device information and operating system</li>
                <li>Referring website addresses</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">3. How We Use Your Information</h2>
              <p className="text-muted-foreground mb-3">We use the information we collect to:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Provide, operate, and maintain our services</li>
                <li>Manage your account and project communications</li>
                <li>Process transactions and send related information</li>
                <li>Send administrative information and updates</li>
                <li>Respond to inquiries and provide customer support</li>
                <li>Improve our website and services</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">4. Data Sharing and Disclosure</h2>
              <p className="text-muted-foreground mb-3">We may share your information in the following circumstances:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li><strong>Service Providers:</strong> With third-party vendors who assist in operating our services</li>
                <li><strong>Legal Requirements:</strong> When required by law or to respond to legal process</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                <li><strong>With Your Consent:</strong> When you have given us permission to share your data</li>
              </ul>
              <p className="text-muted-foreground mt-3">
                We do not sell, rent, or trade your personal information to third parties for marketing purposes.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">5. Data Security</h2>
              <p className="text-muted-foreground">
                We implement industry-standard security measures to protect your personal information. Our platform uses 
                256-bit SSL encryption for data transmission and employs secure data storage practices. However, no method 
                of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">6. Your Rights</h2>
              <p className="text-muted-foreground mb-3">You have the right to:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Access the personal data we hold about you</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your personal data</li>
                <li>Object to processing of your data</li>
                <li>Request data portability</li>
                <li>Withdraw consent at any time</li>
              </ul>
              <p className="text-muted-foreground mt-3">
                To exercise these rights, please contact us at envision@mkqconsulting.com.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">7. Cookies and Tracking Technologies</h2>
              <p className="text-muted-foreground">
                We use cookies and similar tracking technologies to enhance your experience on our platform. 
                You can control cookie preferences through your browser settings. Disabling cookies may limit 
                some features of our services.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">8. Third-Party Services</h2>
              <p className="text-muted-foreground">
                Our services may contain links to third-party websites or integrate with third-party services. 
                We are not responsible for the privacy practices of these external sites. We encourage you to 
                review their privacy policies before providing any personal information.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">9. Children's Privacy</h2>
              <p className="text-muted-foreground">
                Our services are not intended for individuals under the age of 18. We do not knowingly collect 
                personal information from children. If you believe we have collected data from a child, please 
                contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">10. Changes to This Policy</h2>
              <p className="text-muted-foreground">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting 
                the new Privacy Policy on this page and updating the "Last Updated" date. Your continued use of 
                our services after any changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">11. Contact Us</h2>
              <p className="text-muted-foreground">
                If you have any questions about this Privacy Policy or our data practices, please contact us at:
              </p>
              <div className="mt-3 text-muted-foreground">
                <p><strong>MKQ Consulting LLC</strong></p>
                <p>Email: <a href="mailto:envision@mkqconsulting.com" className="text-primary hover:underline">envision@mkqconsulting.com</a></p>
                <p>Website: <a href="https://www.mkqconsulting.com" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">www.mkqconsulting.com</a></p>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Bottom Banner */}
      <div className="h-2 shrink-0 bg-[#1a0a2e]" />
    </div>
  );
}
