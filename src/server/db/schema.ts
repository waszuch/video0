// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm";
import {
	index,
	pgTable,
	pgTableCreator,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";

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
