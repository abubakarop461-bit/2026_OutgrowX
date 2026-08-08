import { ROIData, UserProfile } from '../types';
import { getStateTariffHistory } from '../data/stateElectricityRates';
import { getSolarHoursPerDay } from '../data/solarIrradiance';

export function calculateSystemSize(annualKWh: number, state: string): number {
  const irradiance = getSolarHoursPerDay(state);
  const averageDailyHours = irradiance.average;
  
  // Daily requirement in kWh
  const dailyKWh = annualKWh / 365;
  
  // System size = (Daily energy requirement) / (Average daily solar hours * System efficiency)
  const systemEfficiency = 0.75; // Account for losses
  const requiredKW = dailyKWh / (averageDailyHours * systemEfficiency);
  
  return parseFloat(requiredKW.toFixed(2));
}

export function calculateSubsidy(systemSizeKW: number): number {
  // PM Surya Ghar Muft Bijli Yojana calculation
  if (systemSizeKW <= 2) {
    return Math.min(30000 * systemSizeKW, 60000); // 30k per kW up to 2kW
  } else if (systemSizeKW <= 3) {
    return 60000 + 18000; // Additional 18k for the 3rd kW -> Total 78k
  } else {
    return 78000; // Capped at 78k for systems > 3kW
  }
}

export function calculateROI(profile: UserProfile): ROIData {
  // Rough estimate: ₹10 per unit avg currently if state tariff history not used for current calc
  // Convert bill to units (Assume avg ₹8/unit for simplicity here, though it varies)
  const monthlyBill = profile.billSize || 2000;
  const currentTariffRate = getStateTariffHistory(profile.state, profile.discom).pop()?.rate || 8;
  
  const monthlyUnits = monthlyBill / currentTariffRate;
  const annualUnits = monthlyUnits * 12;
  
  let systemSizeKW = calculateSystemSize(annualUnits, profile.state);
  // Cap at reasonable residential size if not specified
  if (systemSizeKW > 10) systemSizeKW = 10;
  if (systemSizeKW < 1) systemSizeKW = 1;
  
  // Approx cost: ₹60,000 per kW
  const systemCost = systemSizeKW * 60000;
  
  const subsidy = calculateSubsidy(systemSizeKW);
  const netInvestment = systemCost - subsidy;
  
  const annualSavings = annualUnits * currentTariffRate;
  
  const paybackYears = netInvestment / annualSavings;
  
  // 25 year projection
  let cumulative = -netInvestment;
  const yearlyData = [];
  let currentAnnualSavings = annualSavings;
  const tariffInflation = 1.05; // 5% annual increase in electricity prices
  const panelDegradation = 0.992; // 0.8% degradation per year
  
  for (let year = 1; year <= 25; year++) {
    cumulative += currentAnnualSavings;
    yearlyData.push({
      year,
      savings: Math.round(currentAnnualSavings),
      cumulative: Math.round(cumulative)
    });
    
    currentAnnualSavings = currentAnnualSavings * tariffInflation * panelDegradation;
  }
  
  const roi25Year = ((cumulative + netInvestment) / netInvestment) * 100;

  return {
    systemSizeKW: parseFloat(systemSizeKW.toFixed(1)),
    systemCost,
    subsidy,
    netInvestment,
    annualSavings: Math.round(annualSavings),
    paybackYears: parseFloat(paybackYears.toFixed(1)),
    roi25Year: Math.round(roi25Year),
    yearlyData
  };
}

export function getStateGridHistory(state: string, discom?: string) {
  return getStateTariffHistory(state, discom);
}
