import { useState, useCallback, useMemo } from 'react';
import { TableRowSelection } from 'antd/es/table/interface';

export const useTableSelection = <T extends Record<string, any>>(options: any) => {
    const { data, rowKey = 'id', initialSelectedKeys = [], onSelectionChange } = options;

    const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>(initialSelectedKeys);

    const getRowKey = useCallback(
        (record: T): any => {
            return typeof rowKey === 'function' ? rowKey(record) : record[rowKey];
        },
        [rowKey],
    );

    const selectedRows = useMemo(() => {
        const keySet = new Set(selectedRowKeys);
        return data.filter((record: any) => keySet.has(getRowKey(record)));
    }, [data, selectedRowKeys, getRowKey]);

    const handleSelectionChange = useCallback(
        (newSelectedRowKeys: any[], newSelectedRows: T[]) => {
            setSelectedRowKeys(newSelectedRowKeys);
            onSelectionChange?.(newSelectedRowKeys, newSelectedRows);
        },
        [onSelectionChange],
    );

    const selectAll = useCallback(() => {
        const allKeys = data?.map(getRowKey);
        handleSelectionChange(allKeys, data);
    }, [data, getRowKey, handleSelectionChange]);

    const deselectAll = useCallback(() => {
        handleSelectionChange([], []);
    }, [handleSelectionChange]);

    const invertSelection = useCallback(() => {
        const currentKeySet = new Set(selectedRowKeys);
        const invertedKeys = data?.filter((record: any) => !currentKeySet.has(getRowKey(record)))?.map(getRowKey);
        const invertedRows = data?.filter((record: any) => !currentKeySet.has(getRowKey(record)));
        handleSelectionChange(invertedKeys, invertedRows);
    }, [data, selectedRowKeys, getRowKey, handleSelectionChange]);

    const selectByCondition = useCallback(
        (condition: (record: T) => boolean) => {
            const filteredData = data?.filter(condition);
            const keys = filteredData?.map(getRowKey);
            handleSelectionChange(keys, filteredData);
        },
        [data, getRowKey, handleSelectionChange],
    );

    const isSelected = useCallback(
        (record: T): boolean => {
            const key = getRowKey(record);
            return selectedRowKeys.includes(key);
        },
        [selectedRowKeys, getRowKey],
    );

    const toggleSelection = useCallback(
        (record: T) => {
            const key = getRowKey(record);
            const index = selectedRowKeys.indexOf(key);

            if (index > -1) {
                const newKeys = [...selectedRowKeys];
                newKeys.splice(index, 1);
                const newRows = selectedRows.filter((row: any) => getRowKey(row) !== key);
                handleSelectionChange(newKeys, newRows);
            } else {
                handleSelectionChange([...selectedRowKeys, key], [...selectedRows, record]);
            }
        },
        [selectedRowKeys, selectedRows, getRowKey, handleSelectionChange],
    );

    const rowSelection: TableRowSelection<T> = useMemo(
        () => ({
            selectedRowKeys,
            onChange: handleSelectionChange,
            preserveSelectedRowKeys: true,
        }),
        [selectedRowKeys, handleSelectionChange],
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
