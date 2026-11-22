"use client";

import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight, BarChart3, Check, ChevronDown, CircleHelp, Disc3, ExternalLink, Headphones, ImagePlus, Layers3, LockKeyhole, LogOut, Pencil, Plus, Search, SlidersHorizontal, Trash2, Users, X } from "lucide-react";
import { Brand } from "@/components/brand";
import { calculateScore, calculateScoreBreakdown, LEVELS, levelIndex, MAX_SCORE, SCORE_CRITERIA, type Artist, type ArtistInput } from "@/lib/iceberg";

const emptyArtist: ArtistInput = { name: "", description: "", genre: "", origin: "", followers: 0, monthlyListeners: 0, totalPlays: 0, telegramFollowers: 0, tiktokFollowers: 0, instagramFollowers: 0, hasPerformed: false, hasBeenOnTour: false, siteSupport: false, influence: 0, soundcloudUrl: "", spotifyUrl: "", youtubeUrl: "", appleMusicUrl: "", imageUrl: "", secondaryImageUrl: "", profileImageUrl: "", videoUrl: "" };
const sortArtists = (artists: Artist[]) => [...artists].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
type PhotoField = "imageUrl" | "secondaryImageUrl" | "profileImageUrl";

function PhotoUploader({ title, hint, value, error, onChoose, onRemove }: { title: string; hint: string; value: string; error?: string; onChoose: (event: ChangeEvent<HTMLInputElement>) => void; onRemove: () => void }) {
  return <div className="artist-photo-editor"><div className="artist-photo-preview" style={value ? { backgroundImage: `url("${value}")` } : undefined}>{!value && <ImagePlus size={25} strokeWidth={1.4} />}</div><div className="artist-photo-copy"><strong>{title}</strong><small>{hint}</small><div className="artist-photo-actions"><label className="photo-select-button"><ImagePlus size={14} /> {value ? "Заменить фото" : "Загрузить фото"}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={onChoose} /></label>{value && <button type="button" className="photo-remove-button" onClick={onRemove}>Убрать</button>}</div>{error && <span className="photo-error-text">{error}</span>}</div></div>;
}

function inputFromArtist(artist: Artist): ArtistInput {
  return { name: artist.name, description: artist.description, genre: artist.genre, origin: artist.origin, followers: artist.followers, monthlyListeners: artist.monthlyListeners, totalPlays: artist.totalPlays, telegramFollowers: artist.telegramFollowers, tiktokFollowers: artist.tiktokFollowers, instagramFollowers: artist.instagramFollowers, hasPerformed: artist.hasPerformed, hasBeenOnTour: artist.hasBeenOnTour, siteSupport: artist.siteSupport, influence: artist.influence, soundcloudUrl: artist.soundcloudUrl, spotifyUrl: artist.spotifyUrl, youtubeUrl: artist.youtubeUrl, appleMusicUrl: artist.appleMusicUrl, imageUrl: artist.imageUrl, secondaryImageUrl: artist.secondaryImageUrl, profileImageUrl: artist.profileImageUrl, videoUrl: artist.videoUrl };
}

export function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError("");
    try {
      const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Не удалось войти.");
      window.location.reload();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Не удалось войти."); } finally { setLoading(false); }
  }
  return <div className="admin-shell login-shell"><header className="site-header"><div className="header-inner"><Brand /><Link className="back-to-site" href="/"><ArrowLeft size={15} /> НА ГЛАВНУЮ</Link></div></header><main className="login-main"><div className="login-card"><span className="login-icon"><LockKeyhole size={24} /></span><span className="eyebrow muted">SC ICEBERG BY MUSIC CORE / ADMIN</span><h1>С возвращением.</h1><p>Введи пароль, чтобы управлять артистами и глубинами айсберга.</p><form onSubmit={login}><label>Пароль администратора<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoFocus required placeholder="Введи пароль" /></label>{error && <div className="form-error">{error}</div>}<button className="admin-primary" disabled={loading}>{loading ? "Входим..." : "Войти в панель"}<ArrowRight size={17} /></button></form></div></main></div>;
}

