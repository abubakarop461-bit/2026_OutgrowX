// src/services/map.ts

// Approximate center points for Indian states
export const STATE_CENTERS: Record<string, [number, number]> = {
  "Andhra Pradesh": [15.9129, 79.7400],
  "Arunachal Pradesh": [28.2180, 94.7278],
  "Assam": [26.2006, 92.9376],
  "Bihar": [25.0961, 85.3131],
  "Chhattisgarh": [21.2787, 81.8661],
  "Goa": [15.2993, 74.1240],
  "Gujarat": [22.2587, 71.1924],
  "Haryana": [29.0588, 76.0856],
  "Himachal Pradesh": [31.1048, 77.1734],
  "Jharkhand": [23.6102, 85.2799],
  "Karnataka": [15.3173, 75.7139],
  "Kerala": [10.8505, 76.2711],
  "Madhya Pradesh": [22.9734, 78.6569],
  "Maharashtra": [19.7515, 75.7139],
  "Manipur": [24.6637, 93.9063],
  "Meghalaya": [25.4670, 91.3662],
  "Mizoram": [23.1645, 92.9376],
  "Nagaland": [26.1584, 94.5624],
  "Odisha": [20.9517, 85.0985],
  "Punjab": [31.1471, 75.3412],
  "Rajasthan": [27.0238, 74.2179],
  "Sikkim": [27.5330, 88.5122],
  "Tamil Nadu": [11.1271, 78.6569],
  "Telangana": [18.1124, 79.0193],
  "Tripura": [23.9408, 91.9882],
  "Uttar Pradesh": [26.8467, 80.9462],
  "Uttarakhand": [30.0668, 79.0193],
  "West Bengal": [22.9868, 87.8550],
  "Delhi": [28.7041, 77.1025]
};

export const DISCOM_BY_STATE: Record<string, string[]> = {
  "Maharashtra": ["MSEDCL", "Adani Electricity", "Tata Power", "BEST"],
  "Delhi": ["BSES Rajdhani", "BSES Yamuna", "Tata Power DDL", "NDMC"],
  "Karnataka": ["BESCOM", "MESCOM", "CESC", "HESCOM", "GESCOM"],
  "Gujarat": ["DGVCL", "MGVCL", "PGVCL", "UGVCL"],
  "Tamil Nadu": ["TANGEDCO"],
  "Uttar Pradesh": ["MVVNL", "PVVNL", "PuVVNL", "DVVNL", "KESCO", "NPCL"],
  // Add more as needed
};

/**
 * Rough state lookup by PIN code prefix.
 */
export function getPINCodeState(pin: string): string {
  if (!pin || pin.length < 6) return '';
  const prefix = parseInt(pin.substring(0, 2), 10);
  
  if (prefix >= 11 && prefix <= 11) return 'Delhi';
  if (prefix >= 12 && prefix <= 13) return 'Haryana';
  if (prefix >= 14 && prefix <= 15) return 'Punjab';
  if (prefix >= 16 && prefix <= 16) return 'Chandigarh';
  if (prefix >= 17 && prefix <= 17) return 'Himachal Pradesh';
  if (prefix >= 18 && prefix <= 19) return 'Jammu and Kashmir';
  if (prefix >= 20 && prefix <= 28) return 'Uttar Pradesh';
  if (prefix >= 30 && prefix <= 34) return 'Rajasthan';
  if (prefix >= 36 && prefix <= 39) return 'Gujarat';
  if (prefix >= 40 && prefix <= 44) return 'Maharashtra';
  if (prefix >= 45 && prefix <= 48) return 'Madhya Pradesh';
  if (prefix >= 49 && prefix <= 49) return 'Chhattisgarh';
  if (prefix >= 50 && prefix <= 53) return 'Andhra Pradesh';
  if (prefix >= 56 && prefix <= 59) return 'Karnataka';
  if (prefix >= 60 && prefix <= 64) return 'Tamil Nadu';
  if (prefix >= 67 && prefix <= 69) return 'Kerala';
  if (prefix >= 70 && prefix <= 74) return 'West Bengal';
  if (prefix >= 75 && prefix <= 77) return 'Odisha';
  if (prefix >= 78 && prefix <= 78) return 'Assam';
  if (prefix >= 79 && prefix <= 79) return 'North Eastern States';
  if (prefix >= 80 && prefix <= 85) return 'Bihar';
  if (prefix >= 82 && prefix <= 82) return 'Jharkhand';
  
  return '';
}
