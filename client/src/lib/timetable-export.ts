import { TimetableData } from "@shared/schema";

/**
 * Export timetable as CSV
 */
export function exportTimetable(timetable: TimetableData): void {
  const csvContent = generateCSV(timetable);
  downloadCSV(csvContent, "timetable.csv");
}

/**
 * Generate CSV content from timetable data
 */
function generateCSV(timetable: TimetableData): string {
  const { days } = timetable;
  
  // Get all unique time slots across all days
  const allTimeSlots = Array.from(
    new Set(
      days.flatMap(day => 
        day.entries.map(entry => `${entry.time.start}-${entry.time.end}`)
      )
    )
  ).sort();
  
  // Create CSV header
  let csv = `Time,${days.map(day => day.day).join(',')}\n`;
  
  // Add rows for each time slot
  allTimeSlots.forEach(timeSlot => {
    const [start, end] = timeSlot.split('-');
    let row = `${start}-${end}`;
    
    days.forEach(day => {
      const entry = day.entries.find(e => 
        e.time.start === start && e.time.end === end
      );
      
      if (entry) {
        row += `,${entry.subject.name}`;
      } else {
        row += `,`;
      }
    });
    
    csv += row + '\n';
  });
  
  return csv;
}

/**
 * Trigger download of CSV file
 */
function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export timetable as PDF (placeholder for future implementation)
 */
export function exportTimetablePDF(timetable: TimetableData): void {
  // This would be implemented with a PDF generation library
  // For now, we'll just use CSV export
  exportTimetable(timetable);
}
