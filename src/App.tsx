import { FilterType } from '@shared/model';
import { SmartTable } from './shared/ui/SmartTable';
import { ApiRoutes } from '@shared/config';
import { Button } from 'antd';
import { useState } from 'react';
function App() {
    const [state, setState] = useState({
        isEdit: false,
        isDelete: false,
    });
    let idSymbol = Symbol('id');
    class user {
        name: string;
        age: number;
        [idSymbol]: number;
        constructor(name: string, age: number, id: number) {
            this.name = name;
            this.age = age;
            this[idSymbol] = id;
        }
    }
    const users = [
        { name: 'John', age: 30 },
        { name: 'Alice', age: 25 },
        { name: 'Bob', age: 40 },
    ];
    // for (const user of users) {
    //     const newArr = [...newArr, users[user]];
    //     console.log(newArr);
    // }
    return (
        <div>
            <div className="!flex !flex-col !justify-end px-2 lg:p-0">
                <SmartTable
                    url={ApiRoutes.TEST_API}
                    idColumnHidden={true}
                    showDownloadBtn={true}
                    downloadButton={{
                        url: 'download',
                        fileName: 'km',
                        messages: {
                            success: 'Файл успешно скачан',
                            error: 'Ошибка при скачивание',
                        },
                    }}
                    dataSource={[
                        { id: 1, title: 'Test Title', senderCity: 'Test City', startDate: '2023-01-01' },
                        { id: 3, title: 'KM', km: 'KM', startDate: '2023-01-01' },
                    ]}
                    filters={[
                        {
                            type: FilterType.DATE,
                            name: 'startDate',
                            placeholder: 'От',
                        },
                        {
                            type: FilterType.DATE_RANGE,
                            name: 'dateRange',
                            placeholder: 'От и до',
                        },
                        {
                            type: FilterType.SELECT,
                            name: 'orderType',
                            placeholder: 'Выберите тип',
                            transform: (value) => Number(value),
                            options: [{ label: 'КМ', value: 2 }],
                        },
                    ]}
                    handleRowClick={(row) => {
                        console.log(row);
                    }}
                    searchButton={true}
                    enableViewModal={!state.isEdit || !state.isDelete}
                    handleSelectionChange={(selectedRowKeys: any, selectedRows: any) => {
                        console.log('Selected Row Keys:', selectedRowKeys);
                        console.log('Selected Rows:', selectedRows);
                    }}
                    columns={[
                        {
                            title: 'Город отправителя',
                            dataIndex: 'senderCity',
                        },
                        {
                            title: 'Километраж',
                            dataIndex: 'km',
                        },
                        {
                            title: 'Действия',
                            render: (item) => (
                                <div className="flex gap-3">
                                    <Button
                                        type="primary"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            console.log(item);
                                        }}
                                    >
                                        KM
                                    </Button>
                                    <Button>Редактировать</Button>
                                </div>
                            ),
                        },
                    ]}
                />
            </div>
        </div>
    );
}
export default App;
