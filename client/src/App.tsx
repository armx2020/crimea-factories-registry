import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme-provider";
import Home from "@/pages/Home";
import Networks from "@/pages/Networks";
import NotFound from "@/pages/not-found";
import { Button } from "@/components/ui/button";

function Navigation() {
  const [location] = useLocation();

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center gap-1 sm:gap-2 py-2 sm:py-3">
          <Link href="/">
            <Button
              variant={location === "/" ? "default" : "ghost"}
              size="sm"
              data-testid="nav-factories"
              className="text-xs sm:text-sm"
            >
              Заводы
            </Button>
          </Link>
          <Link href="/networks">
            <Button
              variant={location === "/networks" ? "default" : "ghost"}
              size="sm"
              data-testid="nav-networks"
              className="text-xs sm:text-sm"
            >
              Сети
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}

function Router() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <Navigation />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/networks" component={Networks} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
