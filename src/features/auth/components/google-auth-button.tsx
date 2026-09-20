"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export interface GoogleAuthButtonProps {
  role: "tenant" | "agent" | "owner";
}

export function GoogleAuthButton({ role }: GoogleAuthButtonProps) {
  const [isPending, setIsPending] = useState(false);

  const handleClick = async () => {
    setIsPending(true);
    const supabase = createClient();
    const redirectTo = new URL("/auth/callback", window.location.origin);
    if (role !== "tenant") {
      redirectTo.searchParams.set("role", role);
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectTo.toString() },
    });

    if (error) {
      toast.error("Could not continue with Google. Please try again.");
      setIsPending(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full cursor-pointer"
      onClick={handleClick}
      disabled={isPending}
    >
      {isPending ? "Redirecting..." : "Continue with Google"}
    </Button>
  );
}
