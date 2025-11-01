"use client"
import * as z from "zod";
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Loader2, Save, AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useApi, useApiMutation } from "@/lib/hooks/use-api"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  seoSchema,
  generalSchema,
  socialSchema,
  emailSchema,
  themeSchema,
  flashSaleSchema,
  defaultSettings,
  type SEOSettings,
  type GeneralSettings,
  type SocialSettings,
  type EmailSettings,
  type ThemeSettings,
  type FlashSaleSettings,
} from "@/app/api/admin/settings/schema"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { AppwriteMediaBrowser } from "@/components/appwrite-media-browser"
import Image from "next/image";

interface SettingsPayload {
  seo?: SEOSettings
  general?: GeneralSettings
  social?: SocialSettings
  email?: EmailSettings
  theme?: ThemeSettings
  flashSale?: FlashSaleSettings
}

export default function SettingsPage() {
  // Currency symbol helper
  const getCurrencySymbol = (code: string | undefined) => {
    switch (code) {
      case "USD": return "$"
      case "EUR": return "€"
      case "GBP": return "£"
      case "JPY": return "¥"
      case "CAD": return "C$"
      case "AUD": return "A$"
      case "GHS": return "₵"
      default: return "₵"
    }
  }
  const [activeTab, setActiveTab] = useState("general")
  const [error, setError] = useState<string | null>(null)

  // Fetch settings
  const { data, isLoading, error: fetchError, refetch } = useApi<SettingsPayload>("/api/admin/settings")

  // Helper to cast/transform API/general values to match schema
  function castGeneralSettings(input: any): GeneralSettings {
    return {
      storeName: input.storeName ?? '',
      storeEmail: input.storeEmail ?? '',
      storePhone: input.storePhone ?? '',
      storeAddress: input.storeAddress ?? '',
      currencyCode: input.currencyCode ?? '',
      enableTaxCalculation: Boolean(input.enableTaxCalculation),
      taxRate: Number(input.taxRate ?? 0),
      enableFreeShipping: Boolean(input.enableFreeShipping),
      freeShippingThreshold: Number(input.freeShippingThreshold ?? 0),
      shippingFee: Number(input.shippingFee ?? 0),
      orderPrefix: input.orderPrefix ?? '',
      showOutOfStockProducts: Boolean(input.showOutOfStockProducts),
      allowBackorders: Boolean(input.allowBackorders),
      lowStockThreshold: Number(input.lowStockThreshold ?? 0),
    };
  }

  // Helper to cast/transform API/email values to match schema
  function castEmailSettings(input: any): EmailSettings {
    return {
      fromEmail: input.fromEmail ?? '',
      fromName: input.fromName ?? '',
      smtpHost: input.smtpHost ?? '',
      smtpPort: input.smtpPort !== undefined ? Number(input.smtpPort) : undefined,
      smtpUser: input.smtpUser ?? '',
      smtpPassword: input.smtpPassword ?? '',
      sendOrderConfirmation: Boolean(input.sendOrderConfirmation),
      sendShippingConfirmation: Boolean(input.sendShippingConfirmation),
      sendOrderCancellation: Boolean(input.sendOrderCancellation),
      adminNotificationEmails: input.adminNotificationEmails ?? '',
    };
  }

  // Helper to cast/transform API/theme values to match schema
  function castThemeSettings(input: any): ThemeSettings {
    return {
      primaryColor: input.primaryColor ?? '',
      secondaryColor: input.secondaryColor ?? '',
      accentColor: input.accentColor ?? '',
      logoUrl: input.logoUrl ?? '',
      faviconUrl: input.faviconUrl ?? '',
      defaultTheme: input.defaultTheme ?? 'system',
      enableThemeToggle: Boolean(input.enableThemeToggle),
    };
  }

  // General form with schema type
  const generalForm = useForm<GeneralSettings>({
    resolver: zodResolver(generalSchema) as any,
    defaultValues: castGeneralSettings(defaultSettings.general),
  })

  // SEO form
  const seoForm = useForm<SEOSettings>({
    resolver: zodResolver(seoSchema),
    defaultValues: defaultSettings.seo,
  })

  // Social media form
  const socialForm = useForm<SocialSettings>({
    resolver: zodResolver(socialSchema),
    defaultValues: defaultSettings.social,
  })

  // Email form
  const emailForm = useForm<EmailSettings>({
    resolver: zodResolver(emailSchema) as any,
    defaultValues: castEmailSettings(defaultSettings.email),
  })

  // Theme form
  const themeForm = useForm<ThemeSettings>({
    resolver: zodResolver(themeSchema) as any,
    defaultValues: castThemeSettings(defaultSettings.theme),
  })

  // Flash sale form
  const flashForm = useForm<FlashSaleSettings>({
    resolver: zodResolver(flashSaleSchema) as any,
    defaultValues: defaultSettings.flashSale as FlashSaleSettings,
  })

  // Update settings mutation
  const { mutate: updateSettings, isLoading: isUpdating } = useApiMutation("/api/admin/settings", "POST", {
    onSuccess: () => {
      toast.success("Settings updated successfully")
      refetch()
      setError(null)
    },
    onError: (error: string) => {
      console.error("Error updating settings:", error)
      toast.error(`Error updating settings: ${error}`)
      setError(`Failed to update settings: ${error}`)
    },
  })

  // Set form values when data is loaded
  useEffect(() => {
    if (fetchError) {
      console.error("Error fetching settings:", fetchError)
      setError(`Failed to load settings: ${fetchError}`)
      return
    }

    if (data) {
      try {
        // Reset forms with data from API
        if (data.seo) {
          seoForm.reset({ ...defaultSettings.seo, ...data.seo })
        }
        if (data.general) {
          generalForm.reset(castGeneralSettings({
            ...defaultSettings.general,
            ...data.general,
          }))
        }
        if (data.social) {
          socialForm.reset({ ...defaultSettings.social, ...data.social })
        }
        if (data.email) {
          emailForm.reset(castEmailSettings({
            ...defaultSettings.email,
            ...data.email,
          }))
        }
        if (data.theme) {
          themeForm.reset(castThemeSettings({
            ...defaultSettings.theme,
            ...data.theme,
          }))
        }

        if ((data as any).flashSale) {
          flashForm.reset({
            ...defaultSettings.flashSale,
            ...(data as any).flashSale,
          } as FlashSaleSettings)
        }

        // Clear any previous errors
        setError(null)
      } catch (e: any) {
        console.error("Error setting form values:", e)
        setError(`Error loading settings: ${e.message || JSON.stringify(e)}`)
      }
    }
  }, [data, fetchError, seoForm, generalForm, socialForm, emailForm, themeForm, flashForm])

  // Update SEO settings
  const onSEOSubmit = (data: SEOSettings) => {
    updateSettings({
      type: "seo",
      data,
    })
  }

  // Update general settings
  const onGeneralSubmit = (data: GeneralSettings) => {
    updateSettings({
      type: "general",
      data,
    })
  }

  // Update social media settings
  const onSocialSubmit = (data: SocialSettings) => {
    updateSettings({
      type: "social",
      data,
    })
  }

  // Update email settings
  const onEmailSubmit = (data: EmailSettings) => {
    updateSettings({
      type: "email",
      data,
    })
  }

  // Update theme settings
  const onThemeSubmit = (data: ThemeSettings) => {
    updateSettings({
      type: "theme",
      data,
    })
  }

  // Update flash sale settings
  const onFlashSubmit = (data: FlashSaleSettings) => {
    updateSettings({
      type: "flashSale",
      data,
    })
  }

  // Helper function to render a form skeleton during loading
  const renderFormSkeleton = () => (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-24 w-full" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
  )

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          {(error || isLoading) && (
              <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                Reload Settings
              </Button>
          )}
        </div>

        {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
            <TabsTrigger value="social">Social Media</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="theme">Theme</TabsTrigger>
            <TabsTrigger value="flashSale">Flash Sale</TabsTrigger>
          </TabsList>

          {/* General Settings Tab */}
          <TabsContent value="general" className="space-y-6">
            {isLoading ? (
                renderFormSkeleton()
            ) : (
                <Form {...generalForm}>
                  <form onSubmit={generalForm.handleSubmit(onGeneralSubmit)} className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Store Information</CardTitle>
                        <CardDescription>Basic information about your store</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                            control={generalForm.control}
                            name="storeName"
                            render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Store Name</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <FormField
                              control={generalForm.control}
                              name="storeEmail"
                              render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Store Email</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                              )}
                          />
                          <FormField
                              control={generalForm.control}
                              name="storePhone"
                              render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Store Phone</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                              )}
                          />
                        </div>
                        <FormField
                            control={generalForm.control}
                            name="storeAddress"
                            render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Store Address</FormLabel>
                                  <FormControl>
                                    <Textarea {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <FormField
                              control={generalForm.control}
                              name="currencyCode"
                              render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Currency Code</FormLabel>
                                    <Select value={field.value} onValueChange={field.onChange}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select currency" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="GHS">GHS (₵)</SelectItem>
                                        <SelectItem value="USD">USD ($)</SelectItem>
                                        <SelectItem value="EUR">EUR (€)</SelectItem>
                                        <SelectItem value="GBP">GBP (£)</SelectItem>
                                        <SelectItem value="JPY">JPY (¥)</SelectItem>
                                        <SelectItem value="CAD">CAD (C$)</SelectItem>
                                        <SelectItem value="AUD">AUD (A$)</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormDescription>Three-letter ISO currency code</FormDescription>
                                    <FormMessage />
                                  </FormItem>
                              )}
                          />
                          <FormField
                              control={generalForm.control}
                              name="orderPrefix"
                              render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Order ID Prefix</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormDescription>Optional prefix for order IDs (e.g., ORD-)</FormDescription>
                                    <FormMessage />
                                  </FormItem>
                              )}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Tax Settings</CardTitle>
                        <CardDescription>Configure tax calculation for your store</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                            control={generalForm.control}
                            name="enableTaxCalculation"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                  <div className="space-y-0.5">
                                    <FormLabel className="text-base">Enable Tax Calculation</FormLabel>
                                    <FormDescription>Automatically calculate and apply taxes to orders</FormDescription>
                                  </div>
                                  <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                  </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={generalForm.control}
                            name="taxRate"
                            render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Tax Rate (%)</FormLabel>
                                  <FormControl>
                                    <Input type="number" min="0" step="0.01" {...field} />
                                  </FormControl>
                                  <FormDescription>Default tax rate as a percentage (e.g., 10 for 10%)</FormDescription>
                                  <FormMessage />
                                </FormItem>
                            )}
                        />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Shipping Settings</CardTitle>
                        <CardDescription>Configure shipping options for your store</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                            control={generalForm.control}
                            name="enableFreeShipping"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                  <div className="space-y-0.5">
                                    <FormLabel className="text-base">Enable Free Shipping</FormLabel>
                                    <FormDescription>Offer free shipping for orders above a certain amount</FormDescription>
                                  </div>
                                  <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                  </FormControl>
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <FormField
                              control={generalForm.control}
                              name="freeShippingThreshold"
                              render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Free Shipping Threshold</FormLabel>
                                    <div className="relative">
                                      <span className="absolute left-3 top-2.5 text-muted-foreground">{getCurrencySymbol(generalForm.watch("currencyCode"))}</span>
                                      <FormControl>
                                        <Input type="number" min="0" step="0.01" className="pl-7" {...field} />
                                      </FormControl>
                                    </div>
                                    <FormDescription>Minimum order amount for free shipping</FormDescription>
                                    <FormMessage />
                                  </FormItem>
                              )}
                          />
                          <FormField
                              control={generalForm.control}
                              name="shippingFee"
                              render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Standard Shipping Fee</FormLabel>
                                    <div className="relative">
                                      <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                                      <FormControl>
                                        <Input type="number" min="0" step="0.01" className="pl-7" {...field} />
                                      </FormControl>
                                    </div>
                                    <FormMessage />
                                  </FormItem>
                              )}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Inventory Settings</CardTitle>
                        <CardDescription>Configure inventory management for your store</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                            control={generalForm.control}
                            name="showOutOfStockProducts"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                  <div className="space-y-0.5">
                                    <FormLabel className="text-base">Show Out of Stock Products</FormLabel>
                                    <FormDescription>Display products that are out of stock on your store</FormDescription>
                                  </div>
                                  <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                  </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={generalForm.control}
                            name="allowBackorders"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                  <div className="space-y-0.5">
                                    <FormLabel className="text-base">Allow Backorders</FormLabel>
                                    <FormDescription>Allow customers to order products that are out of stock</FormDescription>
                                  </div>
                                  <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                  </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={generalForm.control}
                            name="lowStockThreshold"
                            render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Low Stock Threshold</FormLabel>
                                  <FormControl>
                                    <Input type="number" min="0" step="1" {...field} />
                                  </FormControl>
                                  <FormDescription>Number of items that triggers a low stock alert</FormDescription>
                                  <FormMessage />
                                </FormItem>
                            )}
                        />
                      </CardContent>
                    </Card>

                    <div className="flex justify-end">
                      <Button type="submit" disabled={isUpdating}>
                        {isUpdating ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                        ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Save Changes
                            </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
            )}
          </TabsContent>

          {/* Flash Sale Settings Tab */}
          <TabsContent value="flashSale" className="space-y-6">
            {isLoading ? (
              renderFormSkeleton()
            ) : (
              <Form {...flashForm}>
                <form onSubmit={flashForm.handleSubmit(onFlashSubmit)} className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Flash Sale</CardTitle>
                      <CardDescription>Configure homepage flash sale banner and countdown</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={flashForm.control}
                        name="enabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Enable Flash Sale</FormLabel>
                              <FormDescription>Show Flash Sale section on the homepage</FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <FormField
                          control={flashForm.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Flash Sale" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={flashForm.control}
                          name="subtitle"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Subtitle</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Limited time offers you can't miss" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <FormField
                          control={flashForm.control}
                          name="bannerImage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Banner Image</FormLabel>
                              <div className="flex items-center gap-3">
                                <div className="w-28 h-16 rounded-md overflow-hidden border bg-muted">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  {field.value ? (
                                    <Image src={field.value} alt="flash banner" width={112} height={64} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No image</div>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  <AppwriteMediaBrowser
                                    buttonText="Choose Image"
                                    maxSelections={1}
                                    onSelect={(urls) => {
                                      const url = urls[0]
                                      flashForm.setValue("bannerImage", url, { shouldDirty: true })
                                    }}
                                  />
                                  <Button type="button" variant="outline" onClick={() => flashForm.setValue("bannerImage", "", { shouldDirty: true })}>Clear</Button>
                                </div>
                              </div>
                              <FormDescription>Optional image for the flash sale banner</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={flashForm.control}
                          name="endsAt"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Ends At</FormLabel>
                              <FormControl>
                                <Input type="datetime-local" value={field.value || ""} onChange={field.onChange} />
                              </FormControl>
                              <FormDescription>When the flash sale should end (local time)</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <FormField
                          control={flashForm.control}
                          name="discountPercent"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Discount Percent</FormLabel>
                              <FormControl>
                                <Input type="number" min={0} max={100} step={1} value={field.value as any} onChange={field.onChange} />
                              </FormControl>
                              <FormDescription>Displayed badge (does not auto-apply pricing)</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={flashForm.control}
                          name="productIds"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Products</FormLabel>
                              <div className="space-y-2">
                                {/* Selected items as chips */}
                                <div className="flex flex-wrap gap-2">
                                  {(Array.isArray(field.value) ? field.value : []).map((id: string) => (
                                    <span key={id} className="inline-flex items-center gap-2 px-2 py-1 text-xs rounded-full border">
                                      <span className="font-mono">{id.slice(0, 8)}…</span>
                                      <button type="button" className="text-destructive" onClick={() => field.onChange((field.value as string[]).filter((x) => x !== id))}>×</button>
                                    </span>
                                  ))}
                                </div>
                                {/* Search input */}
                                <Input
                                  placeholder="Search products..."
                                  onChange={async (e) => {
                                    const q = e.target.value
                                    if (!q || q.length < 2) return
                                    try {
                                      const res = await fetch(`/api/products?search=${encodeURIComponent(q)}`, { cache: "no-store" })
                                      if (!res.ok) return
                                      const json = await res.json()
                                      const items = (json?.data?.products ?? json?.products ?? []) as Array<{ id: string; name: string }>
                                      // Show a simple dropdown list below input
                                      const menu = document.getElementById('flash-products-menu')
                                      if (menu) {
                                        menu.innerHTML = items
                                          .map((it) => `<button type='button' data-id='${it.id}' class='w-full text-left px-2 py-1 hover:bg-accent'>${it.name}</button>`)
                                          .join("")
                                        // attach handlers
                                        Array.from(menu.querySelectorAll("button[data-id]"))
                                          .forEach((btn) => {
                                            btn.addEventListener("click", () => {
                                              const id = (btn as HTMLButtonElement).dataset.id!
                                              const cur = Array.isArray(field.value) ? field.value : []
                                              if (!cur.includes(id)) field.onChange([...cur, id])
                                            }, { once: true })
                                          })
                                      }
                                    } catch {}
                                  }}
                                />
                                <div id="flash-products-menu" className="border rounded-md overflow-hidden" />
                              </div>
                              <FormDescription>Optional: select specific products to include in the sale</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={isUpdating}>
                      {isUpdating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Flash Sale
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </TabsContent>

          {/* SEO Settings Tab */}
          <TabsContent value="seo" className="space-y-6">
            {isLoading ? (
                renderFormSkeleton()
            ) : (
                <Form {...seoForm}>
                  <form onSubmit={seoForm.handleSubmit(onSEOSubmit)} className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>SEO Settings</CardTitle>
                        <CardDescription>Configure search engine optimization for your store</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                            control={seoForm.control}
                            name="siteTitle"
                            render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Site Title</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormDescription>The title that appears in search engine results</FormDescription>
                                  <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={seoForm.control}
                            name="siteDescription"
                            render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Site Description</FormLabel>
                                  <FormControl>
                                    <Textarea {...field} />
                                  </FormControl>
                                  <FormDescription>A brief description of your store for search engine results</FormDescription>
                                  <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={seoForm.control}
                            name="metaKeywords"
                            render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Meta Keywords</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="e-commerce, online store, products" />
                                  </FormControl>
                                  <FormDescription>Keywords for search engines (comma separated)</FormDescription>
                                  <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={seoForm.control}
                            name="defaultOgImage"
                            render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Default Social Image URL</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormDescription>Image displayed when your site is shared on social media</FormDescription>
                                  <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={seoForm.control}
                            name="twitterHandle"
                            render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Twitter Handle</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="yourstorename" />
                                  </FormControl>
                                  <FormDescription>Your Twitter username (without @)</FormDescription>
                                  <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={seoForm.control}
                            name="robotsTxt"
                            render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Robots.txt Content</FormLabel>
                                  <FormControl>
                                    <Textarea {...field} rows={5} />
                                  </FormControl>
                                  <FormDescription>Content for your robots.txt file</FormDescription>
                                  <FormMessage />
                                </FormItem>
                            )}
                        />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Analytics</CardTitle>
                        <CardDescription>Configure analytics tracking for your store</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                            control={seoForm.control}
                            name="googleAnalyticsId"
                            render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Google Analytics ID</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="G-XXXXXXXXXX or UA-XXXXXXXX-X" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={seoForm.control}
                            name="facebookPixelId"
                            render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Facebook Pixel ID</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                            )}
                        />
                      </CardContent>
                    </Card>

                    <div className="flex justify-end">
                      <Button type="submit" disabled={isUpdating}>
                        {isUpdating ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                        ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Save Changes
                            </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
            )}
          </TabsContent>

          {/* Social Media Tab */}
          <TabsContent value="social" className="space-y-6">
            {isLoading ? (
                renderFormSkeleton()
            ) : (
                <Form {...socialForm}>
                  <form onSubmit={socialForm.handleSubmit(onSocialSubmit)} className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Social Media Links</CardTitle>
                        <CardDescription>Configure your store&apos;s social media presence</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <FormField
                              control={socialForm.control}
                              name="facebook"
                              render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Facebook</FormLabel>
                                    <FormControl>
                                      <Input {...field} placeholder="https://facebook.com/yourpage" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                              )}
                          />
                          <FormField
                              control={socialForm.control}
                              name="twitter"
                              render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Twitter</FormLabel>
                                    <FormControl>
                                      <Input {...field} placeholder="https://twitter.com/yourhandle" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                              )}
                          />
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <FormField
                              control={socialForm.control}
                              name="instagram"
                              render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Instagram</FormLabel>
                                    <FormControl>
                                      <Input {...field} placeholder="https://instagram.com/yourhandle" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                              )}
                          />
                          <FormField
                              control={socialForm.control}
                              name="youtube"
                              render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>YouTube</FormLabel>
                                    <FormControl>
                                      <Input {...field} placeholder="https://youtube.com/yourchannel" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                              )}
                          />
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <FormField
                              control={socialForm.control}
                              name="pinterest"
                              render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Pinterest</FormLabel>
                                    <FormControl>
                                      <Input {...field} placeholder="https://pinterest.com/yourprofile" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                              )}
                          />
                          <FormField
                              control={socialForm.control}
                              name="linkedin"
                              render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>LinkedIn</FormLabel>
                                    <FormControl>
                                      <Input {...field} placeholder="https://linkedin.com/company/yourcompany" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                              )}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <div className="flex justify-end">
                      <Button type="submit" disabled={isUpdating}>
                        {isUpdating ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                        ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Save Changes
                            </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
            )}
          </TabsContent>

          {/* Email Settings Tab */}
          <TabsContent value="email" className="space-y-6">
            {isLoading ? (
                renderFormSkeleton()
            ) : (
                <Form {...emailForm}>
                  <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Email Settings</CardTitle>
                        <CardDescription>Configure email notifications for your store</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <FormField
                              control={emailForm.control}
                              name="fromEmail"
                              render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>From Email</FormLabel>
                                    <FormControl>
                                      <Input {...field} placeholder="noreply@yourstore.com" />
                                    </FormControl>
                                    <FormDescription>Email address used to send notifications</FormDescription>
                                    <FormMessage />
                                  </FormItem>
                              )}
                          />
                          <FormField
                              control={emailForm.control}
                              name="fromName"
                              render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>From Name</FormLabel>
                                    <FormControl>
                                      <Input {...field} placeholder="Your Store Name" />
                                    </FormControl>
                                    <FormDescription>Name displayed in email notifications</FormDescription>
                                    <FormMessage />
                                  </FormItem>
                              )}
                          />
                        </div>
                        <FormField
                            control={emailForm.control}
                            name="adminNotificationEmails"
                            render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Admin Notification Emails</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="admin@yourstore.com, manager@yourstore.com" />
                                  </FormControl>
                                  <FormDescription>
                                    Comma-separated list of email addresses to receive admin notifications
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                            )}
                        />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>SMTP Configuration</CardTitle>
                        <CardDescription>Configure your email server settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <FormField
                              control={emailForm.control}
                              name="smtpHost"
                              render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>SMTP Host</FormLabel>
                                    <FormControl>
                                      <Input {...field} placeholder="smtp.example.com" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                              )}
                          />
                          <FormField
                              control={emailForm.control}
                              name="smtpPort"
                              render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>SMTP Port</FormLabel>
                                    <FormControl>
                                      <Input type="number" {...field} placeholder="587" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                              )}
                          />
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <FormField
                              control={emailForm.control}
                              name="smtpUser"
                              render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>SMTP Username</FormLabel>
                                    <FormControl>
                                      <Input {...field} placeholder="username@example.com" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                              )}
                          />
                          <FormField
                              control={emailForm.control}
                              name="smtpPassword"
                              render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>SMTP Password</FormLabel>
                                    <FormControl>
                                      <Input type="password" {...field} placeholder="••••••••" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                              )}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Email Notifications</CardTitle>
                        <CardDescription>Configure which email notifications to send</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                            control={emailForm.control}
                            name="sendOrderConfirmation"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                  <div className="space-y-0.5">
                                    <FormLabel className="text-base">Order Confirmation</FormLabel>
                                    <FormDescription>Send an email when a customer places an order</FormDescription>
                                  </div>
                                  <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                  </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={emailForm.control}
                            name="sendShippingConfirmation"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                  <div className="space-y-0.5">
                                    <FormLabel className="text-base">Shipping Confirmation</FormLabel>
                                    <FormDescription>Send an email when an order is shipped</FormDescription>
                                  </div>
                                  <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                  </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={emailForm.control}
                            name="sendOrderCancellation"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                  <div className="space-y-0.5">
                                    <FormLabel className="text-base">Order Cancellation</FormLabel>
                                    <FormDescription>Send an email when an order is cancelled</FormDescription>
                                  </div>
                                  <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                  </FormControl>
                                </FormItem>
                            )}
                        />
                      </CardContent>
                    </Card>

                    <div className="flex justify-end">
                      <Button type="submit" disabled={isUpdating}>
                        {isUpdating ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                        ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Save Changes
                            </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
            )}
          </TabsContent>

          {/* Theme Settings Tab */}
        </Tabs>
      </div>
  )
}
