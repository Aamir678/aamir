import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock, AlertTriangle } from "lucide-react";

interface Subject {
  id: number;
  name: string;
  code: string;
  teacher: string;
}

interface Constraint {
  id: number;
  subjectId?: number;
  teacherId?: number;
  avoidConsecutive: boolean;
  preferMorning: boolean;
  unavailableSlots: { day: string, time: string }[];
}

interface ConstraintSettingsProps {
  constraints: Constraint[];
  subjects: Subject[];
  settings: any;
  onRefetch: () => void;
}

export default function ConstraintSettings({ constraints, subjects, settings, onRefetch }: ConstraintSettingsProps) {
  const { toast } = useToast();
  const [selectedTeacher, setSelectedTeacher] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [avoidConsecutive, setAvoidConsecutive] = useState(false);
  const [preferMorning, setPreferMorning] = useState(false);
  const [unavailableSlots, setUnavailableSlots] = useState<{ day: string, time: string }[]>([]);

  // Create a map of teachers from subjects
  const teachers = subjects.reduce((acc, subject) => {
    if (subject.teacher && !acc.find(t => t.name === subject.teacher)) {
      acc.push({ id: acc.length + 1, name: subject.teacher });
    }
    return acc;
  }, [] as { id: number, name: string }[]);

  // Generate time slots based on settings
  const generateTimeSlots = () => {
    if (!settings) return [];
    
    const slots = [];
    let currentTime = settings.startTime;
    
    while (currentTime < settings.endTime) {
      slots.push(currentTime);
      // Add period duration to current time
      const [hours, minutes] = currentTime.split(':').map(Number);
      const totalMinutes = hours * 60 + minutes + settings.periodDuration;
      const newHours = Math.floor(totalMinutes / 60) % 24;
      const newMinutes = totalMinutes % 60;
      currentTime = `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
    }
    
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Save constraint
  const { mutate: saveConstraint, isPending } = useMutation({
    mutationFn: async (constraint: Partial<Constraint>) => {
      const response = await apiRequest("POST", `/api/constraints`, constraint);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Constraint saved",
        description: "The constraint has been saved successfully.",
      });
      onRefetch();
      // Reset form
      setSelectedTeacher("");
      setSelectedSubject("");
      setAvoidConsecutive(false);
      setPreferMorning(false);
      setUnavailableSlots([]);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to save constraint: ${error.message}`,
      });
    },
  });

  const handleSaveConstraint = () => {
    const constraint: any = {
      unavailableSlots: unavailableSlots,
      avoidConsecutive,
      preferMorning
    };
    
    if (selectedTeacher) {
      constraint.teacherId = parseInt(selectedTeacher);
    }
    
    if (selectedSubject) {
      constraint.subjectId = parseInt(selectedSubject);
    }
    
    saveConstraint(constraint);
  };

  const toggleUnavailableSlot = (day: string, time: string) => {
    setUnavailableSlots(prev => {
      const exists = prev.some(slot => slot.day === day && slot.time === time);
      
      if (exists) {
        return prev.filter(slot => !(slot.day === day && slot.time === time));
      } else {
        return [...prev, { day, time }];
      }
    });
  };

  const isSlotUnavailable = (day: string, time: string) => {
    return unavailableSlots.some(slot => slot.day === day && slot.time === time);
  };

  if (!settings) {
    return <div>Loading settings...</div>;
  }

  return (
    <div className="space-y-4">
      <Alert variant="warning" className="mb-4 bg-amber-50 border border-amber-200 text-amber-700">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Set specific constraints for your timetable generation, such as teacher availability and preferred time slots.
        </AlertDescription>
      </Alert>

      {/* Teacher constraints */}
      <div>
        <Label className="block text-sm font-medium text-gray-700 mb-2">Teacher Availability</Label>
        <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
          <SelectTrigger className="mb-2">
            <SelectValue placeholder="Select Teacher" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Select Teacher</SelectItem>
            {teachers.map(teacher => (
              <SelectItem key={teacher.id} value={teacher.id.toString()}>
                {teacher.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <div className="bg-gray-50 p-3 rounded-md">
          <div className="text-sm text-gray-500 mb-2">Mark unavailable time slots:</div>
          <div className="grid grid-cols-6 gap-1 text-center text-xs mb-2">
            <div className="font-medium"></div>
            {settings.workingDays.map((day: string) => (
              <div key={day} className="font-medium">{day.substring(0, 3)}</div>
            ))}
          </div>
          
          {timeSlots.map((time, index) => (
            <div key={index} className="grid grid-cols-6 gap-1 text-center mb-1">
              <div className="text-xs py-1">{time}</div>
              {settings.workingDays.map((day: string) => (
                <div key={`${day}-${time}`} className="py-1">
                  <Checkbox
                    checked={isSlotUnavailable(day, time)}
                    onCheckedChange={() => toggleUnavailableSlot(day, time)}
                    className="h-4 w-4"
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      
      {/* Subject constraints */}
      <div>
        <Label className="block text-sm font-medium text-gray-700 mb-2">Subject Preferences</Label>
        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
          <SelectTrigger className="mb-2">
            <SelectValue placeholder="Select Subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Select Subject</SelectItem>
            {subjects.map(subject => (
              <SelectItem key={subject.id} value={subject.id.toString()}>
                {subject.name} ({subject.code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <div className="space-y-2">
          <div className="flex items-center">
            <Checkbox
              id="avoidConsecutive"
              checked={avoidConsecutive}
              onCheckedChange={(checked) => setAvoidConsecutive(!!checked)}
              className="h-4 w-4 mr-2"
            />
            <Label htmlFor="avoidConsecutive" className="text-sm text-gray-700">Avoid consecutive periods</Label>
          </div>
          <div className="flex items-center">
            <Checkbox
              id="morningPreference"
              checked={preferMorning}
              onCheckedChange={(checked) => setPreferMorning(!!checked)}
              className="h-4 w-4 mr-2"
            />
            <Label htmlFor="morningPreference" className="text-sm text-gray-700">Prefer morning slots</Label>
          </div>
        </div>
      </div>
      
      {/* Save button */}
      <div className="pt-2">
        <button
          className="w-full px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50"
          onClick={handleSaveConstraint}
          disabled={isPending || (!selectedTeacher && !selectedSubject)}
        >
          {isPending ? "Saving..." : "Save Constraint"}
        </button>
      </div>
    </div>
  );
}
