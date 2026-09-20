import {
  listFavoritesByTenantId,
  listFavoritedPropertyIds,
  isFavorited,
  addFavorite,
  removeFavorite,
} from "./repository";
import type {
  Favorite,
  FavoriteWithProperty,
  ToggleFavoriteInput,
} from "./types";

export type ToggleFavoriteResult = {
  favorited: boolean;
};

/**
 * Toggles a tenant's favorite on a property: adds it if not favorited, removes it otherwise.
 */
export async function toggleFavorite(
  input: ToggleFavoriteInput
): Promise<ToggleFavoriteResult> {
  const alreadyFavorited = await isFavorited(input.tenantId, input.propertyId);

  if (alreadyFavorited) {
    await removeFavorite(input.tenantId, input.propertyId);
    return { favorited: false };
  }

  await addFavorite(input.tenantId, input.propertyId);
  return { favorited: true };
}

export async function listFavorites(
  tenantId: string
): Promise<FavoriteWithProperty[]> {
  return listFavoritesByTenantId(tenantId);
}

export async function listFavoritedIds(tenantId: string): Promise<string[]> {
  return listFavoritedPropertyIds(tenantId);
}

export type { Favorite };
