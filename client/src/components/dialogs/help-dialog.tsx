import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface HelpDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpDialog({ isOpen, onClose }: HelpDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>How to Use the Timetable Generator</DialogTitle>
          <DialogDescription>
            Get started with creating your automated timetable
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-4 py-4 pr-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Getting Started</h3>
              <p className="text-sm text-neutral-medium">
                The Timetable Generator helps you create a schedule with fixed lunch and break times.
                Follow these steps to generate your timetable:
              </p>
            </div>
            
            <div>
              <h4 className="text-base font-medium mb-1">1. Set Schedule Parameters</h4>
              <p className="text-sm text-neutral-medium">
                Begin by selecting your schedule type (daily/weekly) and setting the start and end times 
                for your schedule.
              </p>
            </div>
            
            <div>
              <h4 className="text-base font-medium mb-1">2. Configure Breaks</h4>
              <p className="text-sm text-neutral-medium">
                Set up your lunch break time and duration. For regular breaks, choose between hourly 
                breaks or custom break times.
              </p>
            </div>
            
            <div>
              <h4 className="text-base font-medium mb-1">3. Add Subjects</h4>
              <p className="text-sm text-neutral-medium">
                Add all the subjects or classes you need to schedule. For each subject, specify:
              </p>
              <ul className="text-sm text-neutral-medium list-disc ml-6 mt-1">
                <li>Subject name</li>
                <li>Duration (in minutes)</li>
                <li>Optional room information</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-base font-medium mb-1">4. Generate Your Timetable</h4>
              <p className="text-sm text-neutral-medium">
                Click the "Generate Timetable" button to create your schedule. The system will 
                automatically arrange your subjects while respecting the fixed lunch and break times.
              </p>
            </div>
            
            <div>
              <h4 className="text-base font-medium mb-1">5. Review and Adjust</h4>
              <p className="text-sm text-neutral-medium">
                Review the generated timetable. If you see conflicts or want to make changes, 
                adjust your inputs and regenerate the timetable.
              </p>
            </div>
            
            <div>
              <h4 className="text-base font-medium mb-1">6. Save or Export</h4>
              <p className="text-sm text-neutral-medium">
                Once you're satisfied with your timetable, you can:
              </p>
              <ul className="text-sm text-neutral-medium list-disc ml-6 mt-1">
                <li>Save the timetable to access it later</li>
                <li>Export it to PDF for printing or sharing</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mt-6 mb-2">Tips for Optimal Schedules</h3>
              <ul className="text-sm text-neutral-medium list-disc ml-6">
                <li>Group similar subjects together when possible</li>
                <li>Consider the optimal length for different types of classes</li>
                <li>Balance your schedule to avoid overloading certain days (for weekly schedules)</li>
                <li>Ensure adequate break times between intensive subjects</li>
              </ul>
            </div>
          </div>
        </ScrollArea>
        
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
