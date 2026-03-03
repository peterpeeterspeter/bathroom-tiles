import { supabase } from './supabase';

const SESSION_STORAGE_KEY = 'debadkamer_session_id';
let currentSessionId: string | null = null;

function generateSessionId(): string {
  return crypto.randomUUID();
}

export function getSessionId(): string {
  if (!currentSessionId) {
    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY);
      if (stored) {
        currentSessionId = stored;
      } else {
        currentSessionId = generateSessionId();
        localStorage.setItem(SESSION_STORAGE_KEY, currentSessionId);
      }
    } catch {
      currentSessionId = generateSessionId();
    }
  }
  return currentSessionId;
}

export function resetSessionId(): void {
  currentSessionId = generateSessionId();
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, currentSessionId);
  } catch {
    // ignore
  }
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
