import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

/**
 * The pieces the catalogue screens share.
 *
 * Product editing moved out of a modal and onto its own page, which left the
 * type, the slug maker and the two buffered fields needed in two places. They
 * live here rather than being imported out of a thousand-line screen.
 */

export type Product = {
  id: string;
  collection_id: string;
  slug: string;
  name: string;
  name_en: string | null;
  emblem: string | null;
  tag: string | null;
  tagline: string | null;
  description: any;
  highlights: any;
  materials: any;
  dimensions: string | null;
  cover_url: string | null;
  gallery: any;
  price: number | null;
  price_note: string | null;
  /** Units left, or null when the owner is not counting this piece. */
  stock: number | null;
  sort_order: number;
  published: boolean;
};


export function BufferedTextarea({
  id,
  initial,
  onCommit,
  rows = 4,
  placeholder,
}: {
  /** So a <Label htmlFor> can actually reach it. */
  id?: string;
  initial: string;
  onCommit: (raw: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  const [val, setVal] = useState(initial);
  const lastInitial = useRef(initial);
  useEffect(() => {
    if (initial !== lastInitial.current) {
      lastInitial.current = initial;
      setVal(initial);
    }
  }, [initial]);
  return (
    <Textarea
      id={id}
      rows={rows}
      value={val}
      placeholder={placeholder}
      onChange={(e) => setVal(e.target.value)}
      onBlur={() => onCommit(val)}
    />
  );
}

export function BufferedInput({
  id,
  initial,
  onCommit,
  placeholder,
}: {
  id?: string;
  initial: string;
  onCommit: (raw: string) => void;
  placeholder?: string;
}) {
  const [val, setVal] = useState(initial);
  const lastInitial = useRef(initial);
  useEffect(() => {
    if (initial !== lastInitial.current) {
      lastInitial.current = initial;
      setVal(initial);
    }
  }, [initial]);
  return (
    <Input
      id={id}
      value={val}
      placeholder={placeholder}
      onChange={(e) => setVal(e.target.value)}
      onBlur={() => onCommit(val)}
    />
  );
}

/* ---- Hebrew → Latin transliteration for clean URLs ---- */

const HE_MAP: Record<string, string> = {
  א: "a", ב: "b", ג: "g", ד: "d", ה: "h", ו: "v", ז: "z", ח: "ch",
  ט: "t", י: "y", כ: "k", ך: "k", ל: "l", מ: "m", ם: "m", נ: "n",
  ן: "n", ס: "s", ע: "a", פ: "p", ף: "f", צ: "tz", ץ: "tz", ק: "k",
  ר: "r", ש: "sh", ת: "t",
};

const transliterate = (input: string) =>
  Array.from(input)
    .map((ch) => HE_MAP[ch] ?? ch)
    .join("");

export const slugify = (s: string) => {
  const base = transliterate((s || "").trim().toLowerCase());
  return base
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
};


export const emptyProduct: Partial<Product> = {
  name: "",
  name_en: "",
  emblem: null,
  tag: "",
  tagline: "",
  description: [],
  highlights: [],
  materials: [],
  dimensions: "",
  cover_url: "",
  gallery: [],
  price: null,
  price_note: "",
  sort_order: 0,
  published: true,
};

