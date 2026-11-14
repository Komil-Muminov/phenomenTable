import { toast } from '@shared/ui';
import { Button, Space } from 'antd';

const fakeRequest = (shouldFail: boolean) =>
    new Promise<string>((resolve, reject) =>
        setTimeout(() => (shouldFail ? reject(new Error('Сервер ответил 500')) : resolve('report.xlsx')), 1500),
    );

/** Панель для проверки всех видов тостов */
export const ToastDemo = () => (
    <Space wrap size={8}>
        <Button onClick={() => toast.success('Изменения сохранены', { description: 'Запись #42 обновлена' })}>
            Success
        </Button>
        <Button onClick={() => toast.error('Не удалось загрузить данные', { description: 'Проверьте соединение' })}>
            Error
        </Button>
        <Button onClick={() => toast.warning('Сессия скоро истечёт')}>Warning</Button>
        <Button onClick={() => toast.info('Доступна новая версия', { duration: 0 })}>Info (без таймера)</Button>
        <Button
            onClick={() =>
                toast
                    .promise(fakeRequest(Math.random() < 0.3), {
                        loading: 'Формируем отчёт…',
                        success: (file) => `Готово: ${file}`,
                        error: (error) => (error instanceof Error ? error.message : 'Ошибка'),
                    })
                    .catch(() => undefined)
            }
        >
            Promise
        </Button>
    </Space>
);
