import { sql } from "drizzle-orm";
import { check, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const reservations = sqliteTable(
  "reservations",
  {
    id: text("id")
      .primaryKey()
      .default(sql`(lower(hex(randomblob(16))))`),
    date: text("date").notNull(),
    time: text("time").notNull(),
    customerName: text("customer_name"),
    customerLastName: text("customer_lastname").notNull(),
    customerBirthDay: text("customer_birthday").notNull(),
    customerContact: text("customer_contact").notNull(),
    customerAllergy: text("customer_allergy"),
    status: text("status").default("active").notNull(),
    cancelReason: text("cancel_reason"), // Opcional: razón de cancelación
    attendanceStatus: text("attendance_status").default("pending").notNull(),
    attendanceTime: text("attendance_time"), // Hora de llegada del cliente
    updatedAt: text("updated_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    createdAt: text("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    peopleNr: integer("peopleNr").notNull(),
  },
  (table) => [
    check(
      "status_check",
      sql`${table.status} IN ('active', 'canceled', 'modified')`
    ),

    check(
      "attendance_status_check",
      sql`${table.attendanceStatus} IN ('pending', 'attended', 'late', 'no_show')`
    ),
  ]
);

export type Reservation = typeof reservations.$inferSelect;
export type InsertReservation = typeof reservations.$inferInsert;

export const closedDays = sqliteTable("closed_days", (t) => ({
  id: text("id")
    .primaryKey()
    .default(sql`(lower(hex(randomblob(16))))`),
  date: text("date").notNull().unique(),
  reason: text("reason"),
  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
}));

export type ClosedDay = typeof closedDays.$inferSelect;
export type InsertClosedDay = typeof closedDays.$inferInsert;

export const specialSchedules = sqliteTable("special_schedules", (t) => ({
  id: text("id")
    .primaryKey()
    .default(sql`(lower(hex(randomblob(16))))`),
  date: text("date").unique().notNull(),
  openTime: text("open_time").notNull(),
  closeTime: text("close_time").notNull(),
  reason: text("reason"),
  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  maxPeople: integer("maxPeople")
}));

export type SpecialSchedule = typeof specialSchedules.$inferSelect;
export type NewSpecialSchedule = typeof specialSchedules.$inferInsert;
