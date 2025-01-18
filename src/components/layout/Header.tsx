import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, Bell, LogOut, CreditCard } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const Header = () => {
  const navigate = useNavigate();
  const [isDeductingCredits, setIsDeductingCredits] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      return profile;
    },
  });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  // Static notifications for demo
  const notifications = [
    {
      id: 1,
      title: 'Credits Added',
      message: '100 credits have been added to your account',
      time: '5 minutes ago'
    },
    {
      id: 2,
      title: 'OCR Complete',
      message: 'Your image has been processed successfully',
      time: '1 hour ago'
    }
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="md:hidden" />
          <div className="hidden md:flex items-center gap-2">
            <h2 className="text-2xl font-bold">
              Welcome back, {profile?.username || 'User'}!
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow transition-all duration-300 ${isDeductingCredits ? 'scale-110' : ''}`}>
            <CreditCard className={`w-5 h-5 ${profile?.credit_balance < 50 ? 'text-red-600' : 'text-blue-600'} ${isDeductingCredits ? 'animate-spin' : ''}`} />
            <span className="font-medium">{profile?.credit_balance || 0} credits</span>
          </div>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-white flex items-center justify-center">
                  {notifications.length}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0">
              <div className="p-4 space-y-4">
                {notifications.map((notification) => (
                  <div key={notification.id} className="border-b pb-3 last:border-0 last:pb-0">
                    <h4 className="font-semibold">{notification.title}</h4>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                    <span className="text-xs text-muted-foreground">{notification.time}</span>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          
          <Button variant="ghost" size="icon" onClick={handleSignOut}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;