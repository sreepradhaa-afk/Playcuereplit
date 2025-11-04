import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import Pictionary from "@/pages/pictionary";
import Charades from "@/pages/charades";
import Password from "@/pages/password";
import ComingSoon from "@/pages/coming-soon";
import Feedback from "@/pages/feedback";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/game/pictionary" component={Pictionary} />
      <Route path="/game/charades" component={Charades} />
      <Route path="/game/password" component={Password} />
      <Route path="/game/coming-soon/:gameName" component={ComingSoon} />
      <Route path="/feedback" component={Feedback} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
