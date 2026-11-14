import { useCallback, useSyncExternalStore } from 'react';

/**
 * Подписка на медиа-запрос.
 * @param query строка ('(max-width: 768px)') или число — тогда это max-width в px
 */
export const useMediaQuery = (query: string | number): boolean => {
    const mediaQuery = typeof query === 'number' ? `(max-width: ${query}px)` : query;

    const subscribe = useCallback(
        (onChange: () => void) => {
            const list = window.matchMedia(mediaQuery);
            list.addEventListener('change', onChange);
            return () => list.removeEventListener('change', onChange);
        },
        [mediaQuery],
    );

    return useSyncExternalStore(
        subscribe,
        () => window.matchMedia(mediaQuery).matches,
        () => false,
    );
};
