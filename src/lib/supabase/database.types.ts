// Placeholder types - regenerate with: npx supabase gen types typescript --local
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      contact_messages: unknown;
      profiles: unknown;
      properties: unknown;
      property_find_requests: unknown;
      property_matches: unknown;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
