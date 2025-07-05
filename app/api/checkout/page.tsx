"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, ShieldCheck } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { useCartStore } from "@/lib/store/cart-store"
import { useToast } from "@/hooks/use-toast"
import { useApiMutation } from "@/lib/hooks/use-api"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

// Form validation schema
const checkoutSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    phone: z.string().min(10, "Please enter a valid phone number"),
    firstName: z.string().min(2, "First name is required"),
    lastName: z.string().min(2, "Last name is required"),
    address: z.string().min(5, "Address is required"),
    apartment: z.string().optional(),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    postalCode: z.string().min(5, "Postal code is required"),
    country: z.string().min(2, "Country is required"),
    sameAddress: z.boolean().default(true),
    // Conditional billing address fields
    billingFirstName: z.string().optional(),
    billingLastName: z.string().optional(),
    billingAddress: z.string().optional(),
    billingApartment: z.string().optional(),
    billingCity: z.string().optional(),
    billingState: z.string().optional(),
    billingPostalCode: z.string().optional(),
    billingCountry: z.string().optional(),
    // Payment fields
    cardNumber: z.string().regex(/^\d{16}$/, "Please enter a valid card number"),
    expiration: z.string().regex(/^\d{2}\/\d{2}$/, "Please use MM/YY format"),
    cvc: z.string().regex(/^\d{3,4}$/, "CVC must be 3 or 4 digits"),
    nameOnCard: z.string().min(2, "Name on card is required"),
  })
  .refine(
    (data) => {
      if (!data.sameAddress) {
        return (
          data.billingFirstName &&
          data.billingLastName &&
          data.billingAddress &&
          data.billingCity &&
          data.billingState &&
          data.billingPostalCode &&
          data.billingCountry
        )
      }
      return true
    },
    {
      message: "Billing address is required",
      path: ["billingAddress"],
    },
  )

type CheckoutFormValues = z.infer<typeof checkoutSchema>

