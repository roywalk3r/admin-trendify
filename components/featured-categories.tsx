"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useApi } from "@/lib/hooks/use-api"
import { Skeleton } from "@/components/ui/skeleton"

export function FeaturedCategories() {
  const { data, isLoading } = useApi<any>("/api/categories")
  const [categories, setCategories] = useState<any[]>([])
console.log(data, "Carteg")
  useEffect(() => {
    if (data) {
      setCategories(data.data.slice(0, 4))
    }
  }, [data])

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  if (isLoading) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="aspect-square rounded-xl" />
          ))}
        </div>
    )
  }

  return (
      <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
      >
        {categories.map((category) => (
            <motion.div key={category.id} variants={item}>
              <Link
                  href={`/categories/${category.slug}`}
                  className="group block relative aspect-square rounded-xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 z-10" />
                <img
                    src={category.image || "/placeholder.svg?height=300&width=300"}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <h3 className="text-white font-semibold text-lg md:text-xl drop-shadow-md">{category.name}</h3>
                </div>
              </Link>
            </motion.div>
        ))}
      </motion.div>
  )
}
