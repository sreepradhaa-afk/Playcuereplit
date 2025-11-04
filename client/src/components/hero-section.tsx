import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 md:pt-20">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-chart-2/5">
        <div className="absolute inset-0 opacity-30">
          {/* Floating geometric shapes */}
          <motion.div
            className="absolute top-20 left-10 w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-2xl"
            animate={{
              y: [0, -30, 0],
              x: [0, 20, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute top-40 right-20 w-48 h-48 rounded-full bg-gradient-to-br from-chart-2/20 to-transparent blur-2xl"
            animate={{
              y: [0, 40, 0],
              x: [0, -30, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-20 left-1/3 w-40 h-40 rounded-full bg-gradient-to-br from-primary/15 to-transparent blur-2xl"
            animate={{
              y: [0, -25, 0],
              x: [0, 15, 0],
            }}
            transition={{
              duration: 9,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
      </div>
      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8 md:space-y-12"
        >
          {/* Logo/Title */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-primary/10 border border-primary/20"
            data-testid="badge-games-count"
          >
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-primary">
              10+ Games Ready to Play
            </span>
          </motion.div>

          <div className="space-y-6">
            <h1 
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-bold text-foreground leading-tight"
              data-testid="text-hero-headline"
            >
              Play together -{" "}
              <span className="bg-gradient-to-r from-primary via-primary to-chart-2 bg-clip-text text-transparent">
                Anytime, Anywhere
              </span>
            </h1>

            <p 
              className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto"
              data-testid="text-hero-tagline"
            >No boards, no cards, no downloads, no setup. Just pure joy with screen-assisted party games for the whole gang - friends or family!</p>
          </div>

          {/* 3D Animated CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-4"
          >
            <motion.div
              className="inline-block perspective-1000"
              whileHover={{ 
                rotateX: 5,
                y: -4,
                transition: { duration: 0.3 }
              }}
              whileTap={{ scale: 0.95 }}
              style={{ 
                perspective: "1000px",
                transformStyle: "preserve-3d"
              }}
            >
              <Button
                size="lg"
                className="relative text-lg font-semibold shadow-2xl"
                style={{
                  background: "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--chart-2)) 100%)",
                }}
                data-testid="button-join-to-play"
              >
                Join to play now
              </Button>
            </motion.div>

            <p className="text-sm text-muted-foreground" data-testid="text-hero-subtext">
              No setup. Just fun.
            </p>
          </motion.div>
        </motion.div>
      </div>
      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
}
