import { useState } from 'react';
import { Subject } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface SubjectListProps {
  subjects: Subject[];
  setSubjects: (subjects: Subject[]) => void;
}

export default function SubjectList({ subjects, setSubjects }: SubjectListProps) {
  const handleAddSubject = () => {
    const newSubject: Subject = {
      id: uuidv4(),
      name: '',
      duration: '60',
      room: '',
    };
    setSubjects([...subjects, newSubject]);
  };

  const handleRemoveSubject = (index: number) => {
    const newSubjects = [...subjects];
    newSubjects.splice(index, 1);
    setSubjects(newSubjects);
  };

  const handleSubjectChange = (index: number, field: keyof Subject, value: string) => {
    const newSubjects = [...subjects];
    newSubjects[index] = { ...newSubjects[index], [field]: value };
    setSubjects(newSubjects);
  };

  return (
    <div className="space-y-3">
      {subjects.map((subject, index) => (
        <div 
          key={subject.id || index} 
          className="flex items-center space-x-2 bg-neutral-lightest p-2 rounded-md"
        >
          <Input 
            placeholder="Subject name" 
            className="flex-grow" 
            value={subject.name} 
            onChange={(e) => handleSubjectChange(index, 'name', e.target.value)}
          />
          
          <Select 
            value={subject.duration.toString()} 
            onValueChange={(value) => handleSubjectChange(index, 'duration', value)}
          >
            <SelectTrigger className="w-24">
              <SelectValue placeholder="Duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 min</SelectItem>
              <SelectItem value="45">45 min</SelectItem>
              <SelectItem value="60">60 min</SelectItem>
              <SelectItem value="90">90 min</SelectItem>
              <SelectItem value="120">120 min</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            className="text-neutral-medium hover:text-status-error hover:bg-transparent"
            onClick={() => handleRemoveSubject(index)}
            disabled={subjects.length <= 1}
          >
            <Trash2Icon className="h-4 w-4" />
          </Button>
        </div>
      ))}
      
      <Button 
        type="button" 
        variant="ghost" 
        className="text-primary text-sm hover:text-primary-dark"
        onClick={handleAddSubject}
      >
        <PlusIcon className="h-4 w-4 mr-1" />
        Add Subject
      </Button>
    </div>
  );
}
