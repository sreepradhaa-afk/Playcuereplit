import { useState } from "react";
import { Navigation } from "@/components/navigation";
import { HeroSection } from "@/components/hero-section";
import { FilterSection } from "@/components/filter-section";
import { GameGrid } from "@/components/game-grid";
import type { GameCategory } from "@shared/schema";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<GameCategory | "all">("all");

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <FilterSection
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
        <GameGrid selectedCategory={selectedCategory} />
      </div>
    </div>
  );
}
