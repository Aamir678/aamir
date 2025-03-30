import { TimetableSetting, Subject, Constraint, TimetableData, DaySchedule, TimetableEntry, TimeSlot } from "@shared/schema";

/**
 * Generate a complete timetable based on settings, subjects, and constraints
 */
export function generateTimetable(
  subjects: Subject[],
  settings: TimetableSetting,
  constraints: Constraint[] = []
): TimetableData {
  const { workingDays, startTime, endTime, periodDuration, breakTime, breakDuration, lunchTime, lunchDuration } = settings;
  
  // Generate all possible time slots
  const timeSlots = generateTimeSlots(startTime, endTime, periodDuration);
  
  // Initialize timetable structure
  const days: DaySchedule[] = workingDays.map(day => {
    // Initialize with fixed breaks and lunch
    const entries: TimetableEntry[] = [];
    
    // Add break time
    entries.push({
      subject: { id: 0, name: "Morning Break", teacher: "", periodsPerWeek: 0, color: "#F59E0B" },
      time: { start: breakTime, end: addMinutesToTime(breakTime, breakDuration) },
      type: "break"
    });
    
    // Add lunch time
    entries.push({
      subject: { id: 0, name: "Lunch Break", teacher: "", periodsPerWeek: 0, color: "#F59E0B" },
      time: { start: lunchTime, end: addMinutesToTime(lunchTime, lunchDuration) },
      type: "lunch"
    });
    
    return { day, entries };
  });
  
  // Allocate subjects to time slots
  allocateSubjects(days, subjects, timeSlots, settings, constraints);
  
  return {
    days,
    settings
  };
}

/**
 * Generate time slots based on start time, end time, and period duration
 */
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

/**
 * Add minutes to a time string and return the new time
 */
function addMinutesToTime(timeStr: string, minutes: number): string {
  const [hours, mins] = timeStr.split(':').map(Number);
  const totalMinutes = hours * 60 + mins + minutes;
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMinutes = totalMinutes % 60;
  return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
}

/**
 * Allocate subjects to available time slots
 */
function allocateSubjects(
  days: DaySchedule[],
  subjects: Subject[],
  timeSlots: TimeSlot[],
  settings: TimetableSetting,
  constraints: Constraint[]
): void {
  // Create a distribution plan: how many periods per subject per day
  const subjectDistribution = createSubjectDistribution(subjects, days.length);
  
  // For each day in the timetable
  days.forEach((day, dayIndex) => {
    const availableSlots = [...timeSlots];
    
    // Remove slots that overlap with breaks or lunch
    const fixedEntries = day.entries.filter(entry => entry.type === 'break' || entry.type === 'lunch');
    const unavailableSlots = fixedEntries.map(entry => entry.time);
    
    // Filter out unavailable slots
    const usableSlots = availableSlots.filter(slot => 
      !unavailableSlots.some(unavailableSlot => 
        (slot.start < unavailableSlot.end && slot.end > unavailableSlot.start)
      )
    );
    
    // Allocate subjects for this day
    subjects.forEach(subject => {
      const periodsForThisDay = subjectDistribution[subject.id] ? subjectDistribution[subject.id][dayIndex] : 0;
      
      for (let i = 0; i < periodsForThisDay; i++) {
        if (usableSlots.length === 0) continue;
        
        // Simple algorithm: just take the next available slot
        // In a real implementation, we would consider constraints here
        const slotIndex = Math.floor(Math.random() * usableSlots.length);
        const slot = usableSlots[slotIndex];
        
        // Remove the used slot
        usableSlots.splice(slotIndex, 1);
        
        // Add the entry to the day's schedule
        day.entries.push({
          subject,
          time: slot,
          type: 'class'
        });
      }
    });
    
    // Sort entries by start time
    day.entries.sort((a, b) => a.time.start.localeCompare(b.time.start));
  });
}

/**
 * Create a distribution plan for subjects across days
 */
function createSubjectDistribution(subjects: Subject[], numDays: number): Record<number, number[]> {
  const distribution: Record<number, number[]> = {};
  
  subjects.forEach(subject => {
    distribution[subject.id] = Array(numDays).fill(0);
    
    // Distribute periods evenly across days
    let remaining = subject.periodsPerWeek;
    let currentDay = 0;
    
    while (remaining > 0) {
      distribution[subject.id][currentDay]++;
      remaining--;
      currentDay = (currentDay + 1) % numDays;
    }
  });
  
  return distribution;
}
