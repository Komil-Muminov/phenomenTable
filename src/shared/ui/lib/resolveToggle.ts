import type { Toggle } from '@shared/model';

/**
 * Разворачивает «флаг или объект» в объект настроек.
 * undefined → по умолчанию (включено/выключено), false → выключено, true → {}, объект → как есть.
 */
export const resolveToggle = <Options extends object>(
    value: Toggle<Options> | undefined,
    enabledByDefault = false,
): Options | undefined => {
    if (value === undefined) return enabledByDefault ? ({} as Options) : undefined;
    if (value === false) return undefined;
    if (value === true) return {} as Options;
    return value;
};
