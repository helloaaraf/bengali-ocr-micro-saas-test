import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Camera, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistance, parseISO, isValid } from 'date-fns';

interface ProfileHeaderProps {
  username: string;
  avatarUrl?: string;
  createdAt: string | Date;
}

const ProfileHeader = ({ username, avatarUrl, createdAt }: ProfileHeaderProps) => {
  // Convert string date to Date object if necessary and validate
  const getFormattedDate = () => {
    try {
      const date = typeof createdAt === 'string' ? parseISO(createdAt) : createdAt;
      if (!isValid(date)) {
        return 'Recently joined';
      }
      return `Joined ${formatDistance(date, new Date(), { addSuffix: true })}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Recently joined';
    }
  };

  return (
    <div className="relative p-4 text-center space-y-4">
      <div className="relative inline-block">
        <Avatar className="h-20 w-20 mx-auto">
          <AvatarImage src={avatarUrl} alt={username} />
          <AvatarFallback>{username[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>
        <Button 
          size="icon" 
          variant="secondary" 
          className="absolute bottom-0 right-0 rounded-full"
        >
          <Camera className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-1">
        <h2 className="text-2xl font-bold">{username}</h2>
        <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
          <Calendar className="h-4 w-4" />
          {getFormattedDate()}
        </p>
      </div>
    </div>
  );
};

export default ProfileHeader;