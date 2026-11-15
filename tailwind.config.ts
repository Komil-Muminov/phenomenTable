import plugin from 'tailwindcss/plugin';

import { COLORS, FONT_FAMILY, FONT_SANS, LEGACY_CSS_VARS } from './src/shared/config/tokens';

import type { Config } from 'tailwindcss';

// Те же токены как CSS-переменные (--color-brand, --font-sans) — для var(...) в CSS и инлайн-стилях
const cssVariables = plugin(({ addBase }) => {
    addBase({
        ':root': {
            ...Object.fromEntries(Object.entries(COLORS).map(([name, value]) => [`--color-${name}`, value])),
            '--font-sans': FONT_FAMILY,
            // Совместимость со старыми проектами (@deprecated)
            ...LEGACY_CSS_VARS,
        },
    });
});

// Подключается из index.css через @config — значения берутся из tokens.ts, без дублей
export default {
    theme: {
        extend: {
            colors: COLORS,
            fontFamily: { sans: FONT_SANS },
        },
    },
    plugins: [cssVariables],
} satisfies Config;
