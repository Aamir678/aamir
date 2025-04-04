import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Timetable } from "@shared/schema";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarIcon, DeleteIcon, EditIcon, EyeIcon } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
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

export default function SavedTimetables() {
  const [, setLocation] = useLocation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTimetable, setSelectedTimetable] = useState<string | null>(null);
  const { toast } = useToast();

  // Set the active tab in the parent component
  useEffect(() => {
    const event = new CustomEvent("tabChange", { detail: "saved" });
    window.dispatchEvent(event);
  }, []);

  // Fetch all saved timetables
  const { data: timetables, isLoading, isError } = useQuery({
    queryKey: ["/api/timetables"],
  });

  // Delete timetable mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/timetables/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/timetables"] });
      toast({
        title: "Timetable Deleted",
        description: "The timetable has been deleted successfully",
      });
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete timetable",
        variant: "destructive",
      });
    },
  });

  const handleDeleteClick = (id: string) => {
    setSelectedTimetable(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedTimetable) {
      deleteMutation.mutate(selectedTimetable);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-2">Saved Timetables</h1>
        <p className="text-neutral-medium">View and manage your saved timetable configurations</p>
      </div>

      {isLoading ? (
        // Loading state
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-3/4 mb-1" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : isError ? (
        // Error state
        <div className="text-center py-10">
          <p className="text-lg text-status-error mb-4">Failed to load saved timetables</p>
          <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/timetables"] })}>
            Try Again
          </Button>
        </div>
      ) : timetables && timetables.length > 0 ? (
        // Timetables list
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {timetables.map((timetable: Timetable) => (
            <Card key={timetable.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>{timetable.name}</CardTitle>
                <CardDescription>
                  {timetable.createdAt && (
                    <span className="flex items-center gap-1 text-sm">
                      <CalendarIcon size={14} />
                      {format(new Date(timetable.createdAt), "MMM d, yyyy")}
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <p>Schedule Type: {timetable.constraints.scheduleType}</p>
                  <p>Subjects: {timetable.subjects.length}</p>
                  <p>Time: {timetable.constraints.startTime} - {timetable.constraints.endTime}</p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDeleteClick(timetable.id)}
                  className="text-status-error hover:text-status-error hover:bg-red-50"
                >
                  <DeleteIcon size={16} className="mr-1" />
                  Delete
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={() => {/* View logic */}}
                >
                  <EyeIcon size={16} className="mr-1" />
                  View
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        // Empty state
        <div className="text-center py-16 bg-white rounded-lg border border-neutral-light">
          <div className="text-neutral-medium mb-2">No saved timetables</div>
          <p className="text-sm text-neutral-medium mb-6">Generate and save timetables to view them here</p>
          <Button onClick={() => setLocation("/")}>
            Create New Timetable
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this timetable? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-status-error hover:bg-status-error/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
