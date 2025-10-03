import { createCollection, useLiveQuery } from '@tanstack/react-db';
import { queryCollectionOptions } from '@tanstack/query-db-collection';
import { QueryClient } from '@tanstack/react-query';

const defaultQueryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: Infinity,
            gcTime: Infinity,
        },
    },
});

export const createOfflineCollection = (config: any) => {
    const { storeName, getKey, initialData = [], queryClient = defaultQueryClient } = config;

    return createCollection(
        queryCollectionOptions({
            queryClient,
            queryKey: [storeName],
            queryFn: async () => {
                const stored = localStorage.getItem(storeName);
                if (stored) {
                    try {
                        return JSON.parse(stored);
                    } catch (e) {
                        console.error('Failed to parse stored data:', e);
                        return initialData;
                    }
                }
                return initialData;
            },
            getKey,
            onInsert: async () => {
                const allData = queryClient.getQueryData([storeName]) || [];
                localStorage.setItem(storeName, JSON.stringify(allData));
                return { refetch: false };
            },
            onUpdate: async () => {
                const allData = queryClient.getQueryData([storeName]) || [];
                localStorage.setItem(storeName, JSON.stringify(allData));
                return { refetch: false };
            },
            onDelete: async () => {
                const allData = queryClient.getQueryData([storeName]) || [];
                localStorage.setItem(storeName, JSON.stringify(allData));
                return { refetch: false };
            },
        }) as any,
    );
};

export const useOfflineStore = (collection: any, getKey: any) => {
    const { data: items = [] } = useLiveQuery((q: any) => q.from({ item: collection }));

    const useFilteredItems = (searchQuery: string) => {
        const { data: filtered = [] } = useLiveQuery((q: any) => {
            if (!searchQuery) return q.from({ item: collection });

            return q.from({ item: collection }).where(({ item }: any) => {
                const query = searchQuery.toLowerCase();
                return Object.values(item).some((val: any) => String(val).toLowerCase().includes(query));
            });
        });

        return filtered;
    };

    const addItem = (item: any) => collection.insert(item);
    const addItems = (items: any) => items.forEach((item: any) => collection.insert(item));
    const updateItem = (id: any, updater: any) => collection.update(id, updater);
    const removeItem = (id: any) => collection.delete(id);
    const removeItems = (ids: any) => ids.forEach((id: any) => collection.delete(id));
    const clearAll = () => {
        const allIds = items.map((item: any) => getKey(item));
        allIds.forEach((id: any) => collection.delete(id));
    };
    const getItemById = (id: any): any => collection.get(id);
    const hasItem = (id: any): boolean => collection.has(id);

    return {
        items,
        count: items.length,
        useFilteredItems,
        addItem,
        addItems,
        updateItem,
        removeItem,
        removeItems,
        clearAll,
        getItemById,
        hasItem,
    };
};

export { defaultQueryClient };
