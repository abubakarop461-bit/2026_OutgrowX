import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BlogArticle, STATIC_FALLBACK_BLOGS, fetchFeedBlogs } from '../services/blogFeeds';

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
  isAuthenticated: boolean;
  userRole: UserRole;
  blogArticles: BlogArticle[];
  setProfile: (profileUpdate: Partial<UserProfile>) => void;
  setLanguage: (lang: Language) => void;
  completeOnboarding: () => void;
  authenticateUser: (name: string, phone: string, email: string) => void;
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

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('suryx_authenticated') === 'true' || Boolean(userProfile.name && userProfile.email);
  });

  const [isOnboarded, setIsOnboarded] = useState<boolean>(() => {
    return localStorage.getItem('suryx_onboarded') === 'true';
  });

  const [userRole, setUserRoleState] = useState<UserRole>(() => {
    return (localStorage.getItem('suryx_role') as UserRole) || 'consumer';
  });

  const [blogArticles, setBlogArticles] = useState<BlogArticle[]>(STATIC_FALLBACK_BLOGS);

  useEffect(() => {
    fetchFeedBlogs().then(articles => {
      if (articles && articles.length > 0) {
        setBlogArticles(articles);
      }
    });
  }, []);

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
    localStorage.setItem('suryx_authenticated', String(isAuthenticated));
  }, [isAuthenticated]);

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
      if (profileUpdate.firstName) updated.name = profileUpdate.firstName;
      if (profileUpdate.roofArea) updated.roofSqFt = profileUpdate.roofArea;
      if (profileUpdate.roofSqFt) updated.roofArea = profileUpdate.roofSqFt;
      if (profileUpdate.billAmount) updated.avgBill = profileUpdate.billAmount;
      if (profileUpdate.avgBill) updated.billAmount = profileUpdate.avgBill;
      return updated;
    });
  };

  const authenticateUser = (name: string, phone: string, email: string) => {
    const firstName = name.split(' ')[0] || name;
    setUserProfileState(prev => ({
      ...prev,
      name,
      firstName,
      phone,
      email,
    }));
    setIsAuthenticated(true);
  };

  const setLanguage = (lang: Language) => setLanguageState(lang);

  const completeOnboarding = () => setIsOnboarded(true);

  const setUserRole = (role: UserRole) => setUserRoleState(role);

  const resetProfile = () => {
    setUserProfileState(DEFAULT_PROFILE);
    setIsOnboarded(false);
    setIsAuthenticated(false);
    localStorage.removeItem('suryx_profile');
    localStorage.removeItem('suryx_onboarded');
    localStorage.removeItem('suryx_authenticated');
  };

  return (
    <AppContext.Provider value={{
      userProfile,
      language,
      isOnboarded,
      isAuthenticated,
      userRole,
      blogArticles,
      setProfile,
      setLanguage,
      completeOnboarding,
      authenticateUser,
      resetProfile,
      setUserRole,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return ctx;
};
