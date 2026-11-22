"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import { ArrowDownRight, ArrowLeft, ArrowRight, ArrowUpRight, Check, ChevronLeft, ChevronRight, Cloud, Compass, Disc3, Headphones, Music2, Play, Search, Sparkles, Waves, X } from "lucide-react";
import { Brand } from "@/components/brand";
import { SiteMenu } from "@/components/site-menu";
import { LEVELS, levelIndex, platformLinks, type Artist } from "@/lib/iceberg";

const EDITORIAL_ORDER = [
  "Баста", "Скриптонит", "Oxxxymiron", "FACE", "MORGENSHTERN", "Kizaru", "Pharaoh", "Big Baby Tape", "Boulevard Depo", "OG Buda", "MAYOT",
  "Bushido Zho", "SALUKI", "FRIENDLY THUG 52 NGG", "GONE.Fludd", "Scally Milano", "Платина", "Yung Trappa", "T-Fest", "LIL KRYSTALLL", "Soda Luv", "Markul", "Thomas Mraz", "TVETH", "Heronwater", "9mice", "Kai Angel", "Mnogoznaal", "Lizer", "Ramil’", "Pyrokinesis", "LOVV66", "SeeMee", "Rickey F", "Rizza", "RASKOL", "Sqwore", "LIL MORTY", "Anacondaz",
];
const EDITORIAL_RANK = new Map(EDITORIAL_ORDER.map((name, index) => [name, index]));
type VideoMetadata = { provider: string; title: string; authorName: string; thumbnailUrl: string; watchUrl: string; embedUrl: string };

function PlatformIcon({ kind }: { kind: string }) {
  if (kind === "spotify") return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="M6.6 9.2c3.8-1.1 7.9-.7 11 1.1M7.4 12.3c3.2-.9 6.7-.5 9.4 1M8.2 15.2c2.5-.7 5.1-.3 7.3.9" fill="none" stroke="#1d513d" strokeWidth="1.5" strokeLinecap="round" /></svg>;
  if (kind === "youtube") return <Play size={17} fill="currentColor" />;
  if (kind === "apple") return <Music2 size={19} strokeWidth={2.4} />;
  return <Cloud size={19} fill="currentColor" strokeWidth={1.8} />;
}

