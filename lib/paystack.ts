export type PaystackInitResponse = {
  status: boolean
  message: string
  data?: {
    authorization_url: string
    access_code: string
    reference: string
  }
}

// Stricter typing based on Paystack docs
export type PaystackCustomer = {
  id?: number
  first_name?: string | null
  last_name?: string | null
  email?: string
  customer_code?: string
  phone?: string | null
  metadata?: any
  risk_action?: string
  international_format_phone?: string | null
}

export type PaystackAuthorization = {
  authorization_code?: string
  bin?: string
  last4?: string
  exp_month?: string
  exp_year?: string
  channel?: string
  card_type?: string
  bank?: string
  country_code?: string
  brand?: string
  reusable?: boolean
  signature?: string | null
  account_name?: string | null
  mobile_money_number?: string | null
  receiver_bank_account_number?: string | null
  receiver_bank?: string | null
}

export type PaystackLog = {
  start_time?: number
  time_spent?: number
  attempts?: number
  errors?: number
  success?: boolean
  mobile?: boolean
  input?: any[]
  history?: Array<{ type?: string; message?: string; time?: number }>
}

export type PaystackTransaction = {
  id?: number
  domain?: string
  status: "success" | "failed" | "abandoned" | string
  reference: string
  receipt_number?: string | null
  amount: number // minor unit
  message?: string | null
  gateway_response?: string
  paid_at?: string
  created_at?: string
  channel: string
  currency: string
  ip_address?: string
  metadata?: any
  log?: PaystackLog
  fees?: number
  fees_split?: any
  authorization?: PaystackAuthorization
  customer?: PaystackCustomer
  plan?: any
  split?: any
  order_id?: any
  paidAt?: string
  createdAt?: string
  requested_amount?: number
  pos_transaction_data?: any
  source?: any
  fees_breakdown?: any
  connect?: any
  transaction_date?: string
  plan_object?: any
  subaccount?: any
}

export type PaystackVerifyResponse = {
  status: boolean
  message: string
  data?: PaystackTransaction
}

// Type guard helpers
export function isPaystackTxSuccess(data: PaystackTransaction | undefined | null): data is PaystackTransaction & { status: "success" } {
  return !!data && data.status === "success"
}

export const PAYSTACK_BASE_URL = "https://api.paystack.co"

export async function paystackInitialize(secretKey: string, payload: any, timeoutMs = 10000): Promise<PaystackInitResponse> {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeoutMs)
  const res = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
    signal: controller.signal,
  }).finally(() => clearTimeout(id))
  return res.json()
}

export async function paystackVerify(secretKey: string, reference: string, timeoutMs = 10000): Promise<PaystackVerifyResponse> {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeoutMs)
  const res = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${reference}`, {
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
    signal: controller.signal,
  }).finally(() => clearTimeout(id))
  return res.json()
}
