import { Button, Drawer, Input, Modal, Popconfirm, Space, Table, Tag, Tooltip } from 'antd';
import {
    SaveOutlined,
    DeleteOutlined,
    DatabaseOutlined,
    SearchOutlined,
    ClearOutlined,
    CheckCircleOutlined,
} from '@ant-design/icons';
import { useState } from 'react';
import { useOfflineStore } from './lib';

interface OfflineManagerProps<T> {
    storeName: string;
    selectedRowKeys: any[];
    selectedRows: T[];
    tableData: T[];
    columns: any[];
    onLoadFromDB: (items: T[]) => void;
    hasItem: (id: any) => boolean;
}

export function OfflineManager<T extends { id: any }>(props: OfflineManagerProps<any>) {
    const { storeName, selectedRowKeys, selectedRows, tableData, columns, onLoadFromDB, hasItem } = props;

    const offlineStore = useOfflineStore<any>({ storeName, version: 1 });
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [localSearch, setLocalSearch] = useState('');

    // Добавить выбранные в БД
    const handleAddSelected = async () => {
        if (selectedRows.length === 0) return;
        await offlineStore.addItems(selectedRows);
    };

    // Загрузить из БД
    const handleLoadFromDB = () => {
        onLoadFromDB(offlineStore.filteredItems);
        setDrawerVisible(false);
    };

    // Очистить БД
    const handleClearDB = async () => {
        await offlineStore.clearAll();
    };

    // Удалить выбранные из БД
    const handleRemoveSelected = async () => {
        const idsToRemove = selectedRowKeys.filter((key) => hasItem(key));
        if (idsToRemove.length > 0) {
            await offlineStore.removeItems(idsToRemove);
        }
    };

    // Удалить одну запись из БД
    const handleRemoveItem = async (id: any) => {
        await offlineStore.removeItem(id);
    };

    // Поиск в БД
    const handleSearch = (value: string) => {
        setLocalSearch(value);
        offlineStore.setSearchQuery(value);
    };

    const filteredDBItems = localSearch ? offlineStore.getItems(localSearch) : offlineStore.items;

    return (
        <>
            {/* Toolbar */}
            <Space className="mb-4" wrap>
                <Tooltip title="Добавить выбранные строки в БД">
                    <Button
                        icon={<SaveOutlined />}
                        onClick={handleAddSelected}
                        disabled={selectedRowKeys.length === 0}
                        type="primary"
                    >
                        Добавить в БД ({selectedRowKeys.length})
                    </Button>
                </Tooltip>

                <Tooltip title="Показать данные из БД">
                    <Button icon={<DatabaseOutlined />} onClick={() => setDrawerVisible(true)}>
                        Открыть БД
                    </Button>
                </Tooltip>

                <Tooltip title="Удалить выбранные из БД">
                    <Popconfirm
                        title="Удалить выбранные из БД?"
                        onConfirm={handleRemoveSelected}
                        okText="Да"
                        cancelText="Нет"
                    >
                        <Button
                            icon={<DeleteOutlined />}
                            danger
                            disabled={selectedRowKeys.filter((key) => hasItem(key)).length === 0}
                        >
                            Удалить из БД
                        </Button>
                    </Popconfirm>
                </Tooltip>

                <Popconfirm title="Очистить всю БД?" onConfirm={handleClearDB} okText="Да" cancelText="Нет">
                    <Button icon={<ClearOutlined />} danger disabled={offlineStore.count === 0}>
                        Очистить БД
                    </Button>
                </Popconfirm>

                <Tag color="blue" icon={<DatabaseOutlined />}>
                    В БД: {offlineStore.count} записей
                </Tag>
            </Space>

            {/* Drawer - Боковая панель */}
            <Drawer
                title={
                    <Space>
                        <DatabaseOutlined />
                        Данные в БД ({offlineStore.count})
                    </Space>
                }
                placement="right"
                width={720}
                onClose={() => setDrawerVisible(false)}
                open={drawerVisible}
                extra={
                    <Space>
                        <Button type="primary" onClick={handleLoadFromDB} disabled={offlineStore.count === 0}>
                            Загрузить в таблицу
                        </Button>
                        <Button onClick={() => setModalVisible(true)}>Управление</Button>
                    </Space>
                }
            >
                <Input
                    placeholder="Поиск в БД..."
                    prefix={<SearchOutlined />}
                    value={localSearch}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="mb-4"
                    allowClear
                />

                <Table
                    dataSource={filteredDBItems}
                    columns={columns}
                    rowKey="id"
                    size="small"
                    pagination={{ pageSize: 10 }}
                />
            </Drawer>

            {/* Modal - Управление БД */}
            <Modal
                title="Управление базой данных"
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
                width={900}
            >
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                    <Input
                        placeholder="Поиск..."
                        prefix={<SearchOutlined />}
                        value={localSearch}
                        onChange={(e) => handleSearch(e.target.value)}
                        allowClear
                    />

                    <Table
                        dataSource={filteredDBItems}
                        columns={[
                            ...columns,
                            {
                                title: 'Действия',
                                key: 'actions',
                                width: 100,
                                render: (_: any, record: T) => (
                                    <Popconfirm
                                        title="Удалить?"
                                        onConfirm={() => handleRemoveItem(record.id)}
                                        okText="Да"
                                        cancelText="Нет"
                                    >
                                        <Button type="link" danger size="small" icon={<DeleteOutlined />}>
                                            Удалить
                                        </Button>
                                    </Popconfirm>
                                ),
                            },
                        ]}
                        rowKey="id"
                        size="small"
                        pagination={{ pageSize: 10 }}
                    />
                </Space>
            </Modal>
        </>
    );
}
