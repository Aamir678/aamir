import { v4 as uuidv4 } from "uuid";
import { 
  users, 
  type User, 
  type InsertUser, 
  type Timetable,
  type Subject,
  type TimeSlot,
  type Constraints
} from "@shared/schema";

// Modify the interface with CRUD methods for timetables
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Timetable operations
  getTimetables(): Promise<Timetable[]>;
  getTimetable(id: string): Promise<Timetable | undefined>;
  createTimetable(timetable: Omit<Timetable, 'id' | 'createdAt'>): Promise<Timetable>;
  updateTimetable(id: string, timetable: Partial<Timetable>): Promise<Timetable | undefined>;
  deleteTimetable(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private timetables: Map<string, Timetable>;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.timetables = new Map();
    this.currentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Timetable operations
  async getTimetables(): Promise<Timetable[]> {
    return Array.from(this.timetables.values()).sort((a, b) => {
      const dateA = a.createdAt || new Date(0);
      const dateB = b.createdAt || new Date(0);
      return dateB.getTime() - dateA.getTime(); // Sort by newest first
    });
  }

  async getTimetable(id: string): Promise<Timetable | undefined> {
    return this.timetables.get(id);
  }

  async createTimetable(timetable: Omit<Timetable, 'id' | 'createdAt'>): Promise<Timetable> {
    const id = uuidv4();
    const newTimetable: Timetable = { 
      ...timetable, 
      id, 
      createdAt: new Date() 
    };
    this.timetables.set(id, newTimetable);
    return newTimetable;
  }

  async updateTimetable(id: string, timetableUpdate: Partial<Timetable>): Promise<Timetable | undefined> {
    const existing = this.timetables.get(id);
    if (!existing) return undefined;

    const updated: Timetable = { ...existing, ...timetableUpdate };
    this.timetables.set(id, updated);
    return updated;
  }

  async deleteTimetable(id: string): Promise<boolean> {
    return this.timetables.delete(id);
  }
}

export const storage = new MemStorage();
