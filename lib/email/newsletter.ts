/**
 * Newsletter Email Functions
 */

import { logInfo, logError } from "@/lib/logger"

// Email configuration
function deriveFromEmail() {
  const envFrom = process.env.FROM_EMAIL?.trim()
  if (envFrom) return envFrom
  // Safe fallback for development only. Must use verified sender in production.
  if (process.env.NODE_ENV !== "production") return "onboarding@resend.dev"
  return undefined
}
const FROM_EMAIL = deriveFromEmail()
const APP_NAME = "Trendify"
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

// Check if Resend is configured
const isEmailConfigured = !!process.env.RESEND_API_KEY

/**
 * Base email sending function
 */
async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string
  subject: string
  html: string
  text?: string
}) {
  if (!isEmailConfigured) {
    logInfo("Email skipped (not configured)", { to, subject })
    return { success: false, message: "Email service not configured" }
  }

  // In production, a verified sender must be configured
  if (!FROM_EMAIL) {
    if (process.env.NODE_ENV === "production") {
      logError("Email sending aborted: FROM_EMAIL missing in production", { to, subject })
      return { success: false, message: "Sender email not configured" }
    } else {
      // Should not happen due to deriveFromEmail(), but keep as safeguard
      logInfo("Using Resend onboarding sender in development", { to, subject })
    }
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `${APP_NAME} <${FROM_EMAIL}>`,
        to: [to],
        subject,
        html,
        text,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || "Failed to send email")
    }

    logInfo("Email sent successfully", { to, subject, id: data.id })
    return { success: true, data }
  } catch (error) {
    logError("Email sending failed", { to, subject, error })
    return { success: false, error }
  }
}

/**
 * Send newsletter welcome email
 */
export async function sendNewsletterWelcomeEmail(to: string, name: string) {
  const subject = `Welcome to ${APP_NAME} Newsletter! 🎉`
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>${subject}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; }
          .benefits { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .benefit-item { display: flex; align-items: center; margin: 10px 0; }
          .benefit-icon { color: #667eea; margin-right: 10px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Welcome to ${APP_NAME}! 🎉</h1>
          <p>Thanks for subscribing to our newsletter</p>
        </div>
        
        <div class="content">
          <p>Hi ${name},</p>
          
          <p>Welcome to the ${APP_NAME} family! We're thrilled to have you on board.</p>
          
          <div class="benefits">
            <h3>Here's what you can expect:</h3>
            <div class="benefit-item">
              <span class="benefit-icon">🎯</span>
              <span>Exclusive deals and early access to sales</span>
            </div>
            <div class="benefit-item">
              <span class="benefit-icon">👕</span>
              <span>New arrivals and trending fashion updates</span>
            </div>
            <div class="benefit-item">
              <span class="benefit-icon">💡</span>
              <span>Style tips and fashion inspiration</span>
            </div>
            <div class="benefit-item">
              <span class="benefit-icon">🎁</span>
              <span>Special subscriber-only promotions</span>
            </div>
          </div>
          
          <p>Ready to start shopping? Check out our latest collection:</p>
          
          <a href="${APP_URL}/products" class="button">Shop Now</a>
          
          <p>If you have any questions, feel free to reach out to our support team.</p>
          
          <p>Happy shopping!<br>The ${APP_NAME} Team</p>
        </div>
        
        <div class="footer">
          <p>You're receiving this email because you subscribed to our newsletter.</p>
          <p><a href="${APP_URL}/api/newsletter?email=${encodeURIComponent(to)}&action=unsubscribe">Unsubscribe</a> | <a href="${APP_URL}">Visit our website</a></p>
          <p>&copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
        </div>
      </body>
    </html>
  `

  return sendEmail({ to, subject, html })
}
