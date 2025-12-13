"use client"
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import LimitedCard from "@/components/limited-card";

// Define the type for the fetched product data
interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  category: { name: string };
}

const LimitedCarousel = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch('/api/products?limit=5');
                if (!response.ok) {
                    throw new Error('Failed to fetch products');
                }
                const data = await response.json();
                if (data && data.data && Array.isArray(data.data.products)) {
                    setProducts(data.data.products);
                } else {
                    throw new Error("Fetched data is not in the expected format.");
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const nextSlide = useCallback(() => {
        if (products.length === 0) return;
        setDirection(1);
        setActiveIndex((prev) => (prev + 1) % products.length);
    }, [products.length]);

    const prevSlide = useCallback(() => {
        if (products.length === 0) return;
        setDirection(-1);
        setActiveIndex((prev) => (prev - 1 + products.length) % products.length);
    }, [products.length]);

    const goToSlide = (index: number) => {
        if (products.length === 0) return;
        setDirection(index > activeIndex ? 1 : -1);
        setActiveIndex(index);
    };

    useEffect(() => {
        if (!isAutoPlaying || products.length === 0) return;
        const interval = setInterval(nextSlide, 4000);
        return () => clearInterval(interval);
    }, [isAutoPlaying, nextSlide, products.length]);

    const getVisibleProducts = () => {
        if (products.length === 0) return [];
        const visible = [];
        for (let i = -1; i <= 1; i++) {
            const index = (activeIndex + i + products.length) % products.length;
            const product = products[index];
            visible.push({
                id: product.id,
                image: product.images?.[0] || '/placeholder.png',
                name: product.name,
                category: product.category?.name || 'Uncategorized',
                price: product.price,
                position: i,
                originalIndex: index
            });
        }
        return visible;
    };
    
    if (loading) {
        return <div className="text-center py-16">Loading Limited Collection...</div>;
    }
    
    if (error) {
        return <div className="text-center py-16 text-red-500">Error: {error}</div>;
    }
    
    if (products.length === 0) {
        return <div className="text-center py-16">No limited edition products found.</div>;
    }

    return (
        <div
            className="relative w-full max-w-7xl mx-auto px-4 py-16"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
        >
            {/* Header */}
            <div className="text-center mb-20">
                <motion.div
                    className="inline-flex items-center gap-3 mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <span className="w-8 h-px bg-primary/60" />
                    <p className="text-[11px] font-semibold tracking-[0.35em] uppercase text-primary">
                        Limited Collection
                    </p>
                    <span className="w-8 h-px bg-primary/60" />
                </motion.div>
                <motion.h2
                    className="text-4xl md:text-5xl lg:text-6xl font-display typography text-foreground tracking-tight"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    Curated <span className="text-gradient-gold typography italic">Excellence</span>
                </motion.h2>
                <motion.p
                    className="mt-5 text-muted-foreground typography max-w-md mx-auto text-sm leading-relaxed"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    Discover handpicked pieces that define modern luxury
                </motion.p>
            </div>

            {/* Carousel Container */}
            <div className="relative h-[520px] md:h-[560px]">
                {/* Cards */}
                <div className="absolute inset-0 flex items-center justify-center perspective-1000">
                    {getVisibleProducts().map((product) => {
                        const isCenter = product.position === 0;
                        const xOffset = product.position * 360;
                        const scale = isCenter ? 1 : 0.8;
                        const opacity = isCenter ? 1 : 0.4;
                        const zIndex = isCenter ? 20 : 10;
                        const blur = isCenter ? 0 : 2;

                        return (
                            <motion.div
                                key={product.originalIndex}
                                initial={false}
                                animate={{
                                    x: xOffset,
                                    scale,
                                    opacity,
                                    filter: `blur(${blur}px)`,
                                }}
                                transition={{
                                    type: "spring",
                                    stiffness: 260,
                                    damping: 30,
                                }}
                                className="absolute w-[300px] md:w-[320px]"
                                style={{ zIndex }}
                            >
                                <LimitedCard {...product} isActive={isCenter} />
                            </motion.div>
                        );
                    })}
                </div>

                {/* Navigation Arrows */}
                <motion.button
                    onClick={prevSlide}
                    className="absolute left-2 md:left-12 top-1/2 -translate-y-1/2 z-30 w-14 h-14 flex items-center justify-center rounded-full bg-card/90 backdrop-blur-xl border border-border/50 text-foreground hover:bg-foreground hover:text-background hover:border-foreground transition-all duration-300 shadow-lg"
                    whileHover={{ scale: 1.1, x: -4 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
                </motion.button>

                <motion.button
                    onClick={nextSlide}
                    className="absolute right-2 md:right-12 top-1/2 -translate-y-1/2 z-30 w-14 h-14 flex items-center justify-center rounded-full bg-card/90 backdrop-blur-xl border border-border/50 text-foreground hover:bg-foreground hover:text-background hover:border-foreground transition-all duration-300 shadow-lg"
                    whileHover={{ scale: 1.1, x: 4 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
                </motion.button>
            </div>

            {/* Bottom controls */}
            <div className="flex items-center justify-center gap-8 mt-12">
                {/* Pagination Dots */}
                <div className="flex items-center gap-2.5">
                    {products.map((_, index) => (
                        <motion.button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className="relative p-1"
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <span className={`block rounded-full transition-all duration-500 ${
                                index === activeIndex
                                    ? "w-6 h-1.5 bg-foreground"
                                    : "w-1.5 h-1.5 bg-border hover:bg-muted-foreground"
                            }`} />
                        </motion.button>
                    ))}
                </div>

                {/* Divider */}
                <span className="w-px h-4 bg-border" />

                {/* Progress indicator */}
                <div className="flex items-center gap-1.5 text-xs font-medium tracking-wider">
                    <span className="text-foreground">
                        {String(activeIndex + 1).padStart(2, "0")}
                    </span>
                    <span className="text-muted-foreground/50">—</span>
                    <span className="text-muted-foreground">
                        {String(products.length).padStart(2, "0")}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default LimitedCarousel;
