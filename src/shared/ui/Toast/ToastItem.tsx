import { AlertTriangle, CheckCircle2, Info, Loader2, X, XCircle } from 'lucide-react';
import { memo, type ReactNode } from 'react';

import { toast } from './toast';

import type { ToastEntry, ToastType } from './model';

interface ToastTheme {
    icon: ReactNode;
    iconBox: string;
    progress: string;
}

// Палитра по типам: тонированная плашка под иконкой + цвет полосы прогресса
const THEMES: Record<ToastType, ToastTheme> = {
    success: {
        icon: <CheckCircle2 className="size-[18px]" strokeWidth={2.25} />,
        iconBox: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
        progress: 'bg-emerald-500',
    },
    error: {
        icon: <XCircle className="size-[18px]" strokeWidth={2.25} />,
        iconBox: 'bg-rose-50 text-rose-600 ring-rose-100',
        progress: 'bg-rose-500',
    },
    warning: {
        icon: <AlertTriangle className="size-[18px]" strokeWidth={2.25} />,
        iconBox: 'bg-amber-50 text-amber-600 ring-amber-100',
        progress: 'bg-amber-500',
    },
    info: {
        icon: <Info className="size-[18px]" strokeWidth={2.25} />,
        iconBox: 'bg-sky-50 text-sky-600 ring-sky-100',
        progress: 'bg-sky-500',
    },
    loading: {
        icon: <Loader2 className="size-[18px] animate-spin" strokeWidth={2.25} />,
        iconBox: 'bg-slate-100 text-slate-600 ring-slate-200',
        progress: 'bg-slate-400',
    },
};

interface ToastItemProps {
    item: ToastEntry;
}

export const ToastItem = memo(({ item }: ToastItemProps) => {
    const theme = THEMES[item.type];
    const isAssertive = item.type === 'error' || item.type === 'warning';
    const hasTimer = item.duration > 0;

    const close = () => toast.dismiss(item.id);

    return (
        <div
            role={isAssertive ? 'alert' : 'status'}
            aria-live={isAssertive ? 'assertive' : 'polite'}
            data-closing={item.closing || undefined}
            className="phenomen-toast group pointer-events-auto relative w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_12px_32px_-12px_rgba(15,23,42,0.25)]"
        >
            <div className="flex items-start gap-3 py-3 pl-3 pr-10">
                <span
                    className={`flex size-9 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset ${theme.iconBox}`}
                >
                    {theme.icon}
                </span>

                <div className="min-w-0 flex-1 pt-0.5">
                    <div className="text-sm font-semibold leading-5 text-slate-900 break-words">{item.title}</div>
                    {item.description && (
                        <div className="mt-0.5 text-[13px] leading-5 text-slate-500 break-words">
                            {item.description}
                        </div>
                    )}
                </div>
            </div>

            <button
                type="button"
                aria-label="Закрыть уведомление"
                onClick={close}
                className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-sky-500"
            >
                <X className="size-4" />
            </button>

            {/* Полоса прогресса — она же таймер: по окончании анимации тост закрывается */}
            {hasTimer && (
                <span
                    key={item.version}
                    aria-hidden
                    onAnimationEnd={close}
                    style={{ animationDuration: `${item.duration}ms` }}
                    className={`phenomen-toast__progress absolute bottom-0 left-0 h-[3px] w-full opacity-70 ${theme.progress}`}
                />
            )}
        </div>
    );
});

ToastItem.displayName = 'ToastItem';
