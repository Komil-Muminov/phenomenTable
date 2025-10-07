import { FilterType } from '@shared/model';
import { SmartTable } from './shared/ui/SmartTable';
import { ApiRoutes } from '@shared/config';
function App() {
    return (
        <div className="!bg-red-500">
            <div className="!flex !flex-col !justify-end !bg-red-500">
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
                    ]}
                />
            </div>
        </div>
    );
}
export default App;
