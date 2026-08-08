export interface UserProfile {
  firstName?: string;
  name?: string;
  email?: string;
  phone?: string;
  companyName?: string;
  gstin?: string;
  licenseNo?: string;
  businessType?: string;
  userType?: string;
  occupation?: string;
  propertyType?: string;
  state?: string;
  discom?: string;
  city?: string;
  pinCode?: string;
  pincode?: string;
  billSize?: number; // average monthly bill in INR
  avgBill?: number;
  billAmount?: number;
  roofArea?: number; // sq ft
  roofSqFt?: number;
  roofType?: 'flat' | 'slanted';
  sunlightHours?: 'poor' | 'fair' | 'good' | 'excellent';
  appliances?: ApplianceSelection[];
  hasSolar?: boolean;
  systemSize?: number;
  installYear?: number;
  wantsBattery?: boolean;
}

export type UserRole = 'consumer' | 'vendor' | 'admin';
export type Language = 'en' | 'hi' | 'mr' | 'gu' | 'ta' | 'te' | 'bn' | 'kn' | 'ml';

export interface ApplianceSelection {
  applianceId: string;
  quantity: number;
  hoursPerDay: number;
}

export interface BillData {
  month: string;
  amount: number;
  unitsKWh?: number;
}

export interface SolarScore {
  solarResource: number;
  energyFit: number;
  roofSuitability: number;
  financialROI: number;
  governmentSupport: number;
  overall: number;
}

export interface VendorData {
  id: string;
  companyName: string;
  logo: string;
  states: string[];
  type: 'Installer' | 'Manufacturer' | 'Maintenance';
  rating: number;
  reviewCount: number;
  priceRange: '₹₹' | '₹₹₹' | '₹₹₹₹';
  specializations: string[];
  certifications: string[];
  description: string;
  contactEmail: string;
  phone?: string;
  website?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export type ModelStatus = 'idle' | 'loading' | 'ready' | 'error';
export type OnboardingStep = 'intro' | 'location' | 'energy' | 'roof' | 'results';

export interface ROIData {
  systemSizeKW: number;
  systemCost: number;
  subsidy: number;
  netInvestment: number;
  annualSavings: number;
  paybackYears: number;
  roi25Year: number;
  yearlyData: { year: number; savings: number; cumulative: number }[];
}

export interface GovtScheme {
  id: string;
  name: string;
  type: 'Central' | 'State';
  state?: string;
  description: string;
  eligibility: string[];
  subsidyAmount: string;
  link?: string;
}
