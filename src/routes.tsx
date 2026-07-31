import { lazy } from "react";
import { Navigate, Route } from "react-router-dom";
import Index from "./pages/Index.tsx";

// Code-split secondary routes for faster initial load
const About = lazy(() => import("./pages/About.tsx"));
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
const Club = lazy(() => import("./pages/Club.tsx"));
const ThankYou = lazy(() => import("./pages/ThankYou.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

/**
 * Every public route, as RELATIVE paths.
 *
 * Relative on purpose: this same fragment is mounted twice in App.tsx — once
 * under "/" for Hebrew and once under "/en" for English — so the language
 * prefix must not be baked in here. A leading slash would make both copies
 * resolve to the same absolute URLs and the English tree would never match.
 *
 * The index route is `path=""`. Admin routes are NOT here: the CMS is Hebrew
 * only and lives outside the language tree.
 */
export const publicRoutes = (
  <>
    <Route path="" element={<Index />} />
    <Route path="about" element={<About />} />
    {/* Renamed from "our story". The old URL is indexed, so it redirects here
        in-app as well as at the edge (public/_redirects). */}
    <Route path="story" element={<Navigate to="../about" replace />} />
    <Route path="collections" element={<Collections />} />
    <Route path="collections/:slug" element={<CollectionDetail />} />
    <Route path="materials" element={<Materials />} />
    <Route path="materials/:slug" element={<MaterialDetail />} />
    <Route path="projects" element={<Projects />} />
    <Route path="projects/:slug" element={<ProjectDetail />} />
    <Route path="before-after" element={<Navigate to="../projects" replace />} />
    <Route path="blog" element={<Blog />} />
    <Route path="blog/:slug" element={<BlogPost />} />
    <Route path="questionnaire" element={<Questionnaire />} />
    <Route path="ar" element={<ARPreview />} />
    <Route path="fabric" element={<FabricConfigurator />} />
    <Route path="diy" element={<DIY />} />
    <Route path="designer" element={<SofaDesigner />} />
    <Route path="club" element={<Club />} />
    <Route path="club/auth" element={<Auth />} />
    <Route path="club/dashboard" element={<Account />} />
    {/* Legacy aliases — one page, one canonical URL. */}
    <Route path="auth" element={<Navigate to="../club/auth" replace />} />
    <Route path="account" element={<Navigate to="../club/dashboard" replace />} />
    <Route path="faq" element={<FAQ />} />
    <Route path="contact" element={<Contact />} />
    <Route path="accessibility" element={<AccessibilityPage />} />
    <Route path="terms" element={<TermsPage />} />
    <Route path="privacy" element={<PrivacyPage />} />
    <Route path="thank-you" element={<ThankYou />} />
    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
    <Route path="*" element={<NotFound />} />
  </>
);
