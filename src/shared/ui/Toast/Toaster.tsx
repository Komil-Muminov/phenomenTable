import { useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';

import './Toast.css';
import { toastStore } from './toast';
import { ToastItem } from './ToastItem';

/**
 * Контейнер уведомлений. Монтируется один раз в корне приложения.
 * Десктоп — правый верхний угол, мобилка — на всю ширину сверху.
 */
export const Toaster = () => {
    const toasts = useSyncExternalStore(toastStore.subscribe, toastStore.getSnapshot, toastStore.getSnapshot);

    if (typeof document === 'undefined') return null;

    return createPortal(
        <section
            aria-label="Уведомления"
            className="pointer-events-none fixed inset-x-0 top-0 z-[2000] flex flex-col items-center gap-2 p-4 sm:inset-x-auto sm:right-0 sm:w-[380px] sm:items-end"
        >
            {toasts.map((item) => (
                <ToastItem key={item.id} item={item} />
            ))}
        </section>,
        document.body,
    );
};
