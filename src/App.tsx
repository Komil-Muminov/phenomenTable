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
                    filters={[
                        {
                            type: FilterType.DATE,
                            name: 'startDate',
                            placeholder: 'От',
                        },
                    ]}
                    searchButton={true}
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
