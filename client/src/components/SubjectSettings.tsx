import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Plus } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Subject {
  id: number;
  name: string;
  teacher: string;
  periodsPerWeek: number;
  color: string;
}

interface SubjectSettingsProps {
  subjects: Subject[];
  onAddSubject: () => void;
  onRefetch: () => void;
}

export default function SubjectSettings({ subjects, onAddSubject, onRefetch }: SubjectSettingsProps) {
  const { toast } = useToast();
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);

  const { mutate: deleteSubject, isPending: isDeleting } = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/subjects/${id}`, undefined);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Subject deleted",
        description: "The subject has been deleted successfully.",
      });
      onRefetch();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to delete subject: ${error.message}`,
      });
    },
  });

  const handleDeleteSubject = (subject: Subject) => {
    setSubjectToDelete(subject);
  };

  const confirmDelete = () => {
    if (subjectToDelete) {
      deleteSubject(subjectToDelete.id);
      setSubjectToDelete(null);
    }
  };

  const getColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      "#3B82F6": "bg-blue-50 border-blue-200",
      "#10B981": "bg-green-50 border-green-200",
      "#6366F1": "bg-indigo-50 border-indigo-200",
      "#8B5CF6": "bg-purple-50 border-purple-200",
      "#EC4899": "bg-pink-50 border-pink-200",
      "#F59E0B": "bg-amber-50 border-amber-200",
    };
    
    return colorMap[color] || "bg-gray-50 border-gray-200";
  };

  return (
    <div className="space-y-4">
      {/* Subject List */}
      <div className="space-y-3">
        {subjects.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No subjects added yet. Add a subject to get started.
          </div>
        ) : (
          subjects.map((subject) => (
            <div 
              key={subject.id} 
              className={`flex items-center p-3 rounded-md ${getColorClass(subject.color)}`}
            >
              <div className="flex-grow">
                <div className="font-medium">{subject.name}</div>
                <div className="text-sm text-gray-500">
                  {subject.teacher} • {subject.periodsPerWeek} periods per week
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-gray-400 hover:text-gray-600" 
                  title="Edit"
                >
                  <Edit size={16} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-gray-400 hover:text-red-600" 
                  title="Remove"
                  onClick={() => handleDeleteSubject(subject)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Add Subject Button */}
      <Button 
        variant="outline" 
        className="w-full py-2 border-dashed"
        onClick={onAddSubject}
      >
        <Plus size={16} className="mr-2" />
        Add Subject
      </Button>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!subjectToDelete} onOpenChange={(open) => !open && setSubjectToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the subject "{subjectToDelete?.name}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
