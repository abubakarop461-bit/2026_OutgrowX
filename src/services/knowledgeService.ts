import pmSuryaGhar from '../knowledge/pmSuryaGhar.json';
import solarPolicies from '../knowledge/solarPoliciesAndSchemes.json';

export interface SubsidyResult {
  capacityKw: number;
  subsidyRupees: number;
  formula: string;
  freeUnitsPerMonth: number;
  annualSavingsEstimate: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface EligibilityResult {
  whoCanApply: string;
  capacityKw: number;
  requiredAreaSqMeters: number;
  requiredAreaSqFt: number;
  documentsRequired: string[];
}

export class KnowledgeService {
  /**
   * Get subsidy calculation for a given system capacity or full subsidy slabs.
   */
  getSubsidies(systemCapacityKw?: number): SubsidyResult | typeof pmSuryaGhar.subsidies {
    if (systemCapacityKw === undefined) {
      return pmSuryaGhar.subsidies;
    }

    const cap = Math.max(1, systemCapacityKw);
    let subsidyRupees = 0;
    let formula = '';

    if (cap <= 1) {
      subsidyRupees = 30000;
      formula = '₹30,000 for 1 kW';
    } else if (cap <= 2) {
      subsidyRupees = 60000;
      formula = '₹60,000 for 2 kW (₹30,000/kW)';
    } else {
      subsidyRupees = 78000;
      formula = '₹78,000 capped maximum subsidy for 3 kW and above';
    }

    const freeUnits = cap <= 1 ? 120 : cap <= 2 ? 240 : 300;
    const savings = pmSuryaGhar.estimatedSavings.find(s => s.systemCapacityKw === Math.min(5, Math.floor(cap)))?.annualSavingsRupees || 'Rs. 22,000 – 30,000';

    return {
      capacityKw: cap,
      subsidyRupees,
      formula,
      freeUnitsPerMonth: freeUnits,
      annualSavingsEstimate: savings
    };
  }

  /**
   * Get all structured FAQs or filter by query/category.
   */
  getFAQs(category?: string): FAQItem[] {
    if (!category) return pmSuryaGhar.faqs;
    const catLower = category.toLowerCase();
    return pmSuryaGhar.faqs.filter(faq => 
      faq.question.toLowerCase().includes(catLower) || 
      faq.answer.toLowerCase().includes(catLower)
    );
  }

  /**
   * Get portal and national solar statistics.
   */
  getStatistics() {
    return {
      pmSuryaGharPortal: pmSuryaGhar.statistics,
      nationalRenewableAchievements: solarPolicies.nationalAchievements
    };
  }

  /**
   * Get policies including ALMM rules, net metering regulations, and technical standards.
   */
  getPolicies() {
    return {
      almmFramework: solarPolicies.almmFramework,
      netMeteringStandards: solarPolicies.ceaNetMeteringStandards,
      vendorRules: pmSuryaGhar.vendorRules,
      technicalStandards: pmSuryaGhar.technicalStandards
    };
  }

  /**
   * Get government schemes (PM Surya Ghar, PM-KUSUM, NSM, Solar Parks, CPSU).
   */
  getSchemes(category?: string) {
    const allSchemes = [
      {
        id: 'pm-surya-ghar',
        name: pmSuryaGhar.schemeOverview.name,
        ministry: pmSuryaGhar.schemeOverview.ministry,
        target: pmSuryaGhar.schemeOverview.targetHouseholdsFormatted,
        maxSubsidy: `₹${pmSuryaGhar.schemeOverview.maxSubsidyAmount.toLocaleString('en-IN')}`,
        budget: `₹${pmSuryaGhar.schemeOverview.totalBudgetRupeesCr.toLocaleString('en-IN')} Crore`,
        description: 'Residential rooftop solar scheme giving up to 300 free units electricity/month and up to ₹78,000 direct bank subsidy.'
      },
      ...solarPolicies.schemes
    ];

    if (!category) return allSchemes;
    const catLower = category.toLowerCase();
    return allSchemes.filter(s => 
      s.name.toLowerCase().includes(catLower) || 
      s.id.includes(catLower)
    );
  }

