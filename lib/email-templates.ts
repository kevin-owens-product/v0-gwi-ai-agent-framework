/**
 * @prompt-id forge-v4.1:feature:email-template-management:001
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

import { prisma } from './db'
import { sendEmail } from './email'
import type { EmailTemplate, EmailTemplateCategory } from '@prisma/client'

// Variable pattern for template interpolation: {{variableName}}
const VARIABLE_PATTERN = /\{\{(\w+)\}\}/g

// Default system templates
export const DEFAULT_SYSTEM_TEMPLATES: Array<{
  name: string
  slug: string
  subject: string
  description: string
  category: EmailTemplateCategory
  htmlContent: string
  textContent: string
  variables: Array<{ name: string; description: string; required: boolean; defaultValue?: string }>
  previewData: Record<string, string>
}> = [
  {
    name: 'Welcome Email',
    slug: 'welcome',
    subject: 'Welcome to {{platformName}}!',
    description: 'Sent to new users when they sign up',
    category: 'ONBOARDING',
    htmlContent: `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to {{platformName}}</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #f9fafb;">
    <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="font-size: 24px; font-weight: 600; color: #111827; margin: 0;">Welcome to {{platformName}}!</h1>
      </div>
      <p style="color: #374151; margin-bottom: 16px;">Hi {{userName}},</p>
      <p style="color: #374151; margin-bottom: 24px;">
        Thank you for joining {{platformName}}. Your {{trialDays}}-day free trial has started!
      </p>
      <p style="color: #374151; margin-bottom: 24px;">Here's what you can do next:</p>
      <ul style="color: #374151; margin-bottom: 24px; padding-left: 20px;">
        <li style="margin-bottom: 8px;">Create your first AI agent</li>
        <li style="margin-bottom: 8px;">Connect your data sources</li>
        <li style="margin-bottom: 8px;">Invite your team members</li>
        <li style="margin-bottom: 8px;">Explore insights and analytics</li>
      </ul>
      <div style="text-align: center; margin: 32px 0;">
        <a href="{{dashboardUrl}}" style="display: inline-block; padding: 14px 28px; background: #000; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 16px;">
          Go to Dashboard
        </a>
      </div>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">
      <p style="color: #9ca3af; font-size: 12px; text-align: center;">
        {{platformName}}
      </p>
    </div>
  </body>
</html>`,
    textContent: `Welcome to {{platformName}}!

Hi {{userName}},

Thank you for joining {{platformName}}. Your {{trialDays}}-day free trial has started!

Here's what you can do next:
- Create your first AI agent
- Connect your data sources
- Invite your team members
- Explore insights and analytics

Go to your dashboard: {{dashboardUrl}}

---
{{platformName}}`,
    variables: [
      { name: 'userName', description: 'User\'s display name', required: true },
      { name: 'platformName', description: 'Platform name', required: true, defaultValue: 'GWI AI Platform' },
      { name: 'trialDays', description: 'Number of trial days', required: false, defaultValue: '14' },
      { name: 'dashboardUrl', description: 'URL to the dashboard', required: true },
    ],
    previewData: {
      userName: 'John Doe',
      platformName: 'GWI AI Platform',
      trialDays: '14',
      dashboardUrl: 'https://app.example.com/dashboard',
    },
  },
  {
    name: 'Password Reset',
    slug: 'password_reset',
    subject: 'Reset your {{platformName}} password',
    description: 'Sent when a user requests a password reset',
    category: 'AUTHENTICATION',
    htmlContent: `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset your password</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #f9fafb;">
    <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="font-size: 24px; font-weight: 600; color: #111827; margin: 0;">Reset your password</h1>
      </div>
      <p style="color: #374151; margin-bottom: 16px;">Hi {{userName}},</p>
      <p style="color: #374151; margin-bottom: 24px;">
        We received a request to reset your password. Click the button below to create a new password:
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="{{resetUrl}}" style="display: inline-block; padding: 14px 28px; background: #000; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 16px;">
          Reset Password
        </a>
      </div>
      <p style="color: #6b7280; font-size: 14px; margin-bottom: 8px;">
        This link will expire in {{expirationHours}} hour(s).
      </p>
      <p style="color: #6b7280; font-size: 14px;">
        If you didn't request a password reset, you can safely ignore this email.
      </p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">
      <p style="color: #9ca3af; font-size: 12px; text-align: center;">
        {{platformName}}
      </p>
    </div>
  </body>
</html>`,
    textContent: `Reset your password

Hi {{userName}},

We received a request to reset your password. Click the link below to create a new password:

{{resetUrl}}

This link will expire in {{expirationHours}} hour(s).

If you didn't request a password reset, you can safely ignore this email.

---
{{platformName}}`,
    variables: [
      { name: 'userName', description: 'User\'s display name', required: false },
      { name: 'resetUrl', description: 'Password reset URL', required: true },
      { name: 'expirationHours', description: 'Hours until link expires', required: false, defaultValue: '1' },
      { name: 'platformName', description: 'Platform name', required: true, defaultValue: 'GWI AI Platform' },
    ],
    previewData: {
      userName: 'John Doe',
      resetUrl: 'https://app.example.com/reset-password?token=abc123',
      expirationHours: '1',
      platformName: 'GWI AI Platform',
    },
  },
  {
    name: 'Team Invitation',
    slug: 'invitation',
    subject: 'You\'ve been invited to join {{orgName}} on {{platformName}}',
    description: 'Sent when a user is invited to join an organization',
    category: 'ONBOARDING',
    htmlContent: `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>You've been invited to {{orgName}}</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #f9fafb;">
    <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="font-size: 24px; font-weight: 600; color: #111827; margin: 0;">You've been invited!</h1>
      </div>
      <p style="color: #374151; margin-bottom: 24px;">
        <strong>{{inviterName}}</strong> has invited you to join <strong>{{orgName}}</strong> as a <strong>{{role}}</strong> on {{platformName}}.
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="{{inviteUrl}}" style="display: inline-block; padding: 14px 28px; background: #000; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 16px;">
          Accept Invitation
        </a>
      </div>
      <p style="color: #6b7280; font-size: 14px;">
        This invitation expires in {{expirationDays}} days.
      </p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">
      <p style="color: #9ca3af; font-size: 12px; text-align: center;">
        {{platformName}}
      </p>
    </div>
  </body>
</html>`,
    textContent: `You've been invited to join {{orgName}}!

{{inviterName}} has invited you to join {{orgName}} as a {{role}} on {{platformName}}.

Accept your invitation: {{inviteUrl}}

This invitation expires in {{expirationDays}} days.

---
{{platformName}}`,
    variables: [
      { name: 'inviterName', description: 'Name of the person who sent the invite', required: true },
      { name: 'orgName', description: 'Organization name', required: true },
      { name: 'role', description: 'Role being assigned', required: true },
      { name: 'inviteUrl', description: 'Invitation acceptance URL', required: true },
      { name: 'expirationDays', description: 'Days until invitation expires', required: false, defaultValue: '7' },
      { name: 'platformName', description: 'Platform name', required: true, defaultValue: 'GWI AI Platform' },
    ],
    previewData: {
      inviterName: 'Jane Smith',
      orgName: 'Acme Corp',
      role: 'Member',
      inviteUrl: 'https://app.example.com/invite/abc123',
      expirationDays: '7',
      platformName: 'GWI AI Platform',
    },
  },
  {
    name: 'Email Verification',
    slug: 'email_verification',
    subject: 'Verify your email for {{platformName}}',
    description: 'Sent to verify a user\'s email address',
    category: 'AUTHENTICATION',
    htmlContent: `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify your email</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #f9fafb;">
    <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="font-size: 24px; font-weight: 600; color: #111827; margin: 0;">Verify your email</h1>
      </div>
      <p style="color: #374151; margin-bottom: 16px;">Hi {{userName}},</p>
      <p style="color: #374151; margin-bottom: 24px;">
        Please verify your email address to complete your registration.
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="{{verificationUrl}}" style="display: inline-block; padding: 14px 28px; background: #000; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 16px;">
          Verify Email
        </a>
      </div>
      <p style="color: #6b7280; font-size: 14px;">
        This link will expire in {{expirationHours}} hours.
      </p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">
      <p style="color: #9ca3af; font-size: 12px; text-align: center;">
        {{platformName}}
      </p>
    </div>
  </body>
</html>`,
    textContent: `Verify your email

Hi {{userName}},

Please verify your email address to complete your registration.

Verify your email: {{verificationUrl}}

This link will expire in {{expirationHours}} hours.

---
{{platformName}}`,
    variables: [
      { name: 'userName', description: 'User\'s display name', required: false },
      { name: 'verificationUrl', description: 'Email verification URL', required: true },
      { name: 'expirationHours', description: 'Hours until link expires', required: false, defaultValue: '24' },
      { name: 'platformName', description: 'Platform name', required: true, defaultValue: 'GWI AI Platform' },
    ],
    previewData: {
      userName: 'John Doe',
      verificationUrl: 'https://app.example.com/verify-email?token=abc123',
      expirationHours: '24',
      platformName: 'GWI AI Platform',
    },
  },
  {
    name: 'Password Changed',
    slug: 'password_changed',
    subject: 'Your {{platformName}} password was changed',
    description: 'Notification sent after a password change',
    category: 'AUTHENTICATION',
    htmlContent: `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Changed</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #f9fafb;">
    <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="font-size: 24px; font-weight: 600; color: #111827; margin: 0;">Password Changed</h1>
      </div>
      <p style="color: #374151; margin-bottom: 16px;">Hi {{userName}},</p>
      <p style="color: #374151; margin-bottom: 24px;">
        Your password was successfully changed on {{changedAt}}.
      </p>
      <p style="color: #6b7280; font-size: 14px; margin-bottom: 24px;">
        If you didn't make this change, please contact support immediately or reset your password.
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="{{supportUrl}}" style="display: inline-block; padding: 14px 28px; background: #dc2626; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 16px;">
          Contact Support
        </a>
      </div>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">
      <p style="color: #9ca3af; font-size: 12px; text-align: center;">
        {{platformName}}
      </p>
    </div>
  </body>
</html>`,
    textContent: `Password Changed

Hi {{userName}},

Your password was successfully changed on {{changedAt}}.

If you didn't make this change, please contact support immediately or reset your password.

Contact support: {{supportUrl}}

---
{{platformName}}`,
    variables: [
      { name: 'userName', description: 'User\'s display name', required: false },
      { name: 'changedAt', description: 'Date and time of password change', required: true },
      { name: 'supportUrl', description: 'Support contact URL', required: true },
      { name: 'platformName', description: 'Platform name', required: true, defaultValue: 'GWI AI Platform' },
    ],
    previewData: {
      userName: 'John Doe',
      changedAt: 'January 25, 2026 at 3:45 PM',
      supportUrl: 'https://app.example.com/support',
      platformName: 'GWI AI Platform',
    },
  },
  {
    name: 'Account Suspension Notice',
    slug: 'account_suspended',
    subject: 'Your {{platformName}} account has been suspended',
    description: 'Sent when a user account is suspended',
    category: 'SYSTEM',
    htmlContent: `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Suspended</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #f9fafb;">
    <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="font-size: 24px; font-weight: 600; color: #dc2626; margin: 0;">Account Suspended</h1>
      </div>
      <p style="color: #374151; margin-bottom: 16px;">Hi {{userName}},</p>
      <p style="color: #374151; margin-bottom: 24px;">
        Your account has been suspended for the following reason:
      </p>
      <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <p style="color: #991b1b; margin: 0;">{{suspensionReason}}</p>
      </div>
      <p style="color: #6b7280; font-size: 14px; margin-bottom: 24px;">
        If you believe this is an error, please contact our support team.
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="{{supportUrl}}" style="display: inline-block; padding: 14px 28px; background: #000; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 16px;">
          Contact Support
        </a>
      </div>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">
      <p style="color: #9ca3af; font-size: 12px; text-align: center;">
        {{platformName}}
      </p>
    </div>
  </body>
</html>`,
    textContent: `Account Suspended

Hi {{userName}},

Your account has been suspended for the following reason:

{{suspensionReason}}

If you believe this is an error, please contact our support team.

Contact support: {{supportUrl}}

---
{{platformName}}`,
    variables: [
      { name: 'userName', description: 'User\'s display name', required: false },
      { name: 'suspensionReason', description: 'Reason for suspension', required: true },
      { name: 'supportUrl', description: 'Support contact URL', required: true },
      { name: 'platformName', description: 'Platform name', required: true, defaultValue: 'GWI AI Platform' },
    ],
    previewData: {
      userName: 'John Doe',
      suspensionReason: 'Violation of terms of service',
      supportUrl: 'https://app.example.com/support',
      platformName: 'GWI AI Platform',
    },
  },
  {
    name: 'Usage Alert',
    slug: 'usage_alert',
    subject: '{{alertType}}: Your {{platformName}} usage is at {{usagePercent}}%',
    description: 'Sent when usage approaches or exceeds limits',
    category: 'NOTIFICATION',
    htmlContent: `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Usage Alert</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #f9fafb;">
    <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="font-size: 24px; font-weight: 600; color: #f59e0b; margin: 0;">{{alertType}}</h1>
      </div>
      <p style="color: #374151; margin-bottom: 16px;">Hi {{userName}},</p>
      <p style="color: #374151; margin-bottom: 24px;">
        Your {{resourceType}} usage is currently at <strong>{{usagePercent}}%</strong> of your plan limit.
      </p>
      <div style="background: #fef3c7; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <p style="color: #92400e; margin: 0; font-size: 14px;">
          <strong>Current usage:</strong> {{currentUsage}} / {{usageLimit}}
        </p>
      </div>
      <p style="color: #6b7280; font-size: 14px; margin-bottom: 24px;">
        Consider upgrading your plan to avoid service interruptions.
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="{{upgradeUrl}}" style="display: inline-block; padding: 14px 28px; background: #000; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 16px;">
          Upgrade Plan
        </a>
      </div>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">
      <p style="color: #9ca3af; font-size: 12px; text-align: center;">
        {{platformName}}
      </p>
    </div>
  </body>
</html>`,
    textContent: `{{alertType}}

Hi {{userName}},

Your {{resourceType}} usage is currently at {{usagePercent}}% of your plan limit.

Current usage: {{currentUsage}} / {{usageLimit}}

Consider upgrading your plan to avoid service interruptions.

Upgrade your plan: {{upgradeUrl}}

---
{{platformName}}`,
    variables: [
      { name: 'userName', description: 'User\'s display name', required: false },
      { name: 'alertType', description: 'Type of alert (Warning, Critical, etc.)', required: true },
      { name: 'resourceType', description: 'Type of resource (API calls, tokens, etc.)', required: true },
      { name: 'usagePercent', description: 'Current usage percentage', required: true },
      { name: 'currentUsage', description: 'Current usage amount', required: true },
      { name: 'usageLimit', description: 'Plan limit', required: true },
      { name: 'upgradeUrl', description: 'URL to upgrade plan', required: true },
      { name: 'platformName', description: 'Platform name', required: true, defaultValue: 'GWI AI Platform' },
    ],
    previewData: {
      userName: 'John Doe',
      alertType: 'Usage Warning',
      resourceType: 'API calls',
      usagePercent: '85',
      currentUsage: '8,500',
      usageLimit: '10,000',
      upgradeUrl: 'https://app.example.com/settings/billing',
      platformName: 'GWI AI Platform',
    },
  },
  {
    name: 'Invoice Available',
    slug: 'invoice_available',
    subject: 'Your {{platformName}} invoice for {{invoicePeriod}} is ready',
    description: 'Sent when a new invoice is generated',
    category: 'TRANSACTIONAL',
    htmlContent: `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice Available</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #f9fafb;">
    <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="font-size: 24px; font-weight: 600; color: #111827; margin: 0;">Invoice Available</h1>
      </div>
      <p style="color: #374151; margin-bottom: 24px;">
        Your invoice for <strong>{{invoicePeriod}}</strong> is now available.
      </p>
      <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="color: #6b7280; padding: 4px 0;">Invoice Number</td>
            <td style="color: #111827; text-align: right; font-weight: 600;">{{invoiceNumber}}</td>
          </tr>
          <tr>
            <td style="color: #6b7280; padding: 4px 0;">Amount Due</td>
            <td style="color: #111827; text-align: right; font-weight: 600;">{{amountDue}}</td>
          </tr>
          <tr>
            <td style="color: #6b7280; padding: 4px 0;">Due Date</td>
            <td style="color: #111827; text-align: right; font-weight: 600;">{{dueDate}}</td>
          </tr>
        </table>
      </div>
      <div style="text-align: center; margin: 32px 0;">
        <a href="{{invoiceUrl}}" style="display: inline-block; padding: 14px 28px; background: #000; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 16px;">
          View Invoice
        </a>
      </div>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">
      <p style="color: #9ca3af; font-size: 12px; text-align: center;">
        {{platformName}}
      </p>
    </div>
  </body>
</html>`,
    textContent: `Invoice Available

Your invoice for {{invoicePeriod}} is now available.

Invoice Number: {{invoiceNumber}}
Amount Due: {{amountDue}}
Due Date: {{dueDate}}

View your invoice: {{invoiceUrl}}

---
{{platformName}}`,
    variables: [
      { name: 'invoicePeriod', description: 'Billing period (e.g., January 2026)', required: true },
      { name: 'invoiceNumber', description: 'Invoice number', required: true },
      { name: 'amountDue', description: 'Amount due (formatted)', required: true },
      { name: 'dueDate', description: 'Payment due date', required: true },
      { name: 'invoiceUrl', description: 'URL to view invoice', required: true },
      { name: 'platformName', description: 'Platform name', required: true, defaultValue: 'GWI AI Platform' },
    ],
    previewData: {
      invoicePeriod: 'January 2026',
      invoiceNumber: 'INV-2026-0001',
      amountDue: '$99.00',
      dueDate: 'February 1, 2026',
      invoiceUrl: 'https://app.example.com/billing/invoices/INV-2026-0001',
      platformName: 'GWI AI Platform',
    },
  },
]

/**
 * Get a template by slug
 */
