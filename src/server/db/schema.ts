import { createId } from "@paralleldrive/cuid2";
import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";
import {
	integer,
	pgTable,
	pgTableCreator,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { json } from "drizzle-orm/pg-core";
import type { GeneratedAssetsDataSchema } from "../schemas/generatedAssetsSchema";

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
	transformedImages: json("transformed_images").$type<string[]>().notNull(),
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

export const generatedAssets = pgTable("generated_assets", {
	id: text("id")
		.primaryKey()
		.notNull()
		.$defaultFn(() => createId()),
	type: varchar("type", { enum: ["birthdaySong", "birthdayVideo"] }).notNull(),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
	profileId: uuid("proflie_id")
		.notNull()
		.references(() => profiles.id),
	data: json("data").$type<GeneratedAssetsDataSchema>().notNull(),
	chatId: uuid("chat_id").references(() => chats.id),
	title: text("title").notNull(),
});

// Drizzle ORM relations
export const profilesRelations = relations(profiles, ({ many, one }) => ({
	chats: many(chats, { relationName: "ProfileChats" }),
	generatedAssets: many(generatedAssets, {
		relationName: "ProfileGeneratedAssets",
	}),
	generationTokens: one(generationTokens, {
		relationName: "ProfileGenerationTokens",
		fields: [profiles.id],
		references: [generationTokens.profileId],
	}),
}));

export const chatRelations = relations(chats, ({ one, many }) => ({
	profile: one(profiles, {
		fields: [chats.profileId],
		references: [profiles.id],
		relationName: "ProfileChats",
	}),
	messages: many(messages, { relationName: "ChatMessages" }),
	generatedAssets: many(generatedAssets, {
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
	generatedAssets,
	({ one }) => ({
		profile: one(profiles, {
			fields: [generatedAssets.profileId],
			references: [profiles.id],
			relationName: "ProfileGeneratedAssets",
		}),
		chat: one(chats, {
			fields: [generatedAssets.chatId],
			references: [chats.id],
			relationName: "ChatGeneratedAssets",
		}),
	}),
);

export const customers = pgTable("customers", {
	id: uuid("id").primaryKey().notNull(),
	polarCustomerId: text("polar_customer_id").notNull(),
	profileId: uuid("profile_id")
		.notNull()
		.references(() => profiles.id),
});

export const customerRelations = relations(customers, ({ one }) => ({
	profile: one(profiles, {
		fields: [customers.profileId],
		references: [profiles.id],
	}),
}));

export const generationTokens = pgTable("generation_tokens", {
	id: uuid("id").primaryKey().notNull(),
	profileId: uuid("profile_id")
		.notNull()
		.references(() => profiles.id),
	initialTokenAmount: integer("initial_token_amount").notNull(),
	availableTokens: integer("available_tokens").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
		.notNull()
		.default(sql`now()`),
});

export type DBGenerationToken = typeof generationTokens.$inferSelect;

export const generationTokensRelations = relations(
	generationTokens,
	({ one }) => ({
		profile: one(profiles, {
			fields: [generationTokens.profileId],
			references: [profiles.id],
		}),
	}),
);

export const generationTokenTopups = pgTable("generation_token_topups", {
	id: uuid("id").primaryKey().notNull(),
	generationTokenId: uuid("generation_token_id")
		.notNull()
		.references(() => generationTokens.id),
	amount: integer("amount").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
		.notNull()
		.default(sql`now()`),
	profileId: uuid("profile_id")
		.notNull()
		.references(() => profiles.id),
	polarOrderId: text("polar_order_id").notNull(),
});

export const generationTokenTopupRelations = relations(
	generationTokenTopups,
	({ one }) => ({
		generationToken: one(generationTokens, {
			fields: [generationTokenTopups.generationTokenId],
			references: [generationTokens.id],
		}),
	}),
);

export const generationTransactions = pgTable("generation_transactions", {
	id: uuid("id").primaryKey().notNull(),
	generationTokenId: uuid("generation_token_id")
		.notNull()
		.references(() => generationTokens.id),
	amount: integer("amount").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
		.notNull()
		.default(sql`now()`),
});

export const generationTransactionRelations = relations(
	generationTransactions,
	({ one }) => ({
		generationToken: one(generationTokens, {
			fields: [generationTransactions.generationTokenId],
			references: [generationTokens.id],
		}),
	}),
);
