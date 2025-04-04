import React from 'react';
import { TimeSlot } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DownloadIcon, SaveIcon } from 'lucide-react';
import { exportToPDF } from '@/lib/utils/export';

interface TimetableDisplayProps {
  timetable: { timeSlots: TimeSlot[] } | null;
  viewMode: 'day' | 'week';
  setViewMode: (mode: 'day' | 'week') => void;
  onExport: () => void;
  onSave: () => void;
}

export default function TimetableDisplay({
  timetable,
  viewMode,
  setViewMode,
  onExport,
  onSave,
}: TimetableDisplayProps) {
  // Group time slots by start time for day view
  const groupedByTime = React.useMemo(() => {
    if (!timetable) return [];
    
    return timetable.timeSlots.reduce<{ [key: string]: TimeSlot[] }>((acc, slot) => {
      if (!acc[slot.startTime]) {
        acc[slot.startTime] = [];
      }
      acc[slot.startTime].push(slot);
      return acc;
    }, {});
  }, [timetable]);

  // Group time slots by day for week view
  const groupedByDay = React.useMemo(() => {
    if (!timetable) return {};
    
    return timetable.timeSlots.reduce<{ [key: number]: TimeSlot[] }>((acc, slot) => {
      const day = slot.day ?? 0;
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push(slot);
      return acc;
    }, {});
  }, [timetable]);

  // Get the days of the week
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  // Get background color based on slot type
  const getSlotColor = (slot: TimeSlot) => {
    if (slot.type === 'break') return 'bg-neutral-lightest border-l-4 border-accent';
    if (slot.type === 'lunch') return 'bg-yellow-100 border-l-4 border-yellow-500';
    return slot.color ? `bg-[${slot.color}] border-l-4 border-primary` : 'bg-blue-100 border-l-4 border-primary';
  };

  const handleExport = () => {
    if (timetable) {
      exportToPDF(timetable, viewMode);
    }
    onExport();
  };

  return (
    <Card className="bg-white shadow-sm border border-neutral-light">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold text-neutral-dark">Generated Timetable</CardTitle>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center border border-neutral-light rounded-md overflow-hidden">
            <Button
              variant={viewMode === 'day' ? 'default' : 'ghost'}
              className={viewMode === 'day' ? 'text-white' : 'text-neutral-dark hover:bg-neutral-lightest'}
              size="sm"
              onClick={() => setViewMode('day')}
            >
              Day
            </Button>
            <Button
              variant={viewMode === 'week' ? 'default' : 'ghost'}
              className={viewMode === 'week' ? 'text-white' : 'text-neutral-dark hover:bg-neutral-lightest'}
              size="sm"
              onClick={() => setViewMode('week')}
            >
              Week
            </Button>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-primary hover:text-primary-dark"
            onClick={handleExport}
            disabled={!timetable}
          >
            <DownloadIcon className="h-4 w-4 mr-1" />
            Export
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-primary hover:text-primary-dark"
            onClick={onSave}
            disabled={!timetable}
          >
            <SaveIcon className="h-4 w-4 mr-1" />
            Save
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {timetable ? (
          <div className="overflow-x-auto">
            {viewMode === 'day' ? (
              // Day View
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border border-neutral-light bg-neutral-lightest p-2 text-left text-sm font-medium">Time</th>
                    <th className="border border-neutral-light bg-neutral-lightest p-2 text-left text-sm font-medium">Monday</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(groupedByTime).sort().map((startTime) => {
                    const slots = groupedByTime[startTime];
                    const slot = slots[0]; // For day view, just take the first one
                    
                    return (
                      <tr key={startTime}>
                        <td className="border border-neutral-light p-2 text-sm whitespace-nowrap font-medium">
                          {slot.startTime} - {slot.endTime}
                        </td>
                        <td className="border border-neutral-light p-0">
                          <div className={`timetable-slot h-full p-2 ${getSlotColor(slot)}`}>
                            <div className="font-medium">{slot.name}</div>
                            {slot.room && <div className="text-xs text-neutral-medium">{slot.room}</div>}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              // Week View
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border border-neutral-light bg-neutral-lightest p-2 text-left text-sm font-medium">Time</th>
                    {daysOfWeek.slice(0, 5).map((day) => (
                      <th key={day} className="border border-neutral-light bg-neutral-lightest p-2 text-left text-sm font-medium">{day}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(groupedByTime).sort().map((startTime) => {
                    const slots = groupedByTime[startTime];
                    
                    return (
                      <tr key={startTime}>
                        <td className="border border-neutral-light p-2 text-sm whitespace-nowrap font-medium">
                          {slots[0].startTime} - {slots[0].endTime}
                        </td>
                        
                        {daysOfWeek.slice(0, 5).map((day, dayIndex) => {
                          const daySlot = slots.find((s) => s.day === dayIndex);
                          
                          return (
                            <td key={day} className="border border-neutral-light p-0">
                              {daySlot ? (
                                <div className={`timetable-slot h-full p-2 ${getSlotColor(daySlot)}`}>
                                  <div className="font-medium">{daySlot.name}</div>
                                  {daySlot.room && <div className="text-xs text-neutral-medium">{daySlot.room}</div>}
                                </div>
                              ) : (
                                <div className="h-full p-2 bg-gray-50"></div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          // Empty state
          <div className="text-center py-16">
            <div className="text-neutral-medium mb-2">No timetable generated yet</div>
            <p className="text-sm text-neutral-medium mb-4">Fill out the form and click generate to create your timetable</p>
            <div className="mx-auto w-32 h-32 flex items-center justify-center bg-neutral-lightest rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-medium">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
