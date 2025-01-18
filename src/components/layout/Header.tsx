import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, Bell, LogOut, CreditCard, Check, X } from 'lucide-react';
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
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'ক্রেডিট যোগ করা হয়েছে',
      message: 'আপনার অ্যাকাউন্টে 100 ক্রেডিট যোগ করা হয়েছে',
      time: '5 মিনিট আগে',
      read: false
    },
    {
      id: 2,
      title: 'OCR সম্পন্ন',
      message: 'আপনার ছবি সফলভাবে প্রক্রিয়া করা হয়েছে',
      time: '1 ঘন্টা আগে',
      read: false
    }
  ]);

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

  const markAllAsRead = () => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification => ({
        ...notification,
        read: true
      }))
    );
  };

  const dismissNotification = (id: number) => {
    setNotifications(prevNotifications =>
      prevNotifications.filter(notification => notification.id !== id)
    );
  };

  const unreadCount = notifications.filter(notification => !notification.read).length;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="md:hidden" />
          <div className="hidden md:flex items-center gap-2">
            <h2 className="text-2xl font-bold">
              স্বাগতম, {profile?.username || 'ব্যবহারকারী'}!
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow transition-all duration-300 ${isDeductingCredits ? 'scale-110' : ''}`}>
            <CreditCard className={`w-5 h-5 ${profile?.credit_balance < 50 ? 'text-red-600' : 'text-blue-600'} ${isDeductingCredits ? 'animate-spin' : ''}`} />
            <span className="font-medium">{profile?.credit_balance || 0} ক্রেডিট</span>
          </div>

          <Button 
            variant="default"
            onClick={() => navigate('/credits/purchase')}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            টপ-আপ
          </Button>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-white flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 bg-white shadow-lg border rounded-lg">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-semibold">নোটিফিকেশন</h3>
                {notifications.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    সব পড়া হয়েছে
                  </Button>
                )}
              </div>
              <div className="divide-y divide-gray-100">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    কোন নোটিফিকেশন নেই
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`p-4 relative hover:bg-gray-50 transition-colors ${
                        notification.read ? 'opacity-75' : ''
                      }`}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => dismissNotification(notification.id)}
                        className="absolute top-2 right-2 h-6 w-6 hover:bg-gray-200"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <h4 className="font-semibold mb-1">{notification.title}</h4>
                      <p className="text-sm text-gray-600 mb-1">{notification.message}</p>
                      <span className="text-xs text-gray-400">{notification.time}</span>
                    </div>
                  ))
                )}
              </div>
            </PopoverContent>
          </Popover>
          
          <Button variant="ghost" size="icon" onClick={handleSignOut}>
            <LogOut cl
