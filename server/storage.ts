import { 
  type User, 
  type InsertUser, 
  type Subject, 
  type InsertSubject,
  type TimetableSetting,
  type InsertTimetableSetting,
  type Constraint,
  type InsertConstraint,
  type GeneratedTimetable,
  type InsertGeneratedTimetable,
  type TimetableData
} from "@shared/schema";

export interface IStorage {
  // User methods (kept from original file)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Subject methods
  getSubjects(): Promise<Subject[]>;
  getSubject(id: number): Promise<Subject | undefined>;
  createSubject(subject: InsertSubject): Promise<Subject>;
  updateSubject(id: number, subject: Partial<InsertSubject>): Promise<Subject | undefined>;
  deleteSubject(id: number): Promise<boolean>;
  
  // Timetable settings methods
  getTimetableSettings(): Promise<TimetableSetting | undefined>;
  createTimetableSettings(settings: InsertTimetableSetting): Promise<TimetableSetting>;
  updateTimetableSettings(settings: Partial<InsertTimetableSetting>): Promise<TimetableSetting | undefined>;
  
  // Constraints methods
  getConstraints(): Promise<Constraint[]>;
  getConstraint(id: number): Promise<Constraint | undefined>;
  createConstraint(constraint: InsertConstraint): Promise<Constraint>;
  updateConstraint(id: number, constraint: Partial<InsertConstraint>): Promise<Constraint | undefined>;
  deleteConstraint(id: number): Promise<boolean>;
  
  // Generated timetable methods
  getGeneratedTimetables(): Promise<GeneratedTimetable[]>;
  getGeneratedTimetable(id: number): Promise<GeneratedTimetable | undefined>;
  createGeneratedTimetable(timetable: InsertGeneratedTimetable): Promise<GeneratedTimetable>;
  deleteGeneratedTimetable(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private subjects: Map<number, Subject>;
  private timetableSettings: TimetableSetting | undefined;
  private constraints: Map<number, Constraint>;
  private generatedTimetables: Map<number, GeneratedTimetable>;
  
  currentUserId: number;
  currentSubjectId: number;
  currentConstraintId: number;
  currentTimetableId: number;

  constructor() {
    this.users = new Map();
    this.subjects = new Map();
    this.constraints = new Map();
    this.generatedTimetables = new Map();
    
    this.currentUserId = 1;
    this.currentSubjectId = 1;
    this.currentConstraintId = 1;
    this.currentTimetableId = 1;
    
    // Initialize with default data
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Add default subjects
    const defaultSubjects: InsertSubject[] = [
      { name: "Mathematics", teacher: "Mr. Johnson", periodsPerWeek: 5, color: "#3B82F6" },
      { name: "Physics", teacher: "Ms. Williams", periodsPerWeek: 4, color: "#10B981" },
      { name: "English", teacher: "Mr. Davis", periodsPerWeek: 4, color: "#6366F1" },
      { name: "Chemistry", teacher: "Ms. Thompson", periodsPerWeek: 3, color: "#8B5CF6" },
      { name: "Biology", teacher: "Ms. Martinez", periodsPerWeek: 3, color: "#EC4899" }
    ];
    
    defaultSubjects.forEach(subject => this.createSubject(subject));
    
    // Add default timetable settings
    this.createTimetableSettings({
      workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      startTime: "08:00",
      endTime: "16:00",
      periodDuration: 45,
      breakTime: "10:30",
      breakDuration: 15,
      lunchTime: "12:30",
      lunchDuration: 45
    });
  }

  // User methods (kept from original file)
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Subject methods
  async getSubjects(): Promise<Subject[]> {
    return Array.from(this.subjects.values());
  }
  
  async getSubject(id: number): Promise<Subject | undefined> {
    return this.subjects.get(id);
  }
  
  async createSubject(insertSubject: InsertSubject): Promise<Subject> {
    const id = this.currentSubjectId++;
    const subject: Subject = { ...insertSubject, id };
    this.subjects.set(id, subject);
    return subject;
  }
  
  async updateSubject(id: number, subjectUpdate: Partial<InsertSubject>): Promise<Subject | undefined> {
    const subject = this.subjects.get(id);
    if (!subject) return undefined;
    
    const updatedSubject = { ...subject, ...subjectUpdate };
    this.subjects.set(id, updatedSubject);
    return updatedSubject;
  }
  
  async deleteSubject(id: number): Promise<boolean> {
    return this.subjects.delete(id);
  }
  
  // Timetable settings methods
  async getTimetableSettings(): Promise<TimetableSetting | undefined> {
    return this.timetableSettings;
  }
  
  async createTimetableSettings(settings: InsertTimetableSetting): Promise<TimetableSetting> {
    const timetableSetting: TimetableSetting = { ...settings, id: 1 };
    this.timetableSettings = timetableSetting;
    return timetableSetting;
  }
  
  async updateTimetableSettings(settingsUpdate: Partial<InsertTimetableSetting>): Promise<TimetableSetting | undefined> {
    if (!this.timetableSettings) return undefined;
    
    const updatedSettings = { ...this.timetableSettings, ...settingsUpdate };
    this.timetableSettings = updatedSettings;
    return updatedSettings;
  }
  
  // Constraints methods
  async getConstraints(): Promise<Constraint[]> {
    return Array.from(this.constraints.values());
  }
  
  async getConstraint(id: number): Promise<Constraint | undefined> {
    return this.constraints.get(id);
  }
  
  async createConstraint(insertConstraint: InsertConstraint): Promise<Constraint> {
    const id = this.currentConstraintId++;
    const constraint: Constraint = { ...insertConstraint, id };
    this.constraints.set(id, constraint);
    return constraint;
  }
  
  async updateConstraint(id: number, constraintUpdate: Partial<InsertConstraint>): Promise<Constraint | undefined> {
    const constraint = this.constraints.get(id);
    if (!constraint) return undefined;
    
    const updatedConstraint = { ...constraint, ...constraintUpdate };
    this.constraints.set(id, updatedConstraint);
    return updatedConstraint;
  }
  
  async deleteConstraint(id: number): Promise<boolean> {
    return this.constraints.delete(id);
  }
  
  // Generated timetable methods
  async getGeneratedTimetables(): Promise<GeneratedTimetable[]> {
    return Array.from(this.generatedTimetables.values());
  }
  
  async getGeneratedTimetable(id: number): Promise<GeneratedTimetable | undefined> {
    return this.generatedTimetables.get(id);
  }
  
  async createGeneratedTimetable(insertTimetable: InsertGeneratedTimetable): Promise<GeneratedTimetable> {
    const id = this.currentTimetableId++;
    const timetable: GeneratedTimetable = { 
      ...insertTimetable, 
      id,
      createdAt: new Date()
    };
    this.generatedTimetables.set(id, timetable);
    return timetable;
  }
  
  async deleteGeneratedTimetable(id: number): Promise<boolean> {
    return this.generatedTimetables.delete(id);
  }
}

export const storage = new MemStorage();
