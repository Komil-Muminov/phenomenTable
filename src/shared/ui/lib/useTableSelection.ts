import { useCallback, useMemo, useRef, useState, type Key } from 'react';

import { resolveRowKey } from './rowKey';

import type { RowKeyGetter } from '@shared/model';
import type { TableRowSelection } from 'antd/es/table/interface';

interface UseTableSelectionOptions<RecordType> {
    data: RecordType[];
    rowKey?: RowKeyGetter<RecordType>;
    initialSelectedKeys?: Key[];
    onSelectionChange?: (keys: Key[], rows: RecordType[]) => void;
}

export const useTableSelection = <RecordType>(options: UseTableSelectionOptions<RecordType>) => {
    const { data, rowKey = 'id', initialSelectedKeys = [], onSelectionChange } = options;

    const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>(initialSelectedKeys);

    const getRowKey = useCallback((record: RecordType) => resolveRowKey(record, rowKey), [rowKey]);

    const selectedKeySet = useMemo(() => new Set(selectedRowKeys), [selectedRowKeys]);

    // Кэш выделенных строк: при серверной пагинации строки с прошлых страниц уже не в data
    const rowsCacheRef = useRef(new Map<Key, RecordType>());

    const selectedRows = useMemo(() => {
        const cache = rowsCacheRef.current;
        data.forEach((record) => {
            const key = getRowKey(record);
            if (selectedKeySet.has(key)) cache.set(key, record);
        });
        return selectedRowKeys.map((key) => cache.get(key)).filter((row): row is RecordType => row !== undefined);
    }, [data, selectedRowKeys, selectedKeySet, getRowKey]);

    const setSelection = useCallback(
        (keys: Key[], rows: RecordType[]) => {
            const cache = rowsCacheRef.current;
            // antd может передать undefined вместо строк с других страниц
            rows.forEach((row) => row !== undefined && cache.set(getRowKey(row), row));
            const keySet = new Set(keys);
            [...cache.keys()].forEach((key) => !keySet.has(key) && cache.delete(key));

            setSelectedRowKeys(keys);
            onSelectionChange?.(
                keys,
                keys.map((key) => cache.get(key)).filter((row): row is RecordType => row !== undefined),
            );
        },
        [onSelectionChange, getRowKey],
    );

    const selectAll = useCallback(() => setSelection(data.map(getRowKey), data), [data, getRowKey, setSelection]);

    const deselectAll = useCallback(() => setSelection([], []), [setSelection]);

    const invertSelection = useCallback(() => {
        const rows = data.filter((record) => !selectedKeySet.has(getRowKey(record)));
        setSelection(rows.map(getRowKey), rows);
    }, [data, selectedKeySet, getRowKey, setSelection]);

    const selectByCondition = useCallback(
        (condition: (record: RecordType) => boolean) => {
            const rows = data.filter(condition);
            setSelection(rows.map(getRowKey), rows);
        },
        [data, getRowKey, setSelection],
    );

    const isSelected = useCallback(
        (record: RecordType) => selectedKeySet.has(getRowKey(record)),
        [selectedKeySet, getRowKey],
    );

    const toggleSelection = useCallback(
        (record: RecordType, checked?: boolean) => {
            const key = getRowKey(record);
            const shouldSelect = checked ?? !selectedKeySet.has(key);

            if (shouldSelect) {
                if (selectedKeySet.has(key)) return;
                setSelection([...selectedRowKeys, key], [...selectedRows, record]);
            } else {
                setSelection(
                    selectedRowKeys.filter((item) => item !== key),
                    selectedRows.filter((row) => getRowKey(row) !== key),
                );
            }
        },
        [selectedRowKeys, selectedRows, selectedKeySet, getRowKey, setSelection],
    );

    const rowSelection: TableRowSelection<RecordType> = useMemo(
        () => ({
            selectedRowKeys,
            onChange: setSelection,
            preserveSelectedRowKeys: true,
        }),
        [selectedRowKeys, setSelection],
    );

    return {
        selectedRowKeys,
        selectedRows,
        rowSelection,
        selectAll,
        deselectAll,
        invertSelection,
        selectByCondition,
        isSelected,
        toggleSelection,
        hasSelection: selectedRowKeys.length > 0,
        selectedCount: selectedRowKeys.length,
    };
};
