import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { CompareProvider } from "@/context/CompareContext";
import { CompareBar } from "@/components/compare/CompareBar";
import Index from "./pages/Index";
import PhonesPage from "./pages/PhonesPage";
import PhoneDetailPage from "./pages/PhoneDetailPage";
import CartPage from "./pages/CartPage";
import ComparePage from "./pages/ComparePage";
import HowItWorksPage from "./pages/HowItWorksPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CartProvider>
        <CompareProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/phones" element={<PhonesPage />} />
              <Route path="/phones/:id" element={<PhoneDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/compare" element={<ComparePage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <CompareBar />
          </BrowserRouter>
        </CompareProvider>
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
