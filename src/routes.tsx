import { lazy } from "react";
import { Navigate, Route, useParams } from "react-router-dom";
import Index from "./pages/Index.tsx";

/**
 * /blog/:slug → /journal/:slug, carrying the slug across.
 *
 * `<Navigate>` cannot interpolate a route param, and these are the site's most
 * linked-to URLs — dropping them all onto the index would lose the article the
 * visitor actually clicked.
 */
const LegacyBlogPostRedirect = () => {
  const { slug } = useParams();
  return <Navigate to={`../journal/${slug}`} replace />;
};

// Code-split secondary routes for faster initial load
const Story = lazy(() => import("./pages/Story.tsx"));
const Collections = lazy(() => import("./pages/Collections.tsx"));
const CollectionDetail = lazy(() => import("./pages/CollectionDetail.tsx"));
const Journal = lazy(() => import("./pages/Journal.tsx"));
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
    <Route path="story" element={<Story />} />
    <Route path="about" element={<Navigate to="../story" replace />} />
    <Route path="collections" element={<Collections />} />
    <Route path="collections/:slug" element={<CollectionDetail />} />
    {/* "שווה לדעת" — materials and the magazine, merged. The material DETAIL
        pages survive as the targets of the journal's materials strip; only the
        old index is retired. */}
    <Route path="journal" element={<Journal />} />
    <Route path="journal/:slug" element={<BlogPost />} />
    <Route path="materials" element={<Navigate to="../journal" replace />} />
    <Route path="materials/:slug" element={<MaterialDetail />} />
    <Route path="blog" element={<Navigate to="../journal" replace />} />
    <Route path="blog/:slug" element={<LegacyBlogPostRedirect />} />
    <Route path="projects" element={<Projects />} />
    <Route path="projects/:slug" element={<ProjectDetail />} />
    <Route path="before-after" element={<Navigate to="../projects" replace />} />
    <Route path="diy" element={<DIY />} />
    <Route path="designer" element={<SofaDesigner />} />
    <Route path="fabric" element={<FabricConfigurator />} />
    <Route path="ar" element={<ARPreview />} />
    <Route path="questionnaire" element={<Questionnaire />} />
    {/* Short-lived nested URLs from the restructure — kept so anything already
        linked still lands somewhere. */}
    <Route path="diy/scene" element={<Navigate to="../designer" replace />} />
    <Route path="diy/fabric" element={<Navigate to="../fabric" replace />} />
    <Route path="diy/ar" element={<Navigate to="../ar" replace />} />
    <Route path="consult" element={<Navigate to="../questionnaire" replace />} />
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
