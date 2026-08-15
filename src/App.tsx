import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import React, { Suspense } from "react";
const Index = React.lazy(() => import("./pages/Index"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
// 1. Import the new page here
const AddCard = React.lazy(() => import("./pages/AddCard"));
const Lucky = React.lazy(() => import("./pages/Lucky"));
const Gauntlet = React.lazy(() => import("./pages/Gauntlet"));
const Trivia = React.lazy(() => import("./pages/Trivia"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename="/rarity-realm">
        <Suspense fallback={<div className="flex h-screen w-screen items-center justify-center">Loading...</div>}>
          <Routes>
            <Route path="/" element={<Index />} />
            
            {/* 2. Add the route here, above the catch-all */}
            <Route path="/add" element={<AddCard />} />
            <Route path="/lucky" element={<Lucky />} />
            <Route path="/gauntlet" element={<Gauntlet />} />
            <Route path="/trivia" element={<Trivia />} />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;