import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AddSubjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRefetch: () => void;
}

const SUBJECT_COLORS = [
  { color: "#3B82F6", name: "Blue" },
  { color: "#10B981", name: "Green" },
  { color: "#6366F1", name: "Indigo" },
  { color: "#8B5CF6", name: "Purple" },
  { color: "#EC4899", name: "Pink" },
  { color: "#F59E0B", name: "Yellow" },
];

export default function AddSubjectDialog({ 
  isOpen, 
  onClose, 
  onRefetch 
}: AddSubjectDialogProps) {
  const { toast } = useToast();
  const [subjectName, setSubjectName] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [periodsPerWeek, setPeriodsPerWeek] = useState(5);
  const [selectedColor, setSelectedColor] = useState(SUBJECT_COLORS[0].color);

  const { mutate: addSubject, isPending } = useMutation({
    mutationFn: async (subject: any) => {
      const response = await apiRequest("POST", "/api/subjects", subject);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Subject added",
        description: "The subject has been added successfully.",
      });
      onRefetch();
      resetForm();
      onClose();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to add subject: ${error.message}`,
      });
    },
  });

  const resetForm = () => {
    setSubjectName("");
    setSubjectCode("");
    setTeacherName("");
    setPeriodsPerWeek(5);
    setSelectedColor(SUBJECT_COLORS[0].color);
  };

  const handleAddSubject = () => {
    if (!subjectName.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Subject name is required",
      });
      return;
    }

    if (!subjectCode.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Subject code is required",
      });
      return;
    }

    addSubject({
      name: subjectName,
      code: subjectCode,
      teacher: teacherName,
      periodsPerWeek,
      color: selectedColor
    });
  };

  const handleClose = () => {
    if (!isPending) {
      resetForm();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Subject</DialogTitle>
          <DialogDescription>
            Enter the details for the new subject to add to your timetable.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div>
            <Label htmlFor="subjectName" className="block text-sm font-medium mb-1">Subject Name</Label>
            <Input
              id="subjectName"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              placeholder="e.g., Mathematics"
              disabled={isPending}
            />
          </div>
          
          <div>
            <Label htmlFor="subjectCode" className="block text-sm font-medium mb-1">Subject Code</Label>
            <Input
              id="subjectCode"
              value={subjectCode}
              onChange={(e) => setSubjectCode(e.target.value)}
              placeholder="e.g., MATH101"
              disabled={isPending}
            />
          </div>
          
          <div>
            <Label htmlFor="teacherName" className="block text-sm font-medium mb-1">Teacher</Label>
            <Input
              id="teacherName"
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value)}
              placeholder="e.g., Mr. Johnson"
              disabled={isPending}
            />
          </div>
          
          <div>
            <Label htmlFor="periodsPerWeek" className="block text-sm font-medium mb-1">Periods Per Week</Label>
            <Input
              id="periodsPerWeek"
              type="number"
              min={1}
              max={10}
              value={periodsPerWeek}
              onChange={(e) => setPeriodsPerWeek(parseInt(e.target.value))}
              disabled={isPending}
            />
          </div>
          
          <div>
            <Label className="block text-sm font-medium mb-1">Color</Label>
            <div className="flex space-x-2">
              {SUBJECT_COLORS.map((colorOption) => (
                <button
                  key={colorOption.color}
                  type="button"
                  className={`w-8 h-8 rounded-full cursor-pointer border-2 hover:opacity-90 ${
                    selectedColor === colorOption.color ? 'border-gray-800' : 'border-white'
                  } shadow-sm`}
                  style={{ backgroundColor: colorOption.color }}
                  onClick={() => setSelectedColor(colorOption.color)}
                  title={colorOption.name}
                  disabled={isPending}
                />
              ))}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleAddSubject} disabled={isPending}>
            {isPending ? "Adding..." : "Add Subject"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
