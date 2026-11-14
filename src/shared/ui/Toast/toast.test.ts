import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { EXIT_ANIMATION_MS, toast, toastStore } from './toast';

const current = () => toastStore.getSnapshot();

describe('toast', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        toast.dismiss();
        vi.runAllTimers();
        vi.useRealTimers();
    });

    it('добавляет тост с дефолтной длительностью по типу', () => {
        toast.error('Упало');
        expect(current()).toHaveLength(1);
        expect(current()[0]).toMatchObject({ type: 'error', title: 'Упало', duration: 6000, closing: false });
    });

    it('игнорирует пустой заголовок', () => {
        expect(toast.info('')).toBe('');
        expect(current()).toHaveLength(0);
    });

    it('валидирует duration', () => {
        toast.success('a', { duration: -1 });
        toast.success('b', { duration: 10 ** 9 });
        expect(current().map((item) => item.duration)).toEqual([3500, 60_000]);
    });

    it('обновляет тост с тем же id и увеличивает version', () => {
        toast.loading('Грузим', { id: 'job' });
        toast.success('Готово', { id: 'job' });
        expect(current()).toHaveLength(1);
        expect(current()[0]).toMatchObject({ type: 'success', title: 'Готово', version: 2 });
    });

    it('dismiss сначала помечает closing, затем удаляет', () => {
        const id = toast.info('Привет');
        toast.dismiss(id);
        expect(current()[0].closing).toBe(true);
        vi.advanceTimersByTime(EXIT_ANIMATION_MS);
        expect(current()).toHaveLength(0);
    });

    it('держит не больше 5 живых тостов', () => {
        for (let index = 0; index < 7; index++) toast.info(`#${index}`);
        expect(current().filter((item) => !item.closing)).toHaveLength(5);
    });

    it('promise переключает loading → success', async () => {
        await toast.promise(Promise.resolve(42), {
            loading: 'Ждём',
            success: (value) => `Ок ${value}`,
            error: 'Ошибка',
        });
        await Promise.resolve();
        expect(current()[0]).toMatchObject({ type: 'success', title: 'Ок 42' });
    });
});
