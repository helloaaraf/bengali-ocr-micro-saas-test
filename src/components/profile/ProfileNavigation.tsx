import React from 'react';
import { Button } from '@/components/ui/button';
import { User, Lock, Bell, Settings, Activity, Database } from 'lucide-react';

interface NavItem {
  label: string;
  icon: React.ElementType;
  active?: boolean;
}

interface ProfileNavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const ProfileNavigation = ({ activeSection, onSectionChange }: ProfileNavigationProps) => {
  const navItems: NavItem[] = [
    { label: 'Personal Info', icon: User },
    { label: 'Security', icon: Lock },
    { label: 'Notifications', icon: Bell },
    { label: 'Preferences', icon: Settings },
    { label: 'Activity', icon: Activity },
    { label: 'Data', icon: Database },
  ];

  return (
    <nav className="flex overflow-x-auto p-4 gap-2 md:flex-col md:overflow-visible">
      {navItems.map((item) => (
        <Button
          key={item.label}
          variant={activeSection === item.label ? 'secondary' : 'ghost'}
          className="flex items-center gap-2 whitespace-nowrap justify-start"
          onClick={() => onSectionChange(item.label)}
        >
          <item.icon className="h-4 w-4" />
          <span>{item.label}</span>
        </Button>
      ))}
    </nav>
  );
};

export default ProfileNavigation;