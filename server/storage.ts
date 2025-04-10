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
import { MongoClient, ServerApiVersion, Db, ObjectId } from 'mongodb';

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
      { code: "MATH101", name: "Mathematics", teacher: "Mr. Johnson", periodsPerWeek: 5, color: "#3B82F6" },
      { code: "PHYS101", name: "Physics", teacher: "Ms. Williams", periodsPerWeek: 4, color: "#10B981" },
      { code: "ENG101", name: "English", teacher: "Mr. Davis", periodsPerWeek: 4, color: "#6366F1" },
      { code: "CHEM101", name: "Chemistry", teacher: "Ms. Thompson", periodsPerWeek: 3, color: "#8B5CF6" },
      { code: "BIO101", name: "Biology", teacher: "Ms. Martinez", periodsPerWeek: 3, color: "#EC4899" }
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

export class MongoStorage implements IStorage {
  private client: MongoClient;
  private db: Db | null = null;
  private connected: boolean = false;
  private currentIds: Map<string, number> = new Map();
  
  constructor() {
    const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
    this.client = new MongoClient(uri, { 
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
      }
    });
    
    // Initialize counters
    this.currentIds.set('users', 1);
    this.currentIds.set('subjects', 1);
    this.currentIds.set('constraints', 1);
    this.currentIds.set('timetables', 1);
  }
  
  async connect(): Promise<void> {
    if (this.connected) return;
    
    try {
      await this.client.connect();
      this.db = this.client.db('timetable_app');
      this.connected = true;
      console.log('Connected to MongoDB');
      
      // Initialize with default data if collections are empty
      await this.initializeDefaultData();
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }
  
  async initializeDefaultData() {
    if (!this.db) await this.connect();
    
    // Check if subjects collection is empty
    const subjectsCount = await this.db!.collection('subjects').countDocuments();
    if (subjectsCount === 0) {
      // Add default subjects
      const defaultSubjects: InsertSubject[] = [
        { code: "MATH101", name: "Mathematics", teacher: "Mr. Johnson", periodsPerWeek: 5, color: "#3B82F6" },
        { code: "PHYS101", name: "Physics", teacher: "Ms. Williams", periodsPerWeek: 4, color: "#10B981" },
        { code: "ENG101", name: "English", teacher: "Mr. Davis", periodsPerWeek: 4, color: "#6366F1" },
        { code: "CHEM101", name: "Chemistry", teacher: "Ms. Thompson", periodsPerWeek: 3, color: "#8B5CF6" },
        { code: "BIO101", name: "Biology", teacher: "Ms. Martinez", periodsPerWeek: 3, color: "#EC4899" }
      ];
      
      for (const subject of defaultSubjects) {
        await this.createSubject(subject);
      }
    }
    
    // Check if settings collection is empty
    const settingsCount = await this.db!.collection('timetable_settings').countDocuments();
    if (settingsCount === 0) {
      // Add default timetable settings
      await this.createTimetableSettings({
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
  }
  
  private async getNextId(collection: string): Promise<number> {
    let currentId = this.currentIds.get(collection) || 1;
    this.currentIds.set(collection, currentId + 1);
    return currentId;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    if (!this.db) await this.connect();
    const user = await this.db!.collection('users').findOne({ id });
    return user ? (user as User) : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    if (!this.db) await this.connect();
    const user = await this.db!.collection('users').findOne({ username });
    return user ? (user as User) : undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    if (!this.db) await this.connect();
    const id = await this.getNextId('users');
    const user: User = { ...insertUser, id };
    await this.db!.collection('users').insertOne(user);
    return user;
  }
  
  // Subject methods
  async getSubjects(): Promise<Subject[]> {
    if (!this.db) await this.connect();
    const subjects = await this.db!.collection('subjects').find().toArray();
    return subjects as Subject[];
  }
  
  async getSubject(id: number): Promise<Subject | undefined> {
    if (!this.db) await this.connect();
    const subject = await this.db!.collection('subjects').findOne({ id });
    return subject ? (subject as Subject) : undefined;
  }
  
  async createSubject(insertSubject: InsertSubject): Promise<Subject> {
    if (!this.db) await this.connect();
    const id = await this.getNextId('subjects');
    const subject: Subject = { ...insertSubject, id };
    await this.db!.collection('subjects').insertOne(subject);
    return subject;
  }
  
  async updateSubject(id: number, subjectUpdate: Partial<InsertSubject>): Promise<Subject | undefined> {
    if (!this.db) await this.connect();
    const result = await this.db!.collection('subjects').findOneAndUpdate(
      { id },
      { $set: subjectUpdate },
      { returnDocument: 'after' }
    );
    return result ? (result as Subject) : undefined;
  }
  
  async deleteSubject(id: number): Promise<boolean> {
    if (!this.db) await this.connect();
    const result = await this.db!.collection('subjects').deleteOne({ id });
    return result.deletedCount === 1;
  }
  
  // Timetable settings methods
  async getTimetableSettings(): Promise<TimetableSetting | undefined> {
    if (!this.db) await this.connect();
    const settings = await this.db!.collection('timetable_settings').findOne({});
    return settings ? (settings as TimetableSetting) : undefined;
  }
  
  async createTimetableSettings(settings: InsertTimetableSetting): Promise<TimetableSetting> {
    if (!this.db) await this.connect();
    const timetableSetting: TimetableSetting = { ...settings, id: 1 };
    
    // Try to update first, if it doesn't exist, insert
    const result = await this.db!.collection('timetable_settings').updateOne(
      { id: 1 },
      { $set: timetableSetting },
      { upsert: true }
    );
    
    return timetableSetting;
  }
  
  async updateTimetableSettings(settingsUpdate: Partial<InsertTimetableSetting>): Promise<TimetableSetting | undefined> {
    if (!this.db) await this.connect();
    const result = await this.db!.collection('timetable_settings').findOneAndUpdate(
      { id: 1 },
      { $set: settingsUpdate },
      { returnDocument: 'after' }
    );
    return result ? (result as TimetableSetting) : undefined;
  }
  
  // Constraints methods
  async getConstraints(): Promise<Constraint[]> {
    if (!this.db) await this.connect();
    const constraints = await this.db!.collection('constraints').find().toArray();
    return constraints as Constraint[];
  }
  
  async getConstraint(id: number): Promise<Constraint | undefined> {
    if (!this.db) await this.connect();
    const constraint = await this.db!.collection('constraints').findOne({ id });
    return constraint ? (constraint as Constraint) : undefined;
  }
  
  async createConstraint(insertConstraint: InsertConstraint): Promise<Constraint> {
    if (!this.db) await this.connect();
    const id = await this.getNextId('constraints');
    const constraint: Constraint = { ...insertConstraint, id };
    await this.db!.collection('constraints').insertOne(constraint);
    return constraint;
  }
  
  async updateConstraint(id: number, constraintUpdate: Partial<InsertConstraint>): Promise<Constraint | undefined> {
    if (!this.db) await this.connect();
    const result = await this.db!.collection('constraints').findOneAndUpdate(
      { id },
      { $set: constraintUpdate },
      { returnDocument: 'after' }
    );
    return result ? (result as Constraint) : undefined;
  }
  
  async deleteConstraint(id: number): Promise<boolean> {
    if (!this.db) await this.connect();
    const result = await this.db!.collection('constraints').deleteOne({ id });
    return result.deletedCount === 1;
  }
  
  // Generated timetable methods
  async getGeneratedTimetables(): Promise<GeneratedTimetable[]> {
    if (!this.db) await this.connect();
    const timetables = await this.db!.collection('generated_timetables').find().toArray();
    return timetables as GeneratedTimetable[];
  }
  
  async getGeneratedTimetable(id: number): Promise<GeneratedTimetable | undefined> {
    if (!this.db) await this.connect();
    const timetable = await this.db!.collection('generated_timetables').findOne({ id });
    return timetable ? (timetable as GeneratedTimetable) : undefined;
  }
  
  async createGeneratedTimetable(insertTimetable: InsertGeneratedTimetable): Promise<GeneratedTimetable> {
    if (!this.db) await this.connect();
    const id = await this.getNextId('timetables');
    const timetable: GeneratedTimetable = { 
      ...insertTimetable, 
      id,
      createdAt: new Date()
    };
    await this.db!.collection('generated_timetables').insertOne(timetable);
    return timetable;
  }
  
  async deleteGeneratedTimetable(id: number): Promise<boolean> {
    if (!this.db) await this.connect();
    const result = await this.db!.collection('generated_timetables').deleteOne({ id });
    return result.deletedCount === 1;
  }
}

// Choose which storage implementation to use
const USE_MONGODB = process.env.USE_MONGODB === 'true';

// Export the appropriate storage implementation
export const storage = USE_MONGODB ? new MongoStorage() : new MemStorage();
