import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";

/**
 * What a page shows when the database could not be reached.
 *
 * The point is that this is NOT the empty state and NOT the 404. An empty
 * catalogue says "we sell nothing", a 404 says "this collection does not
 * exist" — and both are lies a visitor has no way to see through, told on the
 * strength of a dropped connection. This says the truth and offers the one
 * action that helps.
 */
const LoadError = ({ onRetry }: { onRetry: () => void }) => {
  const { t } = useTranslation("catalogue");
  return (
    <Layout>
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-5 px-6 text-center">
        <p className="max-w-md text-body leading-relaxed text-muted-foreground">
          {t("loadErrorPage")}
        </p>
        <Button onClick={onRetry} variant="outline" className="rounded-sm px-6 text-body">
          {t("retry")}
        </Button>
      </div>
    </Layout>
  );
};

export default LoadError;
