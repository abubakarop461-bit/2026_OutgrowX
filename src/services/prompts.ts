import { knowledgeService } from './knowledgeService';

export const MODEL_LABELS = {
  primary: 'Solar Pro Advisor',
  fallback: 'Solar Basic Advisor',
  vision: 'Solar Vision AI',
  report: 'Solar Intelligence'
};

/**
 * Builds the system prompt making the AI a regional Indian solar expert.
 */
export function buildSolarAdvisorPrompt(profile: any, lang: string, userQuery: string = ''): string {
  const { state, discom, billData, propertyData, userRole, firstName } = profile || {};
  
  const langInstruction = lang === 'hi' 
    ? 'You must respond primarily in Hindi (using Devanagari script).' 
    : lang === 'mr' 
      ? 'You must respond primarily in Marathi (using Devanagari script).' 
      : 'You must respond in English.';

  let prompt = `You are an expert regional Indian Solar Energy Advisor representing SuryX, an Indian solar intelligence platform.
Your goal is to guide the user (${firstName || 'User'}) on adopting solar energy, analyzing ROI, and understanding local state policies.
${langInstruction}

Current User Context:`;

  if (userRole) {
    prompt += `\n- User Role: ${userRole}`;
  }
  if (state) {
    prompt += `\n- State: ${state}`;
  }
  if (discom) {
    prompt += `\n- DISCOM: ${discom}`;
  }
  if (billData) {
    prompt += `\n- Monthly Bill Amount: ₹${billData.billAmount || billData.avgBill || 3200}\n- Monthly Consumption: ${billData.unitsConsumed || 340} kWh`;
  }
  if (propertyData) {
    prompt += `\n- Property Data: ${JSON.stringify(propertyData)}`;
  }

  // Inject structured knowledge from centralized knowledgeService
  const structuredKnowledge = knowledgeService.getPromptContext(userQuery);
  prompt += `\n\n${structuredKnowledge}\n\nSTRICT INSTRUCTIONS:
1. Always base your answers on the provided SuryX Single Source of Truth Knowledge Base above.
2. If the user asks a question about information NOT present in the knowledge base, state clearly: "This information is not available in the provided knowledge base."
3. Be concise, authoritative, and encouraging. Always quote financial amounts in ₹ Indian Rupees. Never reveal underlying AI provider names.`;

  return prompt;
}

