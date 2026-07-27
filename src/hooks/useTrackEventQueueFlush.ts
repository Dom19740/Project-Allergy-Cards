"use client";

import { useEffect } from 'react';
import { Network } from '@capacitor/network';
import { Capacitor } from '@capacitor/core';
import { flushTrackEventQueue } from '@/lib/trackEvent';

// Android-only: retries any tracking POSTs that failed while offline (install
// referrer / purchase events - see sendOrQueueTrackEvent in trackEvent.ts).
// Web landings are fire-and-forget with no queue, so there's nothing to flush
// there.
export const useTrackEventQueueFlush = () => {
  useEffect(() => {
    if (Capacitor.getPlatform() !== 'android') return;

    flushTrackEventQueue();

    const handler = Network.addListener('networkStatusChange', (status) => {
      if (status.connected) flushTrackEventQueue();
    });

    return () => {
      handler.then((h) => h.remove());
    };
  }, []);
};
