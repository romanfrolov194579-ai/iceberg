import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArtistProfilePage } from "@/components/artist-profile-page";
import { getArtists } from "@/lib/artists";

export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Context): Promise<Metadata> {
  const id = Number((await params).id);
  const artist = (await getArtists()).find((item) => item.id === id);
  return { title: artist ? `${artist.name} · SC ICEBERG by MUSIC CORE` : "Артист не найден · SC ICEBERG" };
}

export default async function ArtistRoute({ params }: Context) {
  const id = Number((await params).id);
  if (!Number.isSafeInteger(id) || id < 1) notFound();
  const artist = (await getArtists()).find((item) => item.id === id);
  if (!artist) notFound();
  return <ArtistProfilePage artist={artist} />;
}
