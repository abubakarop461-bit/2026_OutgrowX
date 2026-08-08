import { buildCentralizedSystemPrompt } from './centralizedContext';

export const MODEL_LABELS = {
  primary: 'Solar Pro Advisor',
  fallback: 'Solar Basic Advisor',
  vision: 'Solar Vision AI',
  report: 'Solar Intelligence'
};

/**
 * Builds an enhanced system prompt powered by the Centralized Context Engine,
 * integrating user role pathways (Homeowner, Landowner, Solar Vendor), scanned bills,
 * appliance loads, and PM Surya Ghar / PM-KUSUM policy data.
 */
export function buildSolarAdvisorPrompt(profile: any, lang: string = 'en', userQuery: string = ''): string {
  return buildCentralizedSystemPrompt(profile, userQuery, lang);
}

