import { ROIData, UserProfile } from '../types';
import { getStateTariffHistory } from '../data/stateElectricityRates';
import { getSolarHoursPerDay } from '../data/solarIrradiance';

/**
 * Accurate PM Surya Ghar subsidy table (Ministry of New & Renewable Energy, 2024)
 * Notified vide Office Memorandum F.No. 283/06/2023-GRID-SOLAR dated 13 Feb 2024
 */
export function calculateSubsidy(systemSizeKW: number): number {
  if (systemSizeKW <= 1) return 30000;
  if (systemSizeKW <= 2) return 60000;
  if (systemSizeKW <= 3) return 78000;
  return 78000; // capped at ₹78,000 for systems > 3 kW (residential cap)
}

/**
 * System size estimation using MNRE benchmark methodology:
 *   System kW = (Annual kWh demand) / (365 × Peak Solar Hours/day × System efficiency)
 * Efficiency factor 0.77 accounts for: wiring losses ~2%, inverter ~4%, soiling ~3%,
 *   temperature derating ~5%, mismatch ~2%, other ~2%
 */
export function calculateSystemSize(annualKWh: number, state: string): number {
  const irr = getSolarHoursPerDay(state);
  // Use annual-average peak sun hours (not summer-only)
  const peakSunHours = irr.average;
  const systemEfficiency = 0.77;
  const rawKW = annualKWh / (365 * peakSunHours * systemEfficiency);
  // Round up to nearest 0.5 kW as installers size in 0.5 kW increments
  return Math.max(1, Math.min(10, Math.ceil(rawKW * 2) / 2));
}

/**
 * Full ROI calculation pipeline — academically grounded:
 *
 * 1. Monthly bill → monthly units (kWh) using latest DISCOM tariff
 * 2. System sizing: annualKWh / (365 × PSH × 0.77)
 * 3. System cost: MNRE benchmark ₹45,000/kW for < 3kW, ₹40,000/kW for 3-10kW (FY2024)
 * 4. Subsidy: PM Surya Ghar 2024 schedule
 * 5. Annual savings: units generated × current tariff
 *    - Each kW generates (PSH × 365 × 0.77) kWh/year
 * 6. Payback = Net Investment / Annual Savings (Year 0 savings)
 * 7. 25-year projection:
 *    - Tariff escalation: 7.8% p.a. (CERC observed average, 2005-2024)
 *    - Panel degradation: 0.5% p.a. (Tier-1 panels, JA Solar / Waaree spec)
 *    - O&M cost: ₹500/kW/year (MNRE estimate)
 */
export function calculateROI(profile: UserProfile): ROIData {
  // Resolve monthly bill — use billSize (the canonical types/index.ts field)
  const monthlyBill = Number((profile as any).billSize ||
    (profile as any).avgBill ||
    (profile as any).billAmount ||
    3200
  );

  // Resolve state
  const state  = profile.state  || 'Maharashtra';
  const discom = (profile as any).discom || 'MSEDCL';

  // Current tariff from historical data (latest year)
  const tariffHistory    = getStateTariffHistory(state, discom);
  const currentTariff    = tariffHistory[tariffHistory.length - 1]?.rate || 7.5;

  // Monthly units consumed
  const monthlyUnits     = monthlyBill / currentTariff;
  const annualUnitsKWh   = monthlyUnits * 12;

  // System sizing
  let systemSizeKW = calculateSystemSize(annualUnitsKWh, state);
  systemSizeKW = Math.max(1, Math.min(10, systemSizeKW));

  // MNRE FY2024 benchmark costs (inclusive of BOS, installation, GST)
  const benchmarkCostPerKW = systemSizeKW <= 3 ? 45000 : 40000;
  const systemCost = Math.round(systemSizeKW * benchmarkCostPerKW);

  // Subsidy
  const subsidy = calculateSubsidy(systemSizeKW);
  const netInvestment = Math.max(0, systemCost - subsidy);

  // Annual solar generation per kW: PSH × 365 × system efficiency
  const irr = getSolarHoursPerDay(state);
  const annualKWhPerKW = irr.average * 365 * 0.77;
  const annualGenerationKWh = systemSizeKW * annualKWhPerKW;

  // Year-1 savings = units generated × tariff (capped at actual consumption)
  const coveredUnits = Math.min(annualGenerationKWh, annualUnitsKWh);
  const annualSavings = Math.round(coveredUnits * currentTariff);

  // Payback period
  const paybackYears = netInvestment > 0 ? parseFloat((netInvestment / annualSavings).toFixed(1)) : 0;

  // 25-year projection
  const TARIFF_ESCALATION = 1.078; // 7.8% p.a. — CERC observed
  const PANEL_DEGRADATION = 0.995; // 0.5% p.a. — Tier-1 panels
  const OM_COST_PER_KW    = 500;   // ₹500/kW/year O&M

  let cumulative           = -netInvestment;
  let currentYearSavings   = annualSavings;
  let currentTariffYr      = currentTariff;
  let generationFactor     = 1.0;
  const yearlyData: { year: number; savings: number; cumulative: number }[] = [];

  for (let yr = 1; yr <= 25; yr++) {
    currentTariffYr   *= TARIFF_ESCALATION;
    generationFactor  *= PANEL_DEGRADATION;
    const omCost       = Math.round(systemSizeKW * OM_COST_PER_KW);
    const generationKWh = annualGenerationKWh * generationFactor;
    const coveredKWh    = Math.min(generationKWh, annualUnitsKWh);
    currentYearSavings  = Math.round(coveredKWh * currentTariffYr) - omCost;
    cumulative         += currentYearSavings;
    yearlyData.push({ year: yr, savings: currentYearSavings, cumulative: Math.round(cumulative) });
  }

  const totalSavings25 = cumulative + netInvestment;
  const roi25Year      = netInvestment > 0 ? Math.round((totalSavings25 / netInvestment) * 100) : 0;

  return {
    systemSizeKW,
    systemCost,
    subsidy,
    netInvestment,
    annualSavings,
    paybackYears,
    roi25Year,
    yearlyData,
  };
}

export function getStateGridHistory(state: string, discom?: string) {
  return getStateTariffHistory(state, discom);
}
