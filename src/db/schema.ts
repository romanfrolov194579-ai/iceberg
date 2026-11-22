import { bigint, boolean, integer, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const artists = pgTable("artists", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull().unique(),
  description: text("description").notNull().default(""),
  genre: varchar("genre", { length: 120 }).notNull().default(""),
  origin: varchar("origin", { length: 120 }).notNull().default(""),
  followers: bigint("followers", { mode: "number" }).notNull().default(0),
  monthlyListeners: bigint("monthly_listeners", { mode: "number" }).notNull().default(0),
  totalPlays: bigint("total_plays", { mode: "number" }).notNull().default(0),
  telegramFollowers: bigint("telegram_followers", { mode: "number" }).notNull().default(0),
  tiktokFollowers: bigint("tiktok_followers", { mode: "number" }).notNull().default(0),
  instagramFollowers: bigint("instagram_followers", { mode: "number" }).notNull().default(0),
  hasPerformed: boolean("has_performed").notNull().default(false),
  hasBeenOnTour: boolean("has_been_on_tour").notNull().default(false),
  siteSupport: boolean("site_support").notNull().default(false),
  influence: integer("influence").notNull().default(0),
  score: integer("score").notNull().default(0),
  soundcloudUrl: text("soundcloud_url").notNull().default(""),
  spotifyUrl: text("spotify_url").notNull().default(""),
  youtubeUrl: text("youtube_url").notNull().default(""),
  appleMusicUrl: text("apple_music_url").notNull().default(""),
  imageUrl: text("image_url").notNull().default(""),
  secondaryImageUrl: text("secondary_image_url").notNull().default(""),
  profileImageUrl: text("profile_image_url").notNull().default(""),
  videoUrl: text("video_url").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const appSettings = pgTable("app_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});
