export type PaystackInitResponse = {
  status: boolean
  message: string
  data?: {
    authorization_url: string
    access_code: string
    reference: string
  }
}

export type PaystackVerifyResponse = {
  status: boolean
  message: string
  data?: {
    status: string
    reference: string
    amount: number
    currency: string
    paid_at: string
    channel: string
    metadata?: any
    customer?: {
      email?: string
    }
  }
}

export const PAYSTACK_BASE_URL = "https://api.paystack.co"

export async function paystackInitialize(secretKey: string, payload: any): Promise<PaystackInitResponse> {
  const res = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  })
  return res.json()
}

export async function paystackVerify(secretKey: string, reference: string): Promise<PaystackVerifyResponse> {
  const res = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${reference}`, {
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  })
  return res.json()
}
