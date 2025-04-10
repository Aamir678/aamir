import mongoose from 'mongoose';
import { log } from './vite';

// Use the provided URI or a fallback for local development/testing
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/timetableDB';

// Connect to MongoDB
export async function connectToDatabase() {
  try {
    log(`Connecting to MongoDB at ${MONGODB_URI.split('@').pop()}`, 'mongodb');
    
    // Add a timeout to prevent hanging
    const connectPromise = mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // 5 seconds
      connectTimeoutMS: 5000
    });
    
    // Set a timeout to avoid hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Connection timeout')), 5000);
    });
    
    // Race the connect promise against the timeout
    await Promise.race([connectPromise, timeoutPromise]);
    
    log('Connected to MongoDB successfully', 'mongodb');
    return mongoose.connection;
  } catch (error) {
    log(`Error connecting to MongoDB: ${error instanceof Error ? error.message : String(error)}`, 'mongodb');
    console.error('MongoDB connection error:', error);
    // Fall back to memory storage if unable to connect
    log('Falling back to in-memory storage', 'mongodb');
    return null;
  }
}

// Define schemas
const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true },
  teacher: { type: String, default: null },
  periodsPerWeek: { type: Number, required: true },
  color: { type: String, required: true }
});

const timetableSettingSchema = new mongoose.Schema({
  workingDays: { type: [String], required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  periodDuration: { type: Number, required: true },
  breakTime: { type: String, required: true },
  breakDuration: { type: Number, required: true },
  lunchTime: { type: String, required: true },
  lunchDuration: { type: Number, required: true }
});

const constraintSchema = new mongoose.Schema({
  subjectId: { type: Number, default: null },
  teacherId: { type: Number, default: null },
  avoidConsecutive: { type: Boolean, default: false },
  preferMorning: { type: Boolean, default: false },
  unavailableSlots: { type: [{ day: String, time: String }], default: [] }
});

const generatedTimetableSchema = new mongoose.Schema({
  name: { type: String, required: true },
  timetable: { type: Object, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Create models
export const Subject = mongoose.model('Subject', subjectSchema);
export const TimetableSetting = mongoose.model('TimetableSetting', timetableSettingSchema);
export const Constraint = mongoose.model('Constraint', constraintSchema);
export const GeneratedTimetable = mongoose.model('GeneratedTimetable', generatedTimetableSchema);