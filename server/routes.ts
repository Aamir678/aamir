import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { timetableSchema, timeSlotSchema, subjectSchema, constraintsSchema } from "@shared/schema";
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes prefix
  const apiRouter = '/api';

  // Get all timetables
  app.get(`${apiRouter}/timetables`, async (req: Request, res: Response) => {
    try {
      const timetables = await storage.getTimetables();
      res.json(timetables);
    } catch (error) {
      console.error('Error fetching timetables:', error);
      res.status(500).json({ message: 'Failed to fetch timetables' });
    }
  });

  // Get timetable by ID
  app.get(`${apiRouter}/timetables/:id`, async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const timetable = await storage.getTimetable(id);
      
      if (!timetable) {
        return res.status(404).json({ message: 'Timetable not found' });
      }
      
      res.json(timetable);
    } catch (error) {
      console.error('Error fetching timetable:', error);
      res.status(500).json({ message: 'Failed to fetch timetable' });
    }
  });

  // Create new timetable
  app.post(`${apiRouter}/timetables`, async (req: Request, res: Response) => {
    try {
      // Validate the request body against the schema
      const validationResult = timetableSchema.omit({ id: true, createdAt: true }).safeParse(req.body);
      
      if (!validationResult.success) {
        const errorMessage = fromZodError(validationResult.error).message;
        return res.status(400).json({ message: `Invalid timetable data: ${errorMessage}` });
      }
      
      const newTimetable = await storage.createTimetable(validationResult.data);
      res.status(201).json(newTimetable);
    } catch (error) {
      console.error('Error creating timetable:', error);
      res.status(500).json({ message: 'Failed to create timetable' });
    }
  });

  // Update timetable
  app.put(`${apiRouter}/timetables/:id`, async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      
      // Validate the request body (allowing partial updates)
      const validationResult = timetableSchema.partial().safeParse(req.body);
      
      if (!validationResult.success) {
        const errorMessage = fromZodError(validationResult.error).message;
        return res.status(400).json({ message: `Invalid timetable data: ${errorMessage}` });
      }
      
      const updatedTimetable = await storage.updateTimetable(id, validationResult.data);
      
      if (!updatedTimetable) {
        return res.status(404).json({ message: 'Timetable not found' });
      }
      
      res.json(updatedTimetable);
    } catch (error) {
      console.error('Error updating timetable:', error);
      res.status(500).json({ message: 'Failed to update timetable' });
    }
  });

  // Delete timetable
  app.delete(`${apiRouter}/timetables/:id`, async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const success = await storage.deleteTimetable(id);
      
      if (!success) {
        return res.status(404).json({ message: 'Timetable not found' });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting timetable:', error);
      res.status(500).json({ message: 'Failed to delete timetable' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
