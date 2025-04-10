import mongoose from 'mongoose';
import { IStorage, MemStorage } from './storage';
import { Subject, TimetableSetting, Constraint, GeneratedTimetable } from './db';
import { 
  User, InsertUser, 
  Subject as SubjectType, InsertSubject, 
  TimetableSetting as TimetableSettingType, InsertTimetableSetting,
  Constraint as ConstraintType, InsertConstraint,
  GeneratedTimetable as GeneratedTimetableType, InsertGeneratedTimetable
} from '@shared/schema';
import { log } from './vite';

export class MongoStorage implements IStorage {
  private readonly memStorage: MemStorage;
  private initialized: boolean = false;

  constructor() {
    // Create memory storage as fallback
    this.memStorage = new MemStorage();
  }

  async initialize(): Promise<boolean> {
    if (this.initialized) return true;
    
    try {
      // Check if MongoDB is connected
      if (mongoose.connection.readyState !== 1) {
        log('MongoDB not connected, using memory storage as fallback', 'mongodb');
        return false;
      }

      this.initialized = true;
      return true;
    } catch (error) {
      log(`MongoDB initialization error: ${error instanceof Error ? error.message : String(error)}`, 'mongodb');
      return false;
    }
  }

  // Users (fallback to memory storage for user operations)
  async getUser(id: number): Promise<User | undefined> {
    return this.memStorage.getUser(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.memStorage.getUserByUsername(username);
  }

  async createUser(user: InsertUser): Promise<User> {
    return this.memStorage.createUser(user);
  }

  // Subject methods
  async getSubjects(): Promise<SubjectType[]> {
    if (!await this.initialize()) {
      return this.memStorage.getSubjects();
    }

    try {
      const subjects = await Subject.find().lean();
      return subjects.map((s) => ({
        id: s._id.toString(),
        name: s.name,
        code: s.code,
        teacher: s.teacher,
        periodsPerWeek: s.periodsPerWeek,
        color: s.color,
      })) as unknown as SubjectType[];
    } catch (error) {
      log(`Error getting subjects: ${error instanceof Error ? error.message : String(error)}`, 'mongodb');
      return this.memStorage.getSubjects();
    }
  }

  async getSubject(id: number): Promise<SubjectType | undefined> {
    if (!await this.initialize()) {
      return this.memStorage.getSubject(id);
    }

    try {
      const subject = await Subject.findById(id).lean();
      if (!subject) return undefined;
      
      return {
        id: subject._id.toString(),
        name: subject.name,
        code: subject.code,
        teacher: subject.teacher,
        periodsPerWeek: subject.periodsPerWeek,
        color: subject.color,
      } as unknown as SubjectType;
    } catch (error) {
      log(`Error getting subject: ${error instanceof Error ? error.message : String(error)}`, 'mongodb');
      return this.memStorage.getSubject(id);
    }
  }

  async createSubject(subject: InsertSubject): Promise<SubjectType> {
    if (!await this.initialize()) {
      return this.memStorage.createSubject(subject);
    }

    try {
      const newSubject = new Subject(subject);
      await newSubject.save();
      
      return {
        id: newSubject._id.toString(),
        name: newSubject.name,
        code: newSubject.code,
        teacher: newSubject.teacher,
        periodsPerWeek: newSubject.periodsPerWeek,
        color: newSubject.color,
      } as unknown as SubjectType;
    } catch (error) {
      log(`Error creating subject: ${error instanceof Error ? error.message : String(error)}`, 'mongodb');
      return this.memStorage.createSubject(subject);
    }
  }

  async updateSubject(id: number, subjectUpdate: Partial<InsertSubject>): Promise<SubjectType | undefined> {
    if (!await this.initialize()) {
      return this.memStorage.updateSubject(id, subjectUpdate);
    }

    try {
      const updatedSubject = await Subject.findByIdAndUpdate(
        id,
        { $set: subjectUpdate },
        { new: true, runValidators: true }
      ).lean();
      
      if (!updatedSubject) return undefined;
      
      return {
        id: updatedSubject._id.toString(),
        name: updatedSubject.name,
        code: updatedSubject.code,
        teacher: updatedSubject.teacher,
        periodsPerWeek: updatedSubject.periodsPerWeek,
        color: updatedSubject.color,
      } as unknown as SubjectType;
    } catch (error) {
      log(`Error updating subject: ${error instanceof Error ? error.message : String(error)}`, 'mongodb');
      return this.memStorage.updateSubject(id, subjectUpdate);
    }
  }

  async deleteSubject(id: number): Promise<boolean> {
    if (!await this.initialize()) {
      return this.memStorage.deleteSubject(id);
    }

    try {
      const result = await Subject.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      log(`Error deleting subject: ${error instanceof Error ? error.message : String(error)}`, 'mongodb');
      return this.memStorage.deleteSubject(id);
    }
  }

  // Timetable settings methods
  async getTimetableSettings(): Promise<TimetableSettingType | undefined> {
    if (!await this.initialize()) {
      return this.memStorage.getTimetableSettings();
    }

    try {
      // Get first settings (we only store one record)
      const settings = await TimetableSetting.findOne().lean();
      if (!settings) return undefined;
      
      return {
        id: settings._id.toString(),
        workingDays: settings.workingDays,
        startTime: settings.startTime,
        endTime: settings.endTime,
        periodDuration: settings.periodDuration,
        breakTime: settings.breakTime,
        breakDuration: settings.breakDuration,
        lunchTime: settings.lunchTime,
        lunchDuration: settings.lunchDuration,
      } as unknown as TimetableSettingType;
    } catch (error) {
      log(`Error getting timetable settings: ${error instanceof Error ? error.message : String(error)}`, 'mongodb');
      return this.memStorage.getTimetableSettings();
    }
  }

  async createTimetableSettings(settings: InsertTimetableSetting): Promise<TimetableSettingType> {
    if (!await this.initialize()) {
      return this.memStorage.createTimetableSettings(settings);
    }

    try {
      // Remove any existing settings first (we only need one record)
      await TimetableSetting.deleteMany({});
      
      const newSettings = new TimetableSetting(settings);
      await newSettings.save();
      
      return {
        id: newSettings._id.toString(),
        workingDays: newSettings.workingDays,
        startTime: newSettings.startTime,
        endTime: newSettings.endTime,
        periodDuration: newSettings.periodDuration,
        breakTime: newSettings.breakTime,
        breakDuration: newSettings.breakDuration,
        lunchTime: newSettings.lunchTime,
        lunchDuration: newSettings.lunchDuration,
      } as unknown as TimetableSettingType;
    } catch (error) {
      log(`Error creating timetable settings: ${error instanceof Error ? error.message : String(error)}`, 'mongodb');
      return this.memStorage.createTimetableSettings(settings);
    }
  }

  async updateTimetableSettings(settingsUpdate: Partial<InsertTimetableSetting>): Promise<TimetableSettingType | undefined> {
    if (!await this.initialize()) {
      return this.memStorage.updateTimetableSettings(settingsUpdate);
    }

    try {
      // Find and update the first record (there should be only one)
      const settings = await TimetableSetting.findOne();
      if (!settings) {
        // If no settings exist, create new ones
        return this.createTimetableSettings(settingsUpdate as InsertTimetableSetting);
      }
      
      // Update fields
      Object.keys(settingsUpdate).forEach(key => {
        if (key in settings && settingsUpdate[key as keyof InsertTimetableSetting] !== undefined) {
          settings[key as keyof typeof settings] = settingsUpdate[key as keyof InsertTimetableSetting];
        }
      });
      
      await settings.save();
      
      return {
        id: settings._id.toString(),
        workingDays: settings.workingDays,
        startTime: settings.startTime,
        endTime: settings.endTime,
        periodDuration: settings.periodDuration,
        breakTime: settings.breakTime,
        breakDuration: settings.breakDuration,
        lunchTime: settings.lunchTime,
        lunchDuration: settings.lunchDuration,
      } as unknown as TimetableSettingType;
    } catch (error) {
      log(`Error updating timetable settings: ${error instanceof Error ? error.message : String(error)}`, 'mongodb');
      return this.memStorage.updateTimetableSettings(settingsUpdate);
    }
  }

  // Constraints methods
  async getConstraints(): Promise<ConstraintType[]> {
    if (!await this.initialize()) {
      return this.memStorage.getConstraints();
    }

    try {
      const constraints = await Constraint.find().lean();
      return constraints.map(c => ({
        id: c._id.toString(),
        subjectId: c.subjectId,
        teacherId: c.teacherId,
        avoidConsecutive: c.avoidConsecutive,
        preferMorning: c.preferMorning,
        unavailableSlots: c.unavailableSlots,
      })) as unknown as ConstraintType[];
    } catch (error) {
      log(`Error getting constraints: ${error instanceof Error ? error.message : String(error)}`, 'mongodb');
      return this.memStorage.getConstraints();
    }
  }

  async getConstraint(id: number): Promise<ConstraintType | undefined> {
    if (!await this.initialize()) {
      return this.memStorage.getConstraint(id);
    }

    try {
      const constraint = await Constraint.findById(id).lean();
      if (!constraint) return undefined;
      
      return {
        id: constraint._id.toString(),
        subjectId: constraint.subjectId,
        teacherId: constraint.teacherId,
        avoidConsecutive: constraint.avoidConsecutive,
        preferMorning: constraint.preferMorning,
        unavailableSlots: constraint.unavailableSlots,
      } as unknown as ConstraintType;
    } catch (error) {
      log(`Error getting constraint: ${error instanceof Error ? error.message : String(error)}`, 'mongodb');
      return this.memStorage.getConstraint(id);
    }
  }

  async createConstraint(constraint: InsertConstraint): Promise<ConstraintType> {
    if (!await this.initialize()) {
      return this.memStorage.createConstraint(constraint);
    }

    try {
      const newConstraint = new Constraint(constraint);
      await newConstraint.save();
      
      return {
        id: newConstraint._id.toString(),
        subjectId: newConstraint.subjectId,
        teacherId: newConstraint.teacherId,
        avoidConsecutive: newConstraint.avoidConsecutive,
        preferMorning: newConstraint.preferMorning,
        unavailableSlots: newConstraint.unavailableSlots,
      } as unknown as ConstraintType;
    } catch (error) {
      log(`Error creating constraint: ${error instanceof Error ? error.message : String(error)}`, 'mongodb');
      return this.memStorage.createConstraint(constraint);
    }
  }

  async updateConstraint(id: number, constraintUpdate: Partial<InsertConstraint>): Promise<ConstraintType | undefined> {
    if (!await this.initialize()) {
      return this.memStorage.updateConstraint(id, constraintUpdate);
    }

    try {
      const updatedConstraint = await Constraint.findByIdAndUpdate(
        id,
        { $set: constraintUpdate },
        { new: true, runValidators: true }
      ).lean();
      
      if (!updatedConstraint) return undefined;
      
      return {
        id: updatedConstraint._id.toString(),
        subjectId: updatedConstraint.subjectId,
        teacherId: updatedConstraint.teacherId,
        avoidConsecutive: updatedConstraint.avoidConsecutive,
        preferMorning: updatedConstraint.preferMorning,
        unavailableSlots: updatedConstraint.unavailableSlots,
      } as unknown as ConstraintType;
    } catch (error) {
      log(`Error updating constraint: ${error instanceof Error ? error.message : String(error)}`, 'mongodb');
      return this.memStorage.updateConstraint(id, constraintUpdate);
    }
  }

  async deleteConstraint(id: number): Promise<boolean> {
    if (!await this.initialize()) {
      return this.memStorage.deleteConstraint(id);
    }

    try {
      const result = await Constraint.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      log(`Error deleting constraint: ${error instanceof Error ? error.message : String(error)}`, 'mongodb');
      return this.memStorage.deleteConstraint(id);
    }
  }

  // Generated timetables methods
  async getGeneratedTimetables(): Promise<GeneratedTimetableType[]> {
    if (!await this.initialize()) {
      return this.memStorage.getGeneratedTimetables();
    }

    try {
      const timetables = await GeneratedTimetable.find().lean();
      return timetables.map(t => ({
        id: t._id.toString(),
        name: t.name,
        timetable: t.timetable,
        createdAt: t.createdAt,
      })) as unknown as GeneratedTimetableType[];
    } catch (error) {
      log(`Error getting generated timetables: ${error instanceof Error ? error.message : String(error)}`, 'mongodb');
      return this.memStorage.getGeneratedTimetables();
    }
  }

  async getGeneratedTimetable(id: number): Promise<GeneratedTimetableType | undefined> {
    if (!await this.initialize()) {
      return this.memStorage.getGeneratedTimetable(id);
    }

    try {
      const timetable = await GeneratedTimetable.findById(id).lean();
      if (!timetable) return undefined;
      
      return {
        id: timetable._id.toString(),
        name: timetable.name,
        timetable: timetable.timetable,
        createdAt: timetable.createdAt,
      } as unknown as GeneratedTimetableType;
    } catch (error) {
      log(`Error getting generated timetable: ${error instanceof Error ? error.message : String(error)}`, 'mongodb');
      return this.memStorage.getGeneratedTimetable(id);
    }
  }

  async createGeneratedTimetable(timetable: InsertGeneratedTimetable): Promise<GeneratedTimetableType> {
    if (!await this.initialize()) {
      return this.memStorage.createGeneratedTimetable(timetable);
    }

    try {
      const newTimetable = new GeneratedTimetable(timetable);
      await newTimetable.save();
      
      return {
        id: newTimetable._id.toString(),
        name: newTimetable.name,
        timetable: newTimetable.timetable,
        createdAt: newTimetable.createdAt,
      } as unknown as GeneratedTimetableType;
    } catch (error) {
      log(`Error creating generated timetable: ${error instanceof Error ? error.message : String(error)}`, 'mongodb');
      return this.memStorage.createGeneratedTimetable(timetable);
    }
  }

  async deleteGeneratedTimetable(id: number): Promise<boolean> {
    if (!await this.initialize()) {
      return this.memStorage.deleteGeneratedTimetable(id);
    }

    try {
      const result = await GeneratedTimetable.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      log(`Error deleting generated timetable: ${error instanceof Error ? error.message : String(error)}`, 'mongodb');
      return this.memStorage.deleteGeneratedTimetable(id);
    }
  }
}