export default function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState("credit-card")
  const { items, subtotal, clearCart } = useCartStore()
  const { toast } = useToast()
  const router = useRouter()

  // Calculate order totals
  const shipping = subtotal() > 100 ? 0 : 10
  const tax = subtotal() * 0.07
  const total = subtotal() + shipping + tax

  // Setup form with validation
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: "",
      phone: "",
      firstName: "",
      lastName: "",
      address: "",
      apartment: "",
      city: "",
      state: "",
      postalCode: "",
      country: "United States",
      sameAddress: true,
      cardNumber: "",
      expiration: "",
      cvc: "",
      nameOnCard: "",
    },
  })

  const { watch, setValue } = form
  const sameAddress = watch("sameAddress")

  // API mutation for creating an order
  const { mutate: createOrder, isLoading } = useApiMutation("/api/orders", "POST", {
    onSuccess: () => {
      toast({
        title: "Order placed successfully!",
        description: "Thank you for your purchase.",
      })
      clearCart()
      router.push("/account?tab=orders")
    },
    onError: (error) => {
      toast({
        title: "Error placing order",
        description: error,
        variant: "destructive",
      })
    },
  })

  // Handle form submission
  const onSubmit = (data: CheckoutFormValues) => {
    if (items.length === 0) {
      toast({
        title: "Your cart is empty",
        description: "Please add items to your cart before checking out.",
        variant: "destructive",
      })
      return
    }

    // Create order items from cart
    const orderItems = items.map((item) => ({
      productId: item.id,
      quantity: item.quantity,
      price: item.price,
    }))

    // Create order
    createOrder({
      totalAmount: total,
      orderItems,
      shippingDetails: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        apartment: data.apartment,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country,
      },
      billingDetails: data.sameAddress
        ? null
        : {
            firstName: data.billingFirstName,
            lastName: data.billingLastName,
            address: data.billingAddress,
            apartment: data.billingApartment,
            city: data.billingCity,
            state: data.billingState,
            postalCode: data.billingPostalCode,
            country: data.billingCountry,
          },
      paymentMethod: paymentMethod,
    })
  }

  return (
    <div className="container px-4 py-8 md:px-6 md:py-12">
      <div className="mb-8">
        <Link
          href="/cart"
          className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to cart
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold">Checkout</h1>
                <p className="text-muted-foreground mt-1">
                  Complete your order by providing your shipping and payment details.
                </p>
              </div>

              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Contact Information</h2>
                <div className="grid gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email address</FormLabel>
                        <FormControl>
                          <Input placeholder="your.email@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone number</FormLabel>
                        <FormControl>
                          <Input placeholder="(123) 456-7890" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Shipping Address</h2>
                <div className="grid gap-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street address</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="apartment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Apartment, suite, etc. (optional)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State / Province</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="postalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Postal code</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Billing Address</h2>
                  <div className="flex items-center space-x-2">
                    <FormField
                      control={form.control}
                      name="sameAddress"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} id="same-address" />
                          </FormControl>
                          <FormLabel htmlFor="same-address" className="text-sm font-normal">
                            Same as shipping address
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {!sameAddress && (
                  <div className="grid gap-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="billingFirstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="billingLastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="billingAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street address</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="billingApartment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Apartment, suite, etc. (optional)</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <FormField
                        control={form.control}
                        name="billingCity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="billingState"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State / Province</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="billingPostalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Postal code</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="billingCountry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Payment Method</h2>
                <Tabs defaultValue="credit-card" value={paymentMethod} onValueChange={setPaymentMethod}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="credit-card">Credit Card</TabsTrigger>
                    <TabsTrigger value="paypal">PayPal</TabsTrigger>
                    <TabsTrigger value="apple-pay">Apple Pay</TabsTrigger>
                  </TabsList>
                  <TabsContent value="credit-card" className="space-y-4 pt-4">
                    <div className="grid gap-4">
                      <FormField
                        control={form.control}
                        name="cardNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Card number</FormLabel>
                            <FormControl>
                              <Input placeholder="1234 5678 9012 3456" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="expiration"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Expiration date</FormLabel>
                              <FormControl>
                                <Input placeholder="MM/YY" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="cvc"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CVC</FormLabel>
                              <FormControl>
                                <Input placeholder="123" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="nameOnCard"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name on card</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>
                  <TabsContent value="paypal" className="pt-4">
                    <div className="flex flex-col items-center justify-center space-y-4 py-4">
                      <div className="rounded-full bg-muted p-6">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-6 w-6 text-primary"
                        >
                          <path d="M17.5 7H17a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v.5" />
                          <path d="M3 7v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7Z" />
                          <path d="M7 15a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v2Z" />
                        </svg>
                      </div>
                      <p className="text-center text-muted-foreground">
                        You will be redirected to PayPal to complete your purchase securely.
                      </p>
                      <Button className="w-full" type="button">
                        Continue with PayPal
                      </Button>
                    </div>
                  </TabsContent>
                  <TabsContent value="apple-pay" className="pt-4">
                    <div className="flex flex-col items-center justify-center space-y-4 py-4">
                      <div className="rounded-full bg-muted p-6">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-6 w-6 text-primary"
                        >
                          <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z" />
                          <path d="M10 2c1 .5 2 2 2 5" />
                        </svg>
                      </div>
                      <p className="text-center text-muted-foreground">
                        You will be redirected to Apple Pay to complete your purchase securely.
                      </p>
                      <Button className="w-full" type="button">
                        Continue with Apple Pay
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="flex justify-end">
                <Button type="submit" size="lg" disabled={isLoading}>
                  {isLoading ? "Processing..." : "Place Order"}
                </Button>
              </div>
            </form>
          </Form>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="flex items-center justify-center text-xs text-muted-foreground">
                <ShieldCheck className="mr-1 h-4 w-4" />
                <span>Secure checkout powered by Stripe</span>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
