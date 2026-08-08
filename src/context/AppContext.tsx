import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'consumer' | 'landowner' | 'business' | null;
export type Language = 'en' | 'hi' | 'mr';

export interface UserProfile {
  name?: string;
  state?: string;
  discom?: string;
  pinCode?: string;
  billData?: any;
  propertyData?: any;
}

interface AppContextType {
  userProfile: UserProfile;
  language: Language;
  isOnboarded: boolean;
  userRole: UserRole;
  setProfile: (profile: Partial<UserProfile>) => void;
  setLanguage: (lang: Language) => void;
  completeOnboarding: () => void;
  resetProfile: () => void;
  setUserRole: (role: UserRole) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [userProfile, setUserProfileState] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('suryx_profile');
    return saved ? JSON.parse(saved) : {};
  });

  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('suryx_lang') as Language) || 'en';
  });

  const [isOnboarded, setIsOnboarded] = useState<boolean>(() => {
    return localStorage.getItem('suryx_onboarded') === 'true';
  });

  const [userRole, setUserRoleState] = useState<UserRole>(() => {
    return (localStorage.getItem('suryx_role') as UserRole) || null;
  });

  useEffect(() => {
    localStorage.setItem('suryx_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('suryx_lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('suryx_onboarded', String(isOnboarded));
  }, [isOnboarded]);

  useEffect(() => {
    if (userRole) {
      localStorage.setItem('suryx_role', userRole);
    } else {
      localStorage.removeItem('suryx_role');
    }
  }, [userRole]);

  const setProfile = (profileUpdate: Partial<UserProfile>) => {
    setUserProfileState(prev => ({ ...prev, ...profileUpdate }));
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const completeOnboarding = () => {
    setIsOnboarded(true);
  };

  const resetProfile = () => {
    setUserProfileState({});
    setIsOnboarded(false);
    setUserRoleState(null);
    localStorage.removeItem('suryx_profile');
    localStorage.removeItem('suryx_onboarded');
    localStorage.removeItem('suryx_role');
  };

  const setUserRole = (role: UserRole) => {
    setUserRoleState(role);
  };

  return (
    <AppContext.Provider
      value={{
        userProfile,
        language,
        isOnboarded,
        userRole,
        setProfile,
        setLanguage,
        completeOnboarding,
        resetProfile,
        setUserRole
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
