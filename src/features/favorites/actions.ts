"use server";

import { getAuthSession } from "@/lib/auth-session";
import { redirect } from "next/navigation";
import * as service from "./service";
import { toggleFavoriteSchema } from "./schema";

export async function toggleFavoriteAction(propertyId: string) {
  const session = await getAuthSession();
  if (!session?.profileId || session.role !== "tenant") {
    redirect("/login");
  }

  const input = toggleFavoriteSchema.parse({
    tenantId: session.profileId,
    propertyId,
  });

  return service.toggleFavorite(input);
}

export async function listFavoritesAction() {
  const session = await getAuthSession();
  if (!session?.profileId || session.role !== "tenant") {
    redirect("/login");
  }

  return service.listFavorites(session.profileId);
}

export async function listFavoritedIdsAction() {
  const session = await getAuthSession();
  if (!session?.profileId || session.role !== "tenant") {
    redirect("/login");
  }

  return service.listFavoritedIds(session.profileId);
}
