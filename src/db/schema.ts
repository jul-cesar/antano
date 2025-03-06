import { sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const reservations = sqliteTable("reservations", (t) => ({
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  date: text("date").notNull(),
  time: text("time").notNull(),
  customerName: text("customer_name"),
  customerContact: text("customer_contact"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
}));


export type Reservation = typeof reservations.$inferSelect;
export type InsertReservation= typeof reservations.$inferInsert;



export const closedDays = sqliteTable("closed_days", (t) => ({
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  date: text("date").unique().notNull(),
  reason: text("reason"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
}));

export type ClosedDay = typeof closedDays.$inferSelect
export type InsertClosedDay = typeof closedDays.$inferInsert


export const specialSchedules = sqliteTable("special_schedules", (t) => ({
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  date: text("date").unique().notNull(),
  openTime: text("open_time").notNull(),
  closeTime: text("close_time").notNull(),
  reason: text("reason"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
}));

export type SpecialSchedule =  typeof specialSchedules.$inferSelect
export type NewSpecialSchedule = typeof specialSchedules.$inferInsert

