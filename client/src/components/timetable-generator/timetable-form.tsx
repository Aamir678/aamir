import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Constraints, Subject, constraintsSchema } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDownIcon, RefreshCwIcon, Settings2Icon } from 'lucide-react';
import SubjectList from './subject-list';

interface TimetableFormProps {
  constraints: Constraints;
  setConstraints: (constraints: Constraints) => void;
  subjects: Subject[];
  setSubjects: (subjects: Subject[]) => void;
  onGenerate: () => void;
}

export default function TimetableForm({
  constraints, 
  setConstraints, 
  subjects, 
  setSubjects,
  onGenerate
}: TimetableFormProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  
  const form = useForm<Constraints>({
    resolver: zodResolver(constraintsSchema),
    defaultValues: constraints,
  });

  const handleSubmit = (data: Constraints) => {
    setConstraints(data);
    onGenerate();
  };

  const resetForm = () => {
    form.reset({
      scheduleType: "daily",
      startTime: "08:00",
      endTime: "17:00",
      lunchTime: "12:00",
      lunchDuration: "60",
      breakFrequency: "hourly",
      breakDuration: "15",
    });
    setSubjects([
      { id: "1", name: "Mathematics", duration: "60", room: "Room 101" },
      { id: "2", name: "Physics", duration: "60", room: "Lab 3" },
      { id: "3", name: "English", duration: "45", room: "Room 205" },
    ]);
  };

  return (
    <Card className="bg-white shadow-sm border border-neutral-light">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-neutral-dark">Input Constraints</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Basic Schedule Settings */}
            <div>
              <h3 className="text-sm font-medium text-neutral-medium uppercase tracking-wide mb-3">
                Schedule Settings
              </h3>
              
              <FormField
                control={form.control}
                name="scheduleType"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>Schedule Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select schedule type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            {/* Fixed Breaks */}
            <div>
              <h3 className="text-sm font-medium text-neutral-medium uppercase tracking-wide mb-3">
                Fixed Breaks
              </h3>
              
              <div className="mb-4">
                <FormLabel className="block mb-1">Lunch Break</FormLabel>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="lunchTime"
                    render={({ field }) => (
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="lunchDuration"
                    render={({ field }) => (
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Duration" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="45">45 minutes</SelectItem>
                          <SelectItem value="60">60 minutes</SelectItem>
                          <SelectItem value="90">90 minutes</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
              
              <div>
                <FormLabel className="block mb-1">Short Breaks</FormLabel>
                <div className="grid grid-cols-3 gap-2">
                  <FormField
                    control={form.control}
                    name="breakFrequency"
                    render={({ field }) => (
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="hourly">Hourly</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="breakDuration"
                    render={({ field }) => (
                      <FormControl>
                        <Input 
                          type="number" 
                          min={5} 
                          max={30} 
                          step={5} 
                          {...field} 
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                    )}
                  />
                  
                  <span className="flex items-center text-sm text-neutral-medium">minutes</span>
                </div>
              </div>
            </div>
            
            {/* Subjects/Classes */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-medium text-neutral-medium uppercase tracking-wide">
                  Classes/Subjects
                </h3>
              </div>
              
              <SubjectList 
                subjects={subjects} 
                setSubjects={setSubjects} 
              />
            </div>
            
            {/* Advanced Options Toggle */}
            <Collapsible
              open={isAdvancedOpen}
              onOpenChange={setIsAdvancedOpen}
              className="mb-6"
            >
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="p-0 text-sm text-primary flex items-center"
                >
                  <Settings2Icon className="h-4 w-4 mr-1" />
                  Advanced Options
                  <ChevronDownIcon className="h-4 w-4 ml-1" />
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="pt-4 space-y-4">
                <div>
                  <FormLabel>Custom Preferences</FormLabel>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    {/* Advanced options would go here */}
                    <div className="text-sm text-neutral-medium">
                      Advanced options not available in this version
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
            
            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <Button 
                type="button" 
                variant="outline" 
                className="text-neutral-medium border-neutral-light" 
                onClick={resetForm}
              >
                <RefreshCwIcon className="h-4 w-4 mr-1" />
                Reset
              </Button>
              <Button type="submit">
                Generate Timetable
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
