import { Constraints, TimeSlot } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ScheduleStatisticsProps {
  timetable: { timeSlots: TimeSlot[] };
  constraints: Constraints;
}

export default function ScheduleStatistics({ timetable, constraints }: ScheduleStatisticsProps) {
  // Calculate statistics
  const totalClasses = timetable.timeSlots.filter(
    (slot) => slot.type === 'subject'
  ).length;
  
  const breakTime = timetable.timeSlots
    .filter((slot) => slot.type === 'break' || slot.type === 'lunch')
    .reduce((total, slot) => {
      const startTime = new Date(`2000-01-01T${slot.startTime}`);
      const endTime = new Date(`2000-01-01T${slot.endTime}`);
      const diffMinutes = (endTime.getTime() - startTime.getTime()) / 1000 / 60;
      return total + diffMinutes;
    }, 0);
  
  const breakHours = Math.floor(breakTime / 60);
  const breakMinutes = Math.round(breakTime % 60);
  
  // Calculate efficiency score
  const totalTimeMinutes = calculateTotalTimeMinutes(constraints);
  const usedTimeMinutes = timetable.timeSlots.reduce((total, slot) => {
    const startTime = new Date(`2000-01-01T${slot.startTime}`);
    const endTime = new Date(`2000-01-01T${slot.endTime}`);
    const diffMinutes = (endTime.getTime() - startTime.getTime()) / 1000 / 60;
    return total + diffMinutes;
  }, 0);
  
  const efficiencyScore = Math.round((usedTimeMinutes / totalTimeMinutes) * 100);
  
  return (
    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-neutral-dark">Schedule Statistics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Total classes:</span>
            <span className="font-medium">{totalClasses}</span>
          </div>
          <div className="flex justify-between">
            <span>Break time:</span>
            <span className="font-medium">{breakHours}h {breakMinutes}m</span>
          </div>
          <div className="flex justify-between">
            <span>Efficiency score:</span>
            <span className={`font-medium ${efficiencyScore >= 75 ? 'text-status-success' : efficiencyScore >= 50 ? 'text-amber-500' : 'text-status-error'}`}>
              {efficiencyScore}%
            </span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-neutral-dark">Optimization Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-neutral-dark space-y-1 ml-6 list-disc">
            {breakTime > 90 && (
              <li>Consider shorter break times for more class time</li>
            )}
            <li>Grouping similar subjects can improve focus</li>
            {efficiencyScore < 75 && (
              <li>Add more subjects to utilize available time slots</li>
            )}
            {parseDuration(constraints.lunchDuration) > 60 && (
              <li>Consider shorter lunch breaks for more class time</li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper function to calculate total time in minutes between start and end time
function calculateTotalTimeMinutes(constraints: Constraints): number {
  const startTime = new Date(`2000-01-01T${constraints.startTime}`);
  const endTime = new Date(`2000-01-01T${constraints.endTime}`);
  
  return (endTime.getTime() - startTime.getTime()) / 1000 / 60;
}

// Helper function to parse duration string to number
function parseDuration(duration: string | number): number {
  return typeof duration === 'string' ? parseInt(duration, 10) : duration;
}
