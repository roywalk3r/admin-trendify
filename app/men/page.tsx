import HeroCard from "@/components/hero-card"
import FilterSortBar from "@/components/filter-sort-bar"
import { all_products } from "@/lib/data"
import Image from "next/image";

export default function MenPage() {
    // Filter products for men's category
    const menProducts = all_products.filter((product) => product.category === "Men")

    return (
        <>
            <div className="w-full max-w-7xl mx-auto p-8">
                <HeroCard
                    title={"Men's Collection"}
                    image="/images/men.jpg"
                    position="items-left"
                    cta="Shop Now"
                    text="Discover our premium collection of men's fashion. From casual wear to formal attire, find everything you need to elevate your style."
                    style="italic typography"
                />
                <FilterSortBar />

                {/* Custom Products Grid for Men */}
                <div className="mt-8">
                    <div className="flex items-center justify-between mb-6 p-4 bg-card rounded-2xl border">
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground">Showing {menProducts.length} men's products</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {menProducts.map((product, index) => (
                            <div
                                key={product.id}
                                className="group relative bg-card rounded-2xl border border-muted  overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
                            >
                                <div className="relative aspect-square overflow-hidden bg-gray-50">
                                    <Image
                                        width={500}
                                        height={500}
                                        src={product.image || "/placeholder.svg"}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />

                                    {/* Badges */}
                                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                                        <span className="bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded-full">MEN</span>
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
                                    </div>

                                    <button className="w-full bg-ascent-foreground hover:bg-ascent hover:text-white transition ease-in-out delay-250 duration-300 text-ascent font-semibold py-2 rounded-full">
                                        Add to Cart
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
