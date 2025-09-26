// import { BrowserRouter as Router } from 'react-router-dom';
// import Layout from './components/Layout';
// import HomePage from './components/Homepage';
// import MemberPage from './components/MemberPage';
import './index.css';
import { PhenomenTable } from './Shared/PhenomenTable/PhenomenTable';
function App() {
    // Обработчик экспорта
    const handleExport = async (exportSettings: any) => {
        console.log('Экспорт с настройками:', exportSettings);

        // Имитация экспорта
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Экспорт завершен!');
                alert(
                    `Экспорт завершен! Формат: ${exportSettings.format}, записей: ${
                        exportSettings.includeFiltered ? 'отфильтрованные' : 'все'
                    }`,
                );
                resolve();
            }, 2000);
        });
    };

    // Обработчик клика по строке
    const handleRowClick = (row: any) => {
        console.log('Клик по сотруднику:', row);
        alert(`Выбран сотрудник: ${row.name} (${row.position})`);
    };

    // Обработчик изменения данных
    const handleDataChange = (data: any) => {
        console.log('Данные изменились, записей:', data.length);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto p-4">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">📊 Управление сотрудниками</h1>

                <PhenomenTable
                    // dataSource={employeesData}
                    // columnRoles={columnRoles}
                    // showExport={true}
                    // showSummary={true}
                    searchable={true}
                    sortable={true}
                    filterMode="server"
                    pageSize={10}
                    filters="smart"
                    features={['sorting', 'filtering', 'export', 'summary', 'search']}
                    onExport={handleExport}
                    onRowClick={handleRowClick}
                    onDataChange={handleDataChange}
                    className="bg-white rounded-lg shadow-sm"
                />
            </div>

            {/* Закомментированный роутинг */}
            {/* <Router> */}
            {/* <Layout>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/member/:id" element={<MemberPage />} />
                    </Routes>
                </Layout> */}
            {/* </Router> */}
        </div>
    );
}

export default App;
