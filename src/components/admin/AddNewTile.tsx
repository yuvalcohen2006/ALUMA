import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * The way to start something new, as a place rather than a button.
 *
 * A dashed square reads as an empty slot waiting to be filled, which is what
 * it is — and it sits in the same grid as the things it creates, so adding one
 * more is the same shape of gesture as opening one that exists.
 *
 * The label sits above the plus: read the what, then see the how.
 */
const AddNewTile = ({
  to,
  label,
  onClick,
}: {
  to?: string;
  label: string;
  onClick?: () => void;
}) => {
  const inner = (
    <>
      <span className="text-sm font-medium text-foreground/70 transition-colors group-hover:text-foreground">
        {label}
      </span>
      <span
        aria-hidden="true"
        className="mt-2.5 grid h-10 w-10 place-items-center rounded-sm border border-transparent text-foreground/35 transition-all duration-200 group-hover:border-foreground/15 group-hover:bg-background group-hover:text-foreground"
      >
        <Plus className="h-5 w-5" strokeWidth={1.5} />
      </span>
    </>
  );

  /* The dash tightens and the ground lifts on hover — the slot filling in
     slightly, rather than a colour change announcing itself. */
  const className =
    "group flex min-h-[7.5rem] w-full flex-col items-center justify-center rounded-sm " +
    "border-2 border-dashed border-border p-5 text-center transition-all duration-200 " +
    "hover:border-foreground/30 hover:bg-secondary " +
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

  if (to) {
    return (
      <Link to={to} className={className}>
        {inner}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {inner}
    </button>
  );
};

export default AddNewTile;
