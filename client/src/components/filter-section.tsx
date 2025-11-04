import { motion } from "framer-motion";
import type { GameCategory } from "@shared/schema";
import { gameCategories } from "@shared/schema";

interface FilterSectionProps {
  selectedCategory: GameCategory | "all";
  onCategoryChange: (category: GameCategory | "all") => void;
}

export function FilterSection({ selectedCategory, onCategoryChange }: FilterSectionProps) {
  const filters: Array<{ id: GameCategory | "all"; label: string }> = [
    { id: "all", label: "All" },
    { id: "alone", label: gameCategories.alone },
    { id: "offline", label: gameCategories.offline },
    { id: "room", label: gameCategories.room },
  ];

  return (
    <div className="mb-12 md:mb-16" id="games" data-testid="section-filters">
      <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
        {filters.map((filter) => (
          <motion.button
            key={filter.id}
            onClick={() => onCategoryChange(filter.id)}
            className={`
              relative px-6 py-3 rounded-full font-medium text-sm md:text-base
              transition-all duration-300
              ${
                selectedCategory === filter.id
                  ? "text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }
            `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            data-testid={`button-filter-${filter.id}`}
          >
            {selectedCategory === filter.id && (
              <motion.div
                layoutId="activeFilter"
                className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-chart-2"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">{filter.label}</span>
            
            {selectedCategory === filter.id && (
              <motion.div
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 h-1 bg-chart-2 rounded-full"
                layoutId="filterUnderline"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
