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
    return (
        <div>
            <div className="!flex !flex-col !justify-end px-2 lg:p-0">
                <SmartTable
                    url={ApiRoutes.TEST_API}
                    idColumnHidden={true}
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
