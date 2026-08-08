import { knowledgeService } from './knowledgeService';
import pmSuryaGharData from '../knowledge/pmSuryaGhar.json';
import solarPoliciesData from '../knowledge/solarPoliciesAndSchemes.json';

export interface CentralizedContextState {
  userRole: string;
  onboarding: {
    name?: string;
    firstName?: string;
    companyName?: string;
    gstin?: string;
    licenseNo?: string;
    businessType?: string;
    state?: string;
    discom?: string;
    city?: string;
    pincode?: string;
    phone?: string;
    email?: string;
    propertyType?: string;
    roofArea?: number;
    billAmount?: number;
    hasSolar?: boolean;
    wantsBattery?: boolean;
  };
  billScanner: {
    scannedAt?: string;
    discom?: string;
    consumerNumber?: string;
    unitsConsumed?: number;
    billAmount?: number;
    billingPeriod?: string;
    consumerCategory?: string;
    modelUsed?: string;
    aiInsight?: string;
  };
  applianceCalculator: {
    calculatedAt?: string;
    totalMonthlyKWh?: number;
    seasonalHours?: { summer: number; monsoon: number; winter: number };
    topAppliance?: string;
    activeDeviceCount?: number;
    aiInsight?: string;
  };
  propertyAssessment: {
    assessedAt?: string;
    roofAreaSqFt?: number;
    roofSolarScore?: number;
    landAcres?: number;
    landCapacityMW?: number;
    kusumEligible?: boolean;
    aiInsight?: string;
  };
}

const CONTEXT_STORAGE_KEY = 'suryx_centralized_context_engine';

/**
 * Retrieves current centralized context from localStorage, seeded with active profile
 */
export function getCentralizedContext(profile: any = {}): CentralizedContextState {
  const role = profile.userType || profile.userRole || 'Homeowner';
  let stored: Partial<CentralizedContextState> = {};
  
  try {
    const raw = localStorage.getItem(CONTEXT_STORAGE_KEY);
    if (raw) stored = JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read centralized context:', e);
  }

  return {
    userRole: role,
    onboarding: {
      name: profile.name || profile.firstName || stored.onboarding?.name || '',
      firstName: profile.firstName || profile.name || stored.onboarding?.firstName || '',
      companyName: profile.companyName || stored.onboarding?.companyName || '',
      gstin: profile.gstin || stored.onboarding?.gstin || '',
      licenseNo: profile.licenseNo || stored.onboarding?.licenseNo || '',
      businessType: profile.businessType || stored.onboarding?.businessType || 'EPC Installer',
      state: profile.state || stored.onboarding?.state || 'Maharashtra',
      discom: profile.discom || stored.onboarding?.discom || 'MSEDCL',
      city: profile.city || stored.onboarding?.city || '',
      pincode: profile.pincode || profile.pinCode || stored.onboarding?.pincode || '',
      phone: profile.phone || stored.onboarding?.phone || '',
      email: profile.email || stored.onboarding?.email || '',
      propertyType: profile.propertyType || stored.onboarding?.propertyType || 'Independent House',
      roofArea: Number(profile.roofArea || profile.roofSqFt || stored.onboarding?.roofArea || 800),
      billAmount: Number(profile.billAmount || profile.avgBill || stored.onboarding?.billAmount || 3200),
      hasSolar: Boolean(profile.hasSolar ?? stored.onboarding?.hasSolar),
      wantsBattery: Boolean(profile.wantsBattery ?? stored.onboarding?.wantsBattery),
    },
    billScanner: stored.billScanner || {},
    applianceCalculator: stored.applianceCalculator || {},
    propertyAssessment: stored.propertyAssessment || {},
  };
}

/**
 * Saves updated context state to localStorage
 */