function ArtistModal({ artist, onClose }: { artist: Artist; onClose: () => void }) {
  const [video, setVideo] = useState<VideoMetadata | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState("");
  const [playing, setPlaying] = useState(false);
  const level = LEVELS[levelIndex(artist.score)];

  useEffect(() => {
    let active = true;
    setVideo(null); setVideoError(""); setPlaying(false);
    if (!artist.videoUrl) { setVideoLoading(false); return () => { active = false; }; }
    setVideoLoading(true);
    fetch(`/api/media/preview?url=${encodeURIComponent(artist.videoUrl)}`)
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || "Не получилось разобрать ссылку на видео.");
        return body as VideoMetadata;
      })
      .then((data) => { if (active) setVideo(data); })
      .catch((error: unknown) => { if (active) setVideoError(error instanceof Error ? error.message : "Видео пока недоступно."); })
      .finally(() => { if (active) setVideoLoading(false); });
    return () => { active = false; };
  }, [artist.id, artist.videoUrl]);

  const coverImage = artist.secondaryImageUrl || artist.imageUrl;
  const coverStyle: CSSProperties | undefined = coverImage ? {
    backgroundImage: `linear-gradient(90deg,rgba(11,36,46,.54),rgba(11,36,46,.12)),url("${coverImage}")`,
    backgroundSize: "cover",
    backgroundPosition: "center 38%",
  } : undefined;

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <section className="artist-modal" role="dialog" aria-modal="true" aria-labelledby="artist-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="artist-modal-cover" style={coverStyle}>
          <div className="cover-orb cover-orb-one" /><div className="cover-orb cover-orb-two" />
          <div className="modal-cover-top"><span><span className="tiny-dot" /> АРТИСТ / {level.number}</span><button className="modal-close light-close" onClick={onClose} aria-label="Закрыть"><X size={19} /></button></div>
          <div className="cover-record" aria-hidden="true"><Disc3 size={82} strokeWidth={0.65} /></div>
          <div className="cover-title"><span className="cover-overline">SC ICEBERG BY MUSIC CORE · АРХИВ АРТИСТОВ</span><h2 id="artist-title">{artist.name}</h2><p>{artist.genre || "SoundCloud rap"}{artist.origin ? `  ·  ${artist.origin}` : ""}</p><Link className="artist-full-profile-link" href={`/artists/${artist.id}`}>ПОЛНЫЙ ПРОФИЛЬ <ArrowUpRight size={13} /></Link></div>
        </div>
        <div className="artist-modal-body">
          <p className="artist-bio">{artist.description || "Открой этого артиста на своей любимой музыкальной площадке."}</p>
          {artist.videoUrl ? <section className="artist-video-card" aria-label="Видео артиста">
            <div className="artist-video-heading"><div><span className="eyebrow muted">СМОТРЕТЬ КЛИП / ЛАЙВ</span><h3>{video?.provider || "Клип / лайв"}</h3></div><span className="video-online"><i /> {videoLoading ? "ЗАГРУЖАЕМ" : videoError ? "ВИДЕО НЕДОСТУПНО" : "МОЖНО СМОТРЕТЬ"}</span></div>
            <div className="artist-video-frame">
              {playing && video ? <iframe src={video.embedUrl} title={video.title || `${artist.name} — видео`} allow="autoplay; encrypted-media; picture-in-picture; web-share" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /> : <button className="artist-video-poster" onClick={() => video && setPlaying(true)} disabled={!video} aria-label="Воспроизвести видео" style={video?.thumbnailUrl ? { backgroundImage: `linear-gradient(180deg,transparent 25%,rgba(7,29,37,.78)),url("${video.thumbnailUrl}")` } : undefined}><span className="video-play-button"><Play size={20} fill="currentColor" /></span><span className="video-poster-caption">{videoLoading ? "Загружаем видео…" : videoError ? "Не получилось загрузить ролик." : video?.title || "Нажми, чтобы воспроизвести"}</span></button>}
            </div>
            <div className="artist-video-footer"><span>{video?.authorName || "YouTube / Vimeo"}{video?.title ? ` · ${video.title}` : ""}</span>{video && <a href={video.watchUrl} target="_blank" rel="noopener noreferrer">ОТКРЫТЬ НА САЙТЕ <ArrowUpRight size={13} /></a>}</div>
          </section> : <section className="artist-video-empty"><span className="eyebrow muted">ВИДЕОАРХИВ</span><p>Мы ещё не добавили, но ты можешь найти сам!🫪</p><a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${artist.name} official video`)}`} target="_blank" rel="noopener noreferrer">ПЕРЕЙТИ НА YOUTUBE <ArrowUpRight size={13} /></a></section>}
          <div className="modal-section-title"><div><span className="eyebrow muted">ВЫБЕРИ ПЛОЩАДКУ</span><h3>Слушать артиста</h3></div><Headphones size={20} strokeWidth={1.4} /></div>
          <div className="platform-list">
            {platformLinks(artist).map((platform) => platform.url ? <a href={platform.url} key={platform.kind} target="_blank" rel="noopener noreferrer" className="platform-link"><span className={`platform-icon ${platform.kind}`}><PlatformIcon kind={platform.kind} /></span><span className="platform-copy"><strong>{platform.name}</strong><small>{platform.subtitle}</small></span><ArrowUpRight size={17} /></a> : <div className="platform-link platform-link-missing" key={platform.kind} aria-disabled="true"><span className={`platform-icon ${platform.kind}`}><PlatformIcon kind={platform.kind} /></span><span className="platform-copy"><strong>{platform.name}</strong><small>Ещё нет😭</small></span><span className="platform-empty-marker">—</span></div>)}
          </div>
          
        </div>
      </section>
    </div>
  );
}

