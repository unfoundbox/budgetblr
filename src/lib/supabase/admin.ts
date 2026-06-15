import { createClient as createSb } from "@supabase/supabase-js";

/**
 * Service-role client. Server-only — bypasses RLS. Never import into a Client
 * Component. Used by the moderation actions, which are themselves token-gated.
 */
export function createAdminClient() {
  return createSb(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
