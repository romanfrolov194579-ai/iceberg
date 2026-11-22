import "server-only";
import { db } from "@/db";
import { appSettings, artists } from "@/db/schema";
import { calculateScore, type Artist, type ArtistInput } from "@/lib/iceberg";
import { artistPhotoPath } from "@/lib/artist-images";
import { and, asc, desc, eq } from "drizzle-orm";

type SeedArtist = Omit<ArtistInput, "soundcloudUrl" | "spotifyUrl" | "youtubeUrl" | "appleMusicUrl" | "imageUrl" | "secondaryImageUrl" | "profileImageUrl" | "videoUrl" | "telegramFollowers" | "tiktokFollowers" | "instagramFollowers" | "hasPerformed" | "hasBeenOnTour" | "siteSupport"> & Partial<Pick<ArtistInput, "telegramFollowers" | "tiktokFollowers" | "instagramFollowers" | "hasPerformed" | "hasBeenOnTour" | "siteSupport">> & { soundcloudUrl?: string; videoUrl?: string };

type SeedCriteria = Pick<ArtistInput, "telegramFollowers" | "tiktokFollowers" | "instagramFollowers" | "hasPerformed" | "hasBeenOnTour" | "siteSupport">;

// Example numbers for the preloaded demo archive only; replace them with checked figures in the admin panel.
function demoCriteriaFromLegacyInfluence(influence: number): SeedCriteria {
  if (influence >= 98) return { telegramFollowers: 25_000, tiktokFollowers: 1_100_000, instagramFollowers: 1_100_000, hasPerformed: true, hasBeenOnTour: true, siteSupport: true };
  if (influence >= 95) return { telegramFollowers: 15_000, tiktokFollowers: 600_000, instagramFollowers: 600_000, hasPerformed: true, hasBeenOnTour: true, siteSupport: false };
  if (influence >= 90) return { telegramFollowers: 7_500, tiktokFollowers: 200_000, instagramFollowers: 200_000, hasPerformed: true, hasBeenOnTour: false, siteSupport: false };
  if (influence >= 80) return { telegramFollowers: 3_500, tiktokFollowers: 75_000, instagramFollowers: 75_000, hasPerformed: true, hasBeenOnTour: false, siteSupport: false };
  if (influence >= 70) return { telegramFollowers: 1_500, tiktokFollowers: 25_000, instagramFollowers: 25_000, hasPerformed: true, hasBeenOnTour: false, siteSupport: false };
  if (influence >= 60) return { telegramFollowers: 100, tiktokFollowers: 500, instagramFollowers: 500, hasPerformed: false, hasBeenOnTour: false, siteSupport: false };
  return { telegramFollowers: 0, tiktokFollowers: 0, instagramFollowers: 0, hasPerformed: false, hasBeenOnTour: false, siteSupport: false };
}

function seedCriteria(artist: SeedArtist): SeedCriteria {
  const demo = demoCriteriaFromLegacyInfluence(artist.influence);
  return {
    telegramFollowers: artist.telegramFollowers ?? demo.telegramFollowers,
    tiktokFollowers: artist.tiktokFollowers ?? demo.tiktokFollowers,
    instagramFollowers: artist.instagramFollowers ?? demo.instagramFollowers,
    hasPerformed: artist.hasPerformed ?? demo.hasPerformed,
    hasBeenOnTour: artist.hasBeenOnTour ?? demo.hasBeenOnTour,
    siteSupport: artist.siteSupport ?? demo.siteSupport,
  };
}

