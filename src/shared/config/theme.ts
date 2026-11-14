import type { ThemeConfig } from 'antd';

/**
 * Единые токены дизайна. Те же значения продублированы в index.css (@theme)
 * для Tailwind — при смене бренда правим оба места.
 */
export const BRAND = {
    primary: '#125a83',
    primaryHover: '#1872a6',
    success: '#16a34a',
    warning: '#d97706',
    error: '#dc2626',
    text: '#0f172a',
    textSecondary: '#64748b',
    border: '#e2e8f0',
    surfaceMuted: '#f8fafc',
    rowHover: '#f1f7fb',
} as const;

// Шрифт берём из токена Tailwind (--font-sans в index.css) — один источник правды
export const FONT_FAMILY = 'var(--font-sans)';

export const appTheme: ThemeConfig = {
    cssVar: true,
    hashed: false,
    token: {
        colorPrimary: BRAND.primary,
        colorInfo: BRAND.primary,
        colorSuccess: BRAND.success,
        colorWarning: BRAND.warning,
        colorError: BRAND.error,
        colorText: BRAND.text,
        colorTextSecondary: BRAND.textSecondary,
        colorBorder: BRAND.border,
        colorBorderSecondary: '#eef2f6',
        borderRadius: 8,
        borderRadiusLG: 12,
        fontFamily: FONT_FAMILY,
        controlHeight: 36,
    },
    components: {
        Table: {
            headerBg: BRAND.surfaceMuted,
            headerColor: BRAND.textSecondary,
            headerSplitColor: 'transparent',
            rowHoverBg: BRAND.rowHover,
            rowSelectedBg: '#e8f1f7',
            rowSelectedHoverBg: '#deebf4',
            cellPaddingBlockSM: 10,
        },
        Button: {
            fontWeight: 500,
            primaryShadow: 'none',
            defaultShadow: 'none',
            dangerShadow: 'none',
        },
        Tag: {
            defaultBg: BRAND.surfaceMuted,
        },
    },
};
