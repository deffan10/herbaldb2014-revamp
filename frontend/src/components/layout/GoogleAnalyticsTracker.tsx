'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

interface GoogleAnalyticsTrackerProps {
  gaId: string;
}

export function GoogleAnalyticsTracker({ gaId }: GoogleAnalyticsTrackerProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
      (window as any).gtag('config', gaId, {
        page_path: url,
      });
    }
  }, [pathname, searchParams, gaId]);

  return null;
}

export default GoogleAnalyticsTracker;