  /**
   * Get eligibility rules and document checklist based on capacity.
   */
  getEligibilityRules(capacityKw: number = 3): EligibilityResult {
    const areaReq = pmSuryaGhar.eligibilityAndDocs.roofAreaRequirements.find(r => r.capacityKw === Math.min(5, Math.floor(capacityKw))) || {
      capacityKw: capacityKw,
      areaSqMeters: capacityKw * 10,
      areaSqFt: capacityKw * 107
    };

    return {
      whoCanApply: pmSuryaGhar.eligibilityAndDocs.whoCanApply,
      capacityKw,
      requiredAreaSqMeters: areaReq.areaSqMeters,
      requiredAreaSqFt: areaReq.areaSqFt,
      documentsRequired: pmSuryaGhar.eligibilityAndDocs.documentsRequired
    };
  }

  /**
   * Pre-formatted data for UI charts (generation vs capacity, portal stats, national RE breakdown).
   */
  getChartData(chartType: 'savingsByCapacity' | 'installationStats' | 'nationalReBreakdown') {
    switch (chartType) {
      case 'savingsByCapacity':
        return {
          labels: ['1 kW', '2 kW', '3 kW', '5 kW'],
          datasets: [
            {
              label: 'Monthly Units Generated',
              data: pmSuryaGhar.estimatedSavings.map(s => s.monthlyGenerationUnits),
              backgroundColor: '#3b82f6'
            },
            {
              label: 'Free Electricity Cap (kWh)',
              data: pmSuryaGhar.estimatedSavings.map(s => s.freeUnitsPerMonth),
              backgroundColor: '#10b981'
            }
          ]
        };
      case 'installationStats':
        return {
          labels: ['Total Applications', 'Installations Done', 'Households Benefitted'],
          datasets: [
            {
              label: 'Portal Count (Millions)',
              data: [
                +(pmSuryaGhar.statistics.totalApplications / 1000000).toFixed(2),
                +(pmSuryaGhar.statistics.totalInstallations / 1000000).toFixed(2),
                +(pmSuryaGhar.statistics.householdsBenefitted / 1000000).toFixed(2)
              ],
              backgroundColor: ['#f59e0b', '#10b981', '#6366f1']
            }
          ]
        };
      case 'nationalReBreakdown':
        return {
          labels: ['Solar (GW)', 'Wind (GW)', 'Other RE (GW)'],
          datasets: [
            {
              label: 'Capacity in GW',
              data: [
                solarPolicies.nationalAchievements.solarInstalledCapacityGw,
                solarPolicies.nationalAchievements.windInstalledCapacityGw,
                45.0
              ],
              backgroundColor: ['#eab308', '#06b6d4', '#8b5cf6']
            }
          ]
        };
      default:
        return null;
    }
  }

  /**
   * Structured search across all knowledge domains.
   */
  searchKnowledge(query: string) {
    const q = query.toLowerCase().trim();
    if (!q) return [];

    const results: { category: string; title: string; content: string }[] = [];

    // Check overview
    if (q.includes('surya ghar') || q.includes('subsidy') || q.includes('cost') || q.includes('free')) {
      results.push({
        category: 'PM Surya Ghar Scheme',
        title: pmSuryaGhar.schemeOverview.name,
        content: `Target: ${pmSuryaGhar.schemeOverview.targetHouseholdsFormatted}. Max Subsidy: ₹${pmSuryaGhar.schemeOverview.maxSubsidyAmount}. Free Units: Up to ${pmSuryaGhar.schemeOverview.freeElectricityUnitsPerMonth} kWh/mo. Total Budget: ₹${pmSuryaGhar.schemeOverview.totalBudgetRupeesCr} Cr.`
      });
    }

    // Check subsidies
    if (q.includes('subsidy') || q.includes('kw') || q.includes('slab') || q.includes('rupees') || q.includes('amount')) {
      pmSuryaGhar.subsidies.residential.forEach(s => {
        results.push({
          category: 'Subsidy Structure',
          title: `Capacity: ${s.capacityLabel}`,
          content: `Subsidy: ₹${s.subsidyRupees.toLocaleString('en-IN')}. Rule: ${s.formula}.`
        });
      });
    }

    // Check FAQs
    pmSuryaGhar.faqs.forEach(faq => {
      if (faq.question.toLowerCase().includes(q) || faq.answer.toLowerCase().includes(q)) {
        results.push({
          category: 'FAQ',
          title: faq.question,
          content: faq.answer
        });
      }
    });

    // Check Schemes
    solarPolicies.schemes.forEach(scheme => {
      if (scheme.name.toLowerCase().includes(q) || scheme.description?.toLowerCase().includes(q)) {
        results.push({
          category: 'Government Scheme',
          title: scheme.name,
          content: scheme.description || (scheme as any).fullName || ''
        });
      }
    });

    return results;
  }

