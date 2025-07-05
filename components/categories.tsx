import Link from "next/link"

export default function Cartegories() {
  return (
    <>
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Shop by Category</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Browse our wide selection of products by category.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mt-8">
            {categories.map((category) => (
              <Link
                href={`/categories/${category.slug}`}
                key={category.name}
                className="group relative overflow-hidden rounded-lg"
              >
                <div className="absolute inset-0 bg-black/50 group-hover:bg-black/60 transition-colors z-10" />
                <Image
                  src={category.image || "placeholder"}
                  width={300}
                  height={300}
                  alt={category.name}
                  className="h-[200px] w-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <h3 className="text-white font-bold text-xl md:text-2xl">{category.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
