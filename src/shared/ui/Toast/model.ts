import type { ReactNode } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface ToastOptions {
    /** Стабильный id: повторный вызов с тем же id обновит тост, а не создаст новый */
    id?: string;
    /** Вторая строка под заголовком */
    description?: ReactNode;
    /** Время жизни в мс. 0 — висит, пока не закроют вручную */
    duration?: number;
}

export interface ToastEntry {
    id: string;
    type: ToastType;
    title: ReactNode;
    description?: ReactNode;
    duration: number;
    /** Растёт при обновлении — перезапускает таймер и анимацию прогресса */
    version: number;
    /** Тост проигрывает анимацию ухода */
    closing: boolean;
}

export interface ToastPromiseMessages<T> {
    loading: ReactNode;
    success: ReactNode | ((data: T) => ReactNode);
    error: ReactNode | ((error: unknown) => ReactNode);
}
