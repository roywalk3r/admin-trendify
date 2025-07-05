export interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  categoryId: string
  images: string[]
  createdAt?: string
  updatedAt?: string
}

export interface Category {
  id: string
  name: string
  description?: string
}

export interface CartItem {
  id: string
  productId: string
  product?: Product
  quantity: number
}

export interface Cart {
  id: string
  items: CartItem[]
  total: number
}

export interface OrderItem {
  id: string
  price: number
  quantity: number
  product: {
    name: string
  }
}

export interface ShippingAddress {
  fullName: string
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  phone: string
}

export interface Order {
  id: string
  created_at: string
  status: string
  paymentStatus: string
  totalAmount: number
  orderItems: OrderItem[]
  user: {
    name: string
    email: string
  }
  shipping: boolean
  shippingAddress: ShippingAddress
}
