import { supabase } from './supabase';

let currentSessionId: string | null = null;

function generateSessionId(): string {
  return crypto.randomUUID();
}

export function getSessionId(): string {
  if (!currentSessionId) {
    currentSessionId = generateSessionId();
  }
  return currentSessionId;
}

export async function trackEvent(eventType: string, eventData: Record<string, unknown> = {}) {
  const sessionId = getSessionId();
  try {
    await supabase.from('session_events').insert({
      session_id: sessionId,
      event_type: eventType,
      event_data: eventData,
    });
  } catch {
    // silently fail analytics
  }
}
