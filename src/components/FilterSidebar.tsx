import { useState } from "react";
import { Check, SlidersHorizontal } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { FilterValue } from "@/hooks/useFilterParams";

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterGroup {
  /** URL param key, e.g. "cat". */
  key: string;
  label: string;
  options: FilterOption[];
}

interface FilterSidebarProps {
  groups: FilterGroup[];
  value: FilterValue;
  onChange: (next: FilterValue) => void;
  activeCount: number;
  /** How many items the current selection leaves on the page. */
  resultCount: number;
}

/**
 * One drawer for every page that filters. Groups are passed in as data and
 * derived from whatever the page loaded, so a new filter dimension is a config
 * change rather than a new component. Selections are OR within a group and AND
 * across groups — the shape people expect from a shop filter.
 */
const FilterSidebar = ({
  groups,
  value,
  onChange,
  activeCount,
  resultCount,
}: FilterSidebarProps) => {
  const [open, setOpen] = useState(false);
  const usable = groups.filter((g) => g.options.length > 0);

  if (usable.length === 0) return null;

  const toggle = (groupKey: string, option: string) => {
    const current = value[groupKey] ?? [];
    onChange({
      ...value,
      [groupKey]: current.includes(option)
        ? current.filter((v) => v !== option)
        : [...current, option],
    });
  };

  const clearAll = () =>
    onChange(Object.fromEntries(usable.map((g) => [g.key, []])));

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="inline-flex items-center gap-2 h-11 px-5 rounded-sm border border-foreground/15 text-primary hover:bg-primary hover:text-primary-foreground transition-smooth text-body">
        <SlidersHorizontal className="w-4 h-4" />
        <span>סינון</span>
        {activeCount > 0 && (
          <span className="inline-flex items-center justify-center min-w-6 h-6 px-2 rounded-full bg-primary text-primary-foreground text-body">
            {activeCount}
          </span>
        )}
      </SheetTrigger>

      {/* Right, matching the trigger's position in the page hero. */}
      <SheetContent side="right" aria-describedby={undefined}>
        <div className="px-6 pt-6 pb-5 border-b border-border text-start">
          <SheetTitle>סינון</SheetTitle>
          <SheetDescription className="mt-1">
            בחרו מה להציג במסך
          </SheetDescription>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 text-start">
          {usable.map((group) => (
            <div key={group.key}>
              <h3 className="font-display text-lg text-foreground mb-3">
                {group.label}
              </h3>
              <ul className="space-y-1">
                {group.options.map((option) => {
                  const checked = (value[group.key] ?? []).includes(option.value);
                  return (
                    <li key={option.value}>
                      <button
                        type="button"
                        onClick={() => toggle(group.key, option.value)}
                        aria-pressed={checked}
                        className="w-full flex items-center justify-between gap-3 py-2 text-start transition-smooth group"
                      >
                        <span className="flex items-center gap-3">
                          <span
                            className={`flex items-center justify-center w-[18px] h-[18px] rounded-sm border transition-smooth ${
                              checked
                                ? "bg-primary border-primary text-primary-foreground"
                                : "border-foreground/15 group-hover:border-primary"
                            }`}
                          >
                            {checked && <Check className="w-3 h-3" strokeWidth={3} />}
                          </span>
                          <span
                            className={`text-body transition-smooth ${
                              checked ? "text-foreground" : "text-foreground-soft group-hover:text-foreground"
                            }`}
                          >
                            {option.label}
                          </span>
                        </span>
                        {option.count !== undefined && (
                          <span className="text-body text-muted-foreground tabular-nums">
                            {option.count}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="px-6 py-5 border-t border-border flex items-center gap-3">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex-1 h-11 rounded-sm bg-primary text-primary-foreground text-body hover:opacity-90 transition-smooth"
          >
            הצג {resultCount} תוצאות
          </button>
          <button
            type="button"
            onClick={clearAll}
            disabled={activeCount === 0}
            className="h-11 px-4 text-body text-foreground-soft hover:text-primary transition-smooth disabled:opacity-40 disabled:hover:text-foreground-soft"
          >
            נקה הכל
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default FilterSidebar;
