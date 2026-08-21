import { FilterType } from '@shared/model';
import { SmartTable, createActionsColumn } from './shared/ui';
import { ApiRoutes } from '@shared/config';
import { useState } from 'react';
import { message } from 'antd';
import { Copy, ShieldAlert } from 'lucide-react';

interface RowItem {
    id: number;
    title: string;
    senderCity?: string;
    km?: string;
    startDate?: string;
    isLocked?: boolean;
}

function App() {
    const [data, setData] = useState<RowItem[]>([
        { id: 1, title: 'Доставка 1', senderCity: 'Москва', km: '350 км', startDate: '2023-01-01' },
        { id: 2, title: 'Доставка 2', senderCity: 'Санкт-Петербург', km: '700 км', startDate: '2023-02-15', isLocked: true },
        { id: 3, title: 'Доставка 3', senderCity: 'Казань', km: '120 км', startDate: '2023-03-20' },
    ]);

    const handleDelete = async (row: RowItem) => {
        // Симуляция сетевого запроса на удаление
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setData((prev) => prev.filter((item) => item.id !== row.id));
        message.success(`Запись #${row.id} успешно удалена`);
    };

    const handleEdit = (row: RowItem) => {
        message.info(`Редактирование записи #${row.id}: ${row.title}`);
    };

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto">
            <div className="mb-4">
                <h1 className="text-xl font-bold text-gray-800">Демонстрация SmartTable + TableActions</h1>
                <p className="text-sm text-gray-500">
                    Готовая колонка действий с подтверждением удаления, асинхронным лоадером и выпадающим меню.
                </p>
            </div>

            <SmartTable<RowItem>
                url={ApiRoutes.TEST_API}
                idColumnHidden={false}
                showDownloadBtn={true}
                downloadButton={{
                    url: 'download',
                    fileName: 'km_report',
                    messages: {
                        success: 'Файл успешно скачан',
                        error: 'Ошибка при скачивании',
                    },
                }}
                dataSource={data}
                filters={[
                    {
                        type: FilterType.DATE,
                        name: 'startDate',
                        placeholder: 'От даты',
                    },
                    {
                        type: FilterType.DATE_RANGE,
                        name: 'dateRange',
                        placeholder: 'Период',
                    },
                    {
                        type: FilterType.SELECT,
                        name: 'orderType',
                        placeholder: 'Выберите тип',
                        transform: (value) => Number(value),
                        options: [{ label: 'Стандарт', value: 1 }, { label: 'Экспресс', value: 2 }],
                    },
                ]}
                handleRowClick={(row) => {
                    message.info(`Клик по строке: #${row.id} ${row.title}`);
                }}
                searchButton={true}
                enableViewModal={true}
                columns={[
                    {
                        title: 'Название',
                        dataIndex: 'title',
                    },
                    {
                        title: 'Город отправителя',
                        dataIndex: 'senderCity',
                    },
                    {
                        title: 'Километраж',
                        dataIndex: 'km',
                    },
                    createActionsColumn<RowItem>({
                        title: 'Действия',
                        width: 220,
                        onEdit: handleEdit,
                        onDelete: handleDelete,
                        deleteConfirm: {
                            title: 'Удалить эту доставку?',
                            description: 'Запись будет безвозвратно удалена из базы данных.',
                            okText: 'Да, удалить',
                            cancelText: 'Отмена',
                            okType: 'danger',
                        },
                        actions: [
                            {
                                key: 'copy',
                                label: 'Копировать',
                                icon: <Copy className="w-3.5 h-3.5" />,
                                onClick: (row) => {
                                    message.success(`Данные #${row.id} скопированы в буфер`);
                                },
                            },
                            {
                                key: 'lock',
                                label: 'Блокировка',
                                icon: <ShieldAlert className="w-3.5 h-3.5" />,
                                danger: true,
                                disabled: (row) => !!row.isLocked,
                                tooltip: (row: RowItem) => row.isLocked ? 'Уже заблокировано' : 'Заблокировать запись',
                                onClick: async (row) => {
                                    await new Promise((res) => setTimeout(res, 600));
                                    message.warning(`Запись #${row.id} заблокирована`);
                                },
                            },
                        ],
                    }),
                ]}
            />
        </div>
    );
}

export default App;
