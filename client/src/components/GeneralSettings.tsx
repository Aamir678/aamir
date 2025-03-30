import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

interface GeneralSettingsProps {
  settings: any;
  onUpdateSettings: (settings: any) => void;
  isPending: boolean;
}

export default function GeneralSettings({ settings, onUpdateSettings, isPending }: GeneralSettingsProps) {
  const [localSettings, setLocalSettings] = useState({
    workingDays: [] as string[],
    startTime: "",
    endTime: "",
    periodDuration: 45,
    breakTime: "",
    breakDuration: 15,
    lunchTime: "",
    lunchDuration: 45
  });

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const handleWorkingDayToggle = (day: string) => {
    setLocalSettings(prev => {
      const newWorkingDays = prev.workingDays.includes(day)
        ? prev.workingDays.filter(d => d !== day)
        : [...prev.workingDays, day];

      onUpdateSettings({ ...prev, workingDays: newWorkingDays });
      return { ...prev, workingDays: newWorkingDays };
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const parsedValue = type === 'number' ? parseInt(value) : value;
    
    setLocalSettings(prev => {
      const newSettings = { ...prev, [name]: parsedValue };
      onUpdateSettings(newSettings);
      return newSettings;
    });
  };

  if (!settings) {
    return <div>Loading settings...</div>;
  }

  return (
    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
      {/* Work days selection */}
      <div>
        <Label className="block text-sm font-medium text-gray-700 mb-1">Working Days</Label>
        <div className="flex flex-wrap gap-2">
          {WEEKDAYS.map((day) => (
            <label key={day} className="flex items-center p-2 border rounded-md cursor-pointer hover:bg-gray-50">
              <Checkbox
                checked={localSettings.workingDays.includes(day)}
                onCheckedChange={() => handleWorkingDayToggle(day)}
                className="h-4 w-4 mr-2"
              />
              <span className="text-sm">{day.substring(0, 3)}</span>
            </label>
          ))}
        </div>
      </div>
      
      {/* Daily time range */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">Start Time</Label>
          <Input
            type="time"
            id="startTime"
            name="startTime"
            value={localSettings.startTime}
            onChange={handleInputChange}
            disabled={isPending}
          />
        </div>
        <div>
          <Label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">End Time</Label>
          <Input
            type="time"
            id="endTime"
            name="endTime"
            value={localSettings.endTime}
            onChange={handleInputChange}
            disabled={isPending}
          />
        </div>
      </div>
      
      {/* Period duration */}
      <div>
        <Label htmlFor="periodDuration" className="block text-sm font-medium text-gray-700 mb-1">Period Duration (minutes)</Label>
        <Input
          type="number"
          id="periodDuration"
          name="periodDuration"
          value={localSettings.periodDuration}
          onChange={handleInputChange}
          min={15}
          max={120}
          step={5}
          disabled={isPending}
        />
      </div>
      
      {/* Break settings */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <Label className="block text-sm font-medium text-gray-700">Break Time</Label>
          <Badge variant="secondary" className="bg-amber-500 text-white hover:bg-amber-600">Fixed</Badge>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Input
              type="time"
              name="breakTime"
              value={localSettings.breakTime}
              onChange={handleInputChange}
              disabled={isPending}
            />
          </div>
          <div>
            <Input
              type="number"
              name="breakDuration"
              value={localSettings.breakDuration}
              onChange={handleInputChange}
              min={5}
              max={30}
              placeholder="Duration (min)"
              disabled={isPending}
            />
          </div>
        </div>
      </div>
      
      {/* Lunch settings */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <Label className="block text-sm font-medium text-gray-700">Lunch Time</Label>
          <Badge variant="secondary" className="bg-amber-500 text-white hover:bg-amber-600">Fixed</Badge>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Input
              type="time"
              name="lunchTime"
              value={localSettings.lunchTime}
              onChange={handleInputChange}
              disabled={isPending}
            />
          </div>
          <div>
            <Input
              type="number"
              name="lunchDuration"
              value={localSettings.lunchDuration}
              onChange={handleInputChange}
              min={30}
              max={90}
              placeholder="Duration (min)"
              disabled={isPending}
            />
          </div>
        </div>
      </div>
    </form>
  );
}
