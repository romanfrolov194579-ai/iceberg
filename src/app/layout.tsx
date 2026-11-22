import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "SC ICEBERG by MUSIC CORE — русский SoundCloud",
  description: "SC ICEBERG by MUSIC CORE — интерактивная карта русского SoundCloud-рэпа: семь уровней от космоса до глубокой сцены.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body><ThemeProvider>{children}</ThemeProvider></body>
    </html>
  );
}
