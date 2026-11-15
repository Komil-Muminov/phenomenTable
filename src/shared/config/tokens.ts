/**
 * Единственный источник дизайн-токенов.
 * Читают: theme.ts (antd ConfigProvider) и tailwind.config.ts (утилиты bg-brand, text-ink-muted…).
 * Файл без зависимостей — его импортирует конфиг Tailwind в Node.
 */
export const COLORS = {
    brand: '#125a83',
    'brand-hover': '#1872a6',
    'brand-soft': '#e8f1f7',

    success: '#16a34a',
    warning: '#d97706',
    error: '#dc2626',

    ink: '#0f172a',
    'ink-muted': '#64748b',
    line: '#e2e8f0',
    'line-soft': '#eef2f6',
    surface: '#ffffff',
    'surface-muted': '#f8fafc',
    'row-hover': '#f1f7fb',
    'row-selected': '#e8f1f7',
    'row-selected-hover': '#deebf4',
} as const;

export type ColorToken = keyof typeof COLORS;

export const FONT_SANS = [
    'Inter Variable',
    'Inter',
    'system-ui',
    '-apple-system',
    'Segoe UI',
    'Roboto',
    'Helvetica Neue',
    'Arial',
    'sans-serif',
];

/** CSS-строка font-family: имена с пробелами в кавычках */
export const FONT_FAMILY = FONT_SANS.map((name) => (name.includes(' ') ? `'${name}'` : name)).join(', ');

/**
 * @deprecated Старые переменные из прошлых проектов — оставлены для совместимости, значения исходные.
 * В новом коде используйте COLORS (bg-brand, text-ink-muted… или var(--color-*)).
 */
export const LEGACY_CSS_VARS: Record<string, string> = {
    // Текст
    '--text-primary': '#252525',
    '--text-secondary': '#66727f',
    '--text-tertiary': COLORS.brand,
    '--text-muted': '#2d3748',
    '--text-inverted': COLORS.surface,
    '--label-primary': '#737c86',
    // Фоны
    '--background-primary': COLORS.surface,
    '--background-secondary': COLORS.brand,
    '--background-secondary-hover': COLORS['brand-hover'],
    '--background-tertiary': '#25ba37',
    '--background-fourth': '#f7fafc',
    '--background-dark': '#000000',
    '--background-yellow': '#f2fa0633',
    // Прочее
    '--logo-primary': '#81da67',
    '--logo-secondary': COLORS.brand,
    '--success-checkbox': '#20d226',
    '--discount': '#48bb78',
    '--pending-status': '#ffc13a',
    '--loading-status': '#e2ff5f',
    '--success-status': '#2cff33',
    '--login-secondary': '#25252599',
    '--border-dashed': '#94a4b9',
};
