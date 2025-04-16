// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";
import {
	pgTable,
	pgTableCreator,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { json } from "drizzle-orm/pg-core";
import type { GeneratedAssetsData } from "../schemas/generatedAssetsSchema";
/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `${name}`);

export const profiles = pgTable("profiles", {
	id: uuid("id").primaryKey().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
		.notNull()
		.default(sql`now()`)
		.$onUpdate(() => sql`now()`),
	email: text("email").notNull(),
	fullName: text("full_name").notNull().default(""),
	createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
		.notNull()
		.default(sql`now()`),
});

export const chats = pgTable("chats", {
	id: uuid("id").primaryKey().notNull().defaultRandom(),
	createdAt: timestamp("createdAt").notNull(),
	title: text("title").notNull(),
	profileId: uuid("profileId")
		.notNull()
		.references(() => profiles.id),
});

export const messages = pgTable("messages", {
	id: uuid("id").primaryKey().notNull().defaultRandom(),
	chatId: uuid("chat_id")
		.notNull()
		.references(() => chats.id),
	role: varchar("role").notNull(),
	parts: json("parts").notNull(),
	attachments: json("attachments").notNull(),
	createdAt: timestamp("created_at").notNull(),
});

export type DBMessage = typeof messages.$inferSelect;

export const generated_assets = pgTable("generated_assets", {
	id: uuid("id").primaryKey().notNull().defaultRandom(),
	type: varchar("type", { enum: ["birthdaySong", "birthdayVideo"] }).notNull(),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
	profileId: uuid("proflie_id")
		.notNull()
		.references(() => profiles.id),
	data: json("data").$type<GeneratedAssetsData>().notNull(),
	chatId: uuid("chat_id").references(() => chats.id),
	title: text("title").notNull(),
});

// Drizzle ORM relations
export const profilesRelations = relations(profiles, ({ many }) => ({
	chats: many(chats, { relationName: "ProfileChats" }),
	generatedAssets: many(generated_assets, {
		relationName: "ProfileGeneratedAssets",
	}),
}));

export const chatRelations = relations(chats, ({ one, many }) => ({
	profile: one(profiles, {
		fields: [chats.profileId],
		references: [profiles.id],
		relationName: "ProfileChats",
	}),
	messages: many(messages, { relationName: "ChatMessages" }),
	generatedAssets: many(generated_assets, {
		relationName: "ChatGeneratedAssets",
	}),
}));

export const messageRelations = relations(messages, ({ one }) => ({
	chat: one(chats, {
		fields: [messages.chatId],
		references: [chats.id],
		relationName: "ChatMessages",
	}),
}));

export const generatedAssetsRelations = relations(
	generated_assets,
	({ one }) => ({
		profile: one(profiles, {
			fields: [generated_assets.profileId],
			references: [profiles.id],
			relationName: "ProfileGeneratedAssets",
		}),
		chat: one(chats, {
			fields: [generated_assets.chatId],
			references: [chats.id],
			relationName: "ChatGeneratedAssets",
		}),
	}),
);
