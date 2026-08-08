import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'consumer' | 'landowner' | 'business' | null;
export type Language = 'en' | 'hi' | 'mr';

export interface UserProfile {
  firstName?: string;
  name?: string;
  companyName?: string;
  gstin?: string;
  licenseNo?: string;
  businessType?: string;
  phone?: string;
  email?: string;
  userType?: string;
  occupation?: string;
  propertyType?: string;
  roofArea?: number | string;
  roofSqFt?: number | string;
  state?: string;
  discom?: string;
  billAmount?: number | string;
  avgBill?: number | string;
  hasSolar?: string | boolean;
  systemSize?: number | string;
  installYear?: number | string;
  wantsBattery?: string | boolean;
  city?: string;
  pinCode?: string;
  pincode?: string;
  billData?: any;
  propertyData?: any;
  userRole?: UserRole;
}

interface AppContextType {
  userProfile: UserProfile;
  language: Language;
  isOnboarded: boolean;
  userRole: UserRole;
  setProfile: (profileUpdate: Partial<UserProfile>) => void;
  setLanguage: (lang: Language) => void;
  completeOnboarding: () => void;
  resetProfile: () => void;
  setUserRole: (role: UserRole) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_PROFILE: UserProfile = {};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userProfile, setUserProfileState] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('suryx_profile');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return DEFAULT_PROFILE;
  });

  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('suryx_lang') as Language) || 'en';
  });

  const [isOnboarded, setIsOnboarded] = useState<boolean>(() => {
    return localStorage.getItem('suryx_onboarded') === 'true';
  });

  const [userRole, setUserRoleState] = useState<UserRole>(() => {
    return (localStorage.getItem('suryx_role') as UserRole) || 'consumer';
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
    setUserProfileState(prev => {
      const updated = { ...prev, ...profileUpdate };
      // Sync duplicate key names for compatibility
      if (profileUpdate.firstName) updated.name = profileUpdate.firstName;
      if (profileUpdate.roofArea) updated.roofSqFt = profileUpdate.roofArea;
      if (profileUpdate.roofSqFt) updated.roofArea = profileUpdate.roofSqFt;
      if (profileUpdate.billAmount) updated.avgBill = profileUpdate.billAmount;
      if (profileUpdate.avgBill) updated.billAmount = profileUpdate.avgBill;
      if (profileUpdate.pincode) updated.pinCode = profileUpdate.pincode;
      if (profileUpdate.pinCode) updated.pincode = profileUpdate.pinCode;
      return updated;
    });
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const completeOnboarding = () => {
    setIsOnboarded(true);
    localStorage.setItem('suryx_onboarded', 'true');
  };

  const resetProfile = () => {
    setUserProfileState(DEFAULT_PROFILE);
    setIsOnboarded(false);
    setUserRoleState('consumer');
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

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
