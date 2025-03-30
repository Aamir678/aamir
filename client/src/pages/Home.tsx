import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CalendarClock } from "lucide-react";
import GeneralSettings from "@/components/GeneralSettings";
import SubjectSettings from "@/components/SubjectSettings";
import ConstraintSettings from "@/components/ConstraintSettings";
import TimetableDisplay from "@/components/TimetableDisplay";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AddSubjectDialog from "@/components/AddSubjectDialog";
import { exportTimetable } from "@/lib/timetable-export";

export default function Home() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("general");
  const [showAddSubjectDialog, setShowAddSubjectDialog] = useState(false);
  const [timetableStats, setTimetableStats] = useState<{
    totalPeriods: number;
    subjects: number;
    constraintsMet: string;
  } | null>(null);

  // Fetch timetable settings
  const { 
    data: timetableSettings,
    isLoading: isLoadingSettings,
    refetch: refetchSettings
  } = useQuery({
    queryKey: ['/api/timetable-settings'],
  });

  // Fetch subjects
  const { 
    data: subjects,
    isLoading: isLoadingSubjects,
    refetch: refetchSubjects
  } = useQuery({
    queryKey: ['/api/subjects'],
  });

  // Fetch constraints
  const { 
    data: constraints,
    isLoading: isLoadingConstraints,
    refetch: refetchConstraints
  } = useQuery({
    queryKey: ['/api/constraints'],
  });

  // Generate timetable
  const { 
    data: generatedTimetable,
    mutate: generateTimetable,
    isPending: isGenerating
  } = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/generate-timetable", {});
      return response.json();
    },
    onSuccess: (data) => {
      setTimetableStats(data.stats);
      toast({
        title: "Success",
        description: "Timetable generated successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to generate timetable: ${error.message}`,
      });
    }
  });

  // Update timetable settings
  const { 
    mutate: updateSettings,
    isPending: isUpdatingSettings
  } = useMutation({
    mutationFn: async (settings: any) => {
      const response = await apiRequest("PUT", "/api/timetable-settings", settings);
      return response.json();
    },
    onSuccess: () => {
      refetchSettings();
      toast({
        title: "Success",
        description: "Settings updated successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive", 
        title: "Error",
        description: `Failed to update settings: ${error.message}`,
      });
    }
  });

  // Reset all settings
  const handleReset = () => {
    if (timetableSettings) {
      updateSettings({
        workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        startTime: "08:00",
        endTime: "16:00",
        periodDuration: 45,
        breakTime: "10:30",
        breakDuration: 15,
        lunchTime: "12:30",
        lunchDuration: 45
      });
    }
    toast({
      title: "Reset",
      description: "Settings have been reset to defaults",
    });
  };

  // Handle export
  const handleExport = () => {
    if (generatedTimetable?.timetable) {
      exportTimetable(generatedTimetable.timetable);
      toast({
        title: "Exported",
        description: "Timetable has been exported successfully",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No timetable to export. Generate one first.",
      });
    }
  };

  const isLoading = isLoadingSettings || isLoadingSubjects || isLoadingConstraints;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <CalendarClock className="text-primary h-6 w-6 mr-3" />
              <h1 className="text-2xl font-semibold text-gray-800">Timetable Generator</h1>
            </div>
            <div>
              <Button 
                onClick={handleExport}
                disabled={!generatedTimetable}
                className="px-4 py-2"
              >
                <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Input Parameters</CardTitle>
              </CardHeader>
              
              {/* Tabs for different settings */}
              <div className="px-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="mb-4">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="subjects">Subjects</TabsTrigger>
                    <TabsTrigger value="constraints">Constraints</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="general">
                    {isLoading ? (
                      <div className="py-10 text-center">Loading...</div>
                    ) : (
                      <GeneralSettings 
                        settings={timetableSettings} 
                        onUpdateSettings={updateSettings}
                        isPending={isUpdatingSettings}
                      />
                    )}
                  </TabsContent>
                  
                  <TabsContent value="subjects">
                    {isLoading ? (
                      <div className="py-10 text-center">Loading...</div>
                    ) : (
                      <SubjectSettings 
                        subjects={subjects || []} 
                        onAddSubject={() => setShowAddSubjectDialog(true)}
                        onRefetch={refetchSubjects}
                      />
                    )}
                  </TabsContent>
                  
                  <TabsContent value="constraints">
                    {isLoading ? (
                      <div className="py-10 text-center">Loading...</div>
                    ) : (
                      <ConstraintSettings 
                        constraints={constraints || []}
                        subjects={subjects || []}
                        settings={timetableSettings}
                        onRefetch={refetchConstraints}
                      />
                    )}
                  </TabsContent>
                </Tabs>
              </div>
              
              {/* Form Actions Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t mt-4">
                <div className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={handleReset}
                  >
                    Reset
                  </Button>
                  <Button 
                    onClick={() => generateTimetable()}
                    disabled={isGenerating}
                  >
                    {isGenerating ? "Generating..." : "Generate Timetable"}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
          
          {/* Timetable Section */}
          <div className="lg:col-span-2">
            <TimetableDisplay 
              timetable={generatedTimetable?.timetable}
              isLoading={isGenerating}
            />
            
            {/* Validation Results */}
            {generatedTimetable && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Validation Results</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Success message */}
                  <div className="p-4 bg-green-50 border border-green-200 rounded-md mb-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-green-800">
                          Timetable generated successfully with no conflicts!
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Statistics */}
                  {timetableStats && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-gray-50 rounded-md">
                        <div className="text-sm font-medium text-gray-500 mb-1">Total Periods</div>
                        <div className="text-2xl font-semibold">{timetableStats.totalPeriods}</div>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-md">
                        <div className="text-sm font-medium text-gray-500 mb-1">Subjects</div>
                        <div className="text-2xl font-semibold">{timetableStats.subjects}</div>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-md">
                        <div className="text-sm font-medium text-gray-500 mb-1">Constraints Met</div>
                        <div className="text-2xl font-semibold">{timetableStats.constraintsMet}</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center text-sm text-gray-500">
            Automated Timetable Generator © {new Date().getFullYear()} | All rights reserved
          </div>
        </div>
      </footer>
      
      {/* Add Subject Dialog */}
      <AddSubjectDialog 
        isOpen={showAddSubjectDialog}
        onClose={() => setShowAddSubjectDialog(false)}
        onRefetch={refetchSubjects}
      />
    </div>
  );
}
