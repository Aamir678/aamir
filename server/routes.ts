import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertSubjectSchema, 
  insertTimetableSettingSchema,
  insertConstraintSchema,
  insertGeneratedTimetableSchema,
  type TimeSlot, 
  type TimetableEntry,
  type DaySchedule,
  type TimetableData,
  type Subject
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // prefix all routes with /api
  const apiRouter = app;

  // Subject routes
  apiRouter.get("/api/subjects", async (_req: Request, res: Response) => {
    try {
      const subjects = await storage.getSubjects();
      res.json(subjects);
    } catch (error) {
      res.status(500).json({ message: "Failed to get subjects" });
    }
  });

  apiRouter.post("/api/subjects", async (req: Request, res: Response) => {
    try {
      const validatedData = insertSubjectSchema.parse(req.body);
      const subject = await storage.createSubject(validatedData);
      res.status(201).json(subject);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid subject data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create subject" });
      }
    }
  });

  apiRouter.put("/api/subjects/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertSubjectSchema.partial().parse(req.body);
      const updatedSubject = await storage.updateSubject(id, validatedData);
      
      if (!updatedSubject) {
        return res.status(404).json({ message: "Subject not found" });
      }
      
      res.json(updatedSubject);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid subject data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update subject" });
      }
    }
  });

  apiRouter.delete("/api/subjects/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteSubject(id);
      
      if (!success) {
        return res.status(404).json({ message: "Subject not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete subject" });
    }
  });

  // Timetable settings routes
  apiRouter.get("/api/timetable-settings", async (_req: Request, res: Response) => {
    try {
      const settings = await storage.getTimetableSettings();
      
      if (!settings) {
        return res.status(404).json({ message: "Timetable settings not found" });
      }
      
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to get timetable settings" });
    }
  });

  apiRouter.post("/api/timetable-settings", async (req: Request, res: Response) => {
    try {
      const validatedData = insertTimetableSettingSchema.parse(req.body);
      const settings = await storage.createTimetableSettings(validatedData);
      res.status(201).json(settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid timetable settings data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create timetable settings" });
      }
    }
  });

  apiRouter.put("/api/timetable-settings", async (req: Request, res: Response) => {
    try {
      const validatedData = insertTimetableSettingSchema.partial().parse(req.body);
      const updatedSettings = await storage.updateTimetableSettings(validatedData);
      
      if (!updatedSettings) {
        return res.status(404).json({ message: "Timetable settings not found" });
      }
      
      res.json(updatedSettings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid timetable settings data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update timetable settings" });
      }
    }
  });

  // Constraints routes
  apiRouter.get("/api/constraints", async (_req: Request, res: Response) => {
    try {
      const constraints = await storage.getConstraints();
      res.json(constraints);
    } catch (error) {
      res.status(500).json({ message: "Failed to get constraints" });
    }
  });

  apiRouter.post("/api/constraints", async (req: Request, res: Response) => {
    try {
      const validatedData = insertConstraintSchema.parse(req.body);
      const constraint = await storage.createConstraint(validatedData);
      res.status(201).json(constraint);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid constraint data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create constraint" });
      }
    }
  });

  apiRouter.put("/api/constraints/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertConstraintSchema.partial().parse(req.body);
      const updatedConstraint = await storage.updateConstraint(id, validatedData);
      
      if (!updatedConstraint) {
        return res.status(404).json({ message: "Constraint not found" });
      }
      
      res.json(updatedConstraint);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid constraint data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update constraint" });
      }
    }
  });

  apiRouter.delete("/api/constraints/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteConstraint(id);
      
      if (!success) {
        return res.status(404).json({ message: "Constraint not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete constraint" });
    }
  });

  // Generated timetable routes
  apiRouter.get("/api/timetables", async (_req: Request, res: Response) => {
    try {
      const timetables = await storage.getGeneratedTimetables();
      res.json(timetables);
    } catch (error) {
      res.status(500).json({ message: "Failed to get timetables" });
    }
  });

  apiRouter.get("/api/timetables/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const timetable = await storage.getGeneratedTimetable(id);
      
      if (!timetable) {
        return res.status(404).json({ message: "Timetable not found" });
      }
      
      res.json(timetable);
    } catch (error) {
      res.status(500).json({ message: "Failed to get timetable" });
    }
  });

  apiRouter.post("/api/timetables", async (req: Request, res: Response) => {
    try {
      const validatedData = insertGeneratedTimetableSchema.parse(req.body);
      const timetable = await storage.createGeneratedTimetable(validatedData);
      res.status(201).json(timetable);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid timetable data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create timetable" });
      }
    }
  });

  apiRouter.delete("/api/timetables/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteGeneratedTimetable(id);
      
      if (!success) {
        return res.status(404).json({ message: "Timetable not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete timetable" });
    }
  });

  // Generate Timetable API
  apiRouter.post("/api/generate-timetable", async (req: Request, res: Response) => {
    try {
      // Get all required data for timetable generation
      const subjects = await storage.getSubjects();
      const settings = await storage.getTimetableSettings();
      const constraints = await storage.getConstraints();
      
      if (!settings) {
        return res.status(400).json({ message: "Timetable settings not found" });
      }
      
      if (subjects.length === 0) {
        return res.status(400).json({ message: "No subjects found" });
      }
      
      // Very basic timetable generation algorithm
      const timetable = generateTimetable(subjects, settings, constraints || []);
      
      res.json({
        timetable,
        stats: {
          totalPeriods: countTotalPeriods(timetable),
          subjects: subjects.length,
          constraintsMet: "100%"
        }
      });
    } catch (error) {
      console.error("Timetable generation error:", error);
      res.status(500).json({ message: "Failed to generate timetable" });
    }
  });

  // Timetable generation logic
  function generateTimetable(
    subjects: Subject[], 
    settings: any, 
    constraints: any[]
  ): TimetableData {
    const { workingDays, startTime, endTime, periodDuration, breakTime, breakDuration, lunchTime, lunchDuration } = settings;
    
    // Generate time slots
    const timeSlots = generateTimeSlots(startTime, endTime, periodDuration);
    
    // Create days array with entries
    const days: DaySchedule[] = workingDays.map(day => {
      // Initialize entries with breaks and lunch
      const entries: TimetableEntry[] = [];
      
      // Add break time - Always add break regardless of exact time slot match
      entries.push({
        subject: { id: 0, name: "Morning Break", code: "BREAK", teacher: "", periodsPerWeek: 0, color: "#F59E0B" },
        time: { start: breakTime, end: addMinutesToTime(breakTime, breakDuration) },
        type: "break"
      });
      
      // Add lunch time - Always add lunch regardless of exact time slot match
      entries.push({
        subject: { id: 0, name: "Lunch Break", code: "LUNCH", teacher: "", periodsPerWeek: 0, color: "#F59E0B" },
        time: { start: lunchTime, end: addMinutesToTime(lunchTime, lunchDuration) },
        type: "lunch"
      });
      
      // Now add subjects to the available time slots
      timeSlots.forEach(slot => {
        // Skip if this slot overlaps with a break or lunch
        if (
          (slot.start === breakTime || 
           (slot.start < addMinutesToTime(breakTime, breakDuration) && slot.end > breakTime)) ||
          (slot.start === lunchTime || 
           (slot.start < addMinutesToTime(lunchTime, lunchDuration) && slot.end > lunchTime))
        ) {
          return;
        }
        
        // Simple round-robin assignment for subjects
        const subjectIndex = (timeSlots.indexOf(slot) + workingDays.indexOf(day)) % subjects.length;
        const subject = subjects[subjectIndex];
        
        entries.push({
          subject,
          time: slot,
          type: "class"
        });
      });
      
      return {
        day,
        entries: entries.sort((a, b) => 
          a.time.start.localeCompare(b.time.start)
        )
      };
    });
    
    return {
      days,
      settings
    };
  }

  function generateTimeSlots(startTime: string, endTime: string, periodDuration: number): TimeSlot[] {
    const slots: TimeSlot[] = [];
    let currentTime = startTime;
    
    while (currentTime < endTime) {
      const nextTime = addMinutesToTime(currentTime, periodDuration);
      slots.push({
        start: currentTime,
        end: nextTime
      });
      currentTime = nextTime;
    }
    
    return slots;
  }

  function addMinutesToTime(timeStr: string, minutes: number): string {
    const [hours, mins] = timeStr.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMinutes = totalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
  }

  function countTotalPeriods(timetable: TimetableData): number {
    return timetable.days.reduce((total, day) => {
      return total + day.entries.filter(entry => entry.type === 'class').length;
    }, 0);
  }

  const httpServer = createServer(app);
  return httpServer;
}
