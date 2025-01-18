import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import ProfileHeader from '@/components/profile/ProfileHeader';
import QuickStats from '@/components/profile/QuickStats';
import ProfileNavigation from '@/components/profile/ProfileNavigation';

const Profile = () => {
  const [activeSection, setActiveSection] = useState('Personal Info');

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      return profile;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="md:grid md:grid-cols-[240px_1fr]">
          <div className="md:border-r">
            <ProfileHeader
              username={profile.username || 'User'}
              avatarUrl={profile.avatar_url}
              createdAt={profile.created_at || new Date().toISOString()}
            />
            <QuickStats
              credits={profile.credit_balance}
              documentsProcessed={0}
              usagePercentage={0}
            />
            <ProfileNavigation
              activeSection={activeSection}
              onSectionChange={setActiveSection}
            />
          </div>
          
          <main className="p-4">
            <h2 className="text-2xl font-semibold mb-4">{activeSection}</h2>
            <p className="text-muted-foreground">Content for {activeSection}</p>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Profile;