/**
 * Mock data factories for consistent test data generation
 */

export const MockData = {
  /**
   * Products
   */
  products: {
    electronics: () => ({
      id: 'prod_electronics_1',
      name: 'Premium Wireless Headphones',
      slug: 'premium-wireless-headphones',
      description: 'High-quality wireless headphones with noise cancellation',
      price: 299.99,
      originalPrice: 399.99,
      images: ['headphones-1.jpg', 'headphones-2.jpg'],
      category: 'Electronics',
      subCategory: 'Audio',
      stock: 50,
      rating: 4.7,
      reviewCount: 128,
      featured: true,
      tags: ['wireless', 'bluetooth', 'noise-cancelling'],
      specifications: {
        battery: '30 hours',
        bluetooth: '5.0',
        weight: '250g'
      },
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date()
    }),

    fashion: () => ({
      id: 'prod_fashion_1',
      name: 'Designer Cotton T-Shirt',
      slug: 'designer-cotton-t-shirt',
      description: 'Premium quality cotton t-shirt',
      price: 49.99,
      images: ['tshirt-1.jpg'],
      category: 'Fashion',
      subCategory: 'Clothing',
      stock: 100,
      rating: 4.3,
      reviewCount: 45,
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Black', 'White', 'Navy'],
      createdAt: new Date(),
      updatedAt: new Date()
    }),

    outOfStock: () => ({
      id: 'prod_oos_1',
      name: 'Out of Stock Product',
      slug: 'out-of-stock-product',
      price: 99.99,
      stock: 0,
      category: 'Electronics',
      images: ['product.jpg'],
      rating: 4.0,
      reviewCount: 10
    }),

    bulk: (count: number = 10) => Array.from({ length: count }, (_, i) => ({
      id: `prod_${i + 1}`,
      name: `Product ${i + 1}`,
      slug: `product-${i + 1}`,
      price: Math.random() * 1000,
      stock: Math.floor(Math.random() * 100),
      category: ['Electronics', 'Fashion', 'Home', 'Sports'][i % 4],
      images: [`product-${i + 1}.jpg`],
      rating: 3 + Math.random() * 2,
      reviewCount: Math.floor(Math.random() * 50)
    }))
  },

  /**
   * Users
   */
  users: {
    customer: () => ({
      id: 'user_customer_1',
      email: 'customer@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'CUSTOMER',
      imageUrl: 'avatar.jpg',
      emailVerified: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date()
    }),

    admin: () => ({
      id: 'user_admin_1',
      email: 'admin@trendify.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      imageUrl: 'admin-avatar.jpg',
      emailVerified: true,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date()
    }),

    guest: () => ({
      id: null,
      email: 'guest@example.com',
      role: 'GUEST'
    })
  },

  /**
   * Orders
   */
  orders: {
    pending: () => ({
      id: 'order_pending_1',
      userId: 'user_customer_1',
      status: 'PENDING',
      paymentStatus: 'PENDING',
      total: 349.98,
      subtotal: 299.98,
      shippingCost: 50.00,
      tax: 0,
      discount: 0,
      items: [
        {
          id: 'item1',
          productId: 'prod_electronics_1',
          quantity: 1,
          price: 299.99,
          product: MockData.products.electronics()
        }
      ],
      shippingAddress: MockData.addresses.default(),
      createdAt: new Date(),
      updatedAt: new Date()
    }),

    completed: () => ({
      id: 'order_completed_1',
      userId: 'user_customer_1',
      status: 'DELIVERED',
      paymentStatus: 'PAID',
      total: 349.98,
      subtotal: 299.98,
      shippingCost: 50.00,
      paymentReference: 'pay_ref_123',
      deliveredAt: new Date(),
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      updatedAt: new Date()
    }),

    withCoupon: () => ({
      id: 'order_coupon_1',
      total: 314.98,
      subtotal: 299.98,
      discount: 35.00,
      couponCode: 'SAVE10',
      couponId: 'coupon1',
      shippingCost: 50.00
    })
  },

  /**
   * Addresses
   */
  addresses: {
    default: () => ({
      id: 'addr_default_1',
      userId: 'user_customer_1',
      fullName: 'John Doe',
      street: '123 Main Street',
      apartment: 'Apt 4B',
      city: 'Accra',
      state: 'Greater Accra',
      zipCode: '00000',
      country: 'GH',
      phone: '+233123456789',
      isDefault: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }),

    international: () => ({
      id: 'addr_intl_1',
      fullName: 'Jane Smith',
      street: '456 Oak Avenue',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'US',
      phone: '+12125551234',
      isDefault: false
    })
  },

  /**
   * Reviews
   */
  reviews: {
    positive: () => ({
      id: 'rev_positive_1',
      productId: 'prod_electronics_1',
      userId: 'user_customer_1',
      rating: 5,
      comment: 'Excellent product! Highly recommend.',
      verified: true,
      helpful: 24,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      user: MockData.users.customer()
    }),

    negative: () => ({
      id: 'rev_negative_1',
      productId: 'prod_fashion_1',
      userId: 'user_customer_1',
      rating: 2,
      comment: 'Not as described. Disappointed.',
      verified: true,
      helpful: 3,
      createdAt: new Date()
    }),

    bulk: (productId: string, count: number = 5) => Array.from({ length: count }, (_, i) => ({
      id: `rev_${productId}_${i}`,
      productId,
      userId: `user_${i}`,
      rating: Math.ceil(Math.random() * 5),
      comment: `Review ${i + 1}`,
      verified: i % 2 === 0,
      helpful: Math.floor(Math.random() * 20),
      createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    }))
  },

  /**
   * Coupons
   */
  coupons: {
    percentage: () => ({
      id: 'coupon_pct_1',
      code: 'SAVE10',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      isActive: true,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      maxUses: 1000,
      usedCount: 123,
      minPurchase: 50,
      createdAt: new Date()
    }),

    fixed: () => ({
      id: 'coupon_fixed_1',
      code: 'FLAT50',
      discountType: 'FIXED',
      discountValue: 50,
      isActive: true,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      maxUses: 100,
      usedCount: 45,
      minPurchase: 200
    }),

    expired: () => ({
      id: 'coupon_exp_1',
      code: 'EXPIRED',
      discountType: 'PERCENTAGE',
      discountValue: 20,
      isActive: true,
      expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      maxUses: 100,
      usedCount: 50
    })
  },

  /**
   * Cart
   */
  cart: {
    empty: () => ({
      id: 'cart_empty_1',
      userId: 'user_customer_1',
      sessionId: null,
      items: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }),

    withItems: () => ({
      id: 'cart_items_1',
      userId: 'user_customer_1',
      sessionId: null,
      items: [
        {
          id: 'item1',
          cartId: 'cart_items_1',
          productId: 'prod_electronics_1',
          quantity: 2,
          product: MockData.products.electronics()
        },
        {
          id: 'item2',
          cartId: 'cart_items_1',
          productId: 'prod_fashion_1',
          quantity: 1,
          product: MockData.products.fashion()
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    }),

    guest: (sessionId: string) => ({
      id: 'cart_guest_1',
      userId: null,
      sessionId,
      items: [],
      createdAt: new Date(),
      updatedAt: new Date()
    })
  },

  /**
   * Payment
   */
  payment: {
    successful: () => ({
      reference: 'pay_ref_success_123',
      amount: 34998, // In cents
      currency: 'GHS',
      status: 'success',
      channel: 'card',
      gateway_response: 'Successful',
      paid_at: new Date(),
      customer: {
        email: 'customer@example.com'
      }
    }),

    failed: () => ({
      reference: 'pay_ref_failed_456',
      amount: 34998,
      currency: 'GHS',
      status: 'failed',
      gateway_response: 'Declined',
      customer: {
        email: 'customer@example.com'
      }
    })
  },

  /**
   * Analytics
   */
  analytics: {
    salesData: () => ({
      totalSales: 125000,
      totalOrders: 458,
      averageOrderValue: 273.14,
      topProducts: MockData.products.bulk(5),
      salesByCategory: [
        { category: 'Electronics', total: 65000, count: 180 },
        { category: 'Fashion', total: 35000, count: 156 },
        { category: 'Home', total: 15000, count: 78 },
        { category: 'Sports', total: 10000, count: 44 }
      ],
      revenueOverTime: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000),
        revenue: Math.random() * 5000 + 2000
      }))
    })
  },

  /**
   * Notifications
   */
  notifications: {
    orderConfirmation: () => ({
      id: 'notif_1',
      type: 'ORDER_CONFIRMATION',
      title: 'Order Confirmed',
      message: 'Your order #order_123 has been confirmed',
      read: false,
      createdAt: new Date()
    }),

    shipmentUpdate: () => ({
      id: 'notif_2',
      type: 'SHIPMENT_UPDATE',
      title: 'Order Shipped',
      message: 'Your order is on the way!',
      read: false,
      createdAt: new Date()
    })
  }
}

/**
 * Helper to generate random data
 */
export const generateRandomData = {
  email: () => `user${Math.random().toString(36).substr(2, 9)}@example.com`,
  phone: () => `+233${Math.floor(Math.random() * 1000000000)}`,
  price: (min: number = 10, max: number = 1000) => 
    Math.floor(Math.random() * (max - min) + min * 100) / 100,
  quantity: (max: number = 10) => Math.floor(Math.random() * max) + 1,
  rating: () => Math.ceil(Math.random() * 5),
  date: (daysAgo: number = 30) => 
    new Date(Date.now() - Math.random() * daysAgo * 24 * 60 * 60 * 1000)
}
