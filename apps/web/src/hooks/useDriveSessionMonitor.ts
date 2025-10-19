'use client';

import { useEffect } from 'react';
import { signOut } from 'next-auth/react';

const PING_INTERVAL_MS = 3 * 60 * 1000;

export function useDriveSessionMonitor(enabled: boolean) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    let isCancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const ping = async () => {
      let shouldScheduleNext = true;
      try {
        const response = await fetch('/api/drive/ping');
        if (!response.ok) {
          shouldScheduleNext = false;
          await signOut({ callbackUrl: '/' });
          return;
        }
      } catch (error) {
        shouldScheduleNext = false;
        await signOut({ callbackUrl: '/' });
        return;
      } finally {
        if (!isCancelled && shouldScheduleNext) {
          timeoutId = setTimeout(ping, PING_INTERVAL_MS);
        }
      }
    };

    ping();

    return () => {
      isCancelled = true;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [enabled]);
}
