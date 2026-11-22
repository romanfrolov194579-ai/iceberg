import { db } from "@/db";
import { artists } from "@/db/schema";
import { isAdminAuthorized } from "@/lib/admin-auth";
import { ensureSeeded, getArtists } from "@/lib/artists";
import { parseArtistInput } from "@/lib/artist-validation";
import { calculateScore } from "@/lib/iceberg";
import { artistPhotoPath, parseArtistPhotoPath, type ArtistPhotoField } from "@/lib/artist-images";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return Response.json({ artists: await getArtists() });
  } catch {
    return Response.json({ error: "Не удалось загрузить артистов." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await isAdminAuthorized(request))) return Response.json({ error: "Требуется авторизация внешней админки." }, { status: 401 });
  try {
    const parsed = parseArtistInput(await request.json());
    if ("error" in parsed) return Response.json({ error: parsed.error }, { status: 400 });
    const photoFields: ArtistPhotoField[] = ["imageUrl", "secondaryImageUrl", "profileImageUrl"];
    if (photoFields.some((field) => parseArtistPhotoPath(parsed.data[field]))) return Response.json({ error: "У новой записи не может быть ссылки на старую фотографию." }, { status: 400 });
    await ensureSeeded();
    const [artist] = await db.insert(artists).values({ ...parsed.data, score: calculateScore(parsed.data) }).returning();
    const responseArtist = {
      ...artist,
      imageUrl: artist.imageUrl.startsWith("data:image/") ? artistPhotoPath(artist.id, "imageUrl") : artist.imageUrl,
      secondaryImageUrl: artist.secondaryImageUrl.startsWith("data:image/") ? artistPhotoPath(artist.id, "secondaryImageUrl") : artist.secondaryImageUrl,
      profileImageUrl: artist.profileImageUrl.startsWith("data:image/") ? artistPhotoPath(artist.id, "profileImageUrl") : artist.profileImageUrl,
    };
    return Response.json({ artist: responseArtist }, { status: 201 });
  } catch (error) {
    if ((error as { code?: string })?.code === "23505") return Response.json({ error: "Артист с таким именем уже есть." }, { status: 409 });
    return Response.json({ error: "Не удалось сохранить артиста." }, { status: 500 });
  }
}
