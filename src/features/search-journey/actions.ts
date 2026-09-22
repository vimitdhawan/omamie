"use server";

import { getAuthSession } from "@/lib/auth-session";
import { redirect } from "next/navigation";
import * as service from "./service";
import type { TenantJourney } from "./types";

export async function getTenantJourneyAction(): Promise<TenantJourney> {
  const session = await getAuthSession();
  if (!session?.profileId || session.role !== "tenant") {
    redirect("/login");
  }

  return service.getTenantJourney(session.profileId);
}
