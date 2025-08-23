"use client"
import HeroCard from "@/components/hero-card";
import FilterSortBar from "@/components/filter-sort-bar";
import NewArrivalProduct from "@/components/new-arrival-product";
import { Suspense } from "react";

export default function NewArrivals(){
    return(
        <>
        <div className="w-full max-w-7xl mx-auto p-8">

        <HeroCard title={"Latest Drops"} image="/images/banner.png" position="items-left" cta="Discover More" text="Discover our curated selection of the newest trends and timeless pieces." style="italic typography"/>
        <Suspense fallback={<div className="p-4 text-sm text-muted-foreground">Loading filters…</div>}>
            <FilterSortBar/>
        </Suspense>
        <NewArrivalProduct/>
        </div>
        </>
    )
}