import type { Language, ReplyLength, Tone } from "@/lib/types";

export const TONE_OPTIONS: { value: Tone; label: string }[] = [
  { value: "professional", label: "Professional" },
  { value: "friendly", label: "Friendly" },
  { value: "formal", label: "Formal" },
  { value: "casual", label: "Casual" },
  { value: "apologetic", label: "Apologetic" },
  { value: "sales", label: "Sales" },
  { value: "customer_support", label: "Customer Support" },
  { value: "executive", label: "Executive" },
];

export const TONE_LABELS: Record<string, string> = Object.fromEntries(
  TONE_OPTIONS.map((t) => [t.value, t.label])
);

export const LENGTH_OPTIONS: { value: ReplyLength; label: string }[] = [
  { value: "short", label: "Short" },
  { value: "medium", label: "Medium" },
  { value: "long", label: "Long" },
];

export const LANGUAGE_OPTIONS: { value: Language; label: string }[] = [
  { value: "english", label: "English" },
  { value: "hindi", label: "Hindi" },
  { value: "spanish", label: "Spanish" },
  { value: "french", label: "French" },
  { value: "german", label: "German" },
];
