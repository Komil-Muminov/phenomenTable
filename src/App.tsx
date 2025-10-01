// import { BrowserRouter as Router } from 'react-router-dom';
// import Layout from './components/Layout';
// import HomePage from './components/Homepage';

import { SmartTable } from './shared/ui/SmartTable';
// import MemberPage from './components/MemberPage';
function App() {
    return (
        <div className="!bg-red-500">
            <div className="!flex !flex-col !justify-end !bg-red-500">
                <SmartTable
                    // url="https://row-cargo.azurewebsites.net/api/Organisation/search"
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