function focusBackgroundPosition(focus: number) {
  const zoom = 1.7;
  return `${(((focus * zoom) - 0.5) / (zoom - 1) * 100).toFixed(1)}%`;
}

function LayerFocus({ artists, selected, closing, onClose, onArtist }: { artists: Artist[]; selected: number; closing: boolean; onClose: () => void; onArtist: (artist: Artist) => void }) {
  const level = LEVELS[selected];
  const focusStyle = {
    "--focus-origin-y": `${level.focus * 100}%`,
    "--focus-background-position": focusBackgroundPosition(level.focus),
  } as CSSProperties;
  return (
    <section className={`depth-explorer focus-depth-${selected + 1}`} data-closing={closing ? "true" : "false"} style={focusStyle} role="dialog" aria-modal="true" aria-labelledby="focus-title">
      <div className="focus-scene-art" aria-hidden="true" /><div className="focus-scene-shade" aria-hidden="true" />
      <header className="focus-topbar"><Brand light /><div className="focus-topbar-mid"><span>ПОГРУЖЕНИЕ / {level.number}</span><span className="focus-topbar-depth">{level.depth.toUpperCase()}</span></div><button className="focus-back" onClick={onClose}><ArrowLeft size={16} /> <span>НАЗАД К АЙСБЕРГУ</span></button></header>
      <div className="focus-content">
        <div className="focus-intro"><div className="focus-overline"><span className="orange-dot" /> СЛОЙ {level.number} / 07 <span className="focus-range">БАЛЛЫ {level.range}</span></div><h2 id="focus-title">{level.title}</h2><p className="focus-lede">{level.description}</p>
          <aside className="focus-meaning"><span className="focus-meaning-icon"><Compass size={19} strokeWidth={1.3} /></span><div><span className="eyebrow muted">ЧТО ЗНАЧИТ ЭТА ЧАСТЬ АЙСБЕРГА</span><p>{level.meaning}</p></div></aside>
        </div>
        <div className="focus-roster-heading"><div><span className="eyebrow muted">ТВОЙ МАРШРУТ ВНИЗ</span><h3>Имена этого слоя</h3></div><span className="focus-roster-count"><strong>{String(artists.length).padStart(2, "0")}</strong><small>АРТИСТОВ</small></span></div>
        {artists.length ? <div className="focus-artist-flow"><div className="focus-flow-line" aria-hidden="true" />{artists.map((artist, index) => <article className={`focus-artist-stop stop-${index % 2 === 0 ? "left" : "right"}`} key={artist.id}>
          <span className="focus-artist-orbit" aria-hidden="true" />
          <button className="focus-artist-card" onClick={() => onArtist(artist)} aria-label={`Открыть профиль ${artist.name}`}>
            <span className="focus-artist-index">{String(index + 1).padStart(2, "0")}</span>
            <span className="focus-artist-image" style={artist.imageUrl ? { backgroundImage: `url("${artist.imageUrl}")` } : undefined}>{!artist.imageUrl && <span>{artist.name.replace(/[^a-zа-яё0-9]/gi, "").slice(0, 2).toUpperCase()}</span>}</span>
            <span className="focus-artist-copy"><strong>{artist.name}</strong><small>{artist.genre || "SoundCloud rap"}{artist.origin ? ` · ${artist.origin}` : ""}</small><em>{artist.description || "Артист этой музыкальной глубины."}</em></span>
            <span className="focus-artist-score">{artist.score}<small>БАЛЛОВ</small></span><ArrowUpRight className="focus-artist-arrow" size={17} />
          </button>
          <span className="focus-artist-depth">{index === 0 ? level.depth.toUpperCase() : `ИМЯ ${String(index + 1).padStart(2, "0")}`}</span>
        </article>)}</div> : <div className="focus-empty">В этом слое пока тихо. Загляни сюда позже — новые имена появляются постепенно.</div>}
        <div className="focus-end-note"><span>ДАЛЬШЕ — ЕЩЁ ГЛУБЖЕ</span><Waves size={22} strokeWidth={1.2} /><span>{artists.length} ИМЁН · УРОВЕНЬ {level.number}</span></div>
      </div>
    </section>
  );
}

