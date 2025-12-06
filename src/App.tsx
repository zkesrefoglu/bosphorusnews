import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Article from "./pages/Article";
import Section from "./pages/Section";
import Tag from "./pages/Tag";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
// TEMPORARILY HIDDEN - Uncomment when payment account is finalized
// import Coffee from "./pages/Coffee";
import Watermark from "./pages/Watermark";
import NotFound from "./pages/NotFound";
import TurkishStars from "./pages/TurkishStars";
import AthleteProfile from "./pages/AthleteProfile";
import AdminTST from "./pages/AdminTST";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/article/:slug" element={<Article />} />
          <Route path="/section/:section" element={<Section />} />
          <Route path="/tag/:slug" element={<Tag />} />
          <Route path="/section/sports/turkish-stars" element={<TurkishStars />} />
          <Route path="/section/sports/turkish-stars/:slug" element={<AthleteProfile />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/tst" element={<AdminTST />} />
          {/* TEMPORARILY HIDDEN - Uncomment when payment account is finalized */}
          {/* <Route path="/coffee" element={<Coffee />} /> */}
          <Route path="/watermark" element={<Watermark />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
