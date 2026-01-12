// MKQ Consulting Email Template System
// Brand colors from Auth page and design system

export const brandColors = {
  primary: '#1A0A2E', // Deep purple background
  accent: '#DFFF00', // Neon yellow/green accent
  accentDark: '#B8D900', // Darker accent for better contrast
  white: '#FFFFFF',
  lightGray: '#FAFAFA',
  gray: '#6b7280',
  darkGray: '#1f2937',
  border: '#e5e7eb',
  success: '#10b981',
  warning: '#f59e0b',
  info: '#0d9488', // Teal from the app
};

export const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  discovery: { bg: '#dbeafe', text: '#1e40af', label: 'Discovery' },
  proposal: { bg: '#fef3c7', text: '#92400e', label: 'Proposal' },
  contract: { bg: '#e0e7ff', text: '#3730a3', label: 'Contract' },
  design: { bg: '#fce7f3', text: '#9d174d', label: 'Design' },
  development: { bg: '#d1fae5', text: '#065f46', label: 'Development' },
  review: { bg: '#fed7aa', text: '#9a3412', label: 'Review' },
  launch: { bg: '#a7f3d0', text: '#047857', label: 'Launch' },
  maintenance: { bg: '#e5e7eb', text: '#374151', label: 'Maintenance' },
};

// Base wrapper for all emails - mobile responsive, accessible
export function emailWrapper(content: string, preheader: string = ''): string {
  return `
<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
  <title>MKQ Consulting</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    /* Reset styles */
    body, table, td, p, a, li, blockquote { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; height: 100% !important; }
    
    /* Link styles */
    a { color: ${brandColors.info}; }
    
    /* Button hover - for email clients that support it */
    .button:hover { background-color: ${brandColors.accentDark} !important; }
    
    /* Responsive styles */
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; padding: 0 16px !important; }
      .content { padding: 24px 20px !important; }
      .header { padding: 24px 20px !important; }
      .button { width: 100% !important; }
      .stack { display: block !important; width: 100% !important; }
    }
    
    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      .body-bg { background-color: #1a1a2e !important; }
      .card-bg { background-color: #252540 !important; }
      .light-text { color: #e5e7eb !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${brandColors.lightGray};" class="body-bg">
  <!-- Preheader text (hidden but shows in email previews) -->
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
    ${preheader}
    ${'&nbsp;'.repeat(100)}
  </div>

  <!-- Email container -->
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${brandColors.lightGray};">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" class="container" style="max-width: 600px; width: 100%;">
          ${content}
        </table>
        
        <!-- Footer -->
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" class="container" style="max-width: 600px; width: 100%;">
          <tr>
            <td style="padding: 24px; text-align: center;">
              <p style="margin: 0 0 8px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; color: ${brandColors.gray};">
                © ${new Date().getFullYear()} MKQ Consulting. All rights reserved.
              </p>
              <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; color: ${brandColors.gray};">
                Questions? Reply to this email or contact 
                <a href="mailto:envision@mkqconsulting.com" style="color: ${brandColors.info};">envision@mkqconsulting.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// Header component with logo and title
export function emailHeader(title: string, subtitle?: string): string {
  return `
<!-- Header with gradient background -->
<tr>
  <td>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background: linear-gradient(135deg, ${brandColors.primary} 0%, #2D1B4E 100%); border-radius: 12px 12px 0 0;">
      <!-- Accent bar -->
      <tr>
        <td style="height: 4px; background-color: ${brandColors.accent};"></td>
      </tr>
      <tr>
        <td class="header" style="padding: 32px 40px; text-align: center;">
          <!-- Logo placeholder - using text for reliability -->
          <div style="display: inline-block; background-color: rgba(255,255,255,0.1); padding: 12px 20px; border-radius: 8px; margin-bottom: 16px;">
            <span style="font-family: 'Syne', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 24px; font-weight: 800; color: ${brandColors.white};">MKQ</span>
            <span style="font-family: 'Syne', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 24px; font-weight: 400; color: ${brandColors.accent};">Consulting</span>
          </div>
          <h1 style="margin: 0; font-family: 'Syne', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 24px; font-weight: 700; color: ${brandColors.white}; line-height: 1.3;">
            ${title}
          </h1>
          ${subtitle ? `
          <p style="margin: 8px 0 0 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 16px; color: rgba(255,255,255,0.7);">
            ${subtitle}
          </p>` : ''}
        </td>
      </tr>
    </table>
  </td>
</tr>`;
}

// Main content card
export function emailCard(content: string): string {
  return `
<!-- Content card -->
<tr>
  <td>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" class="card-bg" style="background-color: ${brandColors.white}; border: 1px solid ${brandColors.border}; border-top: none; border-radius: 0 0 12px 12px;">
      <tr>
        <td class="content" style="padding: 32px 40px;">
          ${content}
        </td>
      </tr>
    </table>
  </td>
</tr>`;
}

// CTA Button
export function emailButton(text: string, url: string): string {
  return `
<table role="presentation" cellpadding="0" cellspacing="0" style="margin: 24px auto;">
  <tr>
    <td style="border-radius: 8px; background-color: ${brandColors.accent};">
      <a href="${url}" class="button" target="_blank" style="display: inline-block; padding: 14px 32px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 16px; font-weight: 600; color: ${brandColors.primary}; text-decoration: none; border-radius: 8px;">
        ${text}
      </a>
    </td>
  </tr>
</table>`;
}

// Status badge
export function statusBadge(status: string): string {
  const colors = statusColors[status] || statusColors.discovery;
  return `<span style="display: inline-block; padding: 4px 12px; background-color: ${colors.bg}; color: ${colors.text}; font-size: 13px; font-weight: 600; border-radius: 9999px; text-transform: capitalize;">${colors.label}</span>`;
}

// Info box (for highlighted content)
export function infoBox(content: string, icon: string = '📋'): string {
  return `
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 20px 0;">
  <tr>
    <td style="background-color: ${brandColors.lightGray}; border-radius: 8px; padding: 20px;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="width: 32px; vertical-align: top; font-size: 20px;">${icon}</td>
          <td style="padding-left: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; color: ${brandColors.darkGray}; line-height: 1.6;">
            ${content}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;
}

// Quote block (for comments)
export function quoteBlock(content: string, author?: string): string {
  return `
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 16px 0;">
  <tr>
    <td style="border-left: 4px solid ${brandColors.info}; padding-left: 16px;">
      <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; color: ${brandColors.darkGray}; font-style: italic; line-height: 1.6;">
        "${content}"
      </p>
      ${author ? `
      <p style="margin: 8px 0 0 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; color: ${brandColors.gray};">
        — ${author}
      </p>` : ''}
    </td>
  </tr>
</table>`;
}

// Divider
export function divider(): string {
  return `<hr style="border: none; border-top: 1px solid ${brandColors.border}; margin: 24px 0;">`;
}

// Text paragraph
export function paragraph(text: string, className: string = ''): string {
  return `<p style="margin: 0 0 16px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 16px; color: ${brandColors.darkGray}; line-height: 1.6;" class="${className}">${text}</p>`;
}

// Section heading
export function sectionHeading(text: string): string {
  return `<h2 style="margin: 24px 0 12px 0; font-family: 'Syne', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 18px; font-weight: 700; color: ${brandColors.darkGray};">${text}</h2>`;
}
