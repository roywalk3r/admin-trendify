import HeroCard from "@/components/hero-card"
import FilterSortBar from "@/components/filter-sort-bar"
import { all_products } from "@/lib/data"
import Image from "next/image";

export default function SalePage() {
    // Create sale products with discounted prices
    const saleProducts = all_products.map((product) => ({
        ...product,
        originalPrice: product.price,
        price: Math.round(product.price * 0.7), // 30% off
        discount: 30,
    }))

    return (
        <>
            <div className="w-full max-w-7xl mx-auto p-8">
                <HeroCard
                    title={"Sale Collection"}
                    image="/images/banner.png"
                    position="items-left"
                    cta="Shop Sale"
                    text="Don't miss out on incredible savings! Discover amazing deals on your favorite fashion pieces with discounts up to 70% off. Limited time only!"
                    style="italic typography"
                />
                <FilterSortBar />

                {/* Custom Products Grid for Sale */}
                <div className="mt-8">
                    <div className="flex items-center justify-between mb-6 p-4 bg-card rounded-2xl border">
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground">Showing {saleProducts.length} sale items</span>
                            <span className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded-full">
                Up to 30% OFF
              </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {saleProducts.map((product, index) => (
                            <div
                                key={product.id}
                                className="group relative bg-card rounded-2xl border border-muted overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
                            >
                                <div className="relative aspect-square overflow-hidden bg-gray-50">
                                    <Image
                                        width={500}
                                        height={500}
                                        src={product.image || "/placeholder.svg"}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />

                                    {/* Sale Badges */}
                                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                    <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                      -{product.discount}%
                    </span>
                                        <span className="bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded-full">SALE</span>
                                    </div>
                                </div>

                                <div className="p-4">
                                    <h3 className="font-semibold typography text-sm text-ascent mb-2 line-clamp-2">{product.name}</h3>

                                    <div className="flex items-center gap-1 mb-3">
                                        <div className="flex">
                                            {[...Array(5)].map((_, i) => (
                                                <span
                                                    key={i}
                                                    className={`w-4 h-4 ${i < Math.floor(product?.rating) ? "text-yellow-400" : "text-gray-300"}`}
                                                >
                          ★
                        </span>
                                            ))}
                                        </div>
                                        <span className="text-sm text-muted-foreground ml-1">({product.reviews})</span>
                                    </div>

                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="text-xl text-foreground typography">${product.price}</span>
                                        <span className="text-sm text-muted-foreground line-through">${product.originalPrice}</span>
                                    </div>

                                    <button className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-full transition-colors duration-300">
                                        Add to Cart - SALE
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    )
}
