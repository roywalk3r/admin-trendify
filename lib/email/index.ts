/**
 * Email Service
 * Centralized email sending functionality using Resend
 * 
 * Setup required:
 * 1. Sign up at https://resend.com
 * 2. Add RESEND_API_KEY to .env
 * 3. Verify your domain in Resend dashboard
 */

import { logInfo, logError } from "@/lib/logger"
import { formatCurrency } from "@/lib/format"
import { getCurrencyCode } from "@/lib/settings"
// Email configuration
// Sender strategy:
// - In production: require FROM_EMAIL (verified domain). If missing, skip send to avoid Resend 403.
// - In non-production: fallback to onboarding@resend.dev for testing.
const RAW_FROM_EMAIL = process.env.FROM_EMAIL || ""
const APP_NAME = process.env.APP_NAME || "Trendify"
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
// Check if Resend is configured
const isEmailConfigured = !!process.env.RESEND_API_KEY

if (!isEmailConfigured) {
  console.warn("⚠️  RESEND_API_KEY not configured. Email sending disabled.")
}

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

  try {
    // Resolve sender per environment
    const isProd = process.env.NODE_ENV === "production"
    const senderEmail = RAW_FROM_EMAIL || (!isProd ? "onboarding@resend.dev" : "")
    if (!senderEmail) {
      // In production without a verified FROM_EMAIL, do not attempt to send
      const msg = "FROM_EMAIL is required in production for Resend. Email not sent."
      logError(new Error(msg), { context: "Email sending", to, subject })
      return { success: false, error: msg }
    }
    const fromHeader = `${APP_NAME} <${senderEmail}>`

    // Using fetch instead of Resend SDK to avoid additional dependency
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: fromHeader,
        to: [to],
        subject,
        html,
        text: text || subject,
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      // Log and return gracefully (don’t throw) so order creation flows don’t fail
      logError(new Error("Resend API error"), { context: "Email sending", to, subject, error })
      return { success: false, error }
    }

    const data = await response.json()
    logInfo("Email sent successfully", { to, subject, emailId: data.id })
    
    return { success: true, emailId: data.id }
  } catch (error) {
    logError(error, { context: "Email sending", to, subject })
    return { success: false, error }
  }
}

/**
 * Order Confirmation Email
 */
