import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import {
  Home,
  CreditCard,
  User,
  FileText,
  History,
  BarChart,
  LogOut,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const AppSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const menuItems = [
    { title: 'হোম', path: '/', icon: Home },
    { title: 'প্রোফাইল', path: '/profile', icon: User },
    { title: 'ক্রেডিট', path: '/credits', icon: CreditCard },
    { title: 'ইতিহাস', path: '/credits/history', icon: History },
    { title: 'ব্যবহার', path: '/credits/usage', icon: BarChart },
  ];

  return (
    <Sidebar>
      <SidebarContent>
        <div className="p-4">
          <div className="flex items-center gap-2 text-white mb-8">
            <FileText className="h-8 w-8" />
            <span className="text-lg font-semibold transition-opacity duration-200">বাংলা OCR</span>
          </div>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton
                  tooltip={item.title}
                  className={`w-full justify-start gap-4 text-white hover:bg-white/10 ${
                    location.pathname === item.path ? 'bg-white/20' : ''
                  }`}
                  onClick={() => navigate(item.path)}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="সাইন আউট"
                className="w-full justify-start gap-4 text-white hover:bg-white/10 mt-auto"
                onClick={handleSignOut}
              >
                <LogOut className="h-5 w-5" />
                <span>সাইন আউট</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
