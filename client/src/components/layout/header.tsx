import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { CircleHelp, Settings2Icon } from 'lucide-react';
import HelpDialog from '@/components/dialogs/help-dialog';
import SettingsDialog from '@/components/dialogs/settings-dialog';

export default function Header() {
  const [isHelpDialogOpen, setIsHelpDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);

  return (
    <header className="bg-primary text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/">
          <h1 className="text-xl font-semibold cursor-pointer">Timetable Generator</h1>
        </Link>
        <div className="flex items-center space-x-4">
          <Button 
            variant="primaryDark" 
            size="sm" 
            onClick={() => setIsHelpDialogOpen(true)}
            className="bg-primary-dark hover:bg-primary-dark/90"
          >
            <CircleHelp className="h-4 w-4 mr-1" />
            Help
          </Button>
          <Button 
            variant="primaryDark" 
            size="sm" 
            onClick={() => setIsSettingsDialogOpen(true)}
            className="bg-primary-dark hover:bg-primary-dark/90"
          >
            <Settings2Icon className="h-4 w-4 mr-1" />
            Settings
          </Button>
        </div>
      
        {/* Dialogs */}
        <HelpDialog 
          isOpen={isHelpDialogOpen} 
          onClose={() => setIsHelpDialogOpen(false)} 
        />
        
        <SettingsDialog
          isOpen={isSettingsDialogOpen}
          onClose={() => setIsSettingsDialogOpen(false)}
        />
      </div>
    </header>
  );
}