// Illustrative numbers, not live platform statistics. Administrators can replace them.
const examples: SeedArtist[] = [
  { name: "XXXTENTACION", description: "Один из самых влиятельных голосов SoundCloud-поколения.", genre: "Emo rap · Trap", origin: "Флорида, США", followers: 12000000, monthlyListeners: 44000000, totalPlays: 1000000000, influence: 100, soundcloudUrl: "https://soundcloud.com/xxxtentacion" },
  { name: "Juice WRLD", description: "Мелодичный фристайл и эмоции, которые услышал весь мир.", genre: "Emo rap · Hip-hop", origin: "Чикаго, США", followers: 6500000, monthlyListeners: 48000000, totalPlays: 900000000, influence: 100, soundcloudUrl: "https://soundcloud.com/juicewrld" },
  { name: "Lil Peep", description: "Пионер звучания на пересечении рэпа, эмо и альтернативы.", genre: "Emo rap · Alternative", origin: "Нью-Йорк, США", followers: 7000000, monthlyListeners: 24000000, totalPlays: 700000000, influence: 100, soundcloudUrl: "https://soundcloud.com/lil_peep" },
  { name: "Playboi Carti", description: "Автор гипнотического звучания, ставшего отдельной вселенной.", genre: "Rage · Trap", origin: "Атланта, США", followers: 2200000, monthlyListeners: 34000000, totalPlays: 500000000, influence: 94, soundcloudUrl: "https://soundcloud.com/playboicarti" },
  { name: "$uicideboy$", description: "Дуэт из Нового Орлеана с мрачным, узнаваемым звуком.", genre: "Underground · Trap", origin: "Новый Орлеан, США", followers: 2600000, monthlyListeners: 18000000, totalPlays: 600000000, influence: 98, soundcloudUrl: "https://soundcloud.com/g59" },
  { name: "Lil Uzi Vert", description: "Энергия, мелодии и новый взгляд на границы рэпа.", genre: "Trap · Rage", origin: "Филадельфия, США", followers: 2000000, monthlyListeners: 28000000, totalPlays: 450000000, influence: 94, soundcloudUrl: "https://soundcloud.com/liluzivert" },
  { name: "Trippie Redd", description: "От сырых интернет-релизов до больших мелодичных хитов.", genre: "Emo rap · Trap", origin: "Огайо, США", followers: 2400000, monthlyListeners: 25000000, totalPlays: 450000000, influence: 92 },
  { name: "Ski Mask the Slump God", description: "Виртуозный флоу и неукротимая энергия новой школы.", genre: "Trap · Hip-hop", origin: "Флорида, США", followers: 2800000, monthlyListeners: 14000000, totalPlays: 400000000, influence: 95 },
  { name: "BONES", description: "Независимый первопроходец и основатель коллектива TeamSESH.", genre: "Cloud rap · Underground", origin: "Мичиган, США", followers: 800000, monthlyListeners: 3500000, totalPlays: 200000000, influence: 94, soundcloudUrl: "https://soundcloud.com/teamsesh" },
  { name: "Ghostemane", description: "Тёмная смесь рэпа, металла и индустриальной эстетики.", genre: "Trap metal · Rap", origin: "Флорида, США", followers: 1100000, monthlyListeners: 5500000, totalPlays: 200000000, influence: 87, soundcloudUrl: "https://soundcloud.com/ghostemane" },
  { name: "Denzel Curry", description: "Технический рэп и бескомпромиссная энергия Флориды.", genre: "Hip-hop · Trap", origin: "Флорида, США", followers: 620000, monthlyListeners: 9000000, totalPlays: 160000000, influence: 88 },
  { name: "Yung Lean", description: "Меланхоличный cloud rap, определивший интернет-эпоху.", genre: "Cloud rap · Alternative", origin: "Стокгольм, Швеция", followers: 550000, monthlyListeners: 6500000, totalPlays: 180000000, influence: 88, soundcloudUrl: "https://soundcloud.com/yung-lean-doer" },
  { name: "Night Lovell", description: "Низкий голос, тёмные биты и ночная атмосфера.", genre: "Dark trap", origin: "Оттава, Канада", followers: 650000, monthlyListeners: 4500000, totalPlays: 160000000, influence: 80, soundcloudUrl: "https://soundcloud.com/night_lovell" },
  { name: "Pouya", description: "Независимый рэпер, выросший из южной underground-сцены.", genre: "Underground · Hip-hop", origin: "Майами, США", followers: 500000, monthlyListeners: 4000000, totalPlays: 110000000, influence: 78 },
  { name: "Xavier Wulf", description: "Узнаваемый звук Memphis rap и один из голосов Seshollowaterboyz.", genre: "Memphis rap · Trap", origin: "Мемфис, США", followers: 600000, monthlyListeners: 2500000, totalPlays: 110000000, influence: 80 },
  { name: "Ramirez", description: "Мрачный южный рэп с влиянием классического Memphis sound.", genre: "Memphis rap · Underground", origin: "Сан-Франциско, США", followers: 350000, monthlyListeners: 2500000, totalPlays: 90000000, influence: 75 },
  { name: "Summrs", description: "Мелодичный голос поколения pluggnb.", genre: "Pluggnb · Trap", origin: "Луизиана, США", followers: 250000, monthlyListeners: 1800000, totalPlays: 50000000, influence: 72 },
  { name: "Autumn!", description: "Мягкие мелодии и независимый звук новой волны.", genre: "Pluggnb · Underground", origin: "Луизиана, США", followers: 220000, monthlyListeners: 1500000, totalPlays: 40000000, influence: 70 },
  { name: "Black Kray", description: "Культовый артист на стыке cloud rap и экспериментальной сцены.", genre: "Cloud rap · Experimental", origin: "Вирджиния, США", followers: 160000, monthlyListeners: 1000000, totalPlays: 30000000, influence: 78 },
  { name: "Hi-C", description: "Шумный, эклектичный и постоянно меняющий форму звук.", genre: "Experimental · Underground", origin: "США", followers: 80000, monthlyListeners: 700000, totalPlays: 18000000, influence: 72 },
  { name: "Yabujin", description: "Загадочная интернет-эстетика и музыка без привычных границ.", genre: "Experimental · Cloud rap", origin: "Литва", followers: 65000, monthlyListeners: 650000, totalPlays: 10000000, influence: 72 },
  { name: "Sybyr", description: "Экспериментальный рэп с нарочито сырым звучанием.", genre: "Anti-trap · Experimental", origin: "Мэриленд, США", followers: 70000, monthlyListeners: 300000, totalPlays: 9000000, influence: 70 },
  { name: "David Shawty", description: "Искажённые мелодии и личный язык цифрового андеграунда.", genre: "Hyperpop · Underground", origin: "США", followers: 85000, monthlyListeners: 450000, totalPlays: 10000000, influence: 62 },
  { name: "Marcy Mane", description: "Независимый артист с туманным, экспериментальным звучанием.", genre: "Cloud rap · Experimental", origin: "США", followers: 16000, monthlyListeners: 50000, totalPlays: 1800000, influence: 60 },
];

