import { db } from "@/db";
import { artists } from "@/db/schema";
import { isAdminAuthorized } from "@/lib/admin-auth";
import { parseArtistInput } from "@/lib/artist-validation";
import { calculateScore } from "@/lib/iceberg";
import { artistPhotoPath, parseArtistPhotoPath, type ArtistPhotoField } from "@/lib/artist-images";
import { eq } from "drizzle-orm";

type Context = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: Context) {
  if (!(await isAdminAuthorized(request))) return Response.json({ error: "Требуется авторизация внешней админки." }, { status: 401 });
  const id = Number((await context.params).id);
  if (!Number.isSafeInteger(id) || id < 1) return Response.json({ error: "Неверный ID." }, { status: 400 });
  try {
    const parsed = parseArtistInput(await request.json());
    if ("error" in parsed) return Response.json({ error: parsed.error }, { status: 400 });
    let data = parsed.data;
    const photoFields: ArtistPhotoField[] = ["imageUrl", "secondaryImageUrl", "profileImageUrl"];
    const storedPhotoPaths = photoFields.map((field) => ({ field, path: parseArtistPhotoPath(data[field]) })).filter((item) => item.path !== null);
    if (storedPhotoPaths.length) {
      const [existing] = await db.select({ imageUrl: artists.imageUrl, secondaryImageUrl: artists.secondaryImageUrl, profileImageUrl: artists.profileImageUrl }).from(artists).where(eq(artists.id, id)).limit(1);
      if (!existing) return Response.json({ error: "Артист не найден." }, { status: 404 });
      const retainedPhotos: Partial<Record<ArtistPhotoField, string>> = {};
      for (const item of storedPhotoPaths) {
        if (item.path?.id !== id || item.path.field !== item.field) return Response.json({ error: "Фотография принадлежит другому артисту или формату." }, { status: 400 });
        retainedPhotos[item.field] = existing[item.field] || "";
      }
      data = { ...data, ...retainedPhotos };
    }
    const [artist] = await db.update(artists).set({ ...data, score: calculateScore(data), updatedAt: new Date() }).where(eq(artists.id, id)).returning();
    if (!artist) return Response.json({ error: "Артист не найден." }, { status: 404 });
    const responseArtist = {
      ...artist,
      imageUrl: artist.imageUrl.startsWith("data:image/") ? artistPhotoPath(artist.id, "imageUrl") : artist.imageUrl,
      secondaryImageUrl: artist.secondaryImageUrl.startsWith("data:image/") ? artistPhotoPath(artist.id, "secondaryImageUrl") : artist.secondaryImageUrl,
      profileImageUrl: artist.profileImageUrl.startsWith("data:image/") ? artistPhotoPath(artist.id, "profileImageUrl") : artist.profileImageUrl,
    };
    return Response.json({ artist: responseArtist });
  } catch (error) {
    if ((error as { code?: string })?.code === "23505") return Response.json({ error: "Артист с таким именем уже есть." }, { status: 409 });
    return Response.json({ error: "Не удалось сохранить изменения." }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: Context) {
  if (!(await isAdminAuthorized(request))) return Response.json({ error: "Требуется авторизация внешней админки." }, { status: 401 });
  const id = Number((await context.params).id);
  if (!Number.isSafeInteger(id) || id < 1) return Response.json({ error: "Неверный ID." }, { status: 400 });
  try {
    const [deleted] = await db.delete(artists).where(eq(artists.id, id)).returning({ id: artists.id });
    if (!deleted) return Response.json({ error: "Артист не найден." }, { status: 404 });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Не удалось удалить артиста." }, { status: 500 });
  }
}
