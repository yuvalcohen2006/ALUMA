import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { projects as staticProjects, type Project } from "@/data/projects";

/**
 * Projects, from the CMS.
 *
 * `site_projects` and its full admin CRUD screen have existed for a while, but
 * nothing public ever read the table — editing a project in the admin panel
 * changed precisely nothing on the site. This is the wire.
 *
 * The static list in src/data/projects.ts stays as the empty-table fallback, so
 * the page never renders bare while the CMS is still empty. Any published row
 * wins over all of it: partial migration isn't a state worth supporting, and
 * mixing real and placeholder projects in one grid is how a placeholder ends up
 * on the live site.
 *
 * The table is thinner than the static shape — it has no year, area, story,
 * scope or materials columns. Those degrade to empty, and every consumer
 * already filters falsy values out of its meta line, so a CMS project simply
 * shows less rather than showing "undefined".
 */
type Row = {
  slug: string;
  title: string;
  location: string | null;
  category: string | null;
  description: string | null;
  cover_url: string | null;
  gallery: unknown;
};

const toProject = (r: Row): Project => ({
  slug: r.slug,
  name: r.title,
  location: r.location ?? "",
  tag: r.category ?? "",
  year: "",
  area: "",
  cover: r.cover_url ?? "",
  gallery: Array.isArray(r.gallery) ? (r.gallery as string[]) : [],
  intro: r.description ?? "",
  story: r.description ? [r.description] : [],
  scope: [],
  materials: [],
});

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>(staticProjects);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase
          .from("site_projects")
          .select("slug, title, location, category, description, cover_url, gallery")
          .eq("published", true)
          .order("sort_order", { ascending: true });
        if (cancelled) return;
        const rows = (data as Row[]) ?? [];
        if (!error && rows.length > 0) setProjects(rows.map(toProject));
      } catch {
        // Offline or blocked: keep the fallback rather than emptying the page.
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { projects, loading };
}

/** Single project by slug, from whichever source `useProjects` settled on. */
export function useProject(slug: string | undefined) {
  const { projects, loading } = useProjects();
  return {
    project: slug ? projects.find((p) => p.slug === slug) : undefined,
    projects,
    loading,
  };
}
