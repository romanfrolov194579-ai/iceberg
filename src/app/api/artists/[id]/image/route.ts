import { db } from "@/db";
import { artists } from "@/db/schema";
import { photoFieldForVariant } from "@/lib/artist-images";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: Context) {
  const id = Number((await context.params).id);
  if (!Number.isSafeInteger(id) || id < 1) return new Response(null, { status: 404 });
  try {
    const photoField = photoFieldForVariant(new URL(request.url).searchParams.get("variant"));
    const [artist] = await db.select({ imageData: artists[photoField] }).from(artists).where(eq(artists.id, id)).limit(1);
    if (!artist?.imageData) return new Response(null, { status: 404 });
    const match = artist.imageData.match(/^data:image\/(png|jpeg|webp);base64,([a-z0-9+/]+=*)$/i);
    if (!match) return new Response(null, { status: 404 });
    const bytes = Buffer.from(match[2], "base64");
    return new Response(bytes, {
      headers: {
        "Content-Type": `image/${match[1].toLowerCase()}`,
        "Content-Length": String(bytes.length),
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response(null, { status: 500 });
  }
}
