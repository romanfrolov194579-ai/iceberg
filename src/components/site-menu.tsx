"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { ArrowUpRight, HandHeart, Menu, Moon, SlidersHorizontal, Sun, UserRound, X } from "lucide-react";
import { useSiteTheme, type ThemeMode } from "@/components/theme-provider";

// Paste hosted PNG/SVG icon URLs here. Leave an empty string to use the built-in monochrome icon.
export const MENU_ICON_URLS = {
  profile: "",
  settings: "",
  donations: "",
};

function MenuIcon({ src, fallback }: { src: string; fallback: ReactNode }) {
  return <span className="site-menu-icon">{src ? <Image src={src} width={21} height={21} alt="" unoptimized /> : fallback}</span>;
}

export function SiteMenu() {
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useSiteTheme();

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  const chooseTheme = (value: ThemeMode) => setTheme(value);

  return <>
    <button className={`menu-toggle ${open ? "menu-toggle-open" : ""}`} onClick={() => setOpen((value) => !value)} aria-label={open ? "Закрыть меню" : "Открыть меню"} aria-expanded={open} aria-haspopup="dialog">{open ? <X size={20} /> : <Menu size={21} />}</button>
    {open && <div className="site-menu-backdrop" onMouseDown={() => setOpen(false)}>
      <aside className="site-menu-panel" role="dialog" aria-modal="true" aria-label="Меню SC ICEBERG" onMouseDown={(event) => event.stopPropagation()}>
        <div className="site-menu-heading"><div><span>SC ICEBERG</span><small>BY MUSIC CORE</small></div><button onClick={() => setOpen(false)} aria-label="Закрыть меню"><X size={19} /></button></div>
        <nav className="site-menu-nav" aria-label="Меню">
          <Link className="site-menu-link" href="/profile" onClick={() => setOpen(false)}><MenuIcon src={MENU_ICON_URLS.profile} fallback={<UserRound size={19} />} /><span><strong>Профиль</strong><small>Твои настройки слушателя</small></span><ArrowUpRight className="site-menu-arrow" size={16} strokeWidth={1.45} aria-hidden="true" /></Link>
          <section className="site-menu-settings"><div className="site-menu-link static-menu-link"><MenuIcon src={MENU_ICON_URLS.settings} fallback={<SlidersHorizontal size={19} />} /><span><strong>Настройки</strong><small>Внешний вид сайта</small></span></div><div className="theme-choices" role="group" aria-label="Цветовая тема"><button className={theme === "mono" ? "theme-choice selected" : "theme-choice"} onClick={() => chooseTheme("mono")} aria-pressed={theme === "mono"}><Moon size={15} /><span>Чёрно-белая</span></button><button className={theme === "ice" ? "theme-choice selected" : "theme-choice"} onClick={() => chooseTheme("ice")} aria-pressed={theme === "ice"}><Sun size={15} /><span>Ледяная</span></button></div></section>
          <Link className="site-menu-link donation-menu-link" href="/donations" onClick={() => setOpen(false)}><MenuIcon src={MENU_ICON_URLS.donations} fallback={<HandHeart size={19} />} /><span><strong>Пожертвования</strong><small>Поддержать развитие сайта</small></span><ArrowUpRight className="site-menu-arrow" size={16} strokeWidth={1.45} aria-hidden="true" /></Link>
        </nav>
        <div className="site-menu-footer">MUSIC CORE · SOUND DISCOVERY</div>
      </aside>
    </div>}
  </>;
}
