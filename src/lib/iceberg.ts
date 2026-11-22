export type ArtistInput = {
  name: string;
  description: string;
  genre: string;
  origin: string;
  /** SoundCloud followers. */
  followers: number;
  monthlyListeners: number;
  /** Plays of the artist's most-played SoundCloud track. */
  totalPlays: number;
  telegramFollowers: number;
  tiktokFollowers: number;
  instagramFollowers: number;
  hasPerformed: boolean;
  hasBeenOnTour: boolean;
  siteSupport: boolean;
  /** Kept for compatibility with the original demo records; not part of the score. */
  influence: number;
  soundcloudUrl: string;
  spotifyUrl: string;
  youtubeUrl: string;
  appleMusicUrl: string;
  imageUrl: string;
  secondaryImageUrl: string;
  profileImageUrl: string;
  videoUrl: string;
};

export type Artist = ArtistInput & { id: number; score: number };
export type ScoreTier = { min: number; max: number | null; points: number; label: string };

const telegramTiers: ScoreTier[] = [
  { min: 0, max: 200, points: 1, label: "0–199" },
  { min: 200, max: 500, points: 2, label: "200–499" },
  { min: 500, max: 1_000, points: 3, label: "500–999" },
  { min: 1_000, max: 3_000, points: 4, label: "1 000–2 999" },
  { min: 3_000, max: 5_000, points: 5, label: "3 000–4 999" },
  { min: 5_000, max: 10_000, points: 6, label: "5 000–9 999" },
  { min: 10_000, max: 20_000, points: 7, label: "10 000–19 999" },
  { min: 20_000, max: null, points: 10, label: "20 000+" },
];
const monthlyTiers: ScoreTier[] = [
  { min: 0, max: 1_000, points: 1, label: "до 999" },
  { min: 1_000, max: 10_000, points: 3, label: "1 000–9 999" },
  { min: 10_000, max: 50_000, points: 5, label: "10 000–49 999" },
  { min: 50_000, max: 100_000, points: 7, label: "50 000–99 999" },
  { min: 100_000, max: 300_000, points: 8, label: "100 000–299 999" },
  { min: 300_000, max: 500_000, points: 9, label: "300 000–499 999" },
  { min: 500_000, max: 1_000_000, points: 10, label: "500 000–999 999" },
  { min: 1_000_000, max: null, points: 15, label: "1 000 000+" },
];
const tiktokTiers: ScoreTier[] = [
  { min: 0, max: 1_000, points: 0, label: "до 999" },
  { min: 1_000, max: 10_000, points: 1, label: "1 000–9 999" },
  { min: 10_000, max: 50_000, points: 2, label: "10 000–49 999" },
  { min: 50_000, max: 100_000, points: 3, label: "50 000–99 999" },
  { min: 100_000, max: 500_000, points: 5, label: "100 000–499 999" },
  { min: 500_000, max: 1_000_000, points: 7, label: "500 000–999 999" },
  { min: 1_000_000, max: null, points: 10, label: "1 000 000+" },
];
const trackPlayTiers: ScoreTier[] = [
  { min: 0, max: 1_000, points: 0, label: "до 999" },
  { min: 1_000, max: 10_000, points: 1, label: "1 000–9 999" },
  { min: 10_000, max: 50_000, points: 2, label: "10 000–49 999" },
  { min: 50_000, max: 100_000, points: 3, label: "50 000–99 999" },
  { min: 100_000, max: 500_000, points: 5, label: "100 000–499 999" },
  { min: 500_000, max: 1_000_000, points: 7, label: "500 000–999 999" },
  { min: 1_000_000, max: 5_000_000, points: 10, label: "1 000 000–4 999 999" },
  { min: 5_000_000, max: null, points: 15, label: "5 000 000+" },
];
const soundCloudFollowerTiers: ScoreTier[] = [
  { min: 0, max: 200, points: 0, label: "до 199" },
  { min: 200, max: 1_000, points: 1, label: "200–999" },
  { min: 1_000, max: 5_000, points: 2, label: "1 000–4 999" },
  { min: 5_000, max: 10_000, points: 3, label: "5 000–9 999" },
  { min: 10_000, max: 50_000, points: 5, label: "10 000–49 999" },
  { min: 50_000, max: 100_000, points: 7, label: "50 000–99 999" },
  { min: 100_000, max: 500_000, points: 10, label: "100 000–499 999" },
  { min: 500_000, max: null, points: 15, label: "500 000+" },
];
const instagramTiers: ScoreTier[] = [
  { min: 0, max: 1_000, points: 0, label: "до 999" },
  { min: 1_000, max: 10_000, points: 1, label: "1 000–9 999" },
  { min: 10_000, max: 50_000, points: 2, label: "10 000–49 999" },
  { min: 50_000, max: 100_000, points: 3, label: "50 000–99 999" },
  { min: 100_000, max: 500_000, points: 5, label: "100 000–499 999" },
  { min: 500_000, max: 1_000_000, points: 7, label: "500 000–999 999" },
  { min: 1_000_000, max: 5_000_000, points: 10, label: "1 000 000–4 999 999" },
  { min: 5_000_000, max: null, points: 15, label: "5 000 000+" },
];

export const SCORE_CRITERIA = [
  { title: "Подписчики Telegram", tiers: telegramTiers },
  { title: "Слушатели в месяц · любой стриминг", tiers: monthlyTiers },
  { title: "Подписчики TikTok", tiers: tiktokTiers },
  { title: "Лучший трек SoundCloud · прослушивания", tiers: trackPlayTiers },
  { title: "Подписчики SoundCloud", tiers: soundCloudFollowerTiers },
  { title: "Подписчики Instagram", tiers: instagramTiers },
] as const;

