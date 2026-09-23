import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";

const Index = lazy(() => import("./pages/Index"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const CVMate = lazy(() => import("./pages/CVMate"));
const CVMateDashboard = lazy(() => import("./pages/CVMateDashboard"));
const DocumentBuilder = lazy(() => import("./pages/DocumentBuilder"));
const JobMate = lazy(() => import("./pages/JobMate"));
const InterviewMate = lazy(() => import("./pages/InterviewMate"));
const Login = lazy(() => import("./pages/Login"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<div className="min-h-screen bg-background" aria-label="Loading page" />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/cvmate" element={<CVMate />} />
                <Route path="/cvmate/dashboard" element={<CVMateDashboard />} />
                <Route path="/cvmate/generate" element={<DocumentBuilder />} />
                <Route path="/jobmate" element={<JobMate />} />
                <Route path="/interviewmate" element={<InterviewMate />} />
                <Route path="/login" element={<Login />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
