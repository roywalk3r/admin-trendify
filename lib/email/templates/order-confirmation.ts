interface OrderItem {
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

interface ShippingAddress {
  fullName: string
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  phone: string
}

interface OrderData {
  orderNumber: string
  createdAt: Date
  subtotal: number
  tax: number
  shipping: number
  discount: number
  totalAmount: number
  orderItems: OrderItem[]
  shippingAddress?: ShippingAddress
  paymentStatus: string
  status: string
}

export function generateOrderConfirmationEmail(
  customerName: string,
  order: OrderData
): { subject: string; html: string; text: string } {
  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation - ${order.orderNumber}</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px 20px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
    }
    .content {
      background: #ffffff;
      padding: 30px 20px;
      border: 1px solid #e5e7eb;
      border-top: none;
    }
    .order-info {
      background: #f3f4f6;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .order-info h2 {
      margin-top: 0;
      color: #667eea;
    }
    .order-items {
      margin: 20px 0;
    }
    .item {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .item:last-child {
      border-bottom: none;
    }
    .totals {
      background: #f9fafb;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
    }
    .total-row.final {
      border-top: 2px solid #667eea;
      margin-top: 10px;
      padding-top: 12px;
      font-weight: bold;
      font-size: 18px;
      color: #667eea;
    }
    .address-box {
      background: #f3f4f6;
      padding: 15px;
      border-radius: 8px;
      margin: 15px 0;
    }
    .button {
      display: inline-block;
      background: #667eea;
      color: white;
      padding: 14px 32px;
      text-decoration: none;
      border-radius: 6px;
      margin: 20px 0;
      font-weight: 600;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #6b7280;
      font-size: 14px;
      border-top: 1px solid #e5e7eb;
      margin-top: 30px;
    }
    @media only screen and (max-width: 600px) {
      body { padding: 10px; }
      .header { padding: 20px 10px; }
      .content { padding: 20px 10px; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>✓ Order Confirmed</h1>
    <p style="margin: 10px 0 0 0; opacity: 0.9;">Thank you for your purchase!</p>
  </div>
  
  <div class="content">
    <p>Hi ${customerName},</p>
    
    <p>Your order has been confirmed and is being processed. We'll send you a shipping notification once your items are on their way.</p>
    
    <div class="order-info">
      <h2>Order Details</h2>
      <p style="margin: 5px 0;"><strong>Order Number:</strong> ${order.orderNumber}</p>
      <p style="margin: 5px 0;"><strong>Order Date:</strong> ${formattedDate}</p>
      <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #667eea; font-weight: 600;">${order.status.toUpperCase()}</span></p>
      <p style="margin: 5px 0;"><strong>Payment Status:</strong> <span style="color: #10b981; font-weight: 600;">${order.paymentStatus.toUpperCase()}</span></p>
    </div>
    
    <h3>Items Ordered</h3>
    <div class="order-items">
      ${order.orderItems
        .map(
          (item) => `
        <div class="item">
          <div>
            <strong>${item.productName}</strong><br>
            <span style="color: #6b7280; font-size: 14px;">Qty: ${item.quantity} × ₦${item.unitPrice.toFixed(2)}</span>
          </div>
          <div style="font-weight: 600;">
            ₦${item.totalPrice.toFixed(2)}
          </div>
        </div>
      `
        )
        .join('')}
    </div>
    
    <div class="totals">
      <div class="total-row">
        <span>Subtotal:</span>
        <span>₦${order.subtotal.toFixed(2)}</span>
      </div>
      ${
        order.shipping > 0
          ? `
      <div class="total-row">
        <span>Shipping:</span>
        <span>₦${order.shipping.toFixed(2)}</span>
      </div>
      `
          : ''
      }
      ${
        order.tax > 0
          ? `
      <div class="total-row">
        <span>Tax:</span>
        <span>₦${order.tax.toFixed(2)}</span>
      </div>
      `
          : ''
      }
      ${
        order.discount > 0
          ? `
      <div class="total-row" style="color: #10b981;">
        <span>Discount:</span>
        <span>-₦${order.discount.toFixed(2)}</span>
      </div>
      `
          : ''
      }
      <div class="total-row final">
        <span>Total:</span>
        <span>₦${order.totalAmount.toFixed(2)}</span>
      </div>
    </div>
    
    ${
      order.shippingAddress
        ? `
    <h3>Shipping Address</h3>
    <div class="address-box">
      <strong>${order.shippingAddress.fullName}</strong><br>
      ${order.shippingAddress.street}<br>
      ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}<br>
      ${order.shippingAddress.country}<br>
      ${order.shippingAddress.phone}
    </div>
    `
        : ''
    }
    
    <div style="text-align: center;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.orderNumber}" class="button">
        Track Your Order
      </a>
    </div>
    
    <div style="background: #eff6ff; padding: 15px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
      <p style="margin: 0; color: #1e40af;">
        <strong>What's Next?</strong><br>
        We're preparing your order for shipment. You'll receive a shipping confirmation email with tracking information once your order ships.
      </p>
    </div>
  </div>
  
  <div class="footer">
    <p>Questions about your order? Reply to this email or contact our support team.</p>
    <p style="margin: 10px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color: #667eea; text-decoration: none;">Visit Our Store</a> |
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/profile/orders" style="color: #667eea; text-decoration: none;">View Orders</a>
    </p>
    <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">
      © ${new Date().getFullYear()} Trendify. All rights reserved.
    </p>
  </div>
</body>
</html>
`

  const text = `
Order Confirmation - ${order.orderNumber}

Hi ${customerName},

Your order has been confirmed and is being processed.

Order Details:
- Order Number: ${order.orderNumber}
- Order Date: ${formattedDate}
- Status: ${order.status.toUpperCase()}
- Payment Status: ${order.paymentStatus.toUpperCase()}

Items Ordered:
${order.orderItems
  .map(
    (item) =>
      `- ${item.productName} (Qty: ${item.quantity}) - ₦${item.totalPrice.toFixed(2)}`
  )
  .join('\n')}

Order Summary:
Subtotal: ₦${order.subtotal.toFixed(2)}
${order.shipping > 0 ? `Shipping: ₦${order.shipping.toFixed(2)}` : ''}
${order.tax > 0 ? `Tax: ₦${order.tax.toFixed(2)}` : ''}
${order.discount > 0 ? `Discount: -₦${order.discount.toFixed(2)}` : ''}
Total: ₦${order.totalAmount.toFixed(2)}

${
  order.shippingAddress
    ? `
Shipping Address:
${order.shippingAddress.fullName}
${order.shippingAddress.street}
${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}
${order.shippingAddress.country}
${order.shippingAddress.phone}
`
    : ''
}

Track your order: ${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.orderNumber}

Thank you for shopping with us!

Trendify
`

  return {
    subject: `Order Confirmation - ${order.orderNumber}`,
    html,
    text,
  }
}
