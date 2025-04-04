import { v4 as uuidv4 } from 'uuid';
import { Constraints, Subject, TimeSlot } from '@shared/schema';
import { addMinutes, formatTime, parseTime, timeToMinutes } from './utils/time';

interface GenerateResult {
  timetable: {
    timeSlots: TimeSlot[];
  };
  conflicts: string[];
}

export function generateTimetable(constraints: Constraints, subjects: Subject[]): GenerateResult {
  const timeSlots: TimeSlot[] = [];
  const conflicts: string[] = [];
  
  const { 
    scheduleType, 
    startTime, 
    endTime, 
    lunchTime, 
    lunchDuration, 
    breakFrequency, 
    breakDuration 
  } = constraints;
  
  // Determine the number of days to generate a schedule for
  const days = scheduleType === 'weekly' ? 5 : 1; // Mon-Fri for weekly, just one day for daily
  
  // We'll track occupied time slots to avoid overlaps
  const occupiedSlots: Record<number, number[]> = {};
  for (let day = 0; day < days; day++) {
    occupiedSlots[day] = [];
  }
  
  // First, add the fixed lunch break for all days
  const lunchStart = lunchTime;
  const lunchEnd = addMinutes(lunchStart, parseInt(lunchDuration.toString(), 10));
  
  for (let day = 0; day < days; day++) {
    // Mark lunch time as occupied
    const lunchStartMinutes = timeToMinutes(lunchStart);
    const lunchEndMinutes = timeToMinutes(lunchEnd);
    
    for (let min = lunchStartMinutes; min < lunchEndMinutes; min++) {
      occupiedSlots[day].push(min);
    }
    
    // Add lunch slot to the timetable
    timeSlots.push({
      id: uuidv4(),
      startTime: lunchStart,
      endTime: lunchEnd,
      day: scheduleType === 'weekly' ? day : undefined,
      type: 'lunch',
      name: 'Lunch Break',
      color: '#FFF4CC',
    });
  }
  
  // Add hourly breaks if configured
  if (breakFrequency === 'hourly') {
    const startTimeMinutes = timeToMinutes(startTime);
    const endTimeMinutes = timeToMinutes(endTime);
    
    // Start from the next hour after start time
    let currentHour = Math.ceil(startTimeMinutes / 60) * 60;
    
    while (currentHour < endTimeMinutes) {
      const breakStartTime = formatTime(currentHour);
      const breakEndTime = formatTime(currentHour + parseInt(breakDuration.toString(), 10));
      
      // Skip if this break overlaps with lunch
      const breakStartMinutes = currentHour;
      const breakEndMinutes = currentHour + parseInt(breakDuration.toString(), 10);
      
      for (let day = 0; day < days; day++) {
        // Check if break overlaps with lunch
        let overlapsLunch = false;
        for (let min = breakStartMinutes; min < breakEndMinutes; min++) {
          if (occupiedSlots[day].includes(min)) {
            overlapsLunch = true;
            break;
          }
        }
        
        if (!overlapsLunch) {
          // Mark break time as occupied
          for (let min = breakStartMinutes; min < breakEndMinutes; min++) {
            occupiedSlots[day].push(min);
          }
          
          // Add break slot to the timetable
          timeSlots.push({
            id: uuidv4(),
            startTime: breakStartTime,
            endTime: breakEndTime,
            day: scheduleType === 'weekly' ? day : undefined,
            type: 'break',
            name: 'Short Break',
            color: '#F5F5F5',
          });
        }
      }
      
      // Move to next hour
      currentHour += 60;
    }
  }
  
  // Now distribute subjects across the available time slots
  // We'll try to fit subjects in the gaps between fixed breaks
  const startTimeMinutes = timeToMinutes(startTime);
  const endTimeMinutes = timeToMinutes(endTime);
  
  // Create a copy of subjects to avoid modifying the original
  const subjectQueue = [...subjects];
  
  // For each day, find available time slots and fill them with subjects
  for (let day = 0; day < days; day++) {
    let currentTime = startTimeMinutes;
    
    while (currentTime < endTimeMinutes && subjectQueue.length > 0) {
      // Find the next occupied slot
      const nextOccupiedTime = occupiedSlots[day].find(time => time > currentTime) || endTimeMinutes;
      
      // Calculate available time until the next occupied slot
      const availableTime = nextOccupiedTime - currentTime;
      
      // Find a subject that fits in this time slot
      const subjectIndex = subjectQueue.findIndex(
        subject => parseInt(subject.duration.toString(), 10) <= availableTime
      );
      
      if (subjectIndex !== -1) {
        // We found a subject that fits
        const subject = subjectQueue[subjectIndex];
        const subjectDuration = parseInt(subject.duration.toString(), 10);
        
        // Create a time slot for this subject
        const subjectStartTime = formatTime(currentTime);
        const subjectEndTime = formatTime(currentTime + subjectDuration);
        
        timeSlots.push({
          id: uuidv4(),
          startTime: subjectStartTime,
          endTime: subjectEndTime,
          day: scheduleType === 'weekly' ? day : undefined,
          type: 'subject',
          subjectId: subject.id,
          name: subject.name,
          room: subject.room,
          color: subject.color || getRandomPastelColor(),
        });
        
        // Mark this time as occupied
        for (let min = currentTime; min < currentTime + subjectDuration; min++) {
          occupiedSlots[day].push(min);
        }
        
        // Remove the subject from the queue if it's a daily schedule
        // For weekly schedules, we keep subjects in the queue for other days
        if (scheduleType === 'daily') {
          subjectQueue.splice(subjectIndex, 1);
        } else if (day === days - 1) {
          // If it's the last day and we're in weekly mode, remove the subject
          subjectQueue.splice(subjectIndex, 1);
        }
        
        // Move current time forward
        currentTime += subjectDuration;
      } else {
        // No subject fits in this gap, so move to the next occupied slot
        currentTime = nextOccupiedTime;
      }
    }
  }
  
  // Check if we couldn't fit all subjects
  if (subjectQueue.length > 0) {
    conflicts.push(`Not enough time allocated for all subjects. ${subjectQueue.length} subjects couldn't be scheduled.`);
    
    // List the subjects that couldn't be scheduled
    subjectQueue.forEach(subject => {
      conflicts.push(`${subject.name} (${subject.duration} min) couldn't be scheduled.`);
    });
  }
  
  // Sort time slots by day and start time for consistent ordering
  timeSlots.sort((a, b) => {
    const dayA = a.day ?? 0;
    const dayB = b.day ?? 0;
    
    if (dayA !== dayB) return dayA - dayB;
    
    return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
  });
  
  return { timetable: { timeSlots }, conflicts };
}

// Helper function to generate a random pastel color
function getRandomPastelColor(): string {
  const colors = [
    '#C7E1FF', // Light Blue
    '#D1F7C4', // Light Green
    '#E6D4FF', // Light Purple
    '#FFD6E5', // Light Pink
    '#FFF4CC', // Light Yellow
    '#D4F6FF', // Light Cyan
    '#FFE8C2', // Light Orange
    '#DCEDC8', // Light Lime
  ];
  
  return colors[Math.floor(Math.random() * colors.length)];
}
