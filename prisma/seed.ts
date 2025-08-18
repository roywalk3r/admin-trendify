import { PrismaClient, EventType } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedDatabase() {
  console.log("🌱 Starting database seeding...");

  // Clean up existing data
  console.log("🧹 Cleaning up existing data...");
  await prisma.audit.deleteMany({});
  await prisma.analyticsEvent.deleteMany({});
  await prisma.hero.deleteMany({});
  await prisma.settings.deleteMany({});
  await prisma.wishlistItem.deleteMany({});
  await prisma.wishlist.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.shippingAddress.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.address.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});

  // Create users with more variety
  console.log("👤 Creating users...");
  const adminUser = await prisma.user.create({
    data: {
      id: "user_2v2E35dLiYgfHGjB4pkWvbIe5Yo",
      name: "Admin Developer",
      email: "testpjmail@gmail.com",
      role: "admin",
    },
  });

  const staffUser = await prisma.user.create({
    data: {
      name: "Sarah Staff",
      email: "staff@example.com",
      role: "staff",
    },
  });

  const customers = await Promise.all([
    prisma.user.create({
      data: {
        name: "Francis Johnson",
        email: "francis@example.com",
        role: "customer",
      },
    }),
    prisma.user.create({
      data: {
        name: "Maria Garcia",
        email: "maria@example.com",
        role: "customer",
      },
    }),
    prisma.user.create({
      data: {
        name: "David Chen",
        email: "david@example.com",
        role: "customer",
      },
    }),
  ]);

  // Create addresses for users
  console.log("🏠 Creating addresses...");
  const addresses = await Promise.all([
    prisma.address.create({
      data: {
        userId: adminUser.id,
        fullName: "Admin Developer",
        street: "123 Tech Street",
        city: "San Francisco",
        state: "CA",
        zipCode: "94105",
        country: "United States",
        phone: "555-123-4567",
      },
    }),
    prisma.address.create({
      data: {
        userId: customers[0].id,
        fullName: "Francis Johnson",
        street: "456 Oak Avenue",
        city: "Austin",
        state: "TX",
        zipCode: "78701",
        country: "United States",
        phone: "555-987-6543",
      },
    }),
    prisma.address.create({
      data: {
        userId: customers[1].id,
        fullName: "Maria Garcia",
        street: "789 Pine Road",
        city: "Miami",
        state: "FL",
        zipCode: "33101",
        country: "United States",
        phone: "555-456-7890",
      },
    }),
  ]);

  // Create main categories and subcategories
  console.log("📁 Creating categories...");
  const electronics = await prisma.category.create({
    data: {
      name: "Electronics",
      slug: "electronics",
      description: "Latest technology and electronic devices",
      image: "/electronics-category.png",
      isActive: true,
    },
  });

  const smartphones = await prisma.category.create({
    data: {
      name: "Smartphones",
      slug: "smartphones",
      description: "Latest smartphones and mobile devices",
      image: "/modern-smartphones.png",
      parentId: electronics.id,
      isActive: true,
    },
  });

  const laptops = await prisma.category.create({
    data: {
      name: "Laptops",
      slug: "laptops",
      description: "Powerful laptops for work and gaming",
      image: "/various-laptops.png",
      parentId: electronics.id,
      isActive: true,
    },
  });

  const clothing = await prisma.category.create({
    data: {
      name: "Fashion",
      slug: "fashion",
      description: "Trendy clothing and accessories",
      image: "/diverse-fashion-collection.png",
      isActive: true,
    },
  });

  const mensClothing = await prisma.category.create({
    data: {
      name: "Men's Clothing",
      slug: "mens-clothing",
      description: "Stylish clothing for men",
      image: "/mens-clothing-display.png",
      parentId: clothing.id,
      isActive: true,
    },
  });

  const womensClothing = await prisma.category.create({
    data: {
      name: "Women's Clothing",
      slug: "womens-clothing",
      description: "Fashion-forward clothing for women",
      image: "/womens-clothing.png",
      parentId: clothing.id,
      isActive: true,
    },
  });

  const homeKitchen = await prisma.category.create({
    data: {
      name: "Home & Kitchen",
      slug: "home-kitchen",
      description: "Everything for your home and kitchen needs",
      image: "/cozy-home-kitchen.png",
      isActive: true,
    },
  });

  const beauty = await prisma.category.create({
    data: {
      name: "Beauty & Personal Care",
      slug: "beauty-personal-care",
      description: "Beauty products and personal care items",
      image: "/beauty-cosmetics.png",
      isActive: true,
    },
  });

  // Create diverse products
  console.log("📦 Creating products...");
  const products = await Promise.all([
    // Electronics - Smartphones
    prisma.product.create({
      data: {
        name: "iPhone 15 Pro",
        slug: "iphone-15-pro",
        description:
          "The most advanced iPhone with titanium design, A17 Pro chip, and professional camera system.",
        price: 999.99,
        stock: 25,
        images: [
          "/iphone-15-pro-front.png",
          "/iphone-15-pro-back.png",
          "/iphone-15-pro-side.png",
        ],
        categoryId: smartphones.id,
        isFeatured: true,
        status: "active",
      },
    }),
    prisma.product.create({
      data: {
        name: "Samsung Galaxy S24 Ultra",
        slug: "samsung-galaxy-s24-ultra",
        description:
          "Premium Android smartphone with S Pen, advanced AI features, and exceptional camera quality.",
        price: 1199.99,
        stock: 18,
        images: [
          "/samsung-galaxy-s24-ultra.png",
          "/samsung-s24-ultra-camera.png",
        ],
        categoryId: smartphones.id,
        isFeatured: true,
        status: "active",
      },
    }),
    // Electronics - Laptops
    prisma.product.create({
      data: {
        name: "MacBook Pro 16-inch M3",
        slug: "macbook-pro-16-m3",
        description:
          "Powerful laptop with M3 chip, stunning Liquid Retina XDR display, and all-day battery life.",
        price: 2499.99,
        stock: 12,
        images: ["/macbook-pro-16-inch.png", "/placeholder-hxrmk.png"],
        categoryId: laptops.id,
        isFeatured: true,
        status: "active",
      },
    }),
    prisma.product.create({
      data: {
        name: "Dell XPS 13 Plus",
        slug: "dell-xps-13-plus",
        description:
          "Ultra-thin laptop with InfinityEdge display, premium materials, and exceptional performance.",
        price: 1299.99,
        stock: 20,
        images: ["/dell-xps-13.png"],
        categoryId: laptops.id,
        status: "active",
      },
    }),
    // Men's Clothing
    prisma.product.create({
      data: {
        name: "Premium Cotton Polo Shirt",
        slug: "premium-cotton-polo-shirt",
        description:
          "Classic fit polo shirt made from 100% premium cotton. Available in multiple colors.",
        price: 49.99,
        stock: 150,
        images: ["/mens-navy-polo.png", "/white-mens-polo.png"],
        categoryId: mensClothing.id,
        status: "active",
      },
    }),
    prisma.product.create({
      data: {
        name: "Slim Fit Chino Pants",
        slug: "slim-fit-chino-pants",
        description:
          "Versatile chino pants with modern slim fit. Perfect for casual and business casual occasions.",
        price: 79.99,
        stock: 85,
        images: ["/placeholder-9za5d.png"],
        categoryId: mensClothing.id,
        isFeatured: true,
        status: "active",
      },
    }),
    // Women's Clothing
    prisma.product.create({
      data: {
        name: "Floral Summer Dress",
        slug: "floral-summer-dress",
        description:
          "Elegant floral dress perfect for summer occasions. Lightweight and comfortable fabric.",
        price: 89.99,
        stock: 60,
        images: ["/womens-floral-dress.png", "/floral-dress-detail.png"],
        categoryId: womensClothing.id,
        isFeatured: true,
        status: "active",
      },
    }),
    // Home & Kitchen
    prisma.product.create({
      data: {
        name: "Smart Coffee Maker Pro",
        slug: "smart-coffee-maker-pro",
        description:
          "WiFi-enabled coffee maker with app control, programmable brewing, and thermal carafe.",
        price: 199.99,
        stock: 35,
        images: ["/placeholder-dyyfy.png"],
        categoryId: homeKitchen.id,
        status: "active",
      },
    }),
    prisma.product.create({
      data: {
        name: "Luxury Bedding Set Queen",
        slug: "luxury-bedding-set-queen",
        description:
          "Premium 1000 thread count Egyptian cotton bedding set. Includes sheets, pillowcases, and duvet cover.",
        price: 299.99,
        stock: 25,
        images: ["/luxury-bedding-set.png"],
        categoryId: homeKitchen.id,
        status: "active",
      },
    }),
    // Beauty
    prisma.product.create({
      data: {
        name: "Anti-Aging Serum",
        slug: "anti-aging-serum",
        description:
          "Advanced anti-aging serum with retinol and hyaluronic acid. Reduces fine lines and improves skin texture.",
        price: 79.99,
        stock: 80,
        images: ["/anti-aging-serum.png"],
        categoryId: beauty.id,
        status: "active",
      },
    }),
  ]);

  // Create hero slides
  console.log("🎨 Creating hero slides...");
  await Promise.all([
    prisma.hero.create({
      data: {
        title: "Latest iPhone 15 Pro",
        description:
          "Experience the most advanced iPhone with titanium design and A17 Pro chip",
        image: "/iphone-15-pro-hero.png",
        buttonText: "Shop Now",
        buttonLink: "/products/iphone-15-pro",
        color: "#007AFF",
        isActive: true,
      },
    }),
    prisma.hero.create({
      data: {
        title: "Summer Fashion Collection",
        description:
          "Discover our latest summer styles with up to 50% off selected items",
        image: "/summer-fashion-collection.png",
        buttonText: "Explore Collection",
        buttonLink: "/categories/fashion",
        color: "#FF6B6B",
        isActive: true,
      },
    }),
    prisma.hero.create({
      data: {
        title: "Smart Home Essentials",
        description:
          "Transform your home with our intelligent appliances and devices",
        image: "/smart-home-devices.png",
        buttonText: "Learn More",
        buttonLink: "/categories/home-kitchen",
        color: "#4ECDC4",
        isActive: true,
      },
    }),
  ]);

  // Create settings
  console.log("⚙️ Creating settings...");
  await Promise.all([
    prisma.settings.create({
      data: {
        key: "site_name",
        value: "TrendifyStore",
        description: "The name of the store",
      },
    }),
    prisma.settings.create({
      data: {
        key: "site_description",
        value:
          "Your one-stop shop for the latest trends in electronics, fashion, and home essentials",
        description: "Site description for SEO",
      },
    }),
    prisma.settings.create({
      data: {
        key: "currency",
        value: "USD",
        description: "Default currency",
      },
    }),
    prisma.settings.create({
      data: {
        key: "tax_rate",
        value: "0.08",
        description: "Default tax rate",
      },
    }),
    prisma.settings.create({
      data: {
        key: "free_shipping_threshold",
        value: "50.00",
        description: "Minimum order amount for free shipping",
      },
    }),
  ]);

  // Create more diverse reviews
  console.log("⭐ Creating product reviews...");
  await Promise.all([
    prisma.review.create({
      data: {
        userId: customers[0].id,
        productId: products[0].id, // iPhone 15 Pro
        rating: 5,
        comment:
          "Absolutely love this phone! The camera quality is incredible and the titanium build feels premium.",
      },
    }),
    prisma.review.create({
      data: {
        userId: customers[1].id,
        productId: products[0].id,
        rating: 4,
        comment:
          "Great phone overall, but the price is quite steep. Battery life is excellent though.",
      },
    }),
    prisma.review.create({
      data: {
        userId: customers[2].id,
        productId: products[2].id, // MacBook Pro
        rating: 5,
        comment:
          "This laptop is a powerhouse! Perfect for video editing and development work.",
      },
    }),
    prisma.review.create({
      data: {
        userId: customers[0].id,
        productId: products[5].id, // Chino Pants
        rating: 4,
        comment:
          "Good quality pants, fit is perfect. Will definitely buy more colors.",
      },
    }),
  ]);

  // Create analytics events
  console.log("📊 Creating analytics events...");
  const analyticsEvents = [];
  for (let i = 0; i < 50; i++) {
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    const randomUser = [adminUser, staffUser, ...customers][
      Math.floor(Math.random() * 5)
    ];
    const events = [
      EventType.PAGE_VIEW,
      EventType.PRODUCT_VIEW,
      EventType.ADD_TO_CART,
      EventType.SIGN_IN,
      EventType.SEARCH,
      EventType.FILTER,
      EventType.SIGN_UP,
      EventType.PURCHASE,
    ];
    const randomEvent = events[Math.floor(Math.random() * events.length)];

    analyticsEvents.push(
      prisma.analyticsEvent.create({
        data: {
          userId: Math.random() > 0.3 ? randomUser.id : undefined, // Some anonymous events
          eventType: randomEvent,

          metadata: {
            productId:
              randomEvent === EventType.PRODUCT_VIEW ||
              randomEvent === EventType.ADD_TO_CART ||
              randomEvent === EventType.SEARCH
                ? randomProduct.id
                : undefined,
            category: randomProduct.categoryId,
            value:
              randomEvent === EventType.PURCHASE
                ? randomProduct.price
                : undefined,
          },
          createdAt: new Date(
            Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
          ), // Random date within last 30 days
        },
      })
    );
  }
  await Promise.all(analyticsEvents);

  // Create audit log entries
  console.log("📝 Creating audit logs...");
  await Promise.all([
    prisma.audit.create({
      data: {
        userId: adminUser.id,
        action: "CREATE",
        entityType: "Product",
        entityId: products[0].id,
        newValue: { name: products[0].name, price: products[0].price },
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      },
    }),
    prisma.audit.create({
      data: {
        userId: staffUser.id,
        action: "UPDATE",
        entityType: "Product",
        entityId: products[1].id,
        oldValue: { stock: 20 },
        newValue: { stock: 18 },
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
    }),
    prisma.audit.create({
      data: {
        userId: adminUser.id,
        action: "CREATE",
        entityType: "Category",
        entityId: electronics.id,
        newValue: { name: electronics.name, slug: electronics.slug },
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      },
    }),
  ]);

  // Create a wishlist for the regular user
  console.log("💖 Creating wishlist...");
  const wishlist = await prisma.wishlist.create({
    data: {
      userId: customers[0].id,
      items: {
        create: [{ productId: products[0].id }, { productId: products[2].id }],
      },
    },
  });

  // Create an order for the regular user
  console.log("🛒 Creating orders...");
  const order = await prisma.order.create({
    data: {
      userId: customers[0].id,
      orderNumber: "ORD-" + Math.random().toString(36).substring(2, 10), // Add unique order number
      subtotal: 209.98,
      tax: 20.0,
      shipping: 0.0,
      totalAmount: 229.98,
      status: "pending",
      paymentStatus: "paid",
      orderItems: {
        create: [
          {
            productId: products[0].id,
            quantity: 1,
            unitPrice: 999.99,
            totalPrice: 999.99,
            productName: products[0].name,
          },
          {
            productId: products[3].id,
            quantity: 3,
            unitPrice: 88.99,
            totalPrice: 999.99,
            productName: products[0].name,
          },
        ],
      },
    },
  });

  // Create shipping address for the order
  await prisma.shippingAddress.create({
    data: {
      orderId: order.id,
      fullName: "Francis Johnson",
      street: "456 Oak Avenue",
      city: "Austin",
      state: "TX",
      zipCode: "78701",
      country: "United States",
      phone: "555-987-6543",
    },
  });

  // Create payment for the order
  await prisma.payment.create({
    data: {
      orderId: order.id,
      amount: order.totalAmount,
      currency: "usd",
      method: "stripe",
      status: "paid",
      transactionId: "txn_" + Math.random().toString(36).substring(2, 15),
    },
  });

  // Create a second order (shipped status)
  const order2 = await prisma.order.create({
    data: {
      userId: customers[0].id,
      orderNumber: "ORD-" + Math.random().toString(36).substring(2, 10), // Add unique order number
      subtotal: 249.97,
      tax: 0.02,
      shipping: 0.0,
      totalAmount: 249.99,
      status: "shipped",
      paymentStatus: "paid",
      orderItems: {
        create: [
          {
            productId: products[1].id, // Samsung Galaxy S24 Ultra
            quantity: 1,
            unitPrice: 1199.99,
            totalPrice: 1199.99,
            productName: products[1].name,
          },
          {
            productId: products[5].id, // Slim Fit Chino Pants
            quantity: 2,
            unitPrice: 79.99,
            totalPrice: 159.98,
            productName: products[5].name,
          },
        ],
      },
    },
  });

  // Create shipping address for the second order
  await prisma.shippingAddress.create({
    data: {
      orderId: order2.id,
      fullName: "Francis Johnson",
      street: "456 Oak Avenue",
      city: "Austin",
      state: "TX",
      zipCode: "78701",
      country: "United States",
      phone: "555-987-6543",
    },
  });

  // Create payment for the second order
  await prisma.payment.create({
    data: {
      orderId: order2.id,
      amount: order2.totalAmount,
      currency: "usd",
      method: "paypal",
      status: "paid",
      transactionId: "txn_" + Math.random().toString(36).substring(2, 15),
    },
  });

  console.log("✅ Seeding completed successfully!");
  console.log(`Created:`);
  console.log(`- ${5} users (1 admin, 1 staff, 3 customers)`);
  console.log(`- ${8} categories (with parent-child relationships)`);
  console.log(`- ${10} products (with featured items)`);
  console.log(`- ${3} hero slides`);
  console.log(`- ${5} settings`);
  console.log(`- ${4} product reviews`);
  console.log(`- ${50} analytics events`);
  console.log(`- ${3} audit log entries`);
}

// Note: do not auto-run seeding on import to avoid side effects during build.
// A dedicated script at scripts/seed.ts should import and execute seedDatabase() explicitly.
