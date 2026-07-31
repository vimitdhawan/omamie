import type { Tables, TablesInsert, TablesUpdate } from "@/lib/supabase/types";

// Database types from Supabase
export type Property = Tables<"properties">;
export type PropertyInsert = TablesInsert<"properties">;
export type PropertyUpdate = TablesUpdate<"properties">;

// Action result type for server actions
// Note: Success case redirects, so only error case is returned
export type PropertyActionResult = {
  success: false;
  error: string;
};

// Service layer result types
export type CreatePropertyResult = {
  property: Property | null;
  error: string | null;
};

export type GetPropertyResult = {
  property: Property | null;
  error: string | null;
};
