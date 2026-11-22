export type ParsedVideo = {
  provider: "YouTube" | "Vimeo";
  providerKey: "youtube" | "vimeo";
  id: string;
  watchUrl: string;
  embedUrl: string;
};

/** Accepts only first-party video URLs and returns a safe, canonical embed. */
export function parseVideoUrl(value: string): ParsedVideo | null {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  const hostname = url.hostname.toLowerCase().replace(/^www\./, "");

  if (["youtube.com", "m.youtube.com", "music.youtube.com", "youtube-nocookie.com"].includes(hostname) || hostname === "youtu.be") {
    let id = "";
    if (hostname === "youtu.be") id = url.pathname.split("/").filter(Boolean)[0] || "";
    else id = url.searchParams.get("v") || url.pathname.match(/^\/(?:embed|shorts|live|v)\/([^/?]+)/)?.[1] || "";
    if (!/^[a-zA-Z0-9_-]{11}$/.test(id)) return null;
    return { provider: "YouTube", providerKey: "youtube", id, watchUrl: `https://www.youtube.com/watch?v=${id}`, embedUrl: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0` };
  }

  if (["vimeo.com", "player.vimeo.com"].includes(hostname)) {
    const id = url.pathname.match(/(?:video\/)?(\d{6,12})(?:$|\/)/)?.[1] || "";
    if (!id) return null;
    return { provider: "Vimeo", providerKey: "vimeo", id, watchUrl: `https://vimeo.com/${id}`, embedUrl: `https://player.vimeo.com/video/${id}?autoplay=1&dnt=1` };
  }

  return null;
}
