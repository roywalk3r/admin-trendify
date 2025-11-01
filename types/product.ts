export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  categoryId: string;
  category?: Category;
  images: string[];
  featured?: boolean;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  // Optional SEO fields
  metaTitle?: string;
  metaDescription?: string;
  // Optional merchandising fields
  tags?: string[];
  comparePrice?: number | null;
  lowStockThreshold?: number | null;
  weight?: number | null; // grams
  dimensions?: string | null; // e.g., "10x5x2 cm"
  sku?: string | null;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  slug?: string;
}

export interface CartItem {
  id: string;
  productId: string;
  product?: Product;
  quantity: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  total: number;
}

export interface OrderItem {
  id: string;
  price: number;
  quantity: number;
  product: {
    name: string;
    price: number;
  };
}

export interface ShippingAddress {
  fullName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

export interface Order {
  id: string;
  created_at: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  orderItems: OrderItem[];
  user: {
    name: string;
    email: string;
  };
  shipping: boolean;
  shippingAddress: ShippingAddress;
}
