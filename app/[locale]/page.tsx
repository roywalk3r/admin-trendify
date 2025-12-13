import Category from "@/components/category-section";
import Hero from "@/components/hero";
import FeaturedProducts from "@/components/featured-product";
import NewsletterSection from "@/components/newsletter-section";
import TestimonialsSection from "@/components/testimonial-section";
import BrandsSection from "@/components/brands-section";
import FlashSale from "@/components/flash-sale";
import LimitedCarousel from "@/components/limited";

export default function Home(){
    return (
        <>
          <Hero/>
            {/* Flash Sale widget (auto-hides if disabled) */}
            <FlashSale />
            <Category/>
            <FeaturedProducts />
            <LimitedCarousel/>
            <TestimonialsSection />
            <BrandsSection />
            <NewsletterSection />
        </>
    )
}
