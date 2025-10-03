// import { BrowserRouter as Router } from 'react-router-dom';
// import Layout from './components/Layout';
// import HomePage from './components/Homepage';

import { FilterType } from '@shared/model';
import { SmartTable } from './shared/ui/SmartTable';
// import MemberPage from './components/MemberPage';
function App() {
    return (
        <div className="!bg-red-500">
            <div className="!flex !flex-col !justify-end !bg-red-500">
                <SmartTable
                    url="ss"
                    dataSource={[
                        { id: 1, title: 'Test Title', senderCity: 'Test City', startDate: '2023-01-01' },
                        { id: 2, title: 'Test Title', senderCity: 'Test City', startDate: '2023-01-01' },
                        { id: 3, title: 'Test Title', senderCity: 'Test City', startDate: '2023-01-01' },
                        { id: 4, title: 'Test Title', senderCity: 'Test City', startDate: '2023-01-01' },
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
                    handleSelectionChange={(selectedRowKeys, selectedRows) => {
                        console.log('Selected Row Keys:', selectedRowKeys);
                        console.log('Selected Rows:', selectedRows);
                    }}
                    columns={[
                        {
                            title: 'Город отправителя',
                            dataIndex: 'senderCity',
                        },
                    ]}
                />
            </div>
        </div>
    );
}

export default App;
