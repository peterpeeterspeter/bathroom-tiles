import { supabase } from './supabase';
import { MaterialConfig, StyleProfile } from '../types';

interface LeadPayload {
  name: string;
  email: string;
  phone: string;
  postcode: string;
  projectId?: string;
  styleProfile?: StyleProfile;
  materialConfig?: MaterialConfig;
  selectedProducts?: Record<string, string>;
  selectedProductDetails?: Record<string, {
    id: string; brand: string; name: string;
    price_low: number; price_high: number; price_tier: string;
  }>;
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
  hasOriginalPhoto?: boolean;
  hasRender?: boolean;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

function calculateLeadScore(payload: LeadPayload): number {
  let score = 0;

  if (payload.name?.trim()) score += 5;
  if (payload.email?.trim()) score += 5;
  if (payload.phone?.trim()) score += 10;
  if (payload.postcode?.trim()) score += 5;

  if (payload.hasOriginalPhoto) score += 15;
  if (payload.styleProfile) score += 5;
  const productCount = Object.keys(payload.selectedProducts || {}).length;
  if (productCount >= 3) score += 10;
  else if (productCount >= 1) score += 5;
  if (payload.roomArea && payload.roomArea > 0) score += 5;

  if (payload.selectedProductDetails) {
    const tiers = Object.values(payload.selectedProductDetails).map(p => p.price_tier);
    const premiumCount = tiers.filter(t => t === 'premium').length;
    if (premiumCount >= 3) score += 5;
    else if (premiumCount >= 1) score += 3;
  }

  if (payload.hasRender) score += 10;
  if (payload.estimatedTotalLow && payload.estimatedTotalHigh) score += 10;

  const avgEstimate = ((payload.estimatedTotalLow || 0) + (payload.estimatedTotalHigh || 0)) / 2;
  if (avgEstimate >= 20000) score += 20;
  else if (avgEstimate >= 12000) score += 15;
  else if (avgEstimate >= 8000) score += 10;
  else if (avgEstimate > 0) score += 5;

  return Math.min(100, score);
}

export async function submitLead(payload: LeadPayload): Promise<{ success: boolean; leadScore: number }> {
  const styleName = payload.styleProfile?.presetName || payload.styleProfile?.summary?.slice(0, 50) || '';
  const leadScore = calculateLeadScore(payload);

  const row: Record<string, unknown> = {
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    postcode: payload.postcode,
    selected_style: styleName || 'Niet geselecteerd',
    source: payload.source || 'website',
    country: payload.country || 'NL',
    lead_score: leadScore,
  };

  if (payload.projectId) row.project_id = payload.projectId;
  if (payload.styleProfile) row.style_profile = payload.styleProfile;
  if (payload.materialConfig) row.material_config = payload.materialConfig;
  if (payload.selectedProducts) row.selected_products = payload.selectedProducts;
  if (payload.selectedProductDetails) row.selected_product_details = payload.selectedProductDetails;
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

  let result = await supabase.from('leads').insert(row);

  if (result.error && result.error.message.includes('column')) {
    console.warn('Lead insert failed with column error, retrying with safe columns:', result.error.message);
    const safeRow: Record<string, unknown> = {
      name: row.name,
      email: row.email,
      phone: row.phone,
      postcode: row.postcode,
      selected_style: row.selected_style,
      source: row.source,
      country: row.country,
    };
    result = await supabase.from('leads').insert(safeRow);
  }

  if (result.error) {
    console.error('Lead submission failed:', result.error.code, result.error.message, result.error.details);
    throw new Error(result.error.message);
  }
  return { success: true, leadScore };
}

export async function sendLeadNotification(payload: Record<string, unknown>): Promise<void> {
  try {
    const { error } = await supabase.functions.invoke('send-lead-notification', {
      body: payload,
    });
    if (error) {
      console.error('Lead notification email failed:', error);
    }
  } catch (err) {
    console.error('Lead notification request failed:', err);
  }
}
