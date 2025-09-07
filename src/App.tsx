import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import LearnPage from "./pages/LearnPage";
import { ProfilePage } from "./pages/ProfilePage";
import CVGeneratorPage from "./pages/CVGeneratorPage";
import { AdminDashboard } from "./pages/AdminDashboard";
import AdminPage from "./pages/AdminPage";
import PaymentTestPage from "./pages/PaymentTestPage";
import PaymentCancelled from "./pages/PaymentCancelled";
import { SubscriptionPlans } from "./components/payment/SubscriptionPlans";
import { PaymentSuccess, PaymentFailed } from "./components/payment/PaymentStatus";
import NotFound from "./pages/NotFound";
import { MarkdownPreview } from "./components/learning/MarkdownPreview";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/learn" element={<LearnPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/cv-generator" element={<CVGeneratorPage />} />
            <Route path="/subscription" element={<SubscriptionPlans />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment-failure" element={<PaymentFailed />} />
            <Route path="/payment-cancelled" element={<PaymentCancelled />} />
            <Route path="/payment-test" element={<PaymentTestPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin-panel" element={<AdminPage />} />
            <Route path="/markdown-preview" element={<MarkdownPreview />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
