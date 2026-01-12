import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfService() {
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

          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Terms of Service</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mb-6 sm:mb-8">Last Updated: January 12, 2026</p>

          <div className="prose prose-sm max-w-none space-y-5 sm:space-y-6 text-foreground">
            <section>
              <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By accessing or using the services provided by MKQ Consulting LLC ("Company," "we," "our," or "us") 
                through our website at www.mkqconsulting.com and client portal, you agree to be bound by these Terms 
                of Service ("Terms"). If you do not agree to these Terms, please do not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">2. Description of Services</h2>
              <p className="text-muted-foreground">
                MKQ Consulting LLC provides consulting services and a client portal platform that enables clients to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1 mt-2">
                <li>Track project progress and milestones</li>
                <li>Share and access project-related documents</li>
                <li>Communicate with our team</li>
                <li>Complete questionnaires and provide project information</li>
                <li>Manage account settings and preferences</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">3. User Accounts</h2>
              <p className="text-muted-foreground mb-3">
                To access our client portal, you must create an account. You agree to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Provide accurate and complete registration information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>Accept responsibility for all activities under your account</li>
              </ul>
              <p className="text-muted-foreground mt-3">
                We reserve the right to suspend or terminate accounts that violate these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">4. Acceptable Use Policy</h2>
              <p className="text-muted-foreground mb-3">You agree not to:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Use our services for any unlawful purpose</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with or disrupt our services</li>
                <li>Upload malicious code, viruses, or harmful content</li>
                <li>Impersonate any person or entity</li>
                <li>Share account credentials with unauthorized parties</li>
                <li>Use automated systems to access our services without permission</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">5. Intellectual Property Rights</h2>
              <p className="text-muted-foreground">
                All content, features, and functionality of our services, including but not limited to text, graphics, 
                logos, and software, are owned by MKQ Consulting LLC and are protected by intellectual property laws. 
                You may not reproduce, distribute, or create derivative works without our express written permission.
              </p>
              <p className="text-muted-foreground mt-3">
                Content you upload to our platform remains your property. By uploading content, you grant us a 
                limited license to use, store, and display such content as necessary to provide our services.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">6. Confidentiality</h2>
              <p className="text-muted-foreground">
                We understand the sensitive nature of project information shared through our platform. We commit to 
                maintaining the confidentiality of your data and will not disclose confidential information to third 
                parties except as required by law or with your consent. You agree to maintain the confidentiality of 
                any proprietary information, methodologies, or materials we share with you.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">7. Payment Terms</h2>
              <p className="text-muted-foreground">
                Payment terms for consulting services are outlined in your individual service agreement. Use of the 
                client portal is provided as part of our consulting services. Late payments may result in suspension 
                of services. All fees are non-refundable unless otherwise specified in writing.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">8. Limitation of Liability</h2>
              <p className="text-muted-foreground">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, MKQ CONSULTING LLC SHALL NOT BE LIABLE FOR ANY INDIRECT, 
                INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF OUR SERVICES. 
                OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT PAID BY YOU FOR SERVICES IN THE TWELVE (12) MONTHS 
                PRECEDING THE CLAIM.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">9. Disclaimer of Warranties</h2>
              <p className="text-muted-foreground">
                OUR SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS 
                OR IMPLIED. WE DO NOT WARRANT THAT OUR SERVICES WILL BE UNINTERRUPTED, ERROR-FREE, OR COMPLETELY SECURE. 
                WE DISCLAIM ALL WARRANTIES, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">10. Indemnification</h2>
              <p className="text-muted-foreground">
                You agree to indemnify, defend, and hold harmless MKQ Consulting LLC and its officers, directors, 
                employees, and agents from any claims, damages, losses, or expenses arising from your use of our 
                services, violation of these Terms, or infringement of any third-party rights.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">11. Termination</h2>
              <p className="text-muted-foreground">
                We may suspend or terminate your access to our services at any time, with or without cause, upon 
                notice. Upon termination, your right to use our services will immediately cease. Provisions of these 
                Terms that by their nature should survive termination shall survive, including intellectual property 
                rights, disclaimers, and limitations of liability.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">12. Governing Law</h2>
              <p className="text-muted-foreground">
                These Terms shall be governed by and construed in accordance with the laws of the State of [Your State], 
                without regard to its conflict of law provisions. Any disputes arising from these Terms shall be 
                resolved in the courts located in [Your County/City], [Your State].
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">13. Dispute Resolution</h2>
              <p className="text-muted-foreground">
                Before initiating any legal proceedings, you agree to first attempt to resolve any dispute informally 
                by contacting us. If the dispute is not resolved within thirty (30) days, either party may pursue 
                formal legal remedies.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">14. Changes to Terms</h2>
              <p className="text-muted-foreground">
                We reserve the right to modify these Terms at any time. We will provide notice of significant changes 
                by posting the updated Terms on our website and updating the "Last Updated" date. Your continued use 
                of our services after changes become effective constitutes acceptance of the revised Terms.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">15. Severability</h2>
              <p className="text-muted-foreground">
                If any provision of these Terms is found to be unenforceable or invalid, that provision shall be 
                limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain 
                in full force and effect.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">16. Contact Us</h2>
              <p className="text-muted-foreground">
                If you have any questions about these Terms of Service, please contact us at:
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
