export interface IrradianceData {
  summer: number; // kWh/m2/day
  monsoon: number;
  winter: number;
  average: number;
}

export const STATE_IRRADIANCE: Record<string, IrradianceData> = {
  'Rajasthan': { summer: 6.5, monsoon: 4.8, winter: 5.2, average: 5.5 },
  'Gujarat': { summer: 6.2, monsoon: 4.5, winter: 5.0, average: 5.2 },
  'Maharashtra': { summer: 6.0, monsoon: 4.0, winter: 5.1, average: 5.0 },
  'Karnataka': { summer: 5.8, monsoon: 3.8, winter: 5.3, average: 4.9 },
  'Tamil Nadu': { summer: 5.5, monsoon: 4.2, winter: 5.0, average: 4.9 },
  'Andhra Pradesh': { summer: 5.7, monsoon: 4.1, winter: 5.2, average: 5.0 },
  'Telangana': { summer: 5.8, monsoon: 4.2, winter: 5.1, average: 5.0 },
  'Madhya Pradesh': { summer: 6.1, monsoon: 4.0, winter: 5.2, average: 5.1 },
  'Uttar Pradesh': { summer: 6.0, monsoon: 3.8, winter: 4.5, average: 4.7 },
  'Delhi': { summer: 6.2, monsoon: 3.9, winter: 4.2, average: 4.7 },
  'Punjab': { summer: 6.3, monsoon: 4.1, winter: 4.0, average: 4.8 },
  'Haryana': { summer: 6.3, monsoon: 4.0, winter: 4.1, average: 4.8 },
  'Bihar': { summer: 5.5, monsoon: 3.5, winter: 4.2, average: 4.4 },
  'West Bengal': { summer: 5.2, monsoon: 3.2, winter: 4.5, average: 4.3 },
  'Odisha': { summer: 5.3, monsoon: 3.4, winter: 4.8, average: 4.5 },
  'Jharkhand': { summer: 5.6, monsoon: 3.7, winter: 4.7, average: 4.6 },
  'Chhattisgarh': { summer: 5.7, monsoon: 3.8, winter: 5.0, average: 4.8 },
  'Kerala': { summer: 5.2, monsoon: 3.5, winter: 5.1, average: 4.6 },
  'Himachal Pradesh': { summer: 5.5, monsoon: 4.0, winter: 4.0, average: 4.5 },
  'Assam': { summer: 4.8, monsoon: 3.5, winter: 4.2, average: 4.1 }
};

// Returns a 24x12 grid (hour x month) for a typical Indian location
// Values normalized 0 to 1
export const HOURLY_IRRADIANCE_GRID: number[][] = Array.from({ length: 24 }, (_, hour) => {
  return Array.from({ length: 12 }, (_, month) => {
    // Basic bell curve for daylight hours
    // Summer (months 3-6) has longer days, winter (10-1) shorter
    const sunrise = (month >= 3 && month <= 6) ? 5 : (month >= 10 || month <= 1) ? 7 : 6;
    const sunset = (month >= 3 && month <= 6) ? 19 : (month >= 10 || month <= 1) ? 17 : 18;
    
    if (hour < sunrise || hour > sunset) return 0;
    
    const peakHour = (sunrise + sunset) / 2;
    const distance = Math.abs(hour - peakHour);
    const spread = (sunset - sunrise) / 2;
    
    // Monsoon reduction (months 6-8)
    const monsoonFactor = (month >= 6 && month <= 8) ? 0.6 : 1.0;
    
    return Math.max(0, (1 - (distance / spread)) * monsoonFactor);
  });
});

export function getSolarHoursPerDay(state: string): IrradianceData {
  return STATE_IRRADIANCE[state] || { summer: 5.5, monsoon: 3.8, winter: 4.5, average: 4.6 }; // Default average
}
