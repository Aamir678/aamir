import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Share2, Printer } from "lucide-react";
import { format } from "date-fns";

interface TimetableProps {
  timetable: any;
  isLoading: boolean;
}

export default function TimetableDisplay({ timetable, isLoading }: TimetableProps) {
  const [viewMode, setViewMode] = useState<"weekly" | "daily">("weekly");
  const [selectedDay, setSelectedDay] = useState<string>("Monday");

  const formatTime = (timeString: string) => {
    // Format from 24-hour to 12-hour if needed
    return timeString;
  };

  const getSubjectColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      "#3B82F6": "bg-blue-50 border border-blue-200",
      "#10B981": "bg-green-50 border border-green-200",
      "#6366F1": "bg-indigo-50 border border-indigo-200",
      "#8B5CF6": "bg-purple-50 border border-purple-200",
      "#EC4899": "bg-pink-50 border border-pink-200",
      "#F59E0B": "bg-amber-50 border border-amber-200",
    };
    
    return colorMap[color] || "bg-gray-50 border border-gray-200";
  };

  const renderWeeklyView = () => {
    if (!timetable?.days || timetable.days.length === 0) {
      return (
        <div className="p-6 text-center text-gray-500">
          No timetable data available. Generate a timetable first.
        </div>
      );
    }

    // Get all unique time slots across all days
    const allTimeSlots = Array.from(
      new Set(
        timetable.days.flatMap((day: any) => 
          day.entries.map((entry: any) => `${entry.time.start}-${entry.time.end}`)
        )
      )
    ).sort();

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Time</th>
              {timetable.days.map((day: any) => (
                <th key={day.day} scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {day.day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {allTimeSlots.map((timeSlot) => {
              const [start, end] = timeSlot.split('-');
              
              // Check if this is a break or lunch slot
              const isBreakOrLunch = timetable.days.some((day: any) => 
                day.entries.some((entry: any) => 
                  (entry.type === 'break' || entry.type === 'lunch') && 
                  entry.time.start === start && 
                  entry.time.end === end
                )
              );
              
              return (
                <tr key={timeSlot} className={isBreakOrLunch ? "bg-amber-50" : ""}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-500">
                    {start}-{end}
                  </td>
                  
                  {timetable.days.map((day: any) => {
                    const entry = day.entries.find((e: any) => 
                      e.time.start === start && e.time.end === end
                    );
                    
                    if (!entry) {
                      return <td key={`${day.day}-${timeSlot}`} className="px-4 py-3"></td>;
                    }
                    
                    if (entry.type === 'break' || entry.type === 'lunch') {
                      return (
                        <td key={`${day.day}-${timeSlot}`} className="px-4 py-3 text-sm text-amber-700 font-medium text-center" colSpan={timetable.days.length}>
                          <div className="flex items-center justify-center">
                            {entry.type === 'break' ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm0 2h12v12H4V4zm2 3a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h5a1 1 0 000-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM13 16a1 1 0 102 0v-5.586l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 101.414 1.414L13 10.414V16z" />
                              </svg>
                            )}
                            <span>{entry.subject.name}</span>
                          </div>
                        </td>
                      );
                    }
                    
                    return (
                      <td key={`${day.day}-${timeSlot}`} className="px-4 py-3">
                        <div className={`p-2 rounded text-sm ${getSubjectColorClass(entry.subject.color)}`}>
                          {entry.subject.name}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const renderDailyView = () => {
    if (!timetable?.days || timetable.days.length === 0) {
      return (
        <div className="p-6 text-center text-gray-500">
          No timetable data available. Generate a timetable first.
        </div>
      );
    }

    const selectedDayData = timetable.days.find((day: any) => day.day === selectedDay);
    
    if (!selectedDayData) {
      return (
        <div className="p-6 text-center text-gray-500">
          No data available for {selectedDay}.
        </div>
      );
    }

    // Get day index for next/prev navigation
    const currentDayIndex = timetable.days.findIndex((day: any) => day.day === selectedDay);
    
    const goToPrevDay = () => {
      const prevIndex = (currentDayIndex - 1 + timetable.days.length) % timetable.days.length;
      setSelectedDay(timetable.days[prevIndex].day);
    };
    
    const goToNextDay = () => {
      const nextIndex = (currentDayIndex + 1) % timetable.days.length;
      setSelectedDay(timetable.days[nextIndex].day);
    };

    return (
      <div className="px-6 py-4">
        <div className="flex justify-between items-center mb-4">
          <Button variant="ghost" size="sm" onClick={goToPrevDay}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </Button>
          <h3 className="text-lg font-medium">{selectedDay}</h3>
          <Button variant="ghost" size="sm" onClick={goToNextDay}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10l-3.293-3.293a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </Button>
        </div>
        
        <div className="space-y-3">
          {selectedDayData.entries.sort((a: any, b: any) => 
            a.time.start.localeCompare(b.time.start)
          ).map((entry: any, index: number) => {
            const isBreakOrLunch = entry.type === 'break' || entry.type === 'lunch';
            
            return (
              <div 
                key={index} 
                className={`flex border rounded-md overflow-hidden ${isBreakOrLunch ? 'bg-amber-50' : ''}`}
              >
                <div className={`py-3 px-4 text-center w-24 flex flex-col justify-center ${isBreakOrLunch ? 'bg-amber-100' : 'bg-gray-100'}`}>
                  <div className={`text-xs ${isBreakOrLunch ? 'text-amber-700' : 'text-gray-500'}`}>{entry.time.start}</div>
                  <div className={`text-sm font-medium ${isBreakOrLunch ? 'text-amber-700' : ''}`}>{entry.time.end}</div>
                </div>
                <div className={`flex-grow p-3 border-l ${
                  isBreakOrLunch 
                    ? 'border-amber-200 text-amber-700' 
                    : `${getSubjectColorClass(entry.subject.color)}`
                }`}>
                  <div className="font-medium">{entry.subject.name}</div>
                  {entry.subject.teacher && <div className="text-sm text-gray-600">{entry.subject.teacher}</div>}
                  {isBreakOrLunch && <div className="text-sm">Fixed Time</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Generated Timetable</CardTitle>
        
        {/* View toggle buttons */}
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "weekly" | "daily")}>
          <TabsList>
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-[400px] w-full" />
          </div>
        ) : (
          <div>
            <div className={viewMode === "weekly" ? "block" : "hidden"}>
              {renderWeeklyView()}
            </div>
            
            <div className={viewMode === "daily" ? "block" : "hidden"}>
              {renderDailyView()}
            </div>
            
            {/* Timetable Actions Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  Last generated: <span className="text-gray-700">
                    {timetable ? format(new Date(), "PPp") : "Never"}
                  </span>
                </span>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" disabled={!timetable}>
                    <Printer className="h-4 w-4 mr-1" />
                    Print
                  </Button>
                  <Button variant="outline" size="sm" className="text-primary" disabled={!timetable}>
                    <Share2 className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
