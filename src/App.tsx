import { FilterType } from '@shared/model';
import { SmartTable } from './shared/ui/SmartTable';
import { ApiRoutes } from '@shared/config';
import { Button } from 'antd';
function App() {
    return (
        <div>
            <div className="!flex !flex-col !justify-end">
                {/* Сделать по клику модалку изменения для смартТейбл */}
                <SmartTable
                    url={ApiRoutes.TEST_API}
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
                    ]}
                    handleRowClick={(row) => {
                        console.log(row);
                    }}
                    searchButton={true}
                    enableViewModal={true}
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
                                    <Button type="primary" onClick={() => console.log(item)}>
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