  /**
   * Generates formatted structured knowledge text for AI System Prompt injection.
   */
  getPromptContext(query: string = '', blogArticles?: any[]): string {
    let feedContext = '';
    if (blogArticles && blogArticles.length > 0) {
      feedContext = `\n\n5. LATEST INDIAN SOLAR NEWS & FEED UPDATES (KNOWLEDGE BASE):\n` +
        blogArticles.slice(0, 10).map((art, idx) => `- [${art.source}] ${art.title}: ${art.description} (${art.link})`).join('\n');
    }

    return `=== OFFICIAL SURYAX KNOWLEDGE BASE (SINGLE SOURCE OF TRUTH) ===

1. PM SURYA GHAR: MUFT BIJLI YOJNA
- Portal: https://pmsuryaghar.gov.in
- Ministry: MNRE, Govt. of India
- Budget: ₹75,021 Crore
- Target: 1 Crore (10 Million) households
- Free Power: Up to 300 units/month per household
- Central Financial Assistance (CFA) Subsidy Slabs:
  * 1 kW: ₹30,000
  * 2 kW: ₹60,000
  * 3 kW and above: ₹78,000 (maximum capped)
  * Housing Societies / RWA: ₹18,000 per kW (up to 500 kW common facility)
  * Special States (Himalayan / NE / Islands): +10% additional subsidy per kW
- Required Roof Area: ~10 sq. metres (107 sq ft) per 1 kW
- Payback Period: 3 to 5 years (System lifespan: 25 years)
- Application Workflow: pmsuryaghar.gov.in -> Feasibility Check -> Empanelled Vendor -> Net Meter -> Commissioning -> DBT Subsidy Credit (~60–90 days total).
- Mandatory Standards: ALMM-listed solar modules (Make in India) & BIS-certified inverters.

2. PM-KUSUM SCHEME (FARMERS SOLAR)
- Full Name: Pradhan Mantri Kisan Urja Suraksha evam Utthaan Mahabhiyan
- Toll-Free Helpline: 1800-180-3333
- Component A: 2 MW grid-connected solar power plants on fallow farmland
- Component B: Standalone off-grid solar pumps (2 to 10 HP)
- Component C: Solarization of grid-connected agricultural pumps
- Subsidy: 30% to 50% Central + State subsidy

3. NATIONAL ACHIEVEMENTS & POLICY
- India RE Goal: 500 GW non-fossil capacity by 2030
- Solar Module Manufacturing Capacity: 100 GW under ALMM
- Solar Power Installed: 162.15 GW (3rd globally)
- Wind Power Installed: 57.44 GW (4th globally)
- Non-Fossil Fuel Share in Power Capacity: 54.18%

4. KEY DISCOM & ELIGIBILITY RULES
- Net Metering: Bi-directional meter measures Import vs Export units
- Documents Needed: Electricity bill, Aadhaar, Bank passbook for DBT, Roof photo, Tenant NOC if applicable.
- If information is not in this knowledge base, answer: "This information is not available in the provided knowledge base."${feedContext}`;
  }
}

export const knowledgeService = new KnowledgeService();
export default knowledgeService;
