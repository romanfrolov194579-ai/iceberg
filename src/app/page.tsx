import { IcebergExperience } from "@/components/iceberg-experience";
import { getArtists } from "@/lib/artists";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const artists = await getArtists();
  return <IcebergExperience artists={artists} />;
}
