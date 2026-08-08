import { SolarScore, UserProfile } from '../types';
import { getSolarHoursPerDay } from '../data/solarIrradiance';
import { checkSubsidyEligibility } from '../data/govtSchemes';
import { calculateROI } from './roiCalculator';

/**
 * Solar suitability score — each dimension rated 0–100
 *
 * Weights: Solar Resource 25%, Energy Fit 20%, Roof 20%, Financial ROI 25%, Govt 10%
 * (Higher weight on financial & solar resource — the two that matter most to a homeowner)
 */
export function calculateSolarScore(profile: UserProfile): SolarScore {

  // 1. Solar Resource (0–100)
  // India range: Assam 4.1 → Rajasthan 5.5 kWh/m²/day (NISE data)
  // Scale: 4.0 → 40 pts,  5.5 → 100 pts  (linear)
  const irr = getSolarHoursPerDay(profile.state || 'Maharashtra');
  const solarResource = Math.round(
    Math.min(100, Math.max(20, ((irr.average - 4.0) / 1.5) * 60 + 40))
  );

  // 2. Energy Fit (0–100) — how well solar offsets the bill
  // Higher bill = more room to save = better fit
  const bill = Number((profile as any).billSize || (profile as any).avgBill || (profile as any).billAmount || 0);
  let energyFit: number;
  if      (bill >= 6000) energyFit = 100;
  else if (bill >= 4000) energyFit = 90;
  else if (bill >= 2500) energyFit = 78;
  else if (bill >= 1500) energyFit = 62;
  else if (bill >= 800)  energyFit = 48;
  else                   energyFit = 35;

  // 3. Roof Suitability (0–100)
  // Min viable: ~90 sq ft per kW (1 kW = ~10 m² = ~108 sq ft, with 15% margin)
  const roofSqFt = Number(profile.roofArea || (profile as any).roofSqFt || 0);
  let roofSuitability: number;
  if      (roofSqFt >= 1200) roofSuitability = 100;
  else if (roofSqFt >= 800)  roofSuitability = 88;
  else if (roofSqFt >= 500)  roofSuitability = 72;
  else if (roofSqFt >= 300)  roofSuitability = 55;
  else if (roofSqFt >= 150)  roofSuitability = 40;
  else                       roofSuitability = 55; // unknown → neutral
  // Flat roof adds 8 pts (easier to orient panels optimally)
  if ((profile as any).roofType === 'flat') roofSuitability = Math.min(100, roofSuitability + 8);

  // 4. Financial ROI (0–100)
  // Payback < 4 yrs = 100, 4-6 = 80, 6-8 = 60, 8-10 = 40, > 10 = 20
  const roiData = calculateROI(profile);
  let financialROI: number;
  const pb = roiData.paybackYears;
  if      (pb < 4)  financialROI = 100;
  else if (pb < 5)  financialROI = 90;
  else if (pb < 6)  financialROI = 78;
  else if (pb < 7)  financialROI = 65;
  else if (pb < 8)  financialROI = 50;
  else if (pb < 10) financialROI = 35;
  else              financialROI = 20;

  // 5. Government Support (0–100)
  const schemes = checkSubsidyEligibility(profile);
  let governmentSupport: number;
  if      (roiData.subsidy >= 78000) governmentSupport = 100; // full 3kW+ central subsidy
  else if (roiData.subsidy >= 60000) governmentSupport = 88;  // 2kW subsidy
  else if (roiData.subsidy >= 30000) governmentSupport = 72;  // 1kW subsidy
  else                               governmentSupport = 55;
  // State scheme bonus
  if (schemes.length > 1) governmentSupport = Math.min(100, governmentSupport + 8);

  // Weighted Overall
  const overall = Math.round(
    solarResource    * 0.25 +
    energyFit        * 0.20 +
    roofSuitability  * 0.20 +
    financialROI     * 0.25 +
    governmentSupport * 0.10
  );

  return { solarResource, energyFit, roofSuitability, financialROI, governmentSupport, overall };
}
