import { pgTable, text, serial, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema from the original
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Subject schema
export const subjectSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Subject name is required"),
  duration: z.string().or(z.number()), // Duration in minutes
  color: z.string().optional(),
  room: z.string().optional(),
});

export type Subject = z.infer<typeof subjectSchema>;

// Constraints schema
export const constraintsSchema = z.object({
  scheduleType: z.enum(["daily", "weekly"]),
  startTime: z.string(),
  endTime: z.string(),
  lunchTime: z.string(),
  lunchDuration: z.string().or(z.number()),
  breakFrequency: z.enum(["hourly", "custom"]),
  breakDuration: z.string().or(z.number()),
  customBreaks: z.array(z.object({
    time: z.string(),
    duration: z.string().or(z.number()),
  })).optional(),
});

export type Constraints = z.infer<typeof constraintsSchema>;

// TimeSlot schema
export const timeSlotSchema = z.object({
  id: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  day: z.number().optional(), // 0-6 for weekdays, undefined for daily
  type: z.enum(["subject", "lunch", "break"]),
  subjectId: z.string().optional(),
  name: z.string(),
  room: z.string().optional(),
  color: z.string().optional(),
});

export type TimeSlot = z.infer<typeof timeSlotSchema>;

// Timetable schema
export const timetableSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Timetable name is required"),
  constraints: constraintsSchema,
  subjects: z.array(subjectSchema),
  timeSlots: z.array(timeSlotSchema),
  createdAt: z.date().optional(),
});

export type Timetable = z.infer<typeof timetableSchema>;

// Timetables storage
export const timetables = pgTable("timetables", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  constraints: jsonb("constraints").notNull(),
  subjects: jsonb("subjects").notNull(),
  timeSlots: jsonb("timeSlots").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const insertTimetableSchema = createInsertSchema(timetables);
export type InsertTimetable = z.infer<typeof insertTimetableSchema>;
export type TimetableModel = typeof timetables.$inferSelect;
