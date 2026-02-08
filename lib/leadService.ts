import { supabase } from './supabase';
import { MaterialConfig, StyleProfile } from '../types';

interface LeadPayload {
  name: string;
  email: string;
  phone: string;
  postcode: string;
  styleProfile?: StyleProfile;
  materialConfig?: MaterialConfig;
  selectedProducts?: Record<string, string>;
  estimatedTotalLow?: number;
  estimatedTotalHigh?: number;
  roomWidth?: number;
  roomLength?: number;
  roomArea?: number;
  source?: string;
  country?: string;
  renovationType?: string;
  bathroomSize?: string;
  preferredTimeline?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

export async function submitLead(payload: LeadPayload): Promise<{ success: boolean; error?: string }> {
  const styleName = payload.styleProfile?.presetName || payload.styleProfile?.summary?.slice(0, 50) || '';

  const row: Record<string, unknown> = {
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    postcode: payload.postcode,
    source: payload.source || 'website',
    country: payload.country || 'NL',
  };

  if (styleName) row.selected_style = styleName;
  if (payload.styleProfile) row.style_profile = payload.styleProfile;
  if (payload.materialConfig) row.material_config = payload.materialConfig;
  if (payload.selectedProducts) row.selected_products = payload.selectedProducts;
  if (payload.estimatedTotalLow !== undefined) row.estimated_total_low = payload.estimatedTotalLow;
  if (payload.estimatedTotalHigh !== undefined) row.estimated_total_high = payload.estimatedTotalHigh;
  if (payload.roomWidth !== undefined) row.room_width = payload.roomWidth;
  if (payload.roomLength !== undefined) row.room_length = payload.roomLength;
  if (payload.roomArea !== undefined) row.room_area = payload.roomArea;
  if (payload.styleProfile?.referenceImageUrls) row.reference_images = payload.styleProfile.referenceImageUrls;
  if (payload.renovationType) row.renovation_type = payload.renovationType;
  if (payload.bathroomSize) row.bathroom_size = payload.bathroomSize;
  if (payload.preferredTimeline) row.preferred_timeline = payload.preferredTimeline;
  if (payload.utmSource) row.utm_source = payload.utmSource;
  if (payload.utmMedium) row.utm_medium = payload.utmMedium;
  if (payload.utmCampaign) row.utm_campaign = payload.utmCampaign;

  const { error } = await supabase.from('leads').insert(row);

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}
