export interface Favorite {
  id: string;
  tenantId: string;
  propertyId: string;
  createdAt: string;
}

export interface FavoriteWithProperty extends Favorite {
  property: {
    id: string;
    title: string;
    location: string | null;
    monthlyRent: number | null;
  };
}

export interface ToggleFavoriteInput {
  tenantId: string;
  propertyId: string;
}
