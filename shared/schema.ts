import { pgTable, text, serial, integer, boolean, json, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema (kept from original file)
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
export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  code: text("code").notNull(),
  name: text("name").notNull(),
  teacher: text("teacher"),
  periodsPerWeek: integer("periods_per_week").notNull(),
  color: text("color").notNull(),
});

export const insertSubjectSchema = createInsertSchema(subjects).pick({
  code: true,
  name: true,
  teacher: true,
  periodsPerWeek: true,
  color: true,
});

export type InsertSubject = z.infer<typeof insertSubjectSchema>;
export type Subject = typeof subjects.$inferSelect;

// Timetable setting schema
export const timetableSettings = pgTable("timetable_settings", {
  id: serial("id").primaryKey(),
  workingDays: json("working_days").notNull().$type<string[]>(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  periodDuration: integer("period_duration").notNull(),
  breakTime: text("break_time").notNull(),
  breakDuration: integer("break_duration").notNull(),
  lunchTime: text("lunch_time").notNull(),
  lunchDuration: integer("lunch_duration").notNull(),
});

export const insertTimetableSettingSchema = createInsertSchema(timetableSettings).pick({
  workingDays: true,
  startTime: true,
  endTime: true,
  periodDuration: true,
  breakTime: true,
  breakDuration: true,
  lunchTime: true,
  lunchDuration: true,
});

export type InsertTimetableSetting = z.infer<typeof insertTimetableSettingSchema>;
export type TimetableSetting = typeof timetableSettings.$inferSelect;

// Constraints schema
export const constraints = pgTable("constraints", {
  id: serial("id").primaryKey(),
  subjectId: integer("subject_id"),
  teacherId: integer("teacher_id"),
  avoidConsecutive: boolean("avoid_consecutive"),
  preferMorning: boolean("prefer_morning"),
  unavailableSlots: json("unavailable_slots").notNull().$type<{day: string, time: string}[]>(),
});

export const insertConstraintSchema = createInsertSchema(constraints).pick({
  subjectId: true,
  teacherId: true,
  avoidConsecutive: true,
  preferMorning: true,
  unavailableSlots: true,
});

export type InsertConstraint = z.infer<typeof insertConstraintSchema>;
export type Constraint = typeof constraints.$inferSelect;

// Generated timetable schema
export const generatedTimetables = pgTable("generated_timetables", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  timetable: json("timetable").notNull().$type<TimetableData>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertGeneratedTimetableSchema = createInsertSchema(generatedTimetables).pick({
  name: true,
  timetable: true,
});

export type InsertGeneratedTimetable = z.infer<typeof insertGeneratedTimetableSchema>;
export type GeneratedTimetable = typeof generatedTimetables.$inferSelect;

// Additional types for the timetable data structure
export type TimeSlot = {
  start: string;
  end: string;
};

export type TimetableEntry = {
  subject: Subject;
  time: TimeSlot;
  type: 'class' | 'break' | 'lunch';
};

export type DaySchedule = {
  day: string;
  entries: TimetableEntry[];
};

export type TimetableData = {
  days: DaySchedule[];
  settings: TimetableSetting;
};
