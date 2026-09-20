"use client";

import { useState } from "react";
import { Check, Link2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function CopyLinkButton() {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy the link");
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      className="w-full justify-start gap-2"
      onClick={copyLink}
    >
      {copied ? <Check className="size-4" /> : <Link2 className="size-4" />}
      Copy Link
    </Button>
  );
}
