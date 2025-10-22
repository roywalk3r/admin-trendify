"use client"

import { useCartSync } from "@/hooks/use-cart-sync"

/**
 * Cart Sync Provider Component
 * 
 * Add this to your root layout to enable automatic cart syncing
 * when users sign in.
 * 
 * Usage in app/layout.tsx:
 * 
 * import { CartSyncProvider } from "@/components/cart-sync-provider"
 * 
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <ClerkProvider>
 *           <CartSyncProvider />
 *           {children}
 *         </ClerkProvider>
 *       </body>
 *     </html>
 *   )
 * }
 */
export function CartSyncProvider() {
  useCartSync()
  return null
}