export function AdminDashboard({ initialArtists, demoMode }: { initialArtists: Artist[]; demoMode: boolean }) {
  const [artists, setArtists] = useState(sortArtists(initialArtists));
  const [form, setForm] = useState<ArtistInput>(emptyArtist);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [photoErrors, setPhotoErrors] = useState<Partial<Record<PhotoField, string>>>({});
  const scoreBreakdown = calculateScoreBreakdown(form);
  const score = scoreBreakdown.total;
  const calculatedLevel = LEVELS[levelIndex(score)];
  const visibleArtists = useMemo(() => artists.filter((artist) => artist.name.toLowerCase().includes(query.toLowerCase().trim()) && (filter === "all" || levelIndex(artist.score) === Number(filter))), [artists, query, filter]);
  const usedLevels = new Set(artists.map((artist) => levelIndex(artist.score))).size;
  const setField = <K extends keyof ArtistInput>(key: K, value: ArtistInput[K]) => setForm((current) => ({ ...current, [key]: value }));
  const reset = () => { setForm({ ...emptyArtist }); setEditingId(null); setError(""); setPhotoErrors({}); };
  const scrollToForm = () => document.getElementById("artist-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  const edit = (artist: Artist) => { setEditingId(artist.id); setForm(inputFromArtist(artist)); setError(""); setPhotoErrors({}); setMessage(""); scrollToForm(); };
  const addNew = () => { reset(); setMessage(""); scrollToForm(); };
  function choosePhoto(event: ChangeEvent<HTMLInputElement>, field: PhotoField) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { setPhotoErrors((current) => ({ ...current, [field]: "Подойдёт фотография JPG, PNG или WebP." })); return; }
    if (file.size > 800 * 1024) { setPhotoErrors((current) => ({ ...current, [field]: "Фотография должна быть меньше 800 КБ." })); return; }
    setPhotoErrors((current) => ({ ...current, [field]: "" }));
    const reader = new FileReader();
    reader.onload = () => { if (typeof reader.result === "string") setField(field, reader.result); };
    reader.onerror = () => setPhotoErrors((current) => ({ ...current, [field]: "Не удалось прочитать фотографию." }));
    reader.readAsDataURL(file);
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError(""); setMessage("");
    try {
      const response = await fetch(editingId ? `/api/artists/${editingId}` : "/api/artists", { method: editingId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Не удалось сохранить артиста.");
      const saved = body.artist as Artist;
      setArtists((current) => sortArtists(editingId ? current.map((item) => item.id === saved.id ? saved : item) : [...current, saved]));
      setMessage(editingId ? "Изменения сохранены. Уровень пересчитан." : "Артист добавлен на айсберг.");
      reset();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Не удалось сохранить артиста."); } finally { setSaving(false); }
  }
  async function remove(artist: Artist) {
    if (!window.confirm(`Удалить ${artist.name} с айсберга?`)) return;
    setMessage(""); setError("");
    try {
      const response = await fetch(`/api/artists/${artist.id}`, { method: "DELETE" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Не удалось удалить артиста.");
      setArtists((current) => current.filter((item) => item.id !== artist.id));
      if (editingId === artist.id) reset();
      setMessage(`${artist.name} удалён с айсберга.`);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Не удалось удалить артиста."); }
  }
  async function logout() { await fetch("/api/admin/logout", { method: "POST" }); window.location.reload(); }

  return <div className="admin-shell">
    <header className="site-header admin-header"><div className="header-inner"><Brand /><div className="admin-header-actions"><Link className="back-to-site" href="/"><ArrowLeft size={15} /> <span>ВЕРНУТЬСЯ К АЙСБЕРГУ</span></Link>{!demoMode && <button className="logout-button" onClick={logout} aria-label="Выйти"><LogOut size={17} /></button>}</div></div></header>
    <main className="admin-main">
      <div className="admin-breadcrumb"><Link href="/">ГЛАВНАЯ</Link><span>/</span><span>ПАНЕЛЬ УПРАВЛЕНИЯ</span></div>
      <div className="admin-page-heading"><div><span className="eyebrow"><span className="orange-dot" /> ПРОСТРАНСТВО АДМИНИСТРАТОРА</span><h1>За кулисами <em>айсберга.</em></h1><p>Управляй артистами, а мы расставим их по глубине.</p></div><Link href="/" className="view-site-button">ОТКРЫТЬ АЙСБЕРГ <ArrowUpRight size={16} /></Link></div>
      {demoMode && <div className="demo-alert"><CircleHelp size={18} /><span><strong>Демо-режим.</strong> Сейчас панель доступна без пароля. Для защиты задай <code>ADMIN_PASSWORD</code> в переменных окружения.</span></div>}
      {message && <div className="success-alert"><Check size={17} /> {message}<button onClick={() => setMessage("")} aria-label="Закрыть"><X size={16} /></button></div>}
      {error && <div className="form-error admin-error">{error}<button onClick={() => setError("")} aria-label="Закрыть"><X size={15} /></button></div>}
      <div className="admin-stats"><div className="stat-card"><span className="stat-icon"><Users size={19} /></span><div><small>ВСЕГО АРТИСТОВ</small><strong>{String(artists.length).padStart(2, "0")}</strong></div><span className="stat-corner">В КАТАЛОГЕ ↗</span></div><div className="stat-card"><span className="stat-icon blue"><Layers3 size={19} /></span><div><small>ЗАПОЛНЕНО УРОВНЕЙ</small><strong>{usedLevels} <i>/ 7</i></strong></div><span className="stat-corner">ГЛУБИНА ↘</span></div><div className="stat-card stat-card-dark"><span className="stat-icon dark"><BarChart3 size={19} /></span><div><small>РАСПРЕДЕЛЕНИЕ</small><strong>Автоматически</strong></div><span className="stat-corner">ПО БАЛЛАМ ✳</span></div></div>
      <div className="admin-content-grid">
        <section className="admin-list-card"><div className="card-heading"><div><span className="eyebrow muted">МУЗЫКАЛЬНЫЙ АРХИВ</span><h2>Артисты <span>{artists.length}</span></h2><p>Все имена на твоём айсберге.</p></div><button className="add-artist-button" onClick={addNew}><Plus size={17} /> <span>ДОБАВИТЬ</span></button></div>
          <div className="table-filters"><label className="admin-search"><Search size={17} /><input placeholder="Поиск по имени" value={query} onChange={(event) => setQuery(event.target.value)} /></label><label className="admin-filter"><SlidersHorizontal size={15} /><select aria-label="Фильтр по уровню" value={filter} onChange={(event) => setFilter(event.target.value)}><option value="all">Все уровни</option>{LEVELS.map((level, index) => <option value={index} key={level.number}>{level.number} · {level.name}</option>)}</select><ChevronDown size={14} /></label></div>
          <div className="artist-table-wrap"><table className="artist-table"><thead><tr><th>АРТИСТ</th><th>УРОВЕНЬ</th><th>БАЛЛЫ</th><th><span className="sr-only">Действия</span></th></tr></thead><tbody>{visibleArtists.map((artist, index) => { const itemLevel = LEVELS[levelIndex(artist.score)]; return <tr key={artist.id}><td><div className="table-artist"><span className={`table-avatar avatar-${levelIndex(artist.score)}`} style={artist.imageUrl ? { backgroundImage: `url("${artist.imageUrl}")`, color: "transparent" } : undefined}>{!artist.imageUrl && artist.name.replace(/[^a-zа-яё0-9]/gi, "").slice(0, 2).toUpperCase()}</span><span><strong>{artist.name}</strong><small>{artist.genre || "SoundCloud rap"}</small></span></div></td><td><span className={`table-level table-level-${levelIndex(artist.score)}`}><i />{itemLevel.name}</span></td><td><span className="score-value">{artist.score}</span><span className="score-max"> / {MAX_SCORE}</span></td><td><div className="table-actions"><button onClick={() => edit(artist)} aria-label={`Редактировать ${artist.name}`} title="Редактировать"><Pencil size={15} /></button><button onClick={() => remove(artist)} aria-label={`Удалить ${artist.name}`} title="Удалить"><Trash2 size={15} /></button></div></td></tr>; })}</tbody></table>{!visibleArtists.length && <div className="table-empty">Здесь пока никого нет. Попробуй изменить поиск или добавь артиста.</div>}</div>
          <div className="table-footer"><span>ПОКАЗАНО {visibleArtists.length} ИЗ {artists.length}</span><span>СОРТИРОВКА ПО БАЛЛАМ ↓</span></div>
        </section>
        <section className="admin-form-card" id="artist-form"><div className="form-card-heading"><div><span className="eyebrow muted">{editingId ? "РЕДАКТИРОВАНИЕ" : "НОВАЯ ЗАПИСЬ"}</span><h2>{editingId ? "Изменить артиста" : "Добавить артиста"}</h2><p>Заполни данные — глубина определится сама.</p></div><span className="form-heading-icon">{editingId ? <Pencil size={19} /> : <Plus size={21} />}</span></div>
          <form onSubmit={save} className="artist-form">
            <div className="form-section-label"><span>01</span> ОСНОВНОЕ</div>
            <label><span>Ник артиста <b>*</b></span><input required maxLength={120} placeholder="Например, Lil Peep" value={form.name} onChange={(event) => setField("name", event.target.value)} /></label>
            <label>Короткое описание<textarea maxLength={500} rows={2} placeholder="Пара слов об артисте и его звучании" value={form.description} onChange={(event) => setField("description", event.target.value)} /></label>
            <div className="artist-photo-stack">
              <PhotoUploader title="Первичная фотография" hint="Маленькая метка рядом с ником на айсберге · до 800 КБ" value={form.imageUrl} error={photoErrors.imageUrl} onChoose={(event) => choosePhoto(event, "imageUrl")} onRemove={() => { setField("imageUrl", ""); setPhotoErrors((current) => ({ ...current, imageUrl: "" })); }} />
              <PhotoUploader title="Вторичная фотография" hint="Обложка карточки при нажатии на артиста · до 800 КБ" value={form.secondaryImageUrl} error={photoErrors.secondaryImageUrl} onChoose={(event) => choosePhoto(event, "secondaryImageUrl")} onRemove={() => { setField("secondaryImageUrl", ""); setPhotoErrors((current) => ({ ...current, secondaryImageUrl: "" })); }} />
              <PhotoUploader title="Третья фотография · широкий профиль" hint="Большой баннер отдельной страницы артиста · до 800 КБ" value={form.profileImageUrl} error={photoErrors.profileImageUrl} onChoose={(event) => choosePhoto(event, "profileImageUrl")} onRemove={() => { setField("profileImageUrl", ""); setPhotoErrors((current) => ({ ...current, profileImageUrl: "" })); }} />
              <p className="photo-db-note">Все три фотографии сохраняются в базе основного сайта.</p>
            </div>
            <div className="form-two-columns"><label>Жанр<input maxLength={120} placeholder="Cloud rap" value={form.genre} onChange={(event) => setField("genre", event.target.value)} /></label><label>Откуда<input maxLength={120} placeholder="Город, страна" value={form.origin} onChange={(event) => setField("origin", event.target.value)} /></label></div>
            <div className="form-section-label metrics-heading"><span>02</span> ПОКАЗАТЕЛИ <i>ДЛЯ РАСЧЁТА БАЛЛОВ</i></div>
            <p className="criteria-demo-note">Счёт складывается по девяти критериям. Социальные показатели в стартовом демо-архиве примерные — проверь и замени их на фактические.</p>
            <div className="form-two-columns">
              <label>Подписчики Telegram<input type="number" min="0" max="1000000000000" step="1" placeholder="0" value={form.telegramFollowers || ""} onChange={(event) => setField("telegramFollowers", Number(event.target.value))} /></label>
              <label>Слушатели в месяц · любой стриминг<input type="number" min="0" max="1000000000000" step="1" placeholder="0" value={form.monthlyListeners || ""} onChange={(event) => setField("monthlyListeners", Number(event.target.value))} /></label>
              <label>Подписчики TikTok<input type="number" min="0" max="1000000000000" step="1" placeholder="0" value={form.tiktokFollowers || ""} onChange={(event) => setField("tiktokFollowers", Number(event.target.value))} /></label>
              <label>Прослушивания лучшего трека · SoundCloud<input type="number" min="0" max="1000000000000" step="1" placeholder="0" value={form.totalPlays || ""} onChange={(event) => setField("totalPlays", Number(event.target.value))} /></label>
              <label>Подписчики SoundCloud<input type="number" min="0" max="1000000000000" step="1" placeholder="0" value={form.followers || ""} onChange={(event) => setField("followers", Number(event.target.value))} /></label>
              <label>Подписчики Instagram<input type="number" min="0" max="1000000000000" step="1" placeholder="0" value={form.instagramFollowers || ""} onChange={(event) => setField("instagramFollowers", Number(event.target.value))} /></label>
            </div>
            <div className="criteria-checkboxes">
              <label className="criteria-checkbox"><input type="checkbox" checked={form.hasPerformed} onChange={(event) => setField("hasPerformed", event.target.checked)} /><span><strong>Выступал хотя бы раз</strong><small>+3 балла</small></span></label>
              <label className="criteria-checkbox"><input type="checkbox" checked={form.hasBeenOnTour} onChange={(event) => setField("hasBeenOnTour", event.target.checked)} /><span><strong>Участвовал в туре</strong><small>+10 баллов</small></span></label>
              <label className="criteria-checkbox"><input type="checkbox" checked={form.siteSupport} onChange={(event) => setField("siteSupport", event.target.checked)} /><span><strong>Поддержан на сайте</strong><small>+5 баллов</small></span></label>
            </div>
            <div className="score-preview"><div><span>ПРЕДВАРИТЕЛЬНЫЙ РЕЗУЛЬТАТ</span><strong>{calculatedLevel.number} · {calculatedLevel.name}</strong><small>Сумма начислений по критериям</small></div><div className="score-circle"><strong>{score}</strong><small>/ {MAX_SCORE}</small></div></div>
            <div className="score-breakdown-grid">{[["Telegram", scoreBreakdown.telegram], ["Стриминги", scoreBreakdown.monthlyListeners], ["TikTok", scoreBreakdown.tiktok], ["Трек SC", scoreBreakdown.soundCloudTrack], ["Подписчики SC", scoreBreakdown.soundCloudFollowers], ["Выступление", scoreBreakdown.livePerformance], ["Тур", scoreBreakdown.tour], ["Instagram", scoreBreakdown.instagram], ["Сайт", scoreBreakdown.siteSupport]].map(([label, points]) => <span key={String(label)}>{label}<strong>+{points}</strong></span>)}</div>
            <details className="score-explanation"><summary>Все пороги и начисления <ChevronDown size={14} /></summary><p>Число на границе ступени относится к следующему диапазону. Общий максимум — {MAX_SCORE} баллов.</p><div className="criterion-rules-list">{SCORE_CRITERIA.map((criterion) => <div className="criterion-rule" key={criterion.title}><strong>{criterion.title}</strong><div>{criterion.tiers.map((tier) => <span key={tier.label}>{tier.label}<b>+{tier.points}</b></span>)}</div></div>)}<div className="criterion-rule"><strong>Дополнительные условия</strong><div><span>Выступление <b>+3</b></span><span>Участие в туре <b>+10</b></span><span>Поддержка на сайте <b>+5</b></span></div></div></div><div className="score-level-ranges">{LEVELS.map((level) => <span key={level.number}>{level.number} · {level.range}</span>)}</div></details>
            <div className="form-section-label links-heading"><span>03</span> ССЫЛКИ НА ПЛОЩАДКИ <i>НЕОБЯЗАТЕЛЬНО</i></div>
            <p className="links-hint">Без ссылки откроется поиск артиста на площадке.</p>
            <label>SoundCloud<input type="url" placeholder="https://soundcloud.com/..." value={form.soundcloudUrl} onChange={(event) => setField("soundcloudUrl", event.target.value)} /></label>
            <div className="form-two-columns"><label>Spotify<input type="url" placeholder="https://open.spotify.com/..." value={form.spotifyUrl} onChange={(event) => setField("spotifyUrl", event.target.value)} /></label><label>YouTube<input type="url" placeholder="https://youtube.com/..." value={form.youtubeUrl} onChange={(event) => setField("youtubeUrl", event.target.value)} /></label></div>
            <label>Apple Music<input type="url" placeholder="https://music.apple.com/..." value={form.appleMusicUrl} onChange={(event) => setField("appleMusicUrl", event.target.value)} /></label>
            <div className="form-section-label video-links-heading"><span>04</span> КЛИП / ЛАЙВ <i>YOUTUBE ИЛИ VIMEO</i></div>
            <label>Ссылка на видео<input type="url" placeholder="https://www.youtube.com/watch?v=…" value={form.videoUrl} onChange={(event) => setField("videoUrl", event.target.value)} /></label>
            <p className="links-hint">Ссылка будет разобрана через oEmbed. Плеер появится в карточке артиста и загрузится только после нажатия «Play».</p>
            <div className="form-actions"><button type="submit" className="admin-primary" disabled={saving}>{saving ? "Сохраняем..." : editingId ? "Сохранить изменения" : "Добавить на айсберг"}<ArrowRight size={17} /></button>{editingId && <button type="button" className="cancel-edit" onClick={reset}>Отменить</button>}</div>
            {editingId && <button type="button" className="delete-form-button" onClick={() => { const current = artists.find((item) => item.id === editingId); if (current) void remove(current); }}><Trash2 size={15} /> УДАЛИТЬ АРТИСТА С АЙСБЕРГА</button>}
          </form>
        </section>
      </div>
      <div className="admin-bottom-note"><span>✳ &nbsp; SC ICEBERG · MUSIC CORE</span><span>СОЗДАНО ДЛЯ ТЕХ, КТО СЛУШАЕТ</span></div>
    </main>
  </div>;
}
