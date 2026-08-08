import { GovtScheme, UserProfile } from '../types';

export const GOVT_SCHEMES: GovtScheme[] = [
  {
    id: 'pm-surya-ghar',
    name: 'PM Surya Ghar Muft Bijli Yojana',
    type: 'Central',
    description: 'Central government scheme to provide 300 units of free electricity every month to 1 crore households by providing subsidy for rooftop solar systems.',
    eligibility: ['Residential grid-connected systems', 'Valid electricity connection', 'Suitable roof space'],
    subsidyAmount: '₹30,000 for up to 2kW, ₹78,000 for up to 3kW'
  },
  {
    id: 'pm-kusum-a',
    name: 'PM-KUSUM (Component A)',
    type: 'Central',
    description: 'Setting up of 10,000 MW of Decentralized Ground Mounted Grid Connected Renewable Power Plants of individual plant size up to 2 MW.',
    eligibility: ['Farmers/groups of farmers', 'Cooperatives', 'Panchayats', 'Farmer Producer Organisations (FPO)'],
    subsidyAmount: 'Performance Based Incentive (PBI) @ ₹ 0.40 per unit'
  },
  {
    id: 'pm-kusum-b',
    name: 'PM-KUSUM (Component B)',
    type: 'Central',
    description: 'Installation of 20 lakh standalone Solar Powered Agriculture Pumps.',
    eligibility: ['Individual farmers', 'Water User Associations', 'Farmer Producer Organisations (FPO)', 'Primary Agriculture Credit Societies (PACS)', 'Community/cluster based irrigation system'],
    subsidyAmount: '30% of benchmark cost or tender cost, whichever is lower. State Govt. gives 30% subsidy.'
  },
  {
    id: 'pm-kusum-c',
    name: 'PM-KUSUM (Component C)',
    type: 'Central',
    description: 'Solarisation of 15 Lakh Grid-connected Agriculture Pumps.',
    eligibility: ['Individual farmers having grid connected agriculture pump'],
    subsidyAmount: '30% of benchmark cost or tender cost, whichever is lower. State Govt. gives 30% subsidy.'
  },
  {
    id: 'grid-connected-rooftop-phase-2',
    name: 'Grid Connected Rooftop Solar Phase-II',
    type: 'Central',
    description: 'Aiming to achieve cumulative capacity of 40,000 MW from Rooftop Solar Projects.',
    eligibility: ['Residential Sector', 'Group Housing Societies (GHS) / Resident Welfare Associations (RWA)'],
    subsidyAmount: '40% up to 3 kW, 20% beyond 3 kW and up to 10 kW.'
  },
  {
    id: 'maharashtra-meda',
    name: 'MEDA Rooftop Solar Subsidy',
    type: 'State',
    state: 'Maharashtra',
    description: 'Additional support and streamlined processing for residential rooftop solar via MahaDiscom.',
    eligibility: ['MSEDCL/BEST/Adani/Tata consumers in Maharashtra'],
    subsidyAmount: 'Integrated with Central Subsidy'
  },
  {
    id: 'gujarat-surya',
    name: 'Surya Gujarat',
    type: 'State',
    state: 'Gujarat',
    description: 'Gujarat government scheme for residential solar rooftop systems with prompt subsidy disbursement.',
    eligibility: ['Residential consumers in Gujarat'],
    subsidyAmount: 'Integrated with Central, high priority processing'
  },
  {
    id: 'rajasthan-solar',
    name: 'Rajasthan Solar Energy Policy',
    type: 'State',
    state: 'Rajasthan',
    description: 'Policy to promote solar energy in Rajasthan, including rooftop and utility-scale projects.',
    eligibility: ['Residential', 'Commercial', 'Industrial consumers in Rajasthan'],
    subsidyAmount: 'State-specific incentives, integrated with Central Subsidy for residential'
  },
  {
    id: 'karnataka-solar',
    name: 'Karnataka Solar Policy',
    type: 'State',
    state: 'Karnataka',
    description: 'Promotes grid-connected rooftop solar systems through net metering.',
    eligibility: ['Consumers under BESCOM, HESCOM, GESCOM, MESCOM, CESC'],
    subsidyAmount: 'Integrated with Central Subsidy'
  },
  {
    id: 'tamil-nadu-solar',
    name: 'Tamil Nadu Solar Energy Policy',
    type: 'State',
    state: 'Tamil Nadu',
    description: 'Aims to generate 9,000 MW of solar power, promoting rooftop solar for various consumer categories.',
    eligibility: ['Consumers under TANGEDCO'],
    subsidyAmount: 'Integrated with Central Subsidy, specific incentives for different sectors'
  }
];

export function checkSubsidyEligibility(profile: UserProfile): GovtScheme[] {
  const eligible = GOVT_SCHEMES.filter(s => s.type === 'Central');
  if (profile.state) {
    const stateScheme = GOVT_SCHEMES.find(s => s.type === 'State' && s.state?.toLowerCase() === profile.state.toLowerCase());
    if (stateScheme) {
      eligible.push(stateScheme);
    }
  }
  return eligible;
}
