import { describe, expect, it } from 'vitest';

import { resolveToggle } from './resolveToggle';

describe('resolveToggle', () => {
    it('undefined → дефолт блока', () => {
        expect(resolveToggle(undefined)).toBeUndefined();
        expect(resolveToggle(undefined, true)).toEqual({});
    });

    it('флаги и объект', () => {
        expect(resolveToggle(false, true)).toBeUndefined();
        expect(resolveToggle(true)).toEqual({});
        const options = { title: 'Карточка' };
        expect(resolveToggle(options)).toBe(options);
    });
});
