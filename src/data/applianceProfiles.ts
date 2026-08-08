import { ApplianceSelection } from '../types';

export interface ApplianceProfile {
  id: string;
  name: string;
  wattage: number; // in kW
  category: string;
  defaultUsage: {
    summer: number; // hrs/day
    monsoon: number;
    winter: number;
  };
}

export const APPLIANCES: ApplianceProfile[] = [
  { id: 'ac_1_5', name: 'Air Conditioner (1.5 Ton)', wattage: 1.5, category: 'Cooling', defaultUsage: { summer: 8, monsoon: 4, winter: 0 } },
  { id: 'cooler', name: 'Air Cooler', wattage: 0.2, category: 'Cooling', defaultUsage: { summer: 10, monsoon: 2, winter: 0 } },
  { id: 'fan', name: 'Ceiling Fan', wattage: 0.075, category: 'Cooling', defaultUsage: { summer: 16, monsoon: 12, winter: 4 } },
  { id: 'fridge', name: 'Refrigerator', wattage: 0.15, category: 'Kitchen', defaultUsage: { summer: 24, monsoon: 24, winter: 24 } },
  { id: 'microwave', name: 'Microwave Oven', wattage: 1.2, category: 'Kitchen', defaultUsage: { summer: 0.5, monsoon: 0.5, winter: 0.5 } },
  { id: 'induction', name: 'Induction Cooktop', wattage: 2.0, category: 'Kitchen', defaultUsage: { summer: 1, monsoon: 1, winter: 1 } },
  { id: 'mixer', name: 'Mixer Grinder', wattage: 0.5, category: 'Kitchen', defaultUsage: { summer: 0.2, monsoon: 0.2, winter: 0.2 } },
  { id: 'tv_led', name: 'LED TV', wattage: 0.1, category: 'Entertainment', defaultUsage: { summer: 4, monsoon: 5, winter: 5 } },
  { id: 'computer', name: 'Computer / Laptop', wattage: 0.3, category: 'Work', defaultUsage: { summer: 6, monsoon: 6, winter: 6 } },
  { id: 'washing_machine', name: 'Washing Machine', wattage: 0.5, category: 'Cleaning', defaultUsage: { summer: 1, monsoon: 1.5, winter: 1 } },
  { id: 'geyser', name: 'Geyser / Water Heater', wattage: 2.0, category: 'Heating', defaultUsage: { summer: 0.5, monsoon: 1, winter: 2 } },
  { id: 'water_pump', name: 'Water Pump', wattage: 0.75, category: 'Utility', defaultUsage: { summer: 1, monsoon: 0.5, winter: 0.5 } },
  { id: 'led_lights', name: 'LED Lights (per room)', wattage: 0.01, category: 'Lighting', defaultUsage: { summer: 6, monsoon: 7, winter: 8 } },
  { id: 'ev_charger', name: 'EV Charger', wattage: 3.3, category: 'Transport', defaultUsage: { summer: 2, monsoon: 2, winter: 2 } }
];

export function calculateApplianceKWh(appliances: ApplianceSelection[], quantities: Record<string, number>, hours: Record<string, number>, season: 'summer' | 'monsoon' | 'winter' = 'summer'): number {
  return appliances.reduce((total, selection) => {
    const profile = APPLIANCES.find(a => a.id === selection.applianceId);
    if (!profile) return total;
    
    const qty = quantities[selection.applianceId] || selection.quantity || 1;
    const hrs = hours[selection.applianceId] || selection.hoursPerDay || profile.defaultUsage[season];
    
    return total + (profile.wattage * qty * hrs);
  }, 0);
}
