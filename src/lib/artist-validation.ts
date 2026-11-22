import type { ArtistInput } from "@/lib/iceberg";
import { parseVideoUrl } from "@/lib/video";
import { parseArtistPhotoPath, type ArtistPhotoField } from "@/lib/artist-images";

export function parseArtistInput(value: unknown): { data: ArtistInput } | { error: string } {
  if (!value || typeof value !== "object") return { error: "Неверные данные артиста." };
  const input = value as Record<string, unknown>;
  const readText = (key: string, max: number) => typeof input[key] === "string" ? (input[key] as string).trim().slice(0, max) : "";
  const name = readText("name", 120);
  if (!name) return { error: "Укажите имя артиста." };

  const numberKeys = ["followers", "monthlyListeners", "totalPlays", "telegramFollowers", "tiktokFollowers", "instagramFollowers", "influence"] as const;
  const numbers = {} as Record<(typeof numberKeys)[number], number>;
  for (const key of numberKeys) {
    const raw = input[key];
    const number = typeof raw === "number" ? raw : typeof raw === "string" && raw.trim() ? Number(raw) : 0;
    const maximum = key === "influence" ? 100 : 1_000_000_000_000;
    if (!Number.isSafeInteger(number) || number < 0 || number > maximum) {
      return { error: key === "influence" ? "Влияние должно быть числом от 0 до 100." : "Показатели должны быть положительными целыми числами." };
    }
    numbers[key] = number;
  }

  const urlKeys = ["soundcloudUrl", "spotifyUrl", "youtubeUrl", "appleMusicUrl", "videoUrl"] as const;
  const urls = {} as Record<(typeof urlKeys)[number], string>;
  for (const key of urlKeys) {
    const url = readText(key, 2048);
    if (url) {
      try {
        const parsed = new URL(url);
        if (!["https:", "http:"].includes(parsed.protocol)) throw new Error("Invalid protocol");
      } catch {
        return { error: "Ссылки должны начинаться с https:// или http://." };
      }
    }
    if (key === "videoUrl" && url && !parseVideoUrl(url)) return { error: "Укажите ссылку на ролик YouTube или Vimeo." };
    urls[key] = url;
  }

  const photoFields: ArtistPhotoField[] = ["imageUrl", "secondaryImageUrl", "profileImageUrl"];
  const photos = {} as Record<ArtistPhotoField, string>;
  for (const key of photoFields) {
    const photo = typeof input[key] === "string" ? input[key].trim() : "";
    if (photo.length > 1_100_000) return { error: "Каждая фотография должна быть меньше 800 КБ." };
    if (photo.startsWith("data:")) {
      if (!/^data:image\/(png|jpeg|webp);base64,[a-z0-9+/]+={0,2}$/i.test(photo)) return { error: "Фото должно быть в формате JPG, PNG или WebP." };
      if (Buffer.byteLength(photo.split(",", 2)[1] || "", "base64") > 800 * 1024) return { error: "Каждая фотография должна быть меньше 800 КБ." };
    } else if (photo && !parseArtistPhotoPath(photo)) {
      try {
        const parsed = new URL(photo);
        if (!["https:", "http:"].includes(parsed.protocol)) throw new Error("Invalid protocol");
      } catch {
        return { error: "Ссылка на фото должна начинаться с https:// или http://." };
      }
    }
    photos[key] = photo;
  }

  const booleans = {
    hasPerformed: input.hasPerformed === true,
    hasBeenOnTour: input.hasBeenOnTour === true,
    siteSupport: input.siteSupport === true,
  };

  return { data: { name, description: readText("description", 500), genre: readText("genre", 120), origin: readText("origin", 120), ...numbers, ...booleans, ...urls, ...photos } };
}