const russianExamples: SeedArtist[] = [
  { name: "Oxxxymiron", description: "Авторский рэп, батлы и тексты, давно ставшие частью культурного кода.", genre: "Hip-hop · Grime", origin: "Россия", followers: 10000000, monthlyListeners: 50000000, totalPlays: 1000000000, influence: 100 },
  { name: "Скриптонит", description: "Автор узнаваемого звука, который навсегда изменил русскоязычный хип-хоп.", genre: "Hip-hop · Trap", origin: "Павлодар", followers: 10000000, monthlyListeners: 50000000, totalPlays: 1000000000, influence: 100 },
  { name: "Баста", description: "Ветеран сцены: от микстейпов и SoundCloud до стадионных припевов.", genre: "Hip-hop · Rap", origin: "Ростов-на-Дону", followers: 10000000, monthlyListeners: 50000000, totalPlays: 1000000000, influence: 100 },
  { name: "FACE", description: "Артист, который принёс звук интернет-андеграунда в большой разговор.", genre: "Emo rap · Trap", origin: "Уфа", followers: 7000000, monthlyListeners: 35000000, totalPlays: 800000000, influence: 100 },
  { name: "MORGENSHTERN", description: "Один из самых громких авторов цифровой эпохи и её мем-культуры.", genre: "Hip-hop · Trap", origin: "Уфа", followers: 6500000, monthlyListeners: 30000000, totalPlays: 800000000, influence: 98 },
  { name: "Kizaru", description: "Тёмная атмосфера, зарубежные влияния и путь из SoundCloud в большую сцену.", genre: "Cloud rap · Trap", origin: "Санкт-Петербург", followers: 5000000, monthlyListeners: 25000000, totalPlays: 700000000, influence: 95 },
  { name: "Pharaoh", description: "Голос волны, выросшей из интернет-релизов и собственной мифологии.", genre: "Cloud rap · Alternative", origin: "Москва", followers: 4500000, monthlyListeners: 24000000, totalPlays: 600000000, influence: 95 },
  { name: "Big Baby Tape", description: "Яркая новая школа, триплеты и бесконечный поток узнаваемых хуков.", genre: "Trap · Hip-hop", origin: "Москва", followers: 4000000, monthlyListeners: 22000000, totalPlays: 500000000, influence: 90 },
  { name: "Boulevard Depo", description: "Один из архитекторов новой русской волны и объединения YungRussia.", genre: "Cloud rap · Trap", origin: "Уфа", followers: 2500000, monthlyListeners: 12000000, totalPlays: 300000000, influence: 90 },
  { name: "OG Buda", description: "Мелодичная энергия новой московской школы и объединения RNDM Crew.", genre: "Melodic rap · Trap", origin: "Тюмень", followers: 2000000, monthlyListeners: 10000000, totalPlays: 250000000, influence: 85 },
  { name: "MAYOT", description: "Мягкие мелодии, скорость флоу и узнаваемый звук нового поколения.", genre: "Melodic rap · Trap", origin: "Тюмень", followers: 1800000, monthlyListeners: 9000000, totalPlays: 180000000, influence: 85 },
  { name: "SALUKI", description: "Свободные формы, интересные аранжировки и собственная эстетика.", genre: "Alternative rap · Hip-hop", origin: "Москва", followers: 1600000, monthlyListeners: 7000000, totalPlays: 150000000, influence: 88, videoUrl: "https://www.youtube.com/watch?v=NytUttpc2pQ" },
  { name: "Bushido Zho", description: "Громкая новая волна: искренние тексты и масштабный звук.", genre: "Melodic rap · Trap", origin: "Москва", followers: 1600000, monthlyListeners: 8000000, totalPlays: 160000000, influence: 82 },
  { name: "FRIENDLY THUG 52 NGG", description: "Тяжёлые биты и выразительный голос питерского объединения 52.", genre: "Trap · Underground", origin: "Санкт-Петербург", followers: 1000000, monthlyListeners: 5000000, totalPlays: 100000000, influence: 90 },
  { name: "GONE.Fludd", description: "Неоновая эстетика и запоминающийся язык независимой интернет-сцены.", genre: "Cloud rap · Hip-hop", origin: "Томск", followers: 1200000, monthlyListeners: 6000000, totalPlays: 160000000, influence: 90 },
  { name: "Scally Milano", description: "Грубый, непосредственный звук и уральский DIY-характер.", genre: "Cloud rap · Underground", origin: "Берёзовский", followers: 800000, monthlyListeners: 4000000, totalPlays: 80000000, influence: 82 },
  { name: "Платина", description: "Мелодичный стиль и лёгкий флоу, ставшие частью новой школы.", genre: "Trap · Melodic rap", origin: "Рига", followers: 1000000, monthlyListeners: 6000000, totalPlays: 100000000, influence: 84 },
  { name: "Yung Trappa", description: "Одна из самых узнаваемых фигур ранней русской трэп-волны.", genre: "Trap · Hip-hop", origin: "Санкт-Петербург", followers: 700000, monthlyListeners: 3500000, totalPlays: 70000000, influence: 83 },
  { name: "T-Fest", description: "Певучие треки и ранняя интернет-сцена, которая выросла вместе с ним.", genre: "Melodic rap · Hip-hop", origin: "Черновцы", followers: 700000, monthlyListeners: 3500000, totalPlays: 55000000, influence: 85 },
  { name: "Markul", description: "Меланхоличный флоу и независимый звук, выросший на стыке сцен.", genre: "Hip-hop · Alternative", origin: "Рига", followers: 600000, monthlyListeners: 3000000, totalPlays: 45000000, influence: 85 },
  { name: "LIL KRYSTALLL", description: "Холодный питерский саунд и треки, которыми делятся свои.", genre: "Cloud rap · Trap", origin: "Санкт-Петербург", followers: 500000, monthlyListeners: 2500000, totalPlays: 50000000, influence: 85 },
  { name: "Soda Luv", description: "Эксперименты с флоу и звучанием рядом с большой интернет-сценой.", genre: "Trap · Experimental", origin: "Воркута", followers: 600000, monthlyListeners: 3000000, totalPlays: 65000000, influence: 82 },
  { name: "Thomas Mraz", description: "Певучая сторона SoundCloud-эпохи и внимание к мелодии.", genre: "Cloud rap · R&B", origin: "Москва", followers: 350000, monthlyListeners: 1400000, totalPlays: 15000000, influence: 82 },
  { name: "TVETH", description: "Фирменные грубые куплеты и нишевая часть новой волны.", genre: "Trap · Underground", origin: "Санкт-Петербург", followers: 180000, monthlyListeners: 600000, totalPlays: 7000000, influence: 77 },
  { name: "Heronwater", description: "Необычная манера и интонации из дальних уголков русского рэпа.", genre: "Alternative rap · Cloud rap", origin: "Россия", followers: 350000, monthlyListeners: 1800000, totalPlays: 25000000, influence: 80 },
  { name: "9mice", description: "Авангардный поп-рэп и интернет-эстетика новой питерской сцены.", genre: "Rage · Hyperpop", origin: "Санкт-Петербург", followers: 450000, monthlyListeners: 2200000, totalPlays: 35000000, influence: 80 },
  { name: "Kai Angel", description: "Электронная мелодика и клубная энергия на границе жанров.", genre: "Rage · Hyperpop", origin: "Санкт-Петербург", followers: 380000, monthlyListeners: 1900000, totalPlays: 30000000, influence: 80 },
  { name: "Mnogoznaal", description: "Атмосферный звук и тонкий язык одной из самых самобытных сцен.", genre: "Cloud rap · Alternative", origin: "Печора", followers: 400000, monthlyListeners: 2000000, totalPlays: 30000000, influence: 80 },
  { name: "Lizer", description: "Мелодичные треки и честная эмоция, начавшие свой путь в сети.", genre: "Emo rap · Alternative", origin: "Москва", followers: 350000, monthlyListeners: 1400000, totalPlays: 15000000, influence: 78 },
  { name: "Ramil’", description: "Сырой голос и треки, которые долго живут в локальных плейлистах.", genre: "Melodic rap · Pop rap", origin: "Россия", followers: 300000, monthlyListeners: 1500000, totalPlays: 18000000, influence: 78 },
  { name: "Pyrokinesis", description: "Образная лирика и собственная вселенная вне стандартных жанров.", genre: "Alternative hip-hop", origin: "Краснодар", followers: 200000, monthlyListeners: 800000, totalPlays: 8000000, influence: 78 },
  { name: "LOVV66", description: "Обрывки трэпа и мелодичный шум молодой уральской сцены.", genre: "Trap · Underground", origin: "Екатеринбург", followers: 180000, monthlyListeners: 800000, totalPlays: 8000000, influence: 75 },
  { name: "SeeMee", description: "Петербургский рэп-подход и экспериментальная работа с ритмом.", genre: "Underground · Trap", origin: "Санкт-Петербург", followers: 150000, monthlyListeners: 500000, totalPlays: 7000000, influence: 77 },
  { name: "Rickey F", description: "Техника батлов встречается с независимым интернет-релизом.", genre: "Battle rap · Hip-hop", origin: "Москва", followers: 150000, monthlyListeners: 600000, totalPlays: 6000000, influence: 70 },
  { name: "Rizza", description: "Громкий андеграунд и музыка, которую находят через знакомых.", genre: "Underground · Trap", origin: "Россия", followers: 60000, monthlyListeners: 250000, totalPlays: 3000000, influence: 65 },
  { name: "RASKOL", description: "Независимый андеграунд с сырыми релизами и собственным кругом.", genre: "Experimental · Underground", origin: "Россия", followers: 60000, monthlyListeners: 250000, totalPlays: 2000000, influence: 68 },
  { name: "Sqwore", description: "Электронная меланхолия и редкий голос из цифровой глубины.", genre: "Alternative · Hyperpop", origin: "Россия", followers: 50000, monthlyListeners: 120000, totalPlays: 1000000, influence: 65 },
  { name: "LIL MORTY", description: "Неприглаженные трэп-релизы и тихая часть местного андеграунда.", genre: "Underground · Trap", origin: "Россия", followers: 30000, monthlyListeners: 80000, totalPlays: 500000, influence: 55 },
  { name: "Anacondaz", description: "Ироничный рэп-бэнд и независимая DIY-культура.", genre: "Alternative · Hip-hop", origin: "Астрахань", followers: 400000, monthlyListeners: 1200000, totalPlays: 12000000, influence: 74 },
];

