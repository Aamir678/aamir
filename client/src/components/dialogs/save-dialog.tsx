import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface SaveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  timetableName: string;
  setTimetableName: (name: string) => void;
  onSave: () => void;
}

export default function SaveDialog({
  isOpen,
  onClose,
  timetableName,
  setTimetableName,
  onSave,
}: SaveDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const saveMutation = useMutation({
    mutationFn: async (data: { name: string }) => {
      // This would typically include the full timetable data
      return apiRequest("POST", "/api/timetables", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/timetables"] });
      toast({
        title: "Success",
        description: "Timetable saved successfully",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save timetable",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (!timetableName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for your timetable",
        variant: "destructive",
      });
      return;
    }
    
    onSave();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save Timetable</DialogTitle>
          <DialogDescription>
            Give your timetable a name to save it for future reference.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <Label htmlFor="timetable-name" className="block text-sm font-medium mb-1">
            Timetable Name
          </Label>
          <Input
            id="timetable-name"
            value={timetableName}
            onChange={(e) => setTimetableName(e.target.value)}
            placeholder="e.g. Spring Semester 2023"
            className="w-full"
          />
        </div>
        
        <DialogFooter className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSubmitting}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