export const MAX_SCORE = 98;

export const LEVELS = [
  { number: "01", name: "Космос", title: "Вне айсберга", subtitle: "Имена-эпохи", depth: "↑ над облаками", range: "80–98", description: "Несколько имён, давно переросших жанр и ставших частью музыкальной истории.", meaning: "Это уже не просто популярность: артисты здесь влияют на всю музыку вокруг и давно переросли саму SoundCloud-сцену.", light: "10%", focus: 0.09 },
  { number: "02", name: "Небо", title: "Небо сцены", subtitle: "Слышно везде", depth: "↑ выше воды", range: "65–79", description: "Звук, который вышел из SoundCloud и разлетелся далеко за пределы сцены.", meaning: "Имена верхнего облачного слоя: большой охват, узнаваемый звук и слушатели далеко за пределами платформы.", light: "21%", focus: 0.22 },
  { number: "03", name: "Вершина", title: "Вершина айсберга", subtitle: "Большая волна", depth: "0 м", range: "52–64", description: "Главные голоса волны: их знают, цитируют и всё ещё переслушивают.", meaning: "То, что видно над водой: опорные артисты русской SoundCloud-волны и треки, с которых многие начинали знакомство со сценой.", light: "34%", focus: 0.36 },
  { number: "04", name: "На радаре", title: "Знают в теме", subtitle: "Своя волна", depth: "−100 м", range: "39–51", description: "Артисты с собственной вселенной и аудиторией, которая слушает внимательно.", meaning: "Уже не случайный шум, но ещё не радио для всех: здесь знают релизы, обсуждают фиты и следят за собственной сценой.", light: "47%", focus: 0.50 },
  { number: "05", name: "Андеграунд", title: "Под поверхностью", subtitle: "Для своих", depth: "−300 м", range: "26–38", description: "Здесь встречаются новые направления, громкие фиты и следующие большие имена.", meaning: "Локальные волны и независимые объединения. Здесь новые имена растут быстрее, чем их успевают заметить музыкальные медиа.", light: "60%", focus: 0.64 },
  { number: "06", name: "Глубина", title: "Глубокий звук", subtitle: "Нишевые имена", depth: "−600 м", range: "21–25", description: "Неочевидные находки и независимая сцена, в которую приятно провалиться.", meaning: "Слой по рекомендациям: редкие релизы, экспериментальный звук и артисты, которых открывают через друзей, репосты и фиты.", light: "73%", focus: 0.78 },
  { number: "07", name: "Бездна", title: "Самая глубина", subtitle: "Только для своих", depth: "−1200 м", range: "0–20", description: "Далеко от радаров: сырые демки, эксперименты и имена, которые только предстоит открыть.", meaning: "Тёмная вода за пределами привычных жанров. Небольшие аудитории, первые демки и музыка, которую находят самые любопытные.", light: "86%", focus: 0.92 },
] as const;

function pointsFromTiers(value: number, tiers: readonly ScoreTier[]) {
  const normalized = Math.max(0, Math.floor(Number.isFinite(value) ? value : 0));
  return tiers.find((tier) => normalized >= tier.min && (tier.max === null || normalized < tier.max))?.points ?? 0;
}

export function calculateScoreBreakdown(input: Pick<ArtistInput, "followers" | "monthlyListeners" | "totalPlays" | "telegramFollowers" | "tiktokFollowers" | "instagramFollowers" | "hasPerformed" | "hasBeenOnTour" | "siteSupport">) {
  const criteria = {
    telegram: pointsFromTiers(input.telegramFollowers, telegramTiers),
    monthlyListeners: pointsFromTiers(input.monthlyListeners, monthlyTiers),
    tiktok: pointsFromTiers(input.tiktokFollowers, tiktokTiers),
    soundCloudTrack: pointsFromTiers(input.totalPlays, trackPlayTiers),
    soundCloudFollowers: pointsFromTiers(input.followers, soundCloudFollowerTiers),
    livePerformance: input.hasPerformed ? 3 : 0,
    tour: input.hasBeenOnTour ? 10 : 0,
    instagram: pointsFromTiers(input.instagramFollowers, instagramTiers),
    siteSupport: input.siteSupport ? 5 : 0,
  };
  return { ...criteria, total: Object.values(criteria).reduce((sum, points) => sum + points, 0) };
}

export function calculateScore(input: Parameters<typeof calculateScoreBreakdown>[0]): number {
  return calculateScoreBreakdown(input).total;
}

export function levelIndex(score: number): number {
  if (score >= 80) return 0;
  if (score >= 65) return 1;
  if (score >= 52) return 2;
  if (score >= 39) return 3;
  if (score >= 26) return 4;
  if (score >= 21) return 5;
  return 6;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("ru-RU").format(value);
}

export function platformLinks(artist: Artist) {
  return [
    { name: "SoundCloud", subtitle: artist.soundcloudUrl ? "Перейти на страницу" : "Ещё нет😭", url: artist.soundcloudUrl, kind: "soundcloud" },
    { name: "Spotify", subtitle: artist.spotifyUrl ? "Перейти на страницу" : "Ещё нет😭", url: artist.spotifyUrl, kind: "spotify" },
    { name: "YouTube", subtitle: artist.youtubeUrl ? "Перейти на страницу" : "Ещё нет😭", url: artist.youtubeUrl, kind: "youtube" },
    { name: "Apple Music", subtitle: artist.appleMusicUrl ? "Перейти на страницу" : "Ещё нет😭", url: artist.appleMusicUrl, kind: "apple" },
  ];
}