async function seedBatch(key: string, values: SeedArtist[]) {
  await db.transaction(async (tx) => {
    const inserted = await tx.insert(appSettings).values({ key, value: "1" }).onConflictDoNothing().returning();
    if (!inserted.length) return;
    const alreadyPresent = await tx.select({ name: artists.name }).from(artists);
    const existingNames = new Set(alreadyPresent.map((artist) => artist.name.toLocaleLowerCase()));
    const missing = values.filter((artist) => !existingNames.has(artist.name.toLocaleLowerCase()));
    if (!missing.length) return;
    await tx.insert(artists).values(missing.map((artist) => {
      const row = {
        ...artist,
        ...seedCriteria(artist),
        soundcloudUrl: artist.soundcloudUrl || "",
        spotifyUrl: "",
        youtubeUrl: "",
        appleMusicUrl: "",
        imageUrl: "",
        secondaryImageUrl: "",
        profileImageUrl: "",
        videoUrl: artist.videoUrl || "",
      };
      return { ...row, score: calculateScore(row) };
    }));
  });
}

async function migrateLegacyScores() {
  await db.transaction(async (tx) => {
    const inserted = await tx.insert(appSettings).values({ key: "artist_scoring_criteria_v1", value: "1" }).onConflictDoNothing().returning();
    if (!inserted.length) return;
    const rows = await tx.select().from(artists);
    for (const artist of rows) {
      const hasEnteredCriteria = artist.telegramFollowers > 0 || artist.tiktokFollowers > 0 || artist.instagramFollowers > 0 || artist.hasPerformed || artist.hasBeenOnTour || artist.siteSupport;
      const demoCriteria = hasEnteredCriteria ? {
        telegramFollowers: artist.telegramFollowers,
        tiktokFollowers: artist.tiktokFollowers,
        instagramFollowers: artist.instagramFollowers,
        hasPerformed: artist.hasPerformed,
        hasBeenOnTour: artist.hasBeenOnTour,
        siteSupport: artist.siteSupport,
      } : demoCriteriaFromLegacyInfluence(artist.influence);
      const values = { ...artist, ...demoCriteria };
      await tx.update(artists).set({ ...demoCriteria, score: calculateScore(values), updatedAt: new Date() }).where(eq(artists.id, artist.id));
    }
  });
}

