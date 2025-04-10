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
  /**
   * Create a distribution plan for subjects across the week based on their periodsPerWeek
   * Returns a map of subjectId -> array of position indices in the week
   */
  function createSubjectDistribution(subjects: Subject[], totalSlotsPerWeek: number): Record<string, number[]> {
    const distribution: Record<string, number[]> = {};
    
    // Initialize available slots with all positions
    const availableSlots = Array.from({ length: totalSlotsPerWeek }, (_, i) => i);
    
    // Sort subjects by periodsPerWeek in descending order to prioritize subjects with more periods
    const sortedSubjects = [...subjects].sort((a, b) => b.periodsPerWeek - a.periodsPerWeek);
    
    for (const subject of sortedSubjects) {
      const subjectId = subject.id.toString();
      distribution[subjectId] = [];
      
      // Allocate slots based on periodsPerWeek
      let periodsToAllocate = Math.min(subject.periodsPerWeek, availableSlots.length);
      
      // Skip if no periods to allocate
      if (periodsToAllocate <= 0) continue;
      
      // Try to spread the periods evenly through the week
      const stride = Math.floor(availableSlots.length / periodsToAllocate);
      
      for (let i = 0; i < periodsToAllocate; i++) {
        // Calculate a good position: start with every "stride" position
        const pos = i * stride < availableSlots.length ? i * stride : availableSlots.length - 1;
        
        const slotPos = availableSlots[pos];
        distribution[subjectId].push(slotPos);
        
        // Remove allocated slot
        availableSlots.splice(pos, 1);
      }
    }
    
    console.log("Subject distribution plan created:", distribution);
    return distribution;
  }

  function generateTimetable(
    subjects: Subject[], 
    settings: any, 
    constraints: any[]
  ): TimetableData {
    const { workingDays, startTime, endTime, periodDuration, breakTime, breakDuration, lunchTime, lunchDuration } = settings;
    
    // Generate time slots
    const timeSlots = generateTimeSlots(startTime, endTime, periodDuration);
    
    // Debug log
    console.log(`Settings: startTime=${startTime}, endTime=${endTime}, breakTime=${breakTime}, lunchTime=${lunchTime}`);
    
    // Create days array with entries
    const days: DaySchedule[] = workingDays.map((day: string) => {
      // Initialize entries with breaks and lunch
      const entries: TimetableEntry[] = [];
      
      // Create separate objects for each special period to avoid reference issues
      const breakSubject = { 
        id: 0, 
        name: "Morning Break", 
        code: "BREAK", 
        teacher: "", 
        periodsPerWeek: 0, 
        color: "#F59E0B" 
      };
      
      const lunchSubject = { 
        id: 0, 
        name: "Lunch Break", 
        code: "LUNCH", 
        teacher: "", 
        periodsPerWeek: 0, 
        color: "#F59E0B" 
      };
      
      // Always add break
      const breakStartTime = breakTime;
      const breakEndTime = addMinutesToTime(breakTime, breakDuration);
      console.log(`Adding break time: ${breakStartTime}-${breakEndTime}`);
      entries.push({
        subject: breakSubject,
        time: { 
          start: breakStartTime, 
          end: breakEndTime 
        },
        type: "break"
      });
      
      // Always add lunch
      const lunchStartTime = lunchTime;
      const lunchEndTime = addMinutesToTime(lunchTime, lunchDuration);
      console.log(`Adding lunch time: ${lunchStartTime}-${lunchEndTime}`);
      entries.push({
        subject: lunchSubject,
        time: { 
          start: lunchStartTime, 
          end: lunchEndTime 
        },
        type: "lunch"
      });
      
      // Now add subjects to the available time slots
      timeSlots.forEach(slot => {
        // Debug log for checking overlap
        console.log(`Checking if time slot ${slot.start}-${slot.end} overlaps with break or lunch`);
        
        // Skip if this slot overlaps with a break or lunch
        if (
          (slot.start === breakTime || 
           (slot.start < addMinutesToTime(breakTime, breakDuration) && slot.end > breakTime)) ||
          (slot.start === lunchTime || 
           (slot.start < addMinutesToTime(lunchTime, lunchDuration) && slot.end > lunchTime))
        ) {
          console.log(`Slot ${slot.start}-${slot.end} overlaps with break or lunch, skipping`);
          return;
        }
        
        // Get a subject that still needs periods allocated for this week
        // Create a distribution plan based on periodsPerWeek
        const dayIndex = workingDays.indexOf(day);
        const slotIndex = timeSlots.indexOf(slot);
        
        // Create a position index for the slot in the week
        const positionInWeek = dayIndex * timeSlots.length + slotIndex;
        
        // Find a subject that still needs periods
        let selectedSubject: Subject | null = null;
        
        // Try to find a subject using the distribution plan
        const subjectDistribution = createSubjectDistribution(subjects, workingDays.length * timeSlots.length);
        
        // Find which subject should be allocated at this position
        for (const subjectId in subjectDistribution) {
          const positions = subjectDistribution[subjectId];
          if (positions.includes(positionInWeek)) {
            selectedSubject = subjects.find(s => s.id.toString() === subjectId) || null;
            break;
          }
        }
        
        // Fallback: use round-robin if no subject found through distribution
        if (!selectedSubject) {
          const subjectIndex = positionInWeek % subjects.length;
          selectedSubject = subjects[subjectIndex];
        }
        
        entries.push({
          subject: selectedSubject,
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
    
    console.log("Generated time slots:", slots.map(slot => `${slot.start}-${slot.end}`));
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
