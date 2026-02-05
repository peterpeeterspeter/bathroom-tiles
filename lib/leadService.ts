import { supabase } from './supabase';
import { MaterialConfig, RenovationStyle } from '../types';

interface LeadPayload {
  name: string;
  email: string;
  phone: string;
  postcode: string;
  selectedStyle: RenovationStyle;
  materialConfig: MaterialConfig;
  selectedProducts: Record<string, string>;
  estimatedTotalLow: number;
  estimatedTotalHigh: number;
  roomWidth: number;
  roomLength: number;
  roomArea: number;
}

export async function submitLead(payload: LeadPayload): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase.from('leads').insert({
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    postcode: payload.postcode,
    selected_style: payload.selectedStyle,
    material_config: payload.materialConfig,
    selected_products: payload.selectedProducts,
    estimated_total_low: payload.estimatedTotalLow,
    estimated_total_high: payload.estimatedTotalHigh,
    room_width: payload.roomWidth,
    room_length: payload.roomLength,
    room_area: payload.roomArea,
  });

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}
