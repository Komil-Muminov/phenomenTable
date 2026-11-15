import { COLORS, FONT_FAMILY } from './tokens';

import type { ThemeConfig } from 'antd';


export { COLORS, FONT_FAMILY } from './tokens';

export const appTheme: ThemeConfig = {
    cssVar: true,
    hashed: false,
    token: {
        colorPrimary: COLORS.brand,
        colorInfo: COLORS.brand,
        colorSuccess: COLORS.success,
        colorWarning: COLORS.warning,
        colorError: COLORS.error,
        colorText: COLORS.ink,
        colorTextSecondary: COLORS['ink-muted'],
        colorBorder: COLORS.line,
        colorBorderSecondary: COLORS['line-soft'],
        borderRadius: 8,
        borderRadiusLG: 12,
        fontFamily: FONT_FAMILY,
        controlHeight: 36,
    },
    components: {
        Table: {
            headerBg: COLORS['surface-muted'],
            headerColor: COLORS['ink-muted'],
            headerSplitColor: 'transparent',
            rowHoverBg: COLORS['row-hover'],
            rowSelectedBg: COLORS['row-selected'],
            rowSelectedHoverBg: COLORS['row-selected-hover'],
            cellPaddingBlockSM: 10,
        },
        Button: {
            fontWeight: 500,
            primaryShadow: 'none',
            defaultShadow: 'none',
            dangerShadow: 'none',
        },
        Tag: {
            defaultBg: COLORS['surface-muted'],
        },
    },
};