export async function getTemplate(slug: string): Promise<EmailTemplate | null> {
  return prisma.emailTemplate.findUnique({
    where: { slug },
  })
}

/**
 * Get a template by ID
 */
export async function getTemplateById(id: string): Promise<EmailTemplate | null> {
  return prisma.emailTemplate.findUnique({
    where: { id },
    include: {
      versions: {
        orderBy: { version: 'desc' },
        take: 10,
      },
    },
  })
}

/**
 * Render a template with the provided data
 */
export function renderTemplate(
  template: { subject: string; htmlContent: string; textContent?: string | null },
  data: Record<string, string>
): { subject: string; html: string; text?: string } {
  const replaceVariables = (content: string): string => {
    return content.replace(VARIABLE_PATTERN, (match, variableName) => {
      return data[variableName] ?? match
    })
  }

  return {
    subject: replaceVariables(template.subject),
    html: replaceVariables(template.htmlContent),
    text: template.textContent ? replaceVariables(template.textContent) : undefined,
  }
}

/**
 * Send a templated email
 */
export async function sendTemplatedEmail(
  slug: string,
  to: string,
  data: Record<string, string>,
  options?: { from?: string }
): Promise<{ success: boolean; id?: string; error?: string }> {
  const template = await getTemplate(slug)

  if (!template) {
    return { success: false, error: `Template "${slug}" not found` }
  }

  if (!template.isActive) {
    return { success: false, error: `Template "${slug}" is inactive` }
  }

  // Merge with default values from variables
  const variables = template.variables as Array<{ name: string; defaultValue?: string }>
  const mergedData: Record<string, string> = {}

  for (const variable of variables) {
    if (data[variable.name] !== undefined) {
      mergedData[variable.name] = data[variable.name]
    } else if (variable.defaultValue !== undefined) {
      mergedData[variable.name] = variable.defaultValue
    }
  }

  const rendered = renderTemplate(template, mergedData)

  try {
    const result = await sendEmail({
      to,
      subject: rendered.subject,
      html: rendered.html,
      from: options?.from,
    })

    return result
  } catch (error) {
    console.error('Failed to send templated email:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Extract variables from template content
 */
export function extractVariables(content: string): string[] {
  const matches = content.matchAll(VARIABLE_PATTERN)
  const variables = new Set<string>()

  for (const match of matches) {
    variables.add(match[1])
  }

  return Array.from(variables)
}

/**
 * Validate that all required variables are provided
 */
export function validateVariables(
  template: EmailTemplate,
  data: Record<string, string>
): { valid: boolean; missing: string[] } {
  const variables = template.variables as Array<{ name: string; required: boolean; defaultValue?: string }>
  const missing: string[] = []

  for (const variable of variables) {
    if (variable.required && data[variable.name] === undefined && variable.defaultValue === undefined) {
      missing.push(variable.name)
    }
  }

  return {
    valid: missing.length === 0,
    missing,
  }
}

/**
 * Seed default system templates
 */
export async function seedDefaultTemplates(): Promise<void> {
  for (const template of DEFAULT_SYSTEM_TEMPLATES) {
    await prisma.emailTemplate.upsert({
      where: { slug: template.slug },
      update: {},
      create: {
        name: template.name,
        slug: template.slug,
        subject: template.subject,
        description: template.description,
        category: template.category,
        htmlContent: template.htmlContent,
        textContent: template.textContent,
        variables: template.variables,
        previewData: template.previewData,
        isSystem: true,
        isActive: true,
      },
    })
  }
}
