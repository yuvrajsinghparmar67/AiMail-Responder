export type Tone =
  | "professional"
  | "friendly"
  | "formal"
  | "casual"
  | "apologetic"
  | "sales"
  | "customer_support"
  | "executive";

export type ReplyLength = "short" | "medium" | "long";

export type Language = "english" | "hindi" | "spanish" | "french" | "german";

export interface User {
  id: number;
  email: string;
  full_name: string;
  created_at: string;
}

export interface EmailGeneration {
  id: number;
  incoming_text: string;
  tone: Tone;
  length: ReplyLength;
  language: Language;
  generated_reply: string;
  token_usage: number;
  created_at: string;
}

export interface Draft {
  id: number;
  title: string;
  content: string;
  is_favorite: boolean;
  source_generation_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface Template {
  id: number;
  name: string;
  category: string;
  prompt_text: string;
  created_at: string;
}

export interface AnalyticsSummary {
  total_emails_generated: number;
  total_drafts_saved: number;
  total_token_usage: number;
  daily_usage: { date: string; count: number }[];
}
