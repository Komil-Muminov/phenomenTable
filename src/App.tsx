import { FilterType } from '@shared/model';
import { SmartTable } from './shared/ui/SmartTable';
import { ApiRoutes } from '@shared/config';
function App() {
    return (
        <div className="!bg-red-500">
            <div className="!flex !flex-col !justify-end !bg-red-500">
                <SmartTable
                    url={ApiRoutes.TEST_API}
                    dataSource={[
                        { id: 1, title: 'Test Title', senderCity: 'Test City', startDate: '2023-01-01' },
                        { id: 2, title: 'Test Title', senderCity: 'Test City', startDate: '2023-01-01' },
                        { id: 3, title: 'Test Title', senderCity: 'Test City', startDate: '2023-01-01' },
                        {
                            id: 4,
                            title: 'Test Title',
                            senderCity: 'Test City',
                            startDate: '2023-01-01',
                        },
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
                    handleSelectionChange={(selectedRowKeys: any, selectedRows: any) => {
                        console.log('Selected Row Keys:', selectedRowKeys);
                        console.log('Selected Rows:', selectedRows);
                    }}
                    columns={[
                        {
                            title: 'Город отправителя',
                            dataIndex: 'senderCity',
                            render: () => (
                                <>
                                    <span>Km</span>
                                </>
                            ),
                        },
                    ]}
                />
            </div>
        </div>
    );
}
export default App;
