import { TimeSlot } from "@shared/schema";
import { formatTime12Hour } from "./time";

// This is a placeholder for PDF export functionality
// In a real implementation, this would use a library like jsPDF
export function exportToPDF(timetable: { timeSlots: TimeSlot[] }, viewMode: 'day' | 'week'): void {
  console.log('Exporting timetable to PDF...');
  
  // Create a printable version of the timetable
  const printWindow = window.open('', '_blank');
  
  if (!printWindow) {
    alert('Please allow pop-ups to export the timetable');
    return;
  }
  
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  
  // Group time slots by start time and day
  const groupedByTime: Record<string, Record<number, TimeSlot>> = {};
  
  timetable.timeSlots.forEach(slot => {
    if (!groupedByTime[slot.startTime]) {
      groupedByTime[slot.startTime] = {};
    }
    
    const day = slot.day ?? 0;
    groupedByTime[slot.startTime][day] = slot;
  });
  
  // Generate HTML content
  let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Timetable Export</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
        }
        h1 {
          text-align: center;
          margin-bottom: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #f2f2f2;
        }
        .lunch {
          background-color: #FFF4CC;
        }
        .break {
          background-color: #F5F5F5;
        }
        .subject {
          background-color: #C7E1FF;
        }
        .room {
          font-size: 12px;
          color: #666;
        }
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      </style>
    </head>
    <body>
      <h1>Timetable</h1>
  `;
  
  // Create table based on view mode
  if (viewMode === 'day') {
    htmlContent += `
      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>Monday</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    // Sort time slots by start time
    const sortedTimeSlots = Object.keys(groupedByTime).sort();
    
    sortedTimeSlots.forEach(startTime => {
      const slot = groupedByTime[startTime][0]; // Day 0 for daily view
      
      htmlContent += `
        <tr>
          <td>${formatTime12Hour(slot.startTime)} - ${formatTime12Hour(slot.endTime)}</td>
          <td class="${slot.type}">
            <div>${slot.name}</div>
            ${slot.room ? `<div class="room">${slot.room}</div>` : ''}
          </td>
        </tr>
      `;
    });
    
    htmlContent += `
        </tbody>
      </table>
    `;
  } else {
    // Weekly view
    htmlContent += `
      <table>
        <thead>
          <tr>
            <th>Time</th>
            ${daysOfWeek.map(day => `<th>${day}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
    `;
    
    // Sort time slots by start time
    const sortedTimeSlots = Object.keys(groupedByTime).sort();
    
    sortedTimeSlots.forEach(startTime => {
      const slots = groupedByTime[startTime];
      const firstSlot = slots[Object.keys(slots).map(Number)[0]];
      
      htmlContent += `
        <tr>
          <td>${formatTime12Hour(firstSlot.startTime)} - ${formatTime12Hour(firstSlot.endTime)}</td>
      `;
      
      // Add a cell for each day
      for (let day = 0; day < 5; day++) {
        const slot = slots[day];
        
        if (slot) {
          htmlContent += `
            <td class="${slot.type}">
              <div>${slot.name}</div>
              ${slot.room ? `<div class="room">${slot.room}</div>` : ''}
            </td>
          `;
        } else {
          htmlContent += `<td></td>`;
        }
      }
      
      htmlContent += `</tr>`;
    });
    
    htmlContent += `
        </tbody>
      </table>
    `;
  }
  
  htmlContent += `
      <div style="text-align: center; margin-top: 20px;">
        <button onclick="window.print()">Print</button>
      </div>
    </body>
    </html>
  `;
  
  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
