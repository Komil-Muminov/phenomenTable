import { useEffect, useState } from 'react';

/**
 * Хук для отслеживания медиа-запросов (например, мобильного брейкпоинта)
 * @param query CSS media query строка (например '(max-width: 768px)') или число в пикселях
 */
export const useMediaQuery = (query: string | number): boolean => {
    const mediaQueryString = typeof query === 'number' ? `(max-width: ${query}px)` : query;

    const [matches, setMatches] = useState<boolean>(() => {
        if (typeof window === 'undefined') return false;
        return window.matchMedia(mediaQueryString).matches;
    });

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const mediaQueryList = window.matchMedia(mediaQueryString);
        setMatches(mediaQueryList.matches);

        const listener = (event: MediaQueryListEvent) => {
            setMatches(event.matches);
        };

        if (mediaQueryList.addEventListener) {
            mediaQueryList.addEventListener('change', listener);
        } else {
            // Fallback for older browsers
            (mediaQueryList as any).addListener(listener);
        }

        return () => {
            if (mediaQueryList.removeEventListener) {
                mediaQueryList.removeEventListener('change', listener);
            } else {
                (mediaQueryList as any).removeListener(listener);
            }
        };
    }, [mediaQueryString]);

    return matches;
};
