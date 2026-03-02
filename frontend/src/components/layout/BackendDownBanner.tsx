'use client';

import { useEffect, useRef } from 'react';
import { useConnectionStore } from '@/store/connectionStore';

const POLL_INTERVAL_MS = 5000;

export function BackendDownBanner() {
  const isBackendDown = useConnectionStore((s) => s.isBackendDown);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isBackendDown) {
      return;
    }

    async function pollHealth() {
      try {
        const res = await fetch('/api/v1/health/live', { cache: 'no-store' });
        if (res.ok) {
          // Backend is back -- full reload to refetch all data and auth state
          window.location.reload();
        }
      } catch {
        // Still unreachable
      }
    }

    timerRef.current = setInterval(pollHealth, POLL_INTERVAL_MS);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isBackendDown]);

  if (!isBackendDown) return null;

  return (
    <div className="bg-red-50 dark:bg-red-900/30 border-b border-red-200 dark:border-red-800 px-4 py-2 text-center text-sm text-red-800 dark:text-red-200">
      <span className="font-semibold">Connection Lost</span>
      {' \u2014 '}
      Unable to reach the server. Retrying automatically...
    </div>
  );
}
