"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Headphones, Play, Waves } from "lucide-react";
import { Brand } from "@/components/brand";
import { SiteMenu } from "@/components/site-menu";
import { LEVELS, levelIndex, platformLinks, type Artist } from "@/lib/iceberg";

type VideoPreview = { provider: string; title: string; authorName: string; thumbnailUrl: string; watchUrl: string; embedUrl: string };

function ProfileVideo({ artist }: { artist: Artist }) {
  const [preview, setPreview] = useState<VideoPreview | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true;
    if (!artist.videoUrl) { setPreview(null); setLoading(false); setFailed(false); setPlaying(false); return () => { active = false; }; }
    setLoading(true); setFailed(false); setPlaying(false);
    fetch(`/api/media/preview?url=${encodeURIComponent(artist.videoUrl)}`).then(async (response) => {
      const body = await response.json();
      if (!response.ok) throw new Error("Video unavailable");
      return body as VideoPreview;
    }).then((data) => { if (active) setPreview(data); }).catch(() => { if (active) setFailed(true); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [artist.id, artist.videoUrl]);
  if (!artist.videoUrl) return <div className="full-profile-video-empty"><span>ВИДЕОАРХИВ</span><p>Мы ещё не добавили, но ты можешь найти сам!🫪</p><a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${artist.name} official video`)}`} target="_blank" rel="noopener noreferrer">ПЕРЕЙТИ НА YOUTUBE <ArrowUpRight size={14}/></a></div>;
  return <section className="full-profile-video"><div className="full-profile-section-heading"><div><span className="eyebrow muted">ВИДЕОАРХИВ</span><h2>{preview?.title || `${artist.name} · клип / лайв`}</h2></div><span>{preview?.provider || (loading ? "ЗАГРУЖАЕМ" : "ВИДЕО")}</span></div><div className="full-profile-video-frame">{playing && preview ? <iframe src={preview.embedUrl} title={preview.title} allow="autoplay; encrypted-media; picture-in-picture; web-share" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"/> : <button className="full-profile-video-poster" disabled={!preview} onClick={() => setPlaying(true)} style={preview?.thumbnailUrl ? { backgroundImage: `linear-gradient(180deg,transparent 25%,#000b),url("${preview.thumbnailUrl}")` } : undefined}><span className="video-play-button"><Play size={21} fill="currentColor"/></span><strong>{loading ? "ЗАГРУЖАЕМ ВИДЕО" : failed ? "ВИДЕО ВРЕМЕННО НЕДОСТУПНО" : preview?.title || "СМОТРЕТЬ"}</strong></button>}</div>{preview && <a className="full-profile-watch-link" href={preview.watchUrl} target="_blank" rel="noopener noreferrer">ОТКРЫТЬ ИСТОЧНИК <ArrowUpRight size={14}/></a>}</section>;
}

export function ArtistProfilePage({ artist }: { artist: Artist }) {
  const level = LEVELS[levelIndex(artist.score)];
  const coverImage = artist.profileImageUrl || artist.secondaryImageUrl || artist.imageUrl;
  const heroStyle: CSSProperties | undefined = coverImage ? { backgroundImage: `linear-gradient(90deg,#000b,#0003 72%),url("${coverImage}")`, backgroundPosition: "center 35%", backgroundSize: "cover" } : undefined;
  const platforms = platformLinks(artist);
  return <div className="site-shell artist-profile-page">
    <header className="site-header"><div className="header-inner"><Brand/><div className="utility-header-side"><span>ПРОФИЛЬ АРТИСТА</span><SiteMenu/></div></div></header>
    <main>
      <section className="artist-profile-cover" style={heroStyle}>
        <div className="artist-profile-cover-content"><Link href="/#iceberg" className="profile-back profile-back-light"><ArrowLeft size={15}/> К АЙСБЕРГУ</Link><span className="artist-profile-level">СЛОЙ {level.number} · {level.name.toUpperCase()}</span><h1>{artist.name}</h1><p>{artist.genre || "Русский SoundCloud"}{artist.origin ? ` · ${artist.origin}` : ""}</p></div>
        <span className="artist-profile-cover-mark">SC ICEBERG BY MUSIC CORE</span>
      </section>
      <section className="artist-profile-body">
        <div className="artist-profile-intro"><div><span className="eyebrow muted">АРТИСТ / {artist.score} БАЛЛОВ ИЗ 98</span><h2>Кто это</h2><p>{artist.description || "Артист русского SoundCloud-андеграунда."}</p></div><span className="artist-profile-depth"><Waves size={19}/>{level.depth}</span></div>
        <ProfileVideo artist={artist}/>
        <section className="artist-profile-platforms"><div className="full-profile-section-heading"><div><span className="eyebrow muted">СЛУШАТЬ</span><h2>Выбери площадку</h2></div><Headphones size={20}/></div><div className="artist-profile-platform-list">{platforms.map((platform) => platform.url ? <a className="artist-profile-platform" href={platform.url} key={platform.kind} target="_blank" rel="noopener noreferrer"><span className={`platform-icon ${platform.kind}`}>{platform.kind === "soundcloud" ? "SC" : platform.kind === "spotify" ? "SP" : platform.kind === "youtube" ? "YT" : "AM"}</span><span><strong>{platform.name}</strong><small>Перейти на страницу</small></span><ArrowUpRight size={17}/></a> : <div className="artist-profile-platform platform-unavailable" key={platform.kind}><span className={`platform-icon ${platform.kind}`}>{platform.kind === "soundcloud" ? "SC" : platform.kind === "spotify" ? "SP" : platform.kind === "youtube" ? "YT" : "AM"}</span><span><strong>{platform.name}</strong><small>Ещё нет😭</small></span></div>)}</div></section>
      </section>
    </main>
    <footer className="site-footer utility-footer"><Brand/><span>MUSIC CORE · SCENE ARCHIVE</span><Link href="/#iceberg">К АЙСБЕРГУ</Link></footer>
  </div>;
}
