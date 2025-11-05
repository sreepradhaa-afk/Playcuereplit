import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import Pictionary from "@/pages/pictionary";
import Charades from "@/pages/charades";
import Password from "@/pages/password";
import Taboo from "@/pages/taboo";
import Colordle from "@/pages/colordle";
import Numble from "@/pages/numble";
import Blankslate from "@/pages/blankslate";
import Imposter from "@/pages/imposter";
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
      <Route path="/game/taboo" component={Taboo} />
      <Route path="/game/colordle" component={Colordle} />
      <Route path="/game/numble" component={Numble} />
      <Route path="/game/blankslate" component={Blankslate} />
      <Route path="/game/imposter" component={Imposter} />
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
