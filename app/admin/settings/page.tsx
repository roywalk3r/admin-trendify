"use client"

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
  defaultSettings,
  type SEOSettings,
  type GeneralSettings,
  type SocialSettings,
  type EmailSettings,
  type ThemeSettings,
} from "@/app/api/admin/settings/schema"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general")
  const [error, setError] = useState<string | null>(null)

  // Fetch settings
  const { data, isLoading, error: fetchError, refetch } = useApi<any>("/api/admin/settings")

  // SEO form
  const seoForm = useForm<SEOSettings>({
    resolver: zodResolver(seoSchema),
    defaultValues: defaultSettings.seo,
  })

  // General form
  const generalForm = useForm<GeneralSettings>({
    resolver: zodResolver(generalSchema),
    defaultValues: defaultSettings.general,
  })

  // Social media form
  const socialForm = useForm<SocialSettings>({
    resolver: zodResolver(socialSchema),
    defaultValues: defaultSettings.social,
  })

  // Email form
  const emailForm = useForm<EmailSettings>({
    resolver: zodResolver(emailSchema),
    defaultValues: defaultSettings.email,
  })

  // Theme form
  const themeForm = useForm<ThemeSettings>({
    resolver: zodResolver(themeSchema),
    defaultValues: defaultSettings.theme,
  })

  // Update settings mutation
  const { mutate: updateSettings, isLoading: isUpdating } = useApiMutation("/api/admin/settings", "POST", {
    onSuccess: () => {
      toast.success("Settings updated successfully")
      refetch()
      setError(null)
    },
    onError: (error) => {
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

    if (data?.data) {
      try {
        // Reset forms with data from API
        if (data.data.seo) {
          seoForm.reset(data.data.seo)
        }
        if (data.data.general) {
          generalForm.reset(data.data.general)
        }
        if (data.data.social) {
          socialForm.reset(data.data.social)
        }
        if (data.data.email) {
          emailForm.reset(data.data.email)
        }
        if (data.data.theme) {
          themeForm.reset(data.data.theme)
        }

        // Clear any previous errors
        setError(null)
      } catch (e: any) {
        console.error("Error setting form values:", e)
        setError(`Error loading settings: ${e.message || JSON.stringify(e)}`)
      }
    }
  }, [data, fetchError, seoForm, generalForm, socialForm, emailForm, themeForm])

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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="theme">Theme</TabsTrigger>
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
                              <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
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
                    <CardDescription>Configure your store's social media presence</CardDescription>
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
        <TabsContent value="theme" className="space-y-6">
          {isLoading ? (
            renderFormSkeleton()
          ) : (
            <Form {...themeForm}>
              <form onSubmit={themeForm.handleSubmit(onThemeSubmit)} className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Theme Settings</CardTitle>
                    <CardDescription>Configure the visual appearance of your store</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <FormField
                        control={themeForm.control}
                        name="primaryColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Primary Color</FormLabel>
                            <FormControl>
                              <div className="flex items-center gap-2">
                                <Input type="color" {...field} className="w-12 h-8 p-1" />
                                <Input type="text" value={field.value} onChange={field.onChange} className="flex-1" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={themeForm.control}
                        name="secondaryColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Secondary Color</FormLabel>
                            <FormControl>
                              <div className="flex items-center gap-2">
                                <Input type="color" {...field} className="w-12 h-8 p-1" />
                                <Input type="text" value={field.value} onChange={field.onChange} className="flex-1" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={themeForm.control}
                        name="accentColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Accent Color</FormLabel>
                            <FormControl>
                              <div className="flex items-center gap-2">
                                <Input type="color" {...field} className="w-12 h-8 p-1" />
                                <Input type="text" value={field.value} onChange={field.onChange} className="flex-1" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <FormField
                        control={themeForm.control}
                        name="logoUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Logo URL</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="https://yourstore.com/logo.png" />
                            </FormControl>
                            <FormDescription>URL to your store logo image</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={themeForm.control}
                        name="faviconUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Favicon URL</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="https://yourstore.com/favicon.ico" />
                            </FormControl>
                            <FormDescription>URL to your store favicon</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Theme Preferences</CardTitle>
                    <CardDescription>Configure theme preferences for your store</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={themeForm.control}
                      name="defaultTheme"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default Theme</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select default theme" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="light">Light</SelectItem>
                              <SelectItem value="dark">Dark</SelectItem>
                              <SelectItem value="system">System</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>Default theme for your store</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={themeForm.control}
                      name="enableThemeToggle"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Enable Theme Toggle</FormLabel>
                            <FormDescription>Allow users to switch between light and dark themes</FormDescription>
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
      </Tabs>
    </div>
  )
}
