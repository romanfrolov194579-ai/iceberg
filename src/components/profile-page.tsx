"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, UserRound } from "lucide-react";
import { Brand } from "@/components/brand";
import { SiteMenu } from "@/components/site-menu";
import { LEVELS } from "@/lib/iceberg";

const PROFILE_KEY = "sc-iceberg-listener-profile";

export function ProfilePage() {
  const [name, setName] = useState("");
  const [favoriteLevel, setFavoriteLevel] = useState("0");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const profile = JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}");
      if (typeof profile.name === "string") setName(profile.name);
      if (typeof profile.favoriteLevel === "string") setFavoriteLevel(profile.favoriteLevel);
    } catch { /* Start with the empty local profile. */ }
  }, []);

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    localStorage.setItem(PROFILE_KEY, JSON.stringify({ name: name.trim(), favoriteLevel }));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2400);
  }

  return <div className="site-shell utility-page-shell">
    <header className="site-header"><div className="header-inner"><Brand /><div className="utility-header-side"><span>ПРОФИЛЬ СЛУШАТЕЛЯ</span><SiteMenu /></div></div></header>
    <main className="profile-page-main">
      <Link href="/" className="profile-back"><ArrowLeft size={15} /> К АЙСБЕРГУ</Link>
      <section className="profile-card">
        <span className="profile-avatar"><UserRound size={25} strokeWidth={1.3} /></span>
        <span className="eyebrow"><span className="orange-dot" /> MUSIC CORE / LISTENER</span>
        <h1>Твоё место<br /><em>в этой глубине.</em></h1>
        <p className="profile-lede">Сохрани своё имя и любимый слой. Настройки остаются только в этом браузере.</p>
        <form className="profile-form" onSubmit={save}>
          <label>Как к тебе обращаться?<input value={name} maxLength={40} onChange={(event) => setName(event.target.value)} placeholder="Твоё имя или ник" /></label>
          <label>Любимая глубина<select value={favoriteLevel} onChange={(event) => setFavoriteLevel(event.target.value)}>{LEVELS.map((level, index) => <option key={level.number} value={index}>{level.number} · {level.name}</option>)}</select></label>
          <button className="profile-save-button" type="submit">{saved ? <><Check size={16} /> Сохранено</> : <>Сохранить профиль <ArrowRight size={16} /></>}</button>
        </form>
        <p className="profile-local-note">Настройки профиля сохраняются на этом устройстве.</p>
      </section>
    </main>
    <footer className="site-footer utility-footer"><Brand /><span>MUSIC CORE · РУССКАЯ СЦЕНА ♡</span><Link href="/donations">ПОДДЕРЖАТЬ ПРОЕКТ</Link></footer>
  </div>;
}
