"use client";

import { Capacitor } from '@capacitor/core';
import { storage } from './storage';

export interface TrackPayload {
  event: 'landing' | 'install' | 'purchase';
  ref: string;
  platform: 'web' | 'android';
  eventId: string;
  amount?: number;
  currency?: string;
}

// Same apiBase pattern already used in PromoCodeDialog.tsx - '' on web
// (relative, same-origin) vs the absolute production host on native, since a
// relative fetch from the Capacitor WebView (origin https://localhost) would
// otherwise hit a nonexistent local server instead of the real API.
const apiBase = Capacitor.getPlatform() === 'web' ? '' : 'https://app.simpleallergyalert.com';
const TRACK_TIMEOUT_MS = 5000;
const PENDING_QUEUE_KEY = 'pendingTrackEvents';
const MAX_ATTEMPTS = 10;

interface PendingTrackEvent {
  payload: TrackPayload;
  attempts: number;
}

// Never throws - a failed tracking call must never affect the app it's
// embedded in. Callers that need offline resilience use
// sendOrQueueTrackEvent() instead of calling this directly.
export const sendTrackEvent = async (payload: TrackPayload): Promise<boolean> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TRACK_TIMEOUT_MS);
  try {
    const res = await fetch(`${apiBase}/api/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
};

// Persists a per-storageKey id the first time it's needed, then reuses it -
// for events (like the one-time install referrer) that only ever fire once
// per install, so a retry must reuse the same eventId rather than minting a
// new one (which would defeat server-side dedup).
export const getOrCreatePersistedEventId = async (storageKey: string): Promise<string> => {
  const existing = await storage.get<string>(storageKey);
  if (existing) return existing;
  const id = crypto.randomUUID();
  await storage.set(storageKey, id);
  return id;
};

export const hashEventId = async (input: string): Promise<string> => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
};

// Attempts an immediate send; on failure, persists the payload for later
// retry (app launch / network regain - see flushTrackEventQueue). The
// install/purchase events this backs only ever fire once in their own right
// (install-referrer consume, purchase dedup both happen exactly once), so if
// the live attempt fails offline, this queue is the only retry path -
// nothing will naturally re-invoke the caller to try again.
export const sendOrQueueTrackEvent = async (payload: TrackPayload): Promise<void> => {
  const ok = await sendTrackEvent(payload);
  if (ok) return;

  const queue = (await storage.get<PendingTrackEvent[]>(PENDING_QUEUE_KEY)) ?? [];
  if (queue.some((item) => item.payload.eventId === payload.eventId)) return;
  queue.push({ payload, attempts: 0 });
  await storage.set(PENDING_QUEUE_KEY, queue);
};

export const flushTrackEventQueue = async (): Promise<void> => {
  const queue = (await storage.get<PendingTrackEvent[]>(PENDING_QUEUE_KEY)) ?? [];
  if (queue.length === 0) return;

  const remaining: PendingTrackEvent[] = [];
  for (const item of queue) {
    const ok = await sendTrackEvent(item.payload);
    if (ok) continue;
    const attempts = item.attempts + 1;
    if (attempts < MAX_ATTEMPTS) remaining.push({ ...item, attempts });
  }
  await storage.set(PENDING_QUEUE_KEY, remaining);
};
