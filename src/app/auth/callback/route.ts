import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";

const OAUTH_ROLES = new Set(["agent", "owner"]);

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const role = searchParams.get("role");
  const next = searchParams.get("next") ?? "/";

  if (!code) {
    return NextResponse.redirect(`${origin}/signup?error=oauth_failed`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/signup?error=oauth_failed`);
  }

  // Google OAuth signups have no way to carry a `role` through Supabase's
  // metadata (unlike password signUp's options.data), so the DB trigger
  // always defaults new profiles to 'tenant'. Promote to agent/owner here
  // when the user picked one via RoleStep before starting the OAuth redirect.
  if (role && OAUTH_ROLES.has(role)) {
    const serviceClient = createServiceRoleClient();
    await serviceClient
      .from("profiles")
      .update({ role })
      .eq("id", data.user.id)
      .eq("role", "tenant");
  }

  return NextResponse.redirect(`${origin}${next}`);
}
