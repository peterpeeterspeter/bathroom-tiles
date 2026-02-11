import { supabase } from './supabase';
import { getSessionId } from './analytics';
import { ProjectSpec, Estimate, StyleProfile, MaterialConfig } from '../types';

// ============================================================
// PROJECT CRUD
// ============================================================

export async function createProject(): Promise<string | null> {
  const sessionId = getSessionId();
  const { data, error } = await supabase
    .from('projects')
    .insert({ session_id: sessionId, status: 'in_progress' })
    .select('id')
    .single();
  if (error) {
    console.error('Failed to create project:', error);
    return null;
  }
  return data.id;
}

export async function updateProjectStyle(
  projectId: string,
  styleProfile: StyleProfile
): Promise<void> {
  const { error } = await supabase
    .from('projects')
    .update({ style_profile: styleProfile })
    .eq('id', projectId);
  if (error) console.error('Failed to update project style:', error);
}

export async function updateProjectProducts(
  projectId: string,
  selectedProducts: Record<string, string>,
  selectedProductNames: Record<string, string>,
  materialConfig: MaterialConfig,
  selectedProductDetails?: Record<string, {
    id: string; brand: string; name: string;
    price_low: number; price_high: number; price_tier: string;
  }>
): Promise<void> {
  const update: Record<string, unknown> = {
    selected_products: selectedProducts,
    selected_product_names: selectedProductNames,
    material_config: materialConfig,
  };
  if (selectedProductDetails) {
    update.selected_product_details = selectedProductDetails;
  }
  const { error } = await supabase
    .from('projects')
    .update(update)
    .eq('id', projectId);
  if (error) console.error('Failed to update project products:', error);
}

export async function updateProjectRoom(
  projectId: string,
  spec: ProjectSpec
): Promise<void> {
  const { error } = await supabase
    .from('projects')
    .update({
      room_spec: spec,
      room_width: spec.estimatedWidthMeters,
      room_length: spec.estimatedLengthMeters,
      room_area: spec.totalAreaM2,
    })
    .eq('id', projectId);
  if (error) console.error('Failed to update project room:', error);
}

export async function updateProjectResults(
  projectId: string,
  estimate: Estimate,
  renderPrompt?: string
): Promise<void> {
  const totalLow = Math.round(estimate.grandTotal * 0.85);
  const totalHigh = Math.round(estimate.grandTotal * 1.15);
  const { error } = await supabase
    .from('projects')
    .update({
      estimate,
      estimated_total_low: totalLow,
      estimated_total_high: totalHigh,
      render_prompt: renderPrompt || null,
      status: 'completed',
    })
    .eq('id', projectId);
  if (error) console.error('Failed to update project results:', error);
}

export async function markProjectLeadSubmitted(projectId: string): Promise<void> {
  const { error } = await supabase
    .from('projects')
    .update({ status: 'lead_submitted' })
    .eq('id', projectId);
  if (error) console.error('Failed to mark project as lead_submitted:', error);
}

// ============================================================
// IMAGE UPLOAD TO SUPABASE STORAGE
// ============================================================

export async function uploadProjectImage(
  projectId: string,
  imageType: 'original_photo' | 'ai_render',
  dataUrl: string
): Promise<string | null> {
  try {
    const mimeMatch = dataUrl.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!mimeMatch) {
      console.error('Invalid data URL format');
      return null;
    }
    const mimeType = mimeMatch[1];
    const base64Data = mimeMatch[2];
    const extension = mimeType.split('/')[1] === 'png' ? 'png' : 'jpg';
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });
    const storagePath = `projects/${projectId}/${imageType}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from('project-images')
      .upload(storagePath, blob, { contentType: mimeType, upsert: true });
    if (uploadError) {
      console.error('Storage upload failed:', uploadError);
      return null;
    }
    if (imageType === 'original_photo') {
      await supabase.from('projects').update({ original_photo_path: storagePath }).eq('id', projectId);
    } else if (imageType === 'ai_render') {
      await supabase.from('projects').update({ render_image_path: storagePath }).eq('id', projectId);
    }
    return storagePath;
  } catch (err) {
    console.error('Image upload error:', err);
    return null;
  }
}

export async function getSignedImageUrl(storagePath: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from('project-images')
    .createSignedUrl(storagePath, 3600);
  if (error) {
    console.error('Failed to get signed URL:', error);
    return null;
  }
  return data.signedUrl;
}

export async function getProjectImagePath(projectId: string, imageType: 'original_photo' | 'ai_render'): Promise<string | null> {
  const column = imageType === 'original_photo' ? 'original_photo_path' : 'render_image_path';
  const { data, error } = await supabase
    .from('projects')
    .select(column)
    .eq('id', projectId)
    .single();
  if (error || !data) return null;
  return (data as Record<string, string | null>)[column] || null;
}
