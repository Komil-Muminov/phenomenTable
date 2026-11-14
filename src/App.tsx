import { useMemo, useState } from 'react';

import { createDemoColumns } from './demo/demoColumns';
import { DEMO_FILTERS, DEMO_ROWS, demoLocalFilter, type RowItem } from './demo/demoData';
import { ToastDemo } from './demo/ToastDemo';
import { SmartTable, toast } from './shared/ui';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function App() {
    const [rows, setRows] = useState<RowItem[]>(DEMO_ROWS);

    const columns = useMemo(
        () =>
            createDemoColumns({
                onEdit: (row) => toast.info(`Редактирование #${row.id}`, { description: row.title }),
                onDelete: async (row) => {
                    await wait(800); // имитация запроса
                    setRows((prev) => prev.filter((item) => item.id !== row.id));
                    toast.success(`Запись #${row.id} удалена`);
                },
            }),
        [],
    );

    return (
        <div className="mx-auto max-w-7xl p-4 sm:p-8">
            <header className="mb-6 space-y-3">
                <div>
                    <h1 className="text-xl font-bold text-gray-800">SmartTable + TableActions</h1>
                    <p className="text-sm text-gray-500">
                        Фильтры в URL, локальная пагинация, выделение, модалка просмотра и кастомные тосты.
                    </p>
                </div>
                <ToastDemo />
            </header>

            <SmartTable<RowItem>
                title="Доставки"
                dataSource={rows}
                columns={columns}
                filters={DEMO_FILTERS}
                localFilter={demoLocalFilter}
                idColumnHidden={false}
                enableViewModal
                viewModalTitle="Карточка доставки"
                handleSelectionChange={(keys) =>
                    keys.length > 0 && toast.info(`Выбрано записей: ${keys.length}`, { id: 'selection' })
                }
            />
        </div>
    );
}

export default App;
