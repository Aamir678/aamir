// Convert a time string (HH:MM) to minutes since midnight
export function timeToMinutes(timeString: string): number {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}

// Convert minutes since midnight to a time string (HH:MM)
export function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

// Parse a time string to a Date object
export function parseTime(timeString: string): Date {
  const [hours, minutes] = timeString.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

// Add minutes to a time string and return a new time string
export function addMinutes(timeString: string, minutesToAdd: number): string {
  const totalMinutes = timeToMinutes(timeString) + minutesToAdd;
  return formatTime(totalMinutes);
}

// Format time string to 12-hour format (with AM/PM)
export function formatTime12Hour(timeString: string): string {
  const [hours, minutes] = timeString.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12; // Convert 0 to 12 for 12 AM
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

// Calculate duration between two time strings in minutes
export function calculateDuration(startTime: string, endTime: string): number {
  return timeToMinutes(endTime) - timeToMinutes(startTime);
}

// Check if two time ranges overlap
export function doTimesOverlap(
  start1: string, 
  end1: string, 
  start2: string, 
  end2: string
): boolean {
  const start1Mins = timeToMinutes(start1);
  const end1Mins = timeToMinutes(end1);
  const start2Mins = timeToMinutes(start2);
  const end2Mins = timeToMinutes(end2);
  
  return start1Mins < end2Mins && start2Mins < end1Mins;
}
