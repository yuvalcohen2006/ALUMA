import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import RouteFallback from "@/components/RouteFallback";
import ErrorBoundary from "@/components/ErrorBoundary";
import { AuthProvider } from "@/hooks/useAuth";
import SiteTracker from "@/components/SiteTracker";
import ScrollToTop from "@/components/ScrollToTop";
import RoutePrefetcher from "@/components/RoutePrefetcher";
import AdminGuard from "@/components/AdminGuard";
import LangShell from "@/components/LangShell";
import { publicRoutes } from "./routes";
import "@/i18n";

const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard.tsx"));
const AdminProjects = lazy(() => import("./pages/admin/AdminProjects.tsx"));
const AdminCollections = lazy(() => import("./pages/admin/AdminCollections.tsx"));
const AdminHero = lazy(() => import("./pages/admin/AdminHero.tsx"));
const AdminBlog = lazy(() => import("./pages/admin/AdminBlog.tsx"));
const AdminLeads = lazy(() => import("./pages/admin/AdminLeads.tsx"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings.tsx"));
const AdminClub = lazy(() => import("./pages/admin/AdminClub.tsx"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders.tsx"));
const AdminTeam = lazy(() => import("./pages/admin/AdminTeam.tsx"));

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <ScrollToTop />
            <RoutePrefetcher />
            <SiteTracker />
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                {/* Admin is Hebrew-only and deliberately outside the language
                    tree — the CMS has one audience and does not need /en. */}
                <Route path="/admin" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
                <Route path="/admin/club" element={<AdminGuard><AdminClub /></AdminGuard>} />
                <Route path="/admin/customers" element={<AdminGuard><Navigate to="/admin/club" replace /></AdminGuard>} />
                <Route path="/admin/orders" element={<AdminGuard><AdminOrders /></AdminGuard>} />
                <Route path="/admin/projects" element={<AdminGuard><AdminProjects /></AdminGuard>} />
                <Route path="/admin/collections" element={<AdminGuard><AdminCollections /></AdminGuard>} />
                <Route path="/admin/hero" element={<AdminGuard><AdminHero /></AdminGuard>} />
                <Route path="/admin/blog" element={<AdminGuard><AdminBlog /></AdminGuard>} />
                <Route path="/admin/leads" element={<AdminGuard><AdminLeads /></AdminGuard>} />
                <Route path="/admin/team" element={<AdminGuard><AdminTeam /></AdminGuard>} />
                <Route path="/admin/settings" element={<AdminGuard><AdminSettings /></AdminGuard>} />

                {/* The same route fragment, mounted once per language. English
                    is prefixed; Hebrew is the default and sits at the root, so
                    every existing URL keeps working unchanged. The English
                    branch must come first — "/en" would otherwise be swallowed
                    by the Hebrew tree's catch-all. */}
                <Route path="/en" element={<LangShell lang="en" />}>
                  {publicRoutes}
                </Route>
                <Route path="/" element={<LangShell lang="he" />}>
                  {publicRoutes}
                </Route>
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
