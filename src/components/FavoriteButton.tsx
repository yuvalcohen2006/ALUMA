import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  productId: string;
  collectionSlug?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "floating" | "inline";
};

const sizes = {
  sm: { btn: "h-8 w-8", icon: "w-4 h-4" },
  md: { btn: "h-10 w-10", icon: "w-5 h-5" },
  lg: { btn: "h-12 w-12", icon: "w-6 h-6" },
};

const FavoriteButton = ({ productId, collectionSlug, className, size = "md", variant = "floating" }: Props) => {
  const { isFav, toggle } = useFavorites();
  const { user } = useAuth();
  const [openPrompt, setOpenPrompt] = useState(false);
  const active = isFav(productId);
  const s = sizes[size];

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const wasEmpty = !user && !active;
    await toggle(productId, collectionSlug);
    if (wasEmpty) setOpenPrompt(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        aria-label={active ? "הסר מהמועדפים" : "הוסף למועדפים"}
        aria-pressed={active}
        className={cn(
          "inline-flex items-center justify-center rounded-full transition-all",
          variant === "floating"
            ? "bg-background/90 backdrop-blur-sm shadow-soft hover:bg-background hover:scale-110"
            : "border border-border hover:border-accent",
          s.btn,
          className
        )}
      >
        <Heart
          className={cn(
            s.icon,
            "transition-colors",
            active ? "fill-accent text-accent" : "text-primary/60"
          )}
        />
      </button>

      <Dialog open={openPrompt} onOpenChange={setOpenPrompt}>
        <DialogContent dir="rtl" className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-primary">שמור לתמיד</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              המועדף נשמר במכשיר הזה. הצטרפו למועדון אלומה בחינם ותוכלו לראות את המועדפים מכל מכשיר, לצד מעקב ההזמנה שלכם.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button asChild className="w-full">
              <Link to="/club/auth?mode=signup">הצטרפות למועדון</Link>
            </Button>
            <Button asChild variant="ghost" className="w-full" onClick={() => setOpenPrompt(false)}>
              <span>אולי אחר כך</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FavoriteButton;
