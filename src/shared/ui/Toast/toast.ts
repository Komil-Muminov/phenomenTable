import type { ToastEntry, ToastOptions, ToastPromiseMessages, ToastType } from './model';
import type { ReactNode } from 'react';

// Тайминги и лимиты
const DEFAULT_DURATION: Record<ToastType, number> = {
    success: 3500,
    info: 4000,
    warning: 5000,
    error: 6000,
    loading: 0,
};
const MAX_DURATION = 60_000;
const MAX_VISIBLE = 5;
export const EXIT_ANIMATION_MS = 220;

type Listener = () => void;

let toasts: ToastEntry[] = [];
let idCounter = 0;
const listeners = new Set<Listener>();
const removeTimers = new Map<string, ReturnType<typeof setTimeout>>();

const emit = () => listeners.forEach((listener) => listener());

const setToasts = (next: ToastEntry[]) => {
    toasts = next;
    emit();
};

// Валидация: отрицательное/NaN → дефолт, слишком большое → потолок
const normalizeDuration = (type: ToastType, duration?: number): number => {
    if (duration === undefined || !Number.isFinite(duration) || duration < 0) return DEFAULT_DURATION[type];
    return Math.min(duration, MAX_DURATION);
};

const isEmptyTitle = (title: ReactNode) => title === null || title === undefined || title === '' || title === false;

/** Плавно убирает тост; без id — убирает все */
const dismiss = (id?: string) => {
    const targets = id ? toasts.filter((item) => item.id === id) : toasts;
    if (targets.length === 0) return;

    const ids = new Set(targets.map((item) => item.id));
    setToasts(toasts.map((item) => (ids.has(item.id) ? { ...item, closing: true } : item)));

    ids.forEach((targetId) => {
        clearTimeout(removeTimers.get(targetId));
        removeTimers.set(
            targetId,
            setTimeout(() => {
                removeTimers.delete(targetId);
                setToasts(toasts.filter((item) => item.id !== targetId));
            }, EXIT_ANIMATION_MS),
        );
    });
};

const show = (type: ToastType, title: ReactNode, options: ToastOptions = {}): string => {
    if (isEmptyTitle(title)) return '';

    const id = options.id ?? `toast-${++idCounter}`;
    const existing = toasts.find((item) => item.id === id);

    // Отменяем удаление, если тост с этим id как раз уходил
    clearTimeout(removeTimers.get(id));
    removeTimers.delete(id);

    const entry: ToastEntry = {
        id,
        type,
        title,
        description: options.description,
        duration: normalizeDuration(type, options.duration),
        version: (existing?.version ?? 0) + 1,
        closing: false,
    };

    if (existing) {
        setToasts(toasts.map((item) => (item.id === id ? entry : item)));
    } else {
        setToasts([...toasts, entry]);
        // Лишние старые тосты вытесняем
        const alive = toasts.filter((item) => !item.closing);
        if (alive.length > MAX_VISIBLE) dismiss(alive[0].id);
    }

    return id;
};

const resolve = <T>(message: ReactNode | ((value: T) => ReactNode), value: T) =>
    typeof message === 'function' ? message(value) : message;

/** Показывает loading, затем success/error по результату промиса */
const promise = <T>(target: Promise<T>, messages: ToastPromiseMessages<T>, options: ToastOptions = {}) => {
    const id = show('loading', messages.loading, options);
    target.then(
        (data) => show('success', resolve(messages.success, data), { ...options, id }),
        (error: unknown) => show('error', resolve(messages.error, error), { ...options, id }),
    );
    return target;
};

export const toast = {
    success: (title: ReactNode, options?: ToastOptions) => show('success', title, options),
    error: (title: ReactNode, options?: ToastOptions) => show('error', title, options),
    warning: (title: ReactNode, options?: ToastOptions) => show('warning', title, options),
    info: (title: ReactNode, options?: ToastOptions) => show('info', title, options),
    loading: (title: ReactNode, options?: ToastOptions) => show('loading', title, options),
    promise,
    dismiss,
};

/** Внешний стор для useSyncExternalStore */
export const toastStore = {
    subscribe: (listener: Listener) => {
        listeners.add(listener);
        return () => {
            listeners.delete(listener);
        };
    },
    getSnapshot: () => toasts,
};
