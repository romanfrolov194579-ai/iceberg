import type { Metadata } from "next";
import { ProfilePage } from "@/components/profile-page";

export const metadata: Metadata = {
  title: "Профиль слушателя · SC ICEBERG by MUSIC CORE",
  description: "Настрой своё локальное место в айсберге русского SoundCloud.",
};

export default function Page() {
  return <ProfilePage />;
}