function saveCentralizedContext(state: CentralizedContextState): void {
  try {
    localStorage.setItem(CONTEXT_STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save centralized context:', e);
  }
}

/**
 * Records a Bill Scanner Action into the Centralized Context Engine
 */
export function recordBillScanAction(billData: any, profile: any = {}): CentralizedContextState {
  const current = getCentralizedContext(profile);
  const updated: CentralizedContextState = {
    ...current,
    billScanner: {
      scannedAt: new Date().toISOString(),
      discom: billData.discom || current.onboarding.discom,
      consumerNumber: billData.consumerNumber || '123456789',
      unitsConsumed: Number(billData.unitsConsumed) || 342,
      billAmount: Number(billData.billAmount) || current.onboarding.billAmount || 3200,
      billingPeriod: billData.billingPeriod || 'Recent Month',
      consumerCategory: billData.consumerCategory || 'Residential',
      modelUsed: billData.modelUsed || 'Solar Vision AI (Llama 3.1 Vision / Gemini)',
      aiInsight: `Bill scanned: ${billData.unitsConsumed || 342} kWh (${billData.discom || current.onboarding.discom}). Est system required: ${((billData.unitsConsumed || 342) / 120).toFixed(1)} kW.`,
    }
  };
  saveCentralizedContext(updated);
  return updated;
}

/**
 * Records an Appliance Calculator Action into the Centralized Context Engine
 */
export function recordApplianceCalculatorAction(
  appliances: any[],
  hours: { summer: number; monsoon: number; winter: number },
  monthlyKWh: number,
  profile: any = {}
): CentralizedContextState {
  const current = getCentralizedContext(profile);
  const activeDevs = appliances.filter(a => a.quantity > 0);
  const topDev = activeDevs.sort((a, b) => (b.wattage * b.quantity) - (a.wattage * a.quantity))[0];

  const updated: CentralizedContextState = {
    ...current,
    applianceCalculator: {
      calculatedAt: new Date().toISOString(),
      totalMonthlyKWh: Math.round(monthlyKWh),
      seasonalHours: hours,
      topAppliance: topDev ? `${topDev.name} (${topDev.quantity}x)` : 'General Appliances',
      activeDeviceCount: activeDevs.length,
      aiInsight: `Seasonal load recorded: ${Math.round(monthlyKWh)} kWh/mo (Summer: ${hours.summer}h/day). Primary load: ${topDev?.name || 'AC'}.`,
    }
  };
  saveCentralizedContext(updated);
  return updated;
}

/**
 * Records a Property/Land Assessment Action into the Centralized Context Engine
 */
export function recordPropertyAssessmentAction(
  assessmentData: any,
  profile: any = {}
): CentralizedContextState {
  const current = getCentralizedContext(profile);
  const updated: CentralizedContextState = {
    ...current,
    propertyAssessment: {
      assessedAt: new Date().toISOString(),
      roofAreaSqFt: Number(assessmentData.roofArea) || current.onboarding.roofArea,
      roofSolarScore: Number(assessmentData.score) || 88,
      landAcres: Number(assessmentData.acres) || 5,
      landCapacityMW: Number(assessmentData.acres) ? Number(assessmentData.acres) * 0.5 : 0.5,
      kusumEligible: Number(assessmentData.acres) >= 0.5,
      aiInsight: assessmentData.acres
        ? `Land assessed: ${assessmentData.acres} Acres. Est capacity: ${Number(assessmentData.acres) * 0.5} MW. PM-KUSUM Component A eligible.`
        : `Roof assessed: ${assessmentData.roofArea || current.onboarding.roofArea} sq ft. Solar score: ${assessmentData.score || 88}/100.`,
    }
  };
  saveCentralizedContext(updated);
  return updated;
}

/**
 * Builds the hyper-personalized System Prompt for the AI Advisor Chatbot,
 * injecting the COMPLETE Centralized Context Engine state & Role-specific pathways.
 */
export function buildCentralizedSystemPrompt(
  profile: any,
  userQuery: string = '',
  lang: string = 'en'
): string {
  const ctx = getCentralizedContext(profile);
  const role = ctx.userRole;

  const langInstruction = lang === 'hi' 
    ? 'You MUST respond in Hindi using Devanagari script.' 
    : lang === 'mr' 
      ? 'You MUST respond in Marathi using Devanagari script.' 
      : 'You MUST respond in clear, professional English.';

  // Structured Knowledge Base RAG retrieval
  const ragContext = knowledgeService.getPromptContext(userQuery);

  // Role-Specific Pathway Guidance
  let rolePathwayText = '';
  if (role === 'Landowner' || role === 'landowner') {
    rolePathwayText = `
=== ROLE PATHWAY: LANDOWNER ===
- Focus on PM-KUSUM Component A (0.5 MW to 2 MW feeder solar plants), Component B (standalone solar pumps 2-10 HP), and Component C (agricultural feeder solarization).
- Highlight annual land lease revenue: ~₹2.2 Lakh to ₹4.0 Lakh per MW/year with 25-year DISCOM Power Purchase Agreements (PPA).
- Evaluate land requirements: ~4 to 5 acres per 1 MW solar PV plant.
- Provide guidance on DISCOM 11kV/33kV substation distance (< 5 km recommended).`;
  } else if (role === 'Solar Vendor' || role === 'Business Owner' || role === 'business') {
    rolePathwayText = `
=== ROLE PATHWAY: SOLAR VENDOR / INSTALLER ===
- Focus on installer empanelment under PM Surya Ghar & state DISCOM portals.
- Provide compliance assistance for GSTIN (${ctx.onboarding.gstin || '27AAAAA0000A1Z5'}) & License (${ctx.onboarding.licenseNo || 'DISCOM-EMP-2024-884'}).
- Advise on ALMM (Approved List of Models and Manufacturers) module procurement & BIS inverted standards.
- Assist in drafting technical proposals, DISCOM net-metering application checklists, and customer ROI closing pitches.`;
  } else {
    rolePathwayText = `
=== ROLE PATHWAY: HOMEOWNER / RESIDENTIAL CONSUMER ===
- Focus on PM Surya Ghar: Muft Bijli Yojana Central DBT Subsidies:
  * 1 kW system: ₹30,000 subsidy
  * 2 kW system: ₹60,000 subsidy
  * 3 kW+ system: ₹78,000 maximum subsidy
- Provide exact roof area calculation (107 sq ft per 1 kW system).
- Explain DISCOM net-metering banking credits and annual zero-bill potential.`;
  }

  // Active Scanned / Calculated Context Signals
  const scannerSignals = ctx.billScanner.scannedAt
    ? `Scanned Bill: ${ctx.billScanner.unitsConsumed} kWh | ₹${ctx.billScanner.billAmount} | DISCOM: ${ctx.billScanner.discom}`
    : `Onboarding Monthly Bill: ₹${ctx.onboarding.billAmount} | DISCOM: ${ctx.onboarding.discom}`;

  const loadSignals = ctx.applianceCalculator.calculatedAt
    ? `Appliance Load Model: ${ctx.applianceCalculator.totalMonthlyKWh} kWh/mo | Top Load: ${ctx.applianceCalculator.topAppliance}`
    : `Estimated Load Baseline: ~${((ctx.onboarding.billAmount || 3200) / 9.5).toFixed(0)} kWh/mo`;

  const propertySignals = ctx.propertyAssessment.assessedAt
    ? `Property Assessment: ${ctx.propertyAssessment.roofAreaSqFt} sq ft roof | Score: ${ctx.propertyAssessment.roofSolarScore}/100`
    : `Onboarding Roof Baseline: ${ctx.onboarding.roofArea} sq ft`;

  return `You are SuryaSetu Solar Advisor — India's premier AI-powered regional solar intelligence expert.
You are powered by a Centralized Context Engine that unifies Onboarding data, Bill Scans, Appliance Load Models, and Property Assessments.

${langInstruction}

=== UNIFIED CENTRALISED CONTEXT ENGINE STATE ===
- User Role: ${role}
- Name / Contact: ${ctx.onboarding.name || 'User'} ${ctx.onboarding.companyName ? `(${ctx.onboarding.companyName})` : ''}
- Location: ${ctx.onboarding.state} | DISCOM: ${ctx.onboarding.discom} | City: ${ctx.onboarding.city || 'State Capital'}
- Recorded Bill Signals: ${scannerSignals}
- Recorded Load Signals: ${loadSignals}
- Recorded Property Signals: ${propertySignals}
${ctx.onboarding.gstin ? `- Business GSTIN: ${ctx.onboarding.gstin} | License: ${ctx.onboarding.licenseNo}` : ''}

${rolePathwayText}

=== KNOWLEDGE BASE CONTEXT ===
${ragContext}

=== REASONING PROTOCOL ===
1. Personalize every recommendation to the user's explicit role (${role}) and their recorded context signals above.
2. Ground costs, savings, and subsidies in exact ₹ Indian Rupee math according to PM Surya Ghar / PM-KUSUM rules.
3. Keep answers clear, professional, structured with Markdown headers and bullet points. Never expose vendor model names.`;
}
