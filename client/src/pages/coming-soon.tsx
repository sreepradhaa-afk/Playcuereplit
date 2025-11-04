import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Rocket } from "lucide-react";
import { Link, useParams } from "wouter";
import { motion } from "framer-motion";

export default function ComingSoon() {
  const params = useParams();
  const gameName = params.gameName || "This Game";

  const displayName = gameName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-2xl w-full space-y-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <div className="flex justify-center">
            <div className="p-8 rounded-full bg-gradient-to-br from-primary/20 via-purple-500/20 to-orange-500/20">
              <Rocket className="w-24 h-24 text-primary" />
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-display font-bold bg-gradient-to-r from-primary via-purple-500 to-orange-500 bg-clip-text text-transparent" data-testid="text-game-name">
              {displayName}
            </h1>
            <p className="text-3xl font-display font-semibold text-foreground">
              Coming Soon!
            </p>
            <p className="text-xl text-muted-foreground max-w-lg mx-auto">
              We're working hard to bring you this exciting game. Stay tuned for updates!
            </p>
          </div>

          <Card className="p-8 space-y-4 bg-gradient-to-br from-primary/5 via-purple-500/5 to-orange-500/5">
            <p className="text-muted-foreground">
              In the meantime, check out our other amazing games:
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Link href="/game/pictionary">
                <Button variant="outline" size="sm" data-testid="button-game-pictionary">
                  Pictionary
                </Button>
              </Link>
              <Link href="/game/charades">
                <Button variant="outline" size="sm" data-testid="button-game-charades">
                  Charades
                </Button>
              </Link>
              <Link href="/game/password">
                <Button variant="outline" size="sm" data-testid="button-game-password">
                  Password
                </Button>
              </Link>
            </div>
          </Card>

          <Link href="/">
            <Button size="lg" data-testid="button-back-home">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
