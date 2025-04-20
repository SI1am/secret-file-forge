
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import RequireAuth from "@/components/auth/RequireAuth";
import React from "react";

// Pages
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import VaultLayout from "@/components/layout/VaultLayout";
import Dashboard from "@/pages/Dashboard";
import WatermarkPage from "@/pages/WatermarkPage";
import DataMaskingPage from "@/pages/DataMaskingPage";
import FileView from "@/pages/FileView";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";

// Create a new QueryClient instance outside of the component
const queryClient = new QueryClient();

const App = () => {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Protected routes */}
                <Route path="/vault" element={
                  <RequireAuth>
                    <VaultLayout />
                  </RequireAuth>
                }>
                  <Route index element={<Dashboard />} />
                  <Route path="file/:id" element={<FileView />} />
                  <Route path="watermark/:id" element={<WatermarkPage />} />
                  <Route path="mask/:id" element={<DataMaskingPage />} />
                  <Route path="settings" element={<Settings />} />
                </Route>
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;
