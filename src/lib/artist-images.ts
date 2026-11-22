export type ArtistPhotoField = "imageUrl" | "secondaryImageUrl" | "profileImageUrl";
export type ArtistPhotoVariant = "primary" | "secondary" | "profile";

const variantByField: Record<ArtistPhotoField, ArtistPhotoVariant> = {
  imageUrl: "primary",
  secondaryImageUrl: "secondary",
  profileImageUrl: "profile",
};
const fieldByVariant: Record<ArtistPhotoVariant, ArtistPhotoField> = {
  primary: "imageUrl",
  secondary: "secondaryImageUrl",
  profile: "profileImageUrl",
};

export function artistPhotoPath(id: number, field: ArtistPhotoField) {
  return `/api/artists/${id}/image?variant=${variantByField[field]}`;
}

export function photoFieldForVariant(variant: string | null): ArtistPhotoField {
  if (variant === "secondary") return fieldByVariant.secondary;
  if (variant === "profile") return fieldByVariant.profile;
  return fieldByVariant.primary;
}

export function parseArtistPhotoPath(value: string): { id: number; field: ArtistPhotoField } | null {
  const match = value.match(/^\/api\/artists\/(\d+)\/image(?:\?variant=(primary|secondary|profile))?$/);
  if (!match) return null;
  const id = Number(match[1]);
  if (!Number.isSafeInteger(id) || id < 1) return null;
  const variant = (match[2] || "primary") as ArtistPhotoVariant;
  return { id, field: fieldByVariant[variant] };
}