export async function sendOrderConfirmationEmail(
  to: string,
  orderData: {
    orderNumber: string
    customerName: string
    items: Array<{
      name: string
      quantity: number
      price: number
      image?: string
    }>
    subtotal: number
    tax: number
    shipping: number
    total: number
    estimatedDelivery?: string
  }
) {
  const currencyCode = await getCurrencyCode()
  const subject = `Order Confirmation - ${orderData.orderNumber}`
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f6f9fc; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .header { background-color: #000000; color: #ffffff; padding: 40px 24px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
          .content { padding: 40px 24px; }
          .greeting { font-size: 18px; margin-bottom: 20px; color: #333333; }
          .message { font-size: 16px; line-height: 1.6; color: #666666; margin-bottom: 30px; }
          .order-details { background-color: #f8f9fa; border-radius: 8px; padding: 24px; margin-bottom: 30px; }
          .order-number { font-size: 14px; color: #666666; margin-bottom: 20px; }
          .order-number strong { color: #000000; }
          .item { display: flex; align-items: center; padding: 16px 0; border-bottom: 1px solid #e9ecef; }
          .item:last-child { border-bottom: none; }
          .item-image { width: 64px; height: 64px; object-fit: cover; border-radius: 4px; margin-right: 16px; }
          .item-details { flex: 1; }
          .item-name { font-weight: 600; color: #000000; margin-bottom: 4px; }
          .item-quantity { font-size: 14px; color: #666666; }
          .totals { border-top: 2px solid #e9ecef; padding-top: 20px; margin-top: 20px; }
          .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 16px; }
          .total-row.subtotal, .total-row.tax, .total-row.shipping { color: #666666; }
          .total-row.final { font-weight: bold; font-size: 20px; color: #000000; border-top: 2px solid #000000; padding-top: 16px; margin-top: 8px; }
          .button { display: inline-block; background-color: #000000; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 6px; font-weight: 600; margin: 20px 0; }
          .button:hover { background-color: #333333; }
          .footer { background-color: #f8f9fa; padding: 24px; text-align: center; color: #666666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${APP_NAME}</h1>
          </div>
          
          <div class="content">
            <div class="greeting">Hi ${orderData.customerName},</div>
            
            <div class="message">
              Thank you for your order! We're excited to get your items to you soon. 
              Your order has been confirmed and will be processed shortly.
            </div>
            
            <div class="order-details">
              <div class="order-number">
                <strong>Order Number:</strong> ${orderData.orderNumber}
              </div>
              
              ${orderData.items.map(item => `
                <div class="item">
                  ${item.image ? `<img src="${item.image}" alt="${item.name}" class="item-image" />` : ''}
                  <div class="item-details">
                    <div class="item-name">${item.name}</div>
                    <div class="item-quantity">Quantity: ${item.quantity} × ${formatCurrency(item.price, currencyCode)}</div>
                  </div>
                </div>
              `).join('')}
              
              <div class="totals">
                <div class="total-row subtotal">
                  <span>Subtotal:</span>
                  <span>${formatCurrency(orderData.subtotal, currencyCode)}</span>
                </div>
                <div class="total-row tax">
                  <span>Tax:</span>
                  <span>${formatCurrency(orderData.tax, currencyCode)}</span>
                </div>
                <div class="total-row shipping">
                  <span>Shipping:</span>
                  <span>${formatCurrency(orderData.shipping, currencyCode)}</span>
                </div>
                <div class="total-row final">
                  <span>Total:</span>
                  <span>${formatCurrency(orderData.total, currencyCode)}</span>
                </div>
              </div>
            </div>
            
            <div style="text-align: center;">
              <a href="${APP_URL}/orders/${orderData.orderNumber}" class="button">
                Track Your Order
              </a>
            </div>
            
            <div class="message" style="margin-top: 30px;">
              If you have any questions, feel free to reply to this email or contact our support team.
            </div>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
            <p>You received this email because you placed an order on our store.</p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({ to, subject, html })
}

/**
 * Abandoned Cart Email (3 variations)
 */
export async function sendAbandonedCartEmail(
  to: string,
  cartData: {
    items: Array<{
      name: string
      price: number
      image?: string
      productId: string
    }>
    cartValue: number
  },
  reminderNumber: 1 | 2 | 3
) {
  const subjects = [
    "You left something behind! 🛒",
    "Still interested? Your cart is waiting 💝",
    "Last chance - Save 10% on your cart! ⏰"
  ]
  
  const messages = [
    "We noticed you left some items in your cart. Complete your purchase now before they're gone!",
    "Your cart misses you! These items are still available and waiting for you.",
    "This is your last reminder! Complete your purchase now and save 10% with code SAVE10."
  ]

  const currencyCode = await getCurrencyCode()
  const subject = subjects[reminderNumber - 1]
  const message = messages[reminderNumber - 1]
  const discountCode = reminderNumber === 3 ? "SAVE10" : null

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #000; color: #fff; padding: 20px; text-align: center; }
          .content { padding: 30px 20px; }
          .item { border-bottom: 1px solid #eee; padding: 15px 0; display: flex; align-items: center; }
          .item img { width: 80px; height: 80px; object-fit: cover; margin-right: 15px; border-radius: 4px; }
          .discount { background: #fffacd; border: 2px dashed #ffd700; padding: 15px; margin: 20px 0; text-align: center; }
          .discount-code { font-size: 24px; font-weight: bold; color: #000; letter-spacing: 2px; }
          .button { display: inline-block; background: #000; color: #fff; padding: 15px 40px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${APP_NAME}</h1>
          </div>
          
          <div class="content">
            <h2>${subject}</h2>
            <p>${message}</p>
            
            ${discountCode ? `
              <div class="discount">
                <div style="font-size: 18px; margin-bottom: 10px;">🎉 Special Offer!</div>
                <div class="discount-code">${discountCode}</div>
                <div style="margin-top: 10px; color: #666;">Use this code at checkout to save 10%</div>
              </div>
            ` : ''}
            
            <h3>Your Cart Items:</h3>
            ${cartData.items.map(item => `
              <div class="item">
                ${item.image ? `<img src="${item.image}" alt="${item.name}" />` : ''}
                <div>
                  <strong>${item.name}</strong><br />
                  <span style="color: #666;">${formatCurrency(item.price, currencyCode)}</span>
                </div>
              </div>
            `).join('')}
            
            <div style="text-align: right; margin-top: 20px;">
              <strong>Total: ${formatCurrency(cartData.cartValue, currencyCode)}</strong>
            </div>
            
            <div style="text-align: center;">
              <a href="${APP_URL}/cart" class="button">Complete Your Purchase</a>
            </div>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} ${APP_NAME}</p>
            <p><a href="${APP_URL}/unsubscribe">Unsubscribe</a> from cart reminders</p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({ to, subject, html })
}

/**
 * Stock Alert Email
 */
export async function sendStockAlertEmail(
  to: string,
  product: {
    name: string
    price: number
    slug: string
    image?: string
  }
) {
  const currencyCode = await getCurrencyCode()
  const subject = `${product.name} is back in stock! 🎉`
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background: #fff; }
          .header { background: #000; color: #fff; padding: 30px 20px; text-align: center; }
          .content { padding: 40px 20px; text-align: center; }
          .product-image { width: 300px; height: 300px; object-fit: cover; border-radius: 8px; margin: 20px 0; }
          .product-name { font-size: 24px; font-weight: bold; margin: 20px 0; }
          .product-price { font-size: 28px; color: #000; margin: 15px 0; }
          .button { display: inline-block; background: #000; color: #fff; padding: 15px 40px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
          .footer { text-align: center; padding: 20px; background: #f8f8f8; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Great News! 🎉</h1>
          </div>
          
          <div class="content">
            <p>The item you've been waiting for is back in stock!</p>
            
            ${product.image ? `<img src="${product.image}" alt="${product.name}" class="product-image" />` : ''}
            
            <div class="product-name">${product.name}</div>
            <div class="product-price">${formatCurrency(product.price, currencyCode)}</div>
            
            <p>Don't miss out this time - stock is limited!</p>
            
            <a href="${APP_URL}/products/${product.slug}" class="button">Shop Now</a>
            
            <p style="margin-top: 30px; color: #666; font-size: 14px;">
              Hurry! This item is popular and may sell out quickly.
            </p>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} ${APP_NAME}</p>
            <p>You received this because you signed up for stock notifications.</p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({ to, subject, html })
}

/**
 * Shipping Notification Email
 */
export async function sendShippingNotificationEmail(
  to: string,
  orderData: {
    orderNumber: string
    customerName: string
    trackingNumber?: string
    carrier?: string
    estimatedDelivery?: string
    driverName?: string
    driverPhone?: string
    driverEmail?: string
  }
) {
  const subject = `Your order ${orderData.orderNumber} has shipped! 📦`
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; background: #fff; }
          .header { background: #000; color: #fff; padding: 30px 20px; text-align: center; }
          .content { padding: 40px 20px; }
          .tracking-box { background: #f8f8f8; border-left: 4px solid #000; padding: 20px; margin: 20px 0; }
          .button { display: inline-block; background: #000; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; background: #f8f8f8; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📦 Your Order Has Shipped!</h1>
          </div>
          
          <div class="content">
            <p>Hi ${orderData.customerName},</p>
            
            <p>Great news! Your order <strong>${orderData.orderNumber}</strong> has been shipped and is on its way to you.</p>
            
            ${orderData.trackingNumber ? `
              <div class="tracking-box">
                <div style="font-size: 14px; color: #666; margin-bottom: 10px;">Tracking Number:</div>
                <div style="font-size: 20px; font-weight: bold; font-family: monospace;">${orderData.trackingNumber}</div>
                ${orderData.carrier ? `<div style="margin-top: 10px; color: #666;">Carrier: ${orderData.carrier}</div>` : ''}
                ${orderData.estimatedDelivery ? `<div style="color: #666;">Estimated Delivery: ${orderData.estimatedDelivery}</div>` : ''}
              </div>
              
              <div style="text-align: center;">
                <a href="${APP_URL}/orders/${orderData.orderNumber}/track" class="button">Track Your Package</a>
              </div>
            ` : ''}

            ${orderData.driverName || orderData.driverPhone || orderData.driverEmail ? `
              <div class="tracking-box">
                <div style="font-size: 14px; color: #666; margin-bottom: 10px;">Assigned Driver</div>
                ${orderData.driverName ? `<div><strong>Name:</strong> ${orderData.driverName}</div>` : ''}
                ${orderData.driverPhone ? `<div><strong>Phone:</strong> ${orderData.driverPhone}</div>` : ''}
                ${orderData.driverEmail ? `<div><strong>Email:</strong> ${orderData.driverEmail}</div>` : ''}
              </div>
            ` : ''}
            
            <p style="margin-top: 30px;">We'll send you another email when your package is delivered.</p>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} ${APP_NAME}</p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({ to, subject, html })
}

/**
 * Return Approved Email
 */
export async function sendReturnApprovedEmail(
  to: string,
  returnData: {
    returnId: string
    orderNumber: string
    customerName: string
    returnLabel?: string
  }
) {
  const subject = `Your return request has been approved`
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; }
          .header { background: #000; color: #fff; padding: 30px 20px; text-align: center; }
          .content { padding: 40px 20px; }
          .button { display: inline-block; background: #000; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; background: #f8f8f8; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Return Request Approved</h1>
          </div>
          
          <div class="content">
            <p>Hi ${returnData.customerName},</p>
            
            <p>Your return request for order <strong>${returnData.orderNumber}</strong> has been approved.</p>
            
            ${returnData.returnLabel ? `
              <p>We've created a prepaid return shipping label for you. Click the button below to download and print your label.</p>
              
              <div style="text-align: center;">
                <a href="${returnData.returnLabel}" class="button">Download Return Label</a>
              </div>
              
              <h3>Return Instructions:</h3>
              <ol>
                <li>Pack the item(s) securely in the original packaging if possible</li>
                <li>Print and attach the return label to the package</li>
                <li>Drop off at any carrier location</li>
                <li>Keep your tracking number for reference</li>
              </ol>
            ` : `
              <p>Please contact our support team for return instructions.</p>
            `}
            
            <p>Once we receive your return, we'll process your refund within 3-5 business days.</p>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} ${APP_NAME}</p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({ to, subject, html })
}
