import { useCallback, useEffect, useRef } from 'react';

/**
 * Оптимизированный debounce hook с правильным cleanup
 * Использует useCallback для стабильной ссылки
 * Автоматически очищает timeout при unmount
 */
export const useDebouncedCallback = <T extends (...args: any[]) => void>(
    callback: T,
    delay: number,
): ((...args: Parameters<T>) => void) => {
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const callbackRef = useRef(callback);

    // Обновляем ref при изменении callback (избегаем лишних пересозданий)
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    // Cleanup при unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    // Мемоизированная функция debounce
    return useCallback(
        (...args: Parameters<T>) => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            timeoutRef.current = setTimeout(() => {
                callbackRef.current(...args);
            }, delay);
        },
        [delay],
    );
};
