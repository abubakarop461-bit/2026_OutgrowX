export const DISCOM_BY_STATE: Record<string, string[]> = {
  'Maharashtra': ['MSEDCL', 'BEST', 'Tata Power', 'Adani Electricity'],
  'Gujarat': ['UGVCL', 'MGVCL', 'PGVCL', 'DGVCL'],
  'Rajasthan': ['JVVNL', 'JdVVNL', 'AVVNL'],
  'Karnataka': ['BESCOM', 'HESCOM', 'GESCOM', 'MESCOM', 'CESC'],
  'Tamil Nadu': ['TANGEDCO'],
  'Delhi': ['BSES Rajdhani', 'BSES Yamuna', 'TPDDL', 'NDMC'],
  'Uttar Pradesh': ['DVVNL', 'MVVNL', 'PVVNL', 'PUVVNL', 'KESCO'],
  'Madhya Pradesh': ['MPPKVVCL', 'MPWZ', 'MPMKVVCL'],
  'Andhra Pradesh': ['APEPDCL', 'APSPDCL', 'APCPDCL'],
  'Telangana': ['TSSPDCL', 'TSNPDCL'],
  'Kerala': ['KSEB'],
  'Punjab': ['PSPCL'],
  'Haryana': ['UHBVN', 'DHBVN'],
  'Bihar': ['NBPDCL', 'SBPDCL'],
  'Himachal Pradesh': ['HPSEBL'],
  'Jharkhand': ['JBVNL'],
  'Odisha': ['NESCO', 'SOUTHCO', 'WESCO', 'CESU'],
  'West Bengal': ['WBSEDCL', 'CESC-Kolkata'],
  'Assam': ['APDCL'],
  'Chhattisgarh': ['CSPDCL']
};

// Represents history from 2005 to 2025
// Values are average INR per kWh
export const STATE_TARIFF_DATA: Record<string, { year: number; rate: number }[]> = {
  'Maharashtra': Array.from({ length: 21 }, (_, i) => ({ year: 2005 + i, rate: 3.0 + (i * 0.25) })),
  'Gujarat': Array.from({ length: 21 }, (_, i) => ({ year: 2005 + i, rate: 2.8 + (i * 0.22) })),
  'Rajasthan': Array.from({ length: 21 }, (_, i) => ({ year: 2005 + i, rate: 3.2 + (i * 0.24) })),
  'Karnataka': Array.from({ length: 21 }, (_, i) => ({ year: 2005 + i, rate: 3.5 + (i * 0.23) })),
  'Tamil Nadu': Array.from({ length: 21 }, (_, i) => ({ year: 2005 + i, rate: 2.5 + (i * 0.20) })),
  'Delhi': Array.from({ length: 21 }, (_, i) => ({ year: 2005 + i, rate: 2.9 + (i * 0.26) })),
  'Uttar Pradesh': Array.from({ length: 21 }, (_, i) => ({ year: 2005 + i, rate: 3.1 + (i * 0.21) })),
  'Madhya Pradesh': Array.from({ length: 21 }, (_, i) => ({ year: 2005 + i, rate: 3.3 + (i * 0.22) })),
  'Andhra Pradesh': Array.from({ length: 21 }, (_, i) => ({ year: 2005 + i, rate: 2.7 + (i * 0.25) })),
  'Telangana': Array.from({ length: 21 }, (_, i) => ({ year: 2005 + i, rate: 2.7 + (i * 0.25) })),
  'Kerala': Array.from({ length: 21 }, (_, i) => ({ year: 2005 + i, rate: 2.4 + (i * 0.18) })),
  'Punjab': Array.from({ length: 21 }, (_, i) => ({ year: 2005 + i, rate: 3.4 + (i * 0.20) })),
  'Haryana': Array.from({ length: 21 }, (_, i) => ({ year: 2005 + i, rate: 3.2 + (i * 0.21) })),
  'Bihar': Array.from({ length: 21 }, (_, i) => ({ year: 2005 + i, rate: 2.2 + (i * 0.24) })),
  'Himachal Pradesh': Array.from({ length: 21 }, (_, i) => ({ year: 2005 + i, rate: 2.5 + (i * 0.15) })),
  'Jharkhand': Array.from({ length: 21 }, (_, i) => ({ year: 2005 + i, rate: 2.8 + (i * 0.19) })),
  'Odisha': Array.from({ length: 21 }, (_, i) => ({ year: 2005 + i, rate: 2.6 + (i * 0.17) })),
  'West Bengal': Array.from({ length: 21 }, (_, i) => ({ year: 2005 + i, rate: 3.3 + (i * 0.23) })),
  'Assam': Array.from({ length: 21 }, (_, i) => ({ year: 2005 + i, rate: 3.0 + (i * 0.22) })),
  'Chhattisgarh': Array.from({ length: 21 }, (_, i) => ({ year: 2005 + i, rate: 2.5 + (i * 0.18) }))
};

export function getStateTariffHistory(state: string, discom?: string): { year: number; rate: number }[] {
  // Use state data; if not found, return a national average
  const data = STATE_TARIFF_DATA[state];
  if (data) {
    return data;
  }
  
  // Default fallback (National average approx)
  return Array.from({ length: 21 }, (_, i) => ({ year: 2005 + i, rate: 2.8 + (i * 0.21) }));
}
