import { parseVideoUrl } from "@/lib/video";

type OEmbedData = { title?: unknown; author_name?: unknown; thumbnail_url?: unknown };
export const dynamic = "force-dynamic";

function text(value: unknown, fallback: string, max = 180) {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, max) : fallback;
}

function safeThumbnail(value: unknown, providerKey: "youtube" | "vimeo", id: string) {
  if (typeof value === "string") {
    try {
      const url = new URL(value);
      const allowed = providerKey === "youtube" ? ["i.ytimg.com", "img.youtube.com"] : ["i.vimeocdn.com", "vumbnail.com"];
      if (url.protocol === "https:" && allowed.includes(url.hostname)) return url.toString();
    } catch { /* Use the known provider thumbnail below. */ }
  }
  return providerKey === "youtube" ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : "";
}

export async function GET(request: Request) {
  const input = new URL(request.url).searchParams.get("url") || "";
  const parsed = parseVideoUrl(input);
  if (!parsed) return Response.json({ error: "Поддерживаются прямые ссылки на ролики YouTube и Vimeo." }, { status: 400 });

  const endpoint = parsed.providerKey === "youtube" ? "https://www.youtube.com/oembed" : "https://vimeo.com/api/oembed.json";
  const metadataUrl = new URL(endpoint);
  metadataUrl.searchParams.set("url", parsed.watchUrl);
  if (parsed.providerKey === "youtube") metadataUrl.searchParams.set("format", "json");

  let metadata: OEmbedData = {};
  try {
    const response = await fetch(metadataUrl, {
      headers: { Accept: "application/json", "User-Agent": "BelowTheSurface/1.0" },
      signal: AbortSignal.timeout(7000),
      next: { revalidate: 3600 },
    });
    if (response.ok) metadata = await response.json() as OEmbedData;
  } catch {
    // Metadata is optional: a valid, safely parsed video can still be embedded.
  }

  return Response.json({
    provider: parsed.provider,
    providerKey: parsed.providerKey,
    id: parsed.id,
    title: text(metadata.title, `Видео артиста · ${parsed.provider}`),
    authorName: text(metadata.author_name, ""),
    thumbnailUrl: safeThumbnail(metadata.thumbnail_url, parsed.providerKey, parsed.id),
    watchUrl: parsed.watchUrl,
    embedUrl: parsed.embedUrl,
  }, { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } });
}
