// Sunbrella fabric library — שמות אמיתיים מהמניפה של Sunbrella.
// הצבעים הם קירוב חזותי לתצוגה מקדימה; הגוון הסופי תמיד נקבע מול הדגימה הפיזית.

export type SunbrellaFabric = {
  code: string;
  name: string;
  nameHe: string;
  family: "Canvas" | "Heritage" | "Patterns";
  // CSS background — אפשר צבע אחיד או gradient לדמות מרקם/פס
  background: string;
  // צבע ההצללה שמוכפל מעל הספה הבסיסית בתצוגה המקדימה
  overlay: string;
  notes?: string;
};

export const sunbrellaFabrics: SunbrellaFabric[] = [
  // ===== CANVAS — צבעי בסיס אחידים =====
  {
    code: "5422-0000",
    name: "Canvas Natural",
    nameHe: "קנבס נטורל",
    family: "Canvas",
    background: "#e5dcc4",
    overlay: "#e5dcc4",
  },
  {
    code: "5476-0000",
    name: "Canvas Heather Beige",
    nameHe: "קנבס הית׳ר בז׳",
    family: "Canvas",
    background: "#cdbf9f",
    overlay: "#cdbf9f",
  },
  {
    code: "5422-0000B",
    name: "Canvas Antique Beige",
    nameHe: "קנבס בז׳ עתיק",
    family: "Canvas",
    background: "#d2c19b",
    overlay: "#d2c19b",
  },
  {
    code: "5402-0000",
    name: "Canvas Taupe",
    nameHe: "קנבס טאופ",
    family: "Canvas",
    background: "#9a8773",
    overlay: "#9a8773",
  },
  {
    code: "5489-0000",
    name: "Canvas Charcoal",
    nameHe: "קנבס פחם",
    family: "Canvas",
    background: "#4a4a4a",
    overlay: "#5b5b5b",
  },
  {
    code: "5408-0000",
    name: "Canvas Black",
    nameHe: "קנבס שחור",
    family: "Canvas",
    background: "#1f1f1f",
    overlay: "#2a2a2a",
  },
  {
    code: "5439-0000",
    name: "Canvas Navy",
    nameHe: "קנבס כחול נייבי",
    family: "Canvas",
    background: "#1f3553",
    overlay: "#2a3f5d",
  },
  {
    code: "5446-0000",
    name: "Canvas Forest Green",
    nameHe: "קנבס ירוק יער",
    family: "Canvas",
    background: "#2f4a36",
    overlay: "#3a553f",
  },
  {
    code: "5403-0000",
    name: "Canvas Terracotta",
    nameHe: "קנבס טרקוטה",
    family: "Canvas",
    background: "#b25a3e",
    overlay: "#b25a3e",
  },

  // ===== HERITAGE — מרקם עדין =====
  {
    code: "18012-0000",
    name: "Heritage Granite",
    nameHe: "הריטג׳ גרניט",
    family: "Heritage",
    background:
      "repeating-linear-gradient(45deg,#9b9892 0 2px,#86837e 2px 4px)",
    overlay: "#8e8b86",
  },
  {
    code: "18004-0000",
    name: "Heritage Char",
    nameHe: "הריטג׳ פחם",
    family: "Heritage",
    background:
      "repeating-linear-gradient(45deg,#4d4a47 0 2px,#3b3936 2px 4px)",
    overlay: "#454340",
  },
  {
    code: "18006-0000",
    name: "Heritage Moss",
    nameHe: "הריטג׳ אזוב",
    family: "Heritage",
    background:
      "repeating-linear-gradient(45deg,#6f7a5a 0 2px,#5d6849 2px 4px)",
    overlay: "#69734f",
  },

  // ===== PATTERNS — דוגמאות ופסים =====
  {
    code: "56000-0000",
    name: "Milano Char",
    nameHe: "מילאנו פחם",
    family: "Patterns",
    background:
      "repeating-linear-gradient(0deg,#3a3a3a 0 6px,#5a5a5a 6px 8px,#3a3a3a 8px 14px)",
    overlay: "#454545",
  },
  {
    code: "58040-0000",
    name: "Gateway Mist",
    nameHe: "גייטוויי מיסט",
    family: "Patterns",
    background:
      "repeating-linear-gradient(90deg,#cfd1cb 0 8px,#a8aba2 8px 10px)",
    overlay: "#b8bab2",
  },
  {
    code: "56094-0000",
    name: "Cabana Regatta",
    nameHe: "קבנה רגאטה",
    family: "Patterns",
    background:
      "repeating-linear-gradient(90deg,#23476b 0 14px,#f3ede0 14px 18px)",
    overlay: "#3a5a7a",
  },
  {
    code: "58028-0000",
    name: "Dimone Sequoia",
    nameHe: "דימון סקוויה",
    family: "Patterns",
    background:
      "repeating-linear-gradient(45deg,#7a3a2a 0 6px,#5e2c20 6px 12px)",
    overlay: "#6b3225",
  },
];

export const families = ["Canvas", "Heritage", "Patterns"] as const;