async function ensureSampleVideos() {
  await db.transaction(async (tx) => {
    const inserted = await tx.insert(appSettings).values({ key: "artists_sample_videos_v1", value: "1" }).onConflictDoNothing().returning();
    if (!inserted.length) return;
    const videos = [
      { name: "Oxxxymiron", url: "https://www.youtube.com/watch?v=XBleNfmkScA" },
      { name: "SALUKI", url: "https://www.youtube.com/watch?v=NytUttpc2pQ" },
    ];
    for (const video of videos) await tx.update(artists).set({ videoUrl: video.url }).where(and(eq(artists.name, video.name), eq(artists.videoUrl, "")));
  });
}

export async function ensureSeeded() {
  await seedBatch("artists_seeded", examples);
  await seedBatch("artists_russian_scene_v1", russianExamples);
  await migrateLegacyScores();
  await ensureSampleVideos();
}

export async function getArtists(): Promise<Artist[]> {
  await ensureSeeded();
  const rows = await db.select().from(artists).orderBy(desc(artists.score), asc(artists.name));
  return rows.map(({ createdAt: _createdAt, updatedAt: _updatedAt, ...artist }) => ({
    ...artist,
    imageUrl: artist.imageUrl.startsWith("data:image/") ? artistPhotoPath(artist.id, "imageUrl") : artist.imageUrl,
    secondaryImageUrl: artist.secondaryImageUrl.startsWith("data:image/") ? artistPhotoPath(artist.id, "secondaryImageUrl") : artist.secondaryImageUrl,
    profileImageUrl: artist.profileImageUrl.startsWith("data:image/") ? artistPhotoPath(artist.id, "profileImageUrl") : artist.profileImageUrl,
  }));
}
