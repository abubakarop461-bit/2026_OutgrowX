import { SolarScore, UserProfile } from '../types';
import { getSolarHoursPerDay } from '../data/solarIrradiance';
import { checkSubsidyEligibility } from '../data/govtSchemes';
import { calculateROI } from './roiCalculator';

export function calculateSolarScore(profile: UserProfile): SolarScore {
  // 1. Solar Resource (0-100) based on irradiance
  const irradiance = getSolarHoursPerDay(profile.state);
  // Max expected avg is around 5.5 (Rajasthan), min around 4.1 (Assam)
  const solarResourceRaw = ((irradiance.average - 3.5) / 2.5) * 100;
  const solarResource = Math.min(100, Math.max(0, Math.round(solarResourceRaw)));

  // 2. Energy Fit (0-100) based on bill size
  const billSize = profile.billSize || 0;
  let energyFit = 50; // default
  if (billSize > 5000) energyFit = 100;
  else if (billSize > 3000) energyFit = 90;
  else if (billSize > 1500) energyFit = 75;
  else if (billSize > 800) energyFit = 60;
  else energyFit = 40;

  // 3. Roof Suitability (0-100)
  let roofSuitability = 50;
  if (profile.roofArea) {
    if (profile.roofArea >= 1000) roofSuitability = 100;
    else if (profile.roofArea >= 500) roofSuitability = 85;
    else if (profile.roofArea >= 250) roofSuitability = 70;
    else roofSuitability = 40;
  }
  
  if (profile.roofType === 'flat') {
    roofSuitability = Math.min(100, roofSuitability + 10);
  }

  // 4. Financial ROI (0-100)
  const roiData = calculateROI(profile);
  // A payback of 3 years is excellent (100), 7+ years is poor (0)
  const financialROIRaw = 100 - ((roiData.paybackYears - 3) * 25);
  const financialROI = Math.min(100, Math.max(0, Math.round(financialROIRaw)));

  // 5. Government Support (0-100)
  const schemes = checkSubsidyEligibility(profile);
  let governmentSupport = 50; // Base from central scheme
  if (schemes.length > 1) {
    governmentSupport = 90; // State schemes give a boost
  }
  if (roiData.subsidy >= 78000) {
    governmentSupport = 100; // Max central subsidy unlocked
  }

  // Overall (Weighted Average)
  const overall = Math.round(
    (solarResource * 0.2) + 
    (energyFit * 0.25) + 
    (roofSuitability * 0.15) + 
    (financialROI * 0.25) + 
    (governmentSupport * 0.15)
  );

  return {
    solarResource,
    energyFit,
    roofSuitability,
    financialROI,
    governmentSupport,
    overall
  };
}