export function IcebergExperience({ artists }: { artists: Artist[] }) {
  const [selected, setSelected] = useState(0);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [focusClosing, setFocusClosing] = useState(false);
  const [artist, setArtist] = useState<Artist | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const groups = useMemo(() => LEVELS.map((_, index) => artists.filter((item) => levelIndex(item.score) === index).sort((a, b) => {
    const rankA = EDITORIAL_RANK.get(a.name);
    const rankB = EDITORIAL_RANK.get(b.name);
    if (rankA !== undefined && rankB !== undefined) return rankA - rankB;
    if (rankA !== undefined) return -1;
    if (rankB !== undefined) return 1;
    return b.score - a.score || b.influence - a.influence || a.name.localeCompare(b.name);
  })), [artists]);
  const results = useMemo(() => [...artists].sort((a, b) => b.score - a.score).filter((item) => item.name.toLowerCase().includes(query.toLowerCase().trim())).slice(0, 8), [artists, query]);
  const level = LEVELS[selected];

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (artist) { setArtist(null); return; }
      if (searchOpen) { setSearchOpen(false); return; }
      if (expanded !== null) closeFocus();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [artist, searchOpen, expanded, focusClosing]);

  useEffect(() => {
    document.body.style.overflow = artist || expanded !== null ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [artist, expanded]);

  const openArtist = (item: Artist) => { setArtist(item); setSelected(levelIndex(item.score)); setSearchOpen(false); };
  const approachLevel = (index: number) => { setSelected(index); setExpanded(index); setFocusClosing(false); };
  function closeFocus() {
    if (expanded === null || focusClosing) return;
    setFocusClosing(true);
    window.setTimeout(() => { setExpanded(null); setFocusClosing(false); }, 540);
  }

  return <div className="site-shell">
    <header className="site-header">
      <div className="header-inner">
        <Brand />
        <nav className="main-nav" aria-label="Главная навигация">
          <a className="nav-active" href="#iceberg">Айсберг <span /></a>
          <a href="#how-it-works">Как это работает</a>
          <a href="#about">О проекте</a>
        </nav>
        <div className="header-actions">
          <button className={`search-toggle ${searchOpen ? "is-open" : ""}`} onClick={() => setSearchOpen(!searchOpen)} aria-label={searchOpen ? "Закрыть поиск" : "Поиск артистов"} aria-expanded={searchOpen}>{searchOpen ? <X size={19} /> : <Search size={19} />}</button>
          <SiteMenu />
        </div>
      </div>
      {searchOpen && <div className="search-popover"><div className="search-input-wrap"><Search size={19} /><input autoFocus placeholder="Найти артиста..." value={query} onChange={(event) => setQuery(event.target.value)} /><span>ESC</span></div><div className="search-results"><div className="search-results-label">{query ? "РЕЗУЛЬТАТЫ ПОИСКА" : "ПОПУЛЯРНЫЕ ИМЕНА"}</div>{results.length ? results.map((item) => <button key={item.id} onClick={() => openArtist(item)}><span className="search-avatar">{item.imageUrl ? <span style={{ backgroundImage: `url("${item.imageUrl}")` }} /> : item.name.slice(0, 1)}</span><span>{item.name}<small>{LEVELS[levelIndex(item.score)].name}</small></span><ArrowUpRight size={15} /></button>) : <p>Никого не нашли. Попробуй другое имя.</p>}</div></div>}
    </header>

    <main>
      <section id="iceberg" className={`iceberg-stage depth-${selected + 1}`} aria-label="Интерактивный айсберг артистов">
        <div className="stage-image" /><div className="stage-wash" /><div className="stage-glow" style={{ top: level.light }} />
        <div className="hero-copy">
          <div className="hero-kicker"><span className="orange-dot" /> SC ICEBERG · MUSIC CORE <span className="kicker-line" /> <span className="kicker-edition">VOL. 01</span></div>
          <h1>Сцена.<br /><em>Чуть глубже.</em></h1>
          <p>Сначала увидишь главные имена. Нырни ближе — и айсберг покажет всех остальных.</p>
          <button className="primary-button" onClick={() => approachLevel(selected)}><span>ПРИБЛИЗИТЬСЯ К АЙСБЕРГУ</span><span className="primary-arrow"><ArrowDownRight size={19} /></span></button>
          <div className="hero-meta"><span className="hero-meta-line" /><span>07 УРОВНЕЙ <b>·</b> {artists.length} АРТИСТОВ <b>·</b> ОДИН АНДЕГРАУНД</span></div>
        </div>

        <div className="above-surface-note"><span className="orange-dot" /> ВЫШЕ ОБЛАКОВ — САМЫЕ ГРОМКИЕ</div>
        <div className="waterline-caption"><span /> УРОВЕНЬ МОРЯ <b>0 М</b></div>
        <div className="stage-side-note"><div className="note-icon"><Waves size={19} strokeWidth={1.2} /></div><div><strong>СНАЧАЛА УВИДИШЬ ГЛАВНОЕ.<br />ОСТАЛЬНОЕ — ЧУТЬ ГЛУБЖЕ.</strong><small>Нажми на слой, чтобы приблизиться.</small></div></div>
        <div className="stage-coordinate">55° 45′ N<br />37° 37′ E</div>

        <div className="ice-map" aria-label="Популярные артисты на каждом уровне айсберга">
          {LEVELS.map((item, index) => <div className={`map-row map-row-${index + 1} ${index === selected ? "map-row-active" : ""} ${index >= 3 ? "map-row-deep" : ""}`} key={item.number}>
            <button className="layer-hitbox" aria-label={`Приблизиться к уровню ${item.number}: ${item.name}`} onClick={() => approachLevel(index)} />
            <span className="map-row-number">{item.number}</span>
            <div className="map-artists">
              {groups[index].slice(0, 3).map((itemArtist) => <button key={itemArtist.id} className="artist-tag" onClick={() => openArtist(itemArtist)}><span className={`artist-tag-avatar ${itemArtist.imageUrl ? "has-photo" : ""}`} style={itemArtist.imageUrl ? { backgroundImage: `url("${itemArtist.imageUrl}")` } : undefined}>{!itemArtist.imageUrl && <span>{itemArtist.name.replace(/[^a-zа-яё0-9]/gi, "").slice(0, 1).toUpperCase()}</span>}</span><span>{itemArtist.name}</span></button>)}
              {!groups[index].length && <span className="empty-map">Пока без имён</span>}
            </div>
          </div>)}
        </div>

        <aside className="depth-panel" aria-label="Семь уровней айсберга">
          <div className="panel-topline"><span>КАРТА ПОГРУЖЕНИЯ</span><span>01 — 07</span></div>
          <div className="panel-heading"><div><h2>Выбери высоту</h2><p>Есть слой даже над облаками.</p></div><span className="compass-icon"><Compass size={21} strokeWidth={1.2} /></span></div>
          <div className="level-list">
            {LEVELS.map((item, index) => <button key={item.number} className={`level-button ${selected === index ? "level-active" : ""}`} onClick={() => approachLevel(index)} aria-label={`Приблизиться: ${item.name}`} aria-pressed={selected === index}><span className="level-number">{item.number}</span><span className="level-copy"><strong>{item.name}</strong><small>{item.subtitle}</small></span><span className="level-depth">{selected === index ? <ArrowDownRight size={16} /> : item.depth}</span></button>)}
          </div>
          <button className="panel-approach" onClick={() => approachLevel(selected)}><span className="panel-pulse" /> ПРИБЛИЗИТЬСЯ К УРОВНЮ <ArrowRight size={14} /></button>
        </aside>
        <div className="image-credit">MUSIC CORE · РУССКИЙ SOUNDCLOUD · ИССЛЕДУЙ НИЖЕ</div>
      </section>

      <section className="status-bar" aria-live="polite">
        <div className="status-inner">
          <div className="status-index"><strong>{level.number}</strong><span>/ 07</span></div>
          <div className="status-divider" />
          <div className="status-title"><span>ТЕКУЩИЙ УРОВЕНЬ</span><strong>{level.title}</strong></div>
          <div className="status-description">{level.description}</div>
          <button className="all-artists-button" onClick={() => approachLevel(selected)}><span className="mini-avatars">{groups[selected].slice(0, 3).map((item) => <i key={item.id} style={item.imageUrl ? { backgroundImage: `url("${item.imageUrl}")`, color: "transparent" } : undefined}>{!item.imageUrl && item.name.slice(0, 1)}</i>)}</span><span><strong>{groups[selected].length} АРТИСТОВ</strong><small>Приблизиться</small></span><ArrowUpRight size={15} /></button>
          <div className="status-controls"><button aria-label="Предыдущий уровень" disabled={selected === 0} onClick={() => setSelected(selected - 1)}><ChevronLeft size={18} /></button><button aria-label="Следующий уровень" disabled={selected === 6} onClick={() => setSelected(selected + 1)}><ChevronRight size={18} /></button></div>
        </div>
      </section>

      <section className="about-section" id="how-it-works">
        <div className="about-heading"><div><span className="eyebrow"><span className="orange-dot" /> КАК ЭТО РАБОТАЕТ</span><h2>Не только под<br /><em>поверхностью.</em></h2></div><p>Семь высот русского SoundCloud. Начни с самых больших имён или приблизься и пройди весь слой сверху вниз.</p></div>
        <div className="steps-grid"><div className="step-card"><div className="step-top"><span>01 / ВЫБИРАЙ</span><Compass size={23} strokeWidth={1.3} /></div><h3>От космоса до бездны</h3><p>В айсберге есть слои над водой, под водой — и далеко за пределами радара.</p></div><div className="step-card"><div className="step-top"><span>02 / ПОГРУЖАЙСЯ</span><Sparkles size={23} strokeWidth={1.3} /></div><h3>Приблизь один слой</h3><p>Камера плавно нырнёт к выбранной части, объяснит её и покажет артистов по порядку.</p></div><div className="step-card"><div className="step-top"><span>03 / СЛУШАЙ И СМОТРИ</span><Headphones size={23} strokeWidth={1.3} /></div><h3>Клипы и музыка</h3><p>Смотри добавленные ролики, а потом выбери SoundCloud, Spotify, YouTube или Apple Music.</p></div></div>
        <div className="about-footnote" id="about"><span><Check size={15} /> КАК УСТРОЕН АЙСБЕРГ</span><p>Слои показывают масштаб и заметность артиста в сцене — но не качество его музыки. Самая ценная находка может ждать глубже.</p></div>
      </section>
    </main>
    <footer className="site-footer"><Brand /><p>НЕ БОЙСЯ НЫРЯТЬ ГЛУБЖЕ.</p><span>MUSIC CORE · РУССКАЯ СЦЕНА ♡</span><a href="#iceberg">НАВЕРХ ↑</a></footer>
    {expanded !== null && <LayerFocus artists={groups[expanded]} selected={expanded} closing={focusClosing} onClose={closeFocus} onArtist={openArtist} />}
    {artist && <ArtistModal artist={artist} onClose={() => setArtist(null)} />}
  </div>;
}
