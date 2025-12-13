import { motion } from "framer-motion"
import { Plus, Heart } from "lucide-react"
import { useCurrency } from "@/lib/contexts/settings-context"
import { useState, useEffect } from "react"
import { useCartStore } from "@/lib/store/cart-store"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@clerk/nextjs"
import { useI18n } from "@/lib/i18n/I18nProvider"

interface LimitedCardProps {
  id: string;
  image: string;
  name: string;
  category: string;
  price: number;
  isActive: boolean;
}

const LimitedCard = ({ id, image, name, category, price, isActive }: LimitedCardProps) => {
    const { format } = useCurrency()
    const { t } = useI18n()
    const [isWishlisted, setIsWishlisted] = useState(false)
    const [isWishlistLoading, setIsWishlistLoading] = useState(false)
    const addToCartStore = useCartStore((s) => s.addItem)
    const { isSignedIn } = useUser()
    const { toast } = useToast()
    const imgSrc = image

    useEffect(() => {
        let mounted = true
        const check = async () => {
            try {
                const res = await fetch(`/api/wishlist?productId=${encodeURIComponent(id)}`, { cache: "no-store" })
                if (!res.ok) return
                const json = await res.json()
                const inWishlist = json?.data?.inWishlist ?? json?.inWishlist
                if (mounted && typeof inWishlist === "boolean") setIsWishlisted(inWishlist)
            } catch {}
        }
        check()
        return () => {
            mounted = false
        }
    }, [id])

    const handleAddToCart = async () => {
        addToCartStore({ id, name, price: Number(price), quantity: 1, image: imgSrc })
        try {
            if (isSignedIn) {
                const res = await fetch("/api/cart", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id, name, price: Number(price), quantity: 1, image: imgSrc }),
                })
                if (!res.ok) throw new Error(`${res.status}`)
            }
            toast({ title: t("product.addedToCart"), description: name })
        } catch (e: any) {
            const msg = String(e?.message || "")
            if (!isSignedIn || msg === "401") {
                toast({ title: t("product.signInToSyncCart"), description: t("product.itemKeptLocally"), variant: "destructive" })
            } else {
                toast({ title: t("product.failedToSyncCart"), description: `Error ${msg}`, variant: "destructive" })
            }
        }
    }

    const toggleWishlist = async () => {
        if (isWishlistLoading) return
        const next = !isWishlisted
        setIsWishlisted(next) // optimistic
        setIsWishlistLoading(true)
        try {
            if (next) {
                const res = await fetch("/api/wishlist", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ productId: id }),
                })
                if (!res.ok) {
                    throw new Error(await res.text())
                }
                toast({ title: t("product.wishlistAdded"), description: name })
                window.dispatchEvent(new Event("wishlist:updated"))
            } else {
                const res = await fetch(`/api/wishlist?productId=${encodeURIComponent(id)}`, { method: "DELETE" })
                if (!res.ok) {
                    throw new Error(await res.text())
                }
                toast({ title: t("product.wishlistRemoved"), description: name })
                window.dispatchEvent(new Event("wishlist:updated"))
            }
        } catch (e: any) {
            setIsWishlisted(!next)
            toast({ title: t("product.wishlistActionFailed"), description: e?.message || "", variant: "destructive" })
        } finally {
            setIsWishlistLoading(false)
        }
    }

  return (
    <motion.div
      className={`group relative overflow-hidden rounded-3xl bg-card border border-border/40 transition-all duration-700 ${
        isActive ? "shadow-glow" : "shadow-soft"
      }`}
      whileHover={{ y: -12, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {/* Shimmer effect */}
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-foreground/[0.03] to-transparent animate-shimmer pointer-events-none z-10" />
      
      {/* Product Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden bg-secondary/30">
        <motion.img
          src={imgSrc}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
        
        {/* Top actions */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <motion.span 
            className="px-3 py-1.5 text-[10px] font-semibold bg-ascent-foreground tracking-[0.2em] uppercase text-ascent rounded-full shadow-lg"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Limited
          </motion.span>
          <motion.button
            className="w-9 h-9 flex items-center justify-center rounded-full bg-card/80 backdrop-blur-sm border border-border/50 text-gray-600 hover:text-primary hover:border-primary/30 transition-colors duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleWishlist}
            disabled={isWishlistLoading}
          >
            <Heart className={`w-4 h-4 transition-colors ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
          </motion.button>
        </div>
      </div>
      
      {/* Content */}
      <div className="relative p-6 space-y-4">
        {/* Subtle top border accent */}
        <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        
        <div className="space-y-2">
          <p className="text-[10px] font-semibold tracking-[0.25em] uppercase text-ascent">
            {category}
          </p>
          <h3 className="text-lg font-display font-semibold text-foreground leading-snug tracking-tight">
            {name}
          </h3>
        </div>
        
        <div className="flex items-end justify-between pt-1">
          <div className="space-y-0.5">
            <p className="text-[10px] font-medium tracking-wide uppercase text-muted-foreground">Price</p>
            <span className="text-2xl font-display font-bold text-foreground">
              {format(price)}
            </span>
          </div>
          <motion.button
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold tracking-wide uppercase text-ascent bg-ascent-foreground hover:bg-ascent hover:text-white rounded-full transition-all duration-300 shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddToCart}
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
            <span>Add</span>
          </motion.button>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </motion.div>
  );
};

export default LimitedCard;
