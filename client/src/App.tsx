import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import SavedTimetables from "@/pages/saved-timetables";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/saved" component={SavedTimetables} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow">
          <Router />
        </div>
        <Footer />
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
