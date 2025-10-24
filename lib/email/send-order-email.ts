import { generateOrderConfirmationEmail } from './templates/order-confirmation'

interface OrderEmailData {
  orderNumber: string
  createdAt: Date
  subtotal: number
  tax: number
  shipping: number
  discount: number
  totalAmount: number
  orderItems: Array<{
    productName: string
    quantity: number
    unitPrice: number
    totalPrice: number
  }>
  shippingAddress?: {
    fullName: string
    street: string
    city: string
    state: string
    zipCode: string
    country: string
    phone: string
  }
  paymentStatus: string
  status: string
}

export async function sendOrderConfirmationEmail(
  customerEmail: string,
  customerName: string,
  orderData: OrderEmailData
): Promise<{ success: boolean; error?: string }> {
  try {
    const resendApiKey = process.env.RESEND_API_KEY
    const fromEmail = process.env.FROM_EMAIL || 'orders@trendify.com'

    if (!resendApiKey) {
      console.error('Resend API key not configured')
      return { success: false, error: 'Email service not configured' }
    }

    const { subject, html, text } = generateOrderConfirmationEmail(customerName, orderData)

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: customerEmail,
        subject,
        html,
        text,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Resend API error:', errorData)
      return { success: false, error: 'Failed to send email' }
    }

    const data = await response.json()
    console.log('Order confirmation email sent:', data.id)
    return { success: true }
  } catch (error) {
    console.error('Error sending order confirmation email:', error)
    return { success: false, error: 'Email sending failed' }
  }
}

export async function sendOrderStatusUpdateEmail(
  customerEmail: string,
  customerName: string,
  orderNumber: string,
  oldStatus: string,
  newStatus: string,
  trackingNumber?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const resendApiKey = process.env.RESEND_API_KEY
    const fromEmail = process.env.FROM_EMAIL || 'orders@trendify.com'

    if (!resendApiKey) {
      return { success: false, error: 'Email service not configured' }
    }

    const statusMessages: Record<string, string> = {
      processing: 'Your order is being prepared for shipment',
      shipped: 'Your order has been shipped',
      delivered: 'Your order has been delivered',
      canceled: 'Your order has been canceled',
    }

    const message = statusMessages[newStatus] || `Your order status has been updated to ${newStatus}`

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Order Status Update</title>
</head>
<body style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #667eea; color: white; padding: 30px 20px; text-align: center; border-radius: 8px;">
    <h1 style="margin: 0;">Order Status Update</h1>
  </div>
  
  <div style="padding: 30px 20px; background: #fff; border: 1px solid #e5e7eb;">
    <p>Hi ${customerName},</p>
    
    <p>${message}</p>
    
    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 5px 0;"><strong>Order Number:</strong> ${orderNumber}</p>
      <p style="margin: 5px 0;"><strong>Previous Status:</strong> ${oldStatus}</p>
      <p style="margin: 5px 0;"><strong>New Status:</strong> <span style="color: #667eea;">${newStatus}</span></p>
      ${trackingNumber ? `<p style="margin: 5px 0;"><strong>Tracking Number:</strong> ${trackingNumber}</p>` : ''}
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderNumber}" 
         style="display: inline-block; background: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px;">
        Track Your Order
      </a>
    </div>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 14px;">
    <p>© ${new Date().getFullYear()} Trendify. All rights reserved.</p>
  </div>
</body>
</html>
`

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: customerEmail,
        subject: `Order Status Update - ${orderNumber}`,
        html,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Resend API error:', errorData)
      return { success: false, error: 'Failed to send email' }
    }

    return { success: true }
  } catch (error) {
    console.error('Error sending status update email:', error)
    return { success: false, error: 'Email sending failed' }
  }
}
