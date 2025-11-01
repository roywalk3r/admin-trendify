import Link from "next/link"
import Image from 'next/image';

export default function Categories({ categories }:{ categories: any[] }) {
  return (
    <>
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl">Shop by Category</h2>
              <p className="max-w-[900px] text-muted-foreground text-sm sm:text-base md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Browse our wide selection of products by category.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mt-6 md:mt-8">
            {categories.map((category:any) => (
              <Link
                href={`/categories/${category.slug}`}
                key={category.name}
                className="group relative overflow-hidden rounded-lg"
              >
                <div className="absolute inset-0 bg-black/50 group-hover:bg-black/60 transition-colors z-10" />
                <Image
                  src={category.image || "/placeholder.svg"}
                  width={600}
                  height={450}
                  alt={category.name}
                  className="w-full aspect-[4/3] object-cover transition-transform group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <h3 className="text-white font-bold text-lg sm:text-xl md:text-2xl">{category.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
