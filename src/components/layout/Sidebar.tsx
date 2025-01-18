import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
  Home,
  CreditCard,
  User,
  Settings,
  FileText,
  History,
  BarChart,
} from 'lucide-react';

const AppSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { title: 'Home', path: '/', icon: Home },
    { title: 'Profile', path: '/profile', icon: User },
    { title: 'Credits', path: '/credits', icon: CreditCard },
    { title: 'Purchase', path: '/credits/purchase', icon: Settings },
    { title: 'History', path: '/credits/history', icon: History },
    { title: 'Usage', path: '/credits/usage', icon: BarChart },
  ];

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    className={location.pathname === item.path ? 'bg-accent' : ''}
                    onClick={() => navigate(item.path)}
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;