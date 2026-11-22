import type { Metadata } from "next";
import { DonationsPage } from "@/components/donations-page";

export const metadata: Metadata = {
  title: "Пожертвования · SC ICEBERG by MUSIC CORE",
  description: "Поддержать развитие SC ICEBERG by MUSIC CORE можно добровольным пожертвованием.",
};

export default function Page() {
  return <DonationsPage />;
}
