"use client"

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"
import { CreditCard, ArrowLeft } from "lucide-react"

const paymentSchema = z.object({
  cardNumber: z.string().min(16, "Card number is required"),
  cardName: z.string().min(2, "Name on card is required"),
  expiryDate: z.string().min(5, "Expiry date is required"),
  cvv: z.string().min(3, "CVV is required"),
  saveCard: z.boolean().optional(),
})

type PaymentFormValues = z.infer<typeof paymentSchema>

interface CheckoutPaymentProps {
  paymentInfo: any
  setPaymentInfo: (info: any) => void
  onBack: () => void
  onNext: () => void
}

export function CheckoutPayment({ paymentInfo, setPaymentInfo, onBack, onNext }: CheckoutPaymentProps) {
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      ...paymentInfo,
    },
  })

  function onSubmit(data: PaymentFormValues) {
    setPaymentInfo(data)
    onNext()
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Payment Information</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-muted/50 p-4 rounded-lg flex items-center mb-6">
            <CreditCard className="h-5 w-5 mr-2 text-muted-foreground" />
            <span className="text-sm">All transactions are secure and encrypted</span>
          </div>

          <FormField
            control={form.control}
            name="cardNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Card Number</FormLabel>
                <FormControl>
                  <Input placeholder="1234 5678 9012 3456" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cardName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name on Card</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="expiryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expiry Date</FormLabel>
                  <FormControl>
                    <Input placeholder="MM/YY" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cvv"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CVV</FormLabel>
                  <FormControl>
                    <Input placeholder="123" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex items-center space-x-2">
            <FormField
              control={form.control}
              name="saveCard"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Save this card for future purchases</FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Shipping
            </Button>
            <Button type="submit">Continue to Review</Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

