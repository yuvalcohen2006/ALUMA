import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import RouteFallback from "@/components/RouteFallback";
import ErrorBoundary from "@/components/ErrorBoundary";
import { AuthProvider } from "@/hooks/useAuth";
import { FavoritesProvider } from "@/hooks/useFavorites";
import SiteTracker from "@/components/SiteTracker";
import ScrollToTop from "@/components/ScrollToTop";
import RoutePrefetcher from "@/components/RoutePrefetcher";
import AdminGuard from "@/components/AdminGuard";

// Code-split secondary routes for faster initial load
const Story = lazy(() => import("./pages/Story.tsx"));
const Collections = lazy(() => import("./pages/Collections.tsx"));
const CollectionDetail = lazy(() => import("./pages/CollectionDetail.tsx"));
const Materials = lazy(() => import("./pages/Materials.tsx"));
const MaterialDetail = lazy(() => import("./pages/MaterialDetail.tsx"));
const Projects = lazy(() => import("./pages/Projects.tsx"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail.tsx"));
const FAQ = lazy(() => import("./pages/FAQ.tsx"));
const Contact = lazy(() => import("./pages/Contact.tsx"));
const AccessibilityPage = lazy(() => import("./pages/Accessibility.tsx"));
const TermsPage = lazy(() => import("./pages/Terms.tsx"));
const PrivacyPage = lazy(() => import("./pages/Privacy.tsx"));
const Auth = lazy(() => import("./pages/Auth.tsx"));
const Account = lazy(() => import("./pages/Account.tsx"));
const Blog = lazy(() => import("./pages/Blog.tsx"));
const BlogPost = lazy(() => import("./pages/BlogPost.tsx"));
const Questionnaire = lazy(() => import("./pages/Questionnaire.tsx"));
const ARPreview = lazy(() => import("./pages/ARPreview.tsx"));
const FabricConfigurator = lazy(() => import("./pages/FabricConfigurator.tsx"));
const SofaDesigner = lazy(() => import("./pages/SofaDesigner.tsx"));
const DIY = lazy(() => import("./pages/DIY.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const ThankYou = lazy(() => import("./pages/ThankYou.tsx"));

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
const Club = lazy(() => import("./pages/Club.tsx"));

const queryClient = new QueryClient();


const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Sonner />
        <AuthProvider>
          <FavoritesProvider>
          <BrowserRouter>
            <ScrollToTop />
            <RoutePrefetcher />
            <SiteTracker />
            <Suspense fallback={<RouteFallback />}>
              <Routes>
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
                <Route path="/" element={<Index />} />
                <Route path="/story" element={<Story />} />
                <Route path="/collections" element={<Collections />} />
                <Route path="/collections/:slug" element={<CollectionDetail />} />
                <Route path="/materials" element={<Materials />} />
                <Route path="/materials/:slug" element={<MaterialDetail />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/projects/:slug" element={<ProjectDetail />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/questionnaire" element={<Questionnaire />} />
                <Route path="/ar" element={<ARPreview />} />
                <Route path="/fabric" element={<FabricConfigurator />} />
                <Route path="/diy" element={<DIY />} />
                <Route path="/designer" element={<SofaDesigner />} />
                <Route path="/club" element={<Club />} />
                <Route path="/club/auth" element={<Auth />} />
                <Route path="/club/dashboard" element={<Account />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/account" element={<Account />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/accessibility" element={<AccessibilityPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/thank-you" element={<ThankYou />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
          </FavoritesProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
