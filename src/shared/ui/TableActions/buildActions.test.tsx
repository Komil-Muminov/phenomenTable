import { describe, expect, it, vi } from 'vitest';

import { buildActions, DEFAULT_DELETE_CONFIRM, resolveActions } from './buildActions';

interface Row {
    id: number;
    locked: boolean;
}

describe('buildActions', () => {
    it('ставит пресеты в правильном порядке', () => {
        const list = buildActions<Row>({
            onView: vi.fn(),
            onEdit: vi.fn(),
            onDelete: vi.fn(),
            actions: [{ key: 'copy', label: 'Копировать' }],
            deleteConfirm: DEFAULT_DELETE_CONFIRM,
        });
        expect(list.map((item) => item.key)).toEqual(['preset-view', 'preset-edit', 'copy', 'preset-delete']);
        expect(list.at(-1)?.confirm).toBe(DEFAULT_DELETE_CONFIRM);
    });
});

describe('resolveActions', () => {
    it('вычисляет hidden/disabled/tooltip от записи', () => {
        const record: Row = { id: 1, locked: true };
        const resolved = resolveActions<Row>(
            [
                { key: 'a', hidden: (row) => row.locked },
                { key: 'b', disabled: (row) => row.locked, tooltip: (row) => `#${row.id}` },
                { label: 'без ключа' },
            ],
            record,
        );

        expect(resolved.map((item) => item.key)).toEqual(['b', 'action-1']);
        expect(resolved[0]).toMatchObject({ disabled: true, tooltip: '#1' });
    });
});
