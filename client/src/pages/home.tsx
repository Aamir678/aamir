import { useState } from "react";
import { Route, Link, useLocation } from "wouter";
import TimetableForm from "@/components/timetable-generator/timetable-form";
import TimetableDisplay from "@/components/timetable-generator/timetable-display";
import ScheduleStatistics from "@/components/timetable-generator/schedule-statistics";
import SaveDialog from "@/components/dialogs/save-dialog";
import HelpDialog from "@/components/dialogs/help-dialog";
import SettingsDialog from "@/components/dialogs/settings-dialog";
import { Constraints, Subject, TimeSlot, Timetable } from "@shared/schema";
import { generateTimetable } from "@/lib/timetable-generator";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangleIcon } from "lucide-react";

export default function Home() {
  const [location, setLocation] = useLocation();
  const [constraints, setConstraints] = useState<Constraints>({
    scheduleType: "daily",
    startTime: "08:00",
    endTime: "17:00",
    lunchTime: "12:00",
    lunchDuration: "60",
    breakFrequency: "hourly",
    breakDuration: "15",
  });
  const [subjects, setSubjects] = useState<Subject[]>([
    { id: "1", name: "Mathematics", duration: "60", room: "Room 101", color: "#C7E1FF" },
    { id: "2", name: "Physics", duration: "60", room: "Lab 3", color: "#D1F7C4" },
    { id: "3", name: "English", duration: "45", room: "Room 205", color: "#E6D4FF" },
  ]);
  const [timetable, setTimetable] = useState<{ timeSlots: TimeSlot[] } | null>(null);
  const [viewMode, setViewMode] = useState<"day" | "week">("day");
  const [activeTab, setActiveTab] = useState<"generator" | "saved">("generator");
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isHelpDialogOpen, setIsHelpDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [timetableName, setTimetableName] = useState("");
  const [conflicts, setConflicts] = useState<string[]>([]);
  
  const { toast } = useToast();

  const handleGenerate = () => {
    try {
      const result = generateTimetable(constraints, subjects);
      setTimetable(result.timetable);
      setConflicts(result.conflicts);
      
      if (result.conflicts.length > 0) {
        toast({
          title: "Schedule Conflicts",
          description: "There are some conflicts in the generated timetable.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Timetable Generated",
          description: "Your timetable has been successfully generated.",
        });
      }
    } catch (error) {
      console.error("Error generating timetable:", error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate timetable. Please check your inputs.",
        variant: "destructive",
      });
    }
  };

  const handleSaveTimetable = () => {
    setIsSaveDialogOpen(true);
  };

  const handleTabChange = (tab: "generator" | "saved") => {
    setActiveTab(tab);
    if (tab === "saved") {
      setLocation("/saved");
    } else {
      setLocation("/");
    }
  };

  return (
    <main className="container mx-auto p-4">
      {/* Tabbed Navigation */}
      <div className="mb-8">
        <div className="border-b border-neutral-light flex">
          <button 
            className={`px-4 py-2 border-b-2 ${activeTab === "generator" 
              ? "border-primary text-primary font-medium" 
              : "border-transparent hover:text-primary hover:border-primary/30"}`}
            onClick={() => handleTabChange("generator")}
          >
            Generate Timetable
          </button>
          <button 
            className={`px-4 py-2 border-b-2 ${activeTab === "saved" 
              ? "border-primary text-primary font-medium" 
              : "border-transparent hover:text-primary hover:border-primary/30"}`}
            onClick={() => handleTabChange("saved")}
          >
            Saved Timetables
          </button>
        </div>
      </div>

      {/* Generator Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Panel */}
        <div className="lg:col-span-1">
          <TimetableForm 
            constraints={constraints}
            setConstraints={setConstraints}
            subjects={subjects}
            setSubjects={setSubjects}
            onGenerate={handleGenerate}
          />
        </div>
        
        {/* Timetable Results Panel */}
        <div className="lg:col-span-2">
          <TimetableDisplay
            timetable={timetable}
            viewMode={viewMode}
            setViewMode={setViewMode}
            onExport={() => {}}
            onSave={handleSaveTimetable}
          />
          
          {/* Conflicts & Warnings */}
          {conflicts.length > 0 && (
            <Alert variant="destructive" className="mt-4">
              <AlertTriangleIcon className="h-4 w-4" />
              <AlertTitle>Schedule Conflicts</AlertTitle>
              <AlertDescription>
                <ul className="text-sm space-y-1 ml-6 list-disc">
                  {conflicts.map((conflict, index) => (
                    <li key={index}>{conflict}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
          
          {/* Optimization Tips and Stats */}
          {timetable && (
            <ScheduleStatistics timetable={timetable} constraints={constraints} />
          )}
        </div>
      </div>
      
      {/* Dialogs */}
      <SaveDialog 
        isOpen={isSaveDialogOpen} 
        onClose={() => setIsSaveDialogOpen(false)}
        timetableName={timetableName}
        setTimetableName={setTimetableName}
        onSave={() => {
          // Save timetable logic
          setIsSaveDialogOpen(false);
          toast({
            title: "Timetable Saved",
            description: `"${timetableName}" has been saved successfully.`,
          });
        }}
      />
      
      <HelpDialog
        isOpen={isHelpDialogOpen}
        onClose={() => setIsHelpDialogOpen(false)}
      />
      
      <SettingsDialog
        isOpen={isSettingsDialogOpen}
        onClose={() => setIsSettingsDialogOpen(false)}
      />
    </main>
  );
}
