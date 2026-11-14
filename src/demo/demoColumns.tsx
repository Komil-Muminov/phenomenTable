import { createActionsColumn, toast } from '@shared/ui';
import { Copy, ShieldAlert } from 'lucide-react';

import type { RowItem } from './demoData';
import type { TableColumnsType } from 'antd';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface DemoHandlers {
    onEdit: (row: RowItem) => void;
    onDelete: (row: RowItem) => Promise<void>;
}

export const createDemoColumns = ({ onEdit, onDelete }: DemoHandlers): TableColumnsType<RowItem> => [
    { title: 'Название', dataIndex: 'title' },
    { title: 'Город отправителя', dataIndex: 'senderCity' },
    { title: 'Километраж', dataIndex: 'km' },
    // Колонка без render: ISO-дата отформатируется автоматически
    { title: 'Дата отправки', dataIndex: 'startDate' },
    createActionsColumn<RowItem>({
        title: 'Действия',
        width: 220,
        onEdit,
        onDelete,
        deleteConfirm: {
            title: 'Удалить эту доставку?',
            description: 'Запись будет безвозвратно удалена.',
            okText: 'Да, удалить',
            cancelText: 'Отмена',
            okType: 'danger',
        },
        actions: [
            {
                key: 'copy',
                label: 'Копировать',
                icon: <Copy className="h-3.5 w-3.5" />,
                onClick: async (row) => {
                    await navigator.clipboard?.writeText(JSON.stringify(row, null, 2)).catch(() => undefined);
                    toast.success(`Запись #${row.id} скопирована`, { description: 'JSON уже в буфере обмена' });
                },
            },
            {
                key: 'lock',
                label: 'Блокировка',
                icon: <ShieldAlert className="h-3.5 w-3.5" />,
                danger: true,
                disabled: (row) => Boolean(row.isLocked),
                tooltip: (row) => (row.isLocked ? 'Уже заблокировано' : 'Заблокировать запись'),
                onClick: async (row) => {
                    await wait(600);
                    toast.warning(`Запись #${row.id} заблокирована`);
                },
            },
        ],
    }),
];
