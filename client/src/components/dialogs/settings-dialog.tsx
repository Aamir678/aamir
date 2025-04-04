import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {
  const [timeFormat, setTimeFormat] = useState<"12h" | "24h">("24h");
  const [showWeekends, setShowWeekends] = useState(false);
  const [colorScheme, setColorScheme] = useState("default");

  const handleSaveSettings = () => {
    // Save settings logic would go here
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Customize your timetable generator experience
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-6">
          <div className="space-y-3">
            <Label htmlFor="time-format">Time Format</Label>
            <Select value={timeFormat} onValueChange={(value: "12h" | "24h") => setTimeFormat(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select time format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                <SelectItem value="24h">24-hour</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="color-scheme">Color Scheme</Label>
            <Select value={colorScheme} onValueChange={setColorScheme}>
              <SelectTrigger>
                <SelectValue placeholder="Select color scheme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="pastel">Pastel</SelectItem>
                <SelectItem value="vibrant">Vibrant</SelectItem>
                <SelectItem value="monochrome">Monochrome</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="show-weekends" className="cursor-pointer">Show Weekends</Label>
            <Switch
              id="show-weekends"
              checked={showWeekends}
              onCheckedChange={setShowWeekends}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="mr-2">
            Cancel
          </Button>
          <Button onClick={handleSaveSettings}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
