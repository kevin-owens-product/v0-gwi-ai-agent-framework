import { Resend } from 'resend'

// Initialize Resend with optional API key
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

interface SendEmailParams {
  to: string
  subject: string
  html: string
  from?: string
}

export async function sendEmail({ to, subject, html, from }: SendEmailParams) {
  const fromAddress = from || `GWI AI Platform <noreply@${process.env.EMAIL_DOMAIN || 'gwi-platform.com'}>`

  // If Resend is not configured, log and return success (for development)
  if (!resend) {
    console.log('Email service not configured. Would send:')
    console.log({ from: fromAddress, to, subject })
    console.log('HTML preview:', html.substring(0, 200) + '...')
    return { success: true, id: 'mock-' + Date.now() }
  }

  try {
    const result = await resend.emails.send({
      from: fromAddress,
      to,
      subject,
      html,
    })

    if (result.error) {
      console.error('Resend error:', result.error)
      throw new Error(result.error.message)
    }

    return { success: true, id: result.data?.id }
  } catch (error) {
    console.error('Failed to send email:', error)
    throw error
  }
}

// Email Templates
export function getPasswordResetEmailHtml(params: { resetUrl: string; userName?: string }) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset your password</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #f9fafb;">
        <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="font-size: 24px; font-weight: 600; color: #111827; margin: 0;">Reset your password</h1>
          </div>

          ${params.userName ? `<p style="color: #374151; margin-bottom: 16px;">Hi ${params.userName},</p>` : ''}

          <p style="color: #374151; margin-bottom: 24px;">
            We received a request to reset your password. Click the button below to create a new password:
          </p>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${params.resetUrl}" style="display: inline-block; padding: 14px 28px; background: #000; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 16px;">
              Reset Password
            </a>
          </div>

          <p style="color: #6b7280; font-size: 14px; margin-bottom: 8px;">
            This link will expire in 1 hour.
          </p>

          <p style="color: #6b7280; font-size: 14px;">
            If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
          </p>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">

          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            GWI AI Agent Platform
          </p>
        </div>
      </body>
    </html>
  `
}

export function getInvitationEmailHtml(params: {
  orgName: string
  inviterName: string
  role: string
  inviteUrl: string
}) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>You've been invited to ${params.orgName}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #f9fafb;">
        <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="font-size: 24px; font-weight: 600; color: #111827; margin: 0;">You've been invited!</h1>
          </div>

          <p style="color: #374151; margin-bottom: 24px;">
            <strong>${params.inviterName}</strong> has invited you to join <strong>${params.orgName}</strong> as a <strong>${params.role}</strong> on the GWI AI Agent Platform.
          </p>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${params.inviteUrl}" style="display: inline-block; padding: 14px 28px; background: #000; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 16px;">
              Accept Invitation
            </a>
          </div>

          <p style="color: #6b7280; font-size: 14px;">
            This invitation expires in 7 days.
          </p>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">

          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            GWI AI Agent Platform
          </p>
        </div>
      </body>
    </html>
  `
}

// Send invitation email helper
export async function sendInvitationEmail(params: {
  to: string
  inviterName: string
  organizationName: string
  inviteUrl: string
  role?: string
}) {
  const html = getInvitationEmailHtml({
    orgName: params.organizationName,
    inviterName: params.inviterName,
    role: params.role || 'member',
    inviteUrl: params.inviteUrl,
  })

  return sendEmail({
    to: params.to,
    subject: `You've been invited to join ${params.organizationName}`,
    html,
  })
}

export function getWelcomeEmailHtml(params: { userName: string; loginUrl: string }) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to GWI AI Platform</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #f9fafb;">
        <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="font-size: 24px; font-weight: 600; color: #111827; margin: 0;">Welcome to GWI!</h1>
          </div>

          <p style="color: #374151; margin-bottom: 16px;">Hi ${params.userName},</p>

          <p style="color: #374151; margin-bottom: 24px;">
            Thank you for signing up for the GWI AI Agent Platform. Your 14-day free trial has started!
          </p>

          <p style="color: #374151; margin-bottom: 24px;">
            Here's what you can do next:
          </p>

          <ul style="color: #374151; margin-bottom: 24px; padding-left: 20px;">
            <li style="margin-bottom: 8px;">Create your first AI agent</li>
            <li style="margin-bottom: 8px;">Connect your data sources</li>
            <li style="margin-bottom: 8px;">Invite your team members</li>
            <li style="margin-bottom: 8px;">Explore insights and analytics</li>
          </ul>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${params.loginUrl}" style="display: inline-block; padding: 14px 28px; background: #000; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 16px;">
              Go to Dashboard
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">

          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            GWI AI Agent Platform
          </p>
        </div>
      </body>
    </html>
  `
}
