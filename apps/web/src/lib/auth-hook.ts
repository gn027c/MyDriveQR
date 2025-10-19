'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

export const useAuthRedirect = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const logoutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto logout when session expires
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  // Session expiry checker
  useEffect(() => {
    if (session?.expires) {
      const expiryTime = new Date(session.expires).getTime();
      const currentTime = Date.now();
      const timeUntilExpiry = expiryTime - currentTime;

      // Clear existing timers
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
      }
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
      }

      // Set warning 5 minutes before expiry
      const warningTime = timeUntilExpiry - (5 * 60 * 1000);
      if (warningTime > 0) {
        warningTimerRef.current = setTimeout(() => {
          if (confirm('Your session will expire in 5 minutes. Would you like to extend it?')) {
            if (logoutTimerRef.current) {
              clearTimeout(logoutTimerRef.current);
              logoutTimerRef.current = null;
            }

            // Refresh session by making a request
            fetch('/api/auth/session')
              .catch(() => undefined)
              .finally(() => {
                window.location.reload();
              });
          }
        }, warningTime);
      }

      // Set auto logout at expiry
      if (timeUntilExpiry > 0) {
        logoutTimerRef.current = setTimeout(() => {
          signOut({ callbackUrl: '/' });
        }, timeUntilExpiry);
      }
    }

    // Cleanup timers on unmount
    return () => {
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
      }
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
      }
    };
  }, [session?.expires]);

  return { session, status: status === 'loading' ? 'loading' : status === 'authenticated' ? 'authenticated' : 'unauthenticated' };
};
