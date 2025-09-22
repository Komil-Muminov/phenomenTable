// import { BrowserRouter as Router } from 'react-router-dom';
// import Layout from './components/Layout';
// import HomePage from './components/Homepage';
// import MemberPage from './components/MemberPage';
import './index.css';
import { PhenomenTable } from './Shared/PhenomenTable/PhenomenTable';
// Тестовые данные сотрудников
const employeesData = [
    {
        id: 1,
        name: 'Алексей Петров',
        email: 'alexey.petrov@company.ru',
        phone: '+7 (999) 123-45-67',
        department: 'IT',
        position: 'Frontend Developer',
        salary: 120000,
        bonus: 15000,
        status: 'Активен',
        hired_date: '2023-01-15',
        birth_date: '1995-03-22',
        experience: 3,
        city: 'Москва',
        age: 28,
        projects_count: 12,
        rating: 4.8,
        gender: 'Мужской',
        education: 'Высшее',
        skills: ['React', 'TypeScript', 'Node.js'],
        is_remote: false,
        contract_type: 'Полная занятость',
        manager: 'Иван Сидоров',
    },
    {
        id: 2,
        name: 'Мария Сидорова',
        email: 'maria.sidorova@company.ru',
        phone: '+7 (999) 234-56-78',
        department: 'Дизайн',
        position: 'UI/UX Designer',
        salary: 95000,
        bonus: 8000,
        status: 'Активен',
        hired_date: '2022-08-20',
        birth_date: '1998-07-11',
        experience: 2,
        city: 'Санкт-Петербург',
        age: 25,
        projects_count: 8,
        rating: 4.9,
        gender: 'Женский',
        education: 'Высшее',
        skills: ['Figma', 'Adobe XD', 'Photoshop'],
        is_remote: true,
        contract_type: 'Полная занятость',
        manager: 'Анна Козлова',
    },
    {
        id: 3,
        name: 'Дмитрий Иванов',
        email: 'dmitry.ivanov@company.ru',
        phone: '+7 (999) 345-67-89',
        department: 'IT',
        position: 'Backend Developer',
        salary: 130000,
        bonus: 20000,
        status: 'В отпуске',
        hired_date: '2021-03-10',
        birth_date: '1991-12-05',
        experience: 5,
        city: 'Москва',
        age: 32,
        projects_count: 20,
        rating: 4.7,
        gender: 'Мужской',
        education: 'Высшее',
        skills: ['Python', 'Django', 'PostgreSQL'],
        is_remote: false,
        contract_type: 'Полная занятость',
        manager: 'Иван Сидоров',
    },
    {
        id: 4,
        name: 'Анна Козлова',
        email: 'anna.kozlova@company.ru',
        phone: '+7 (999) 456-78-90',
        department: 'Маркетинг',
        position: 'Marketing Manager',
        salary: 85000,
        bonus: 12000,
        status: 'Активен',
        hired_date: '2023-06-01',
        birth_date: '1994-09-15',
        experience: 4,
        city: 'Казань',
        age: 29,
        projects_count: 6,
        rating: 4.6,
        gender: 'Женский',
        education: 'Высшее',
        skills: ['SMM', 'Google Analytics', 'Контент-маркетинг'],
        is_remote: true,
        contract_type: 'Полная занятость',
        manager: 'Петр Николаев',
    },
    {
        id: 5,
        name: 'Сергей Николаев',
        email: 'sergey.nikolaev@company.ru',
        phone: '+7 (999) 567-89-01',
        department: 'Продажи',
        position: 'Sales Manager',
        salary: 75000,
        bonus: 25000,
        status: 'Неактивен',
        hired_date: '2020-11-25',
        birth_date: '1988-04-30',
        experience: 6,
        city: 'Нижний Новгород',
        age: 35,
        projects_count: 15,
        rating: 4.3,
        gender: 'Мужской',
        education: 'Высшее',
        skills: ['CRM', 'Переговоры', 'B2B продажи'],
        is_remote: false,
        contract_type: 'Частичная занятость',
        manager: 'Елена Морозова',
    },
    {
        id: 6,
        name: 'Елена Морозова',
        email: 'elena.morozova@company.ru',
        phone: '+7 (999) 678-90-12',
        department: 'HR',
        position: 'HR Specialist',
        salary: 70000,
        bonus: 7000,
        status: 'Активен',
        hired_date: '2022-12-15',
        birth_date: '1996-01-18',
        experience: 2,
        city: 'Екатеринбург',
        age: 27,
        projects_count: 4,
        rating: 4.5,
        gender: 'Женский',
        education: 'Высшее',
        skills: ['Рекрутинг', 'Психология', 'Трудовое право'],
        is_remote: true,
        contract_type: 'Полная занятость',
        manager: 'Петр Николаев',
    },
    {
        id: 7,
        name: 'Олег Кузнецов',
        email: 'oleg.kuznetsov@company.ru',
        phone: '+7 (999) 789-01-23',
        department: 'IT',
        position: 'DevOps Engineer',
        salary: 140000,
        bonus: 18000,
        status: 'Активен',
        hired_date: '2021-09-03',
        birth_date: '1990-06-12',
        experience: 7,
        city: 'Москва',
        age: 33,
        projects_count: 25,
        rating: 4.9,
        gender: 'Мужской',
        education: 'Высшее',
        skills: ['Docker', 'Kubernetes', 'AWS'],
        is_remote: false,
        contract_type: 'Полная занятость',
        manager: 'Иван Сидоров',
    },
    {
        id: 8,
        name: 'Татьяна Волкова',
        email: 'tatyana.volkova@company.ru',
        phone: '+7 (999) 890-12-34',
        department: 'Финансы',
        position: 'Accountant',
        salary: 65000,
        bonus: 5000,
        status: 'Активен',
        hired_date: '2023-02-20',
        birth_date: '1999-11-08',
        experience: 1,
        city: 'Воронеж',
        age: 24,
        projects_count: 2,
        rating: 4.2,
        gender: 'Женский',
        education: 'Высшее',
        skills: ['1С', 'Excel', 'Налогообложение'],
        is_remote: false,
        contract_type: 'Полная занятость',
        manager: 'Максим Лебедев',
    },
    {
        id: 9,
        name: 'Максим Лебедев',
        email: 'maxim.lebedev@company.ru',
        phone: '+7 (999) 901-23-45',
        department: 'IT',
        position: 'QA Engineer',
        salary: 90000,
        bonus: 10000,
        status: 'Активен',
        hired_date: '2022-05-18',
        birth_date: '1997-02-28',
        experience: 3,
        city: 'Новосибирск',
        age: 26,
        projects_count: 18,
        rating: 4.4,
        gender: 'Мужской',
        education: 'Высшее',
        skills: ['Selenium', 'Jest', 'Cypress'],
        is_remote: true,
        contract_type: 'Полная занятость',
        manager: 'Иван Сидоров',
    },
    {
        id: 10,
        name: 'Ирина Соколова',
        email: 'irina.sokolova@company.ru',
        phone: '+7 (999) 012-34-56',
        department: 'Дизайн',
        position: 'Graphic Designer',
        salary: 80000,
        bonus: 9000,
        status: 'В отпуске',
        hired_date: '2021-07-12',
        birth_date: '1993-05-20',
        experience: 4,
        city: 'Ростов-на-Дону',
        age: 30,
        projects_count: 14,
        rating: 4.6,
        gender: 'Женский',
        education: 'Высшее',
        skills: ['Illustrator', 'InDesign', 'After Effects'],
        is_remote: false,
        contract_type: 'Полная занятость',
        manager: 'Анна Козлова',
    },
    {
        id: 11,
        name: 'Андрей Попов',
        email: 'andrey.popov@company.ru',
        phone: '+7 (999) 123-45-60',
        department: 'Продажи',
        position: 'Sales Representative',
        salary: 60000,
        bonus: 15000,
        status: 'Активен',
        hired_date: '2023-08-01',
        birth_date: '2000-10-14',
        experience: 1,
        city: 'Челябинск',
        age: 23,
        projects_count: 3,
        rating: 4.1,
        gender: 'Мужской',
        education: 'Среднее специальное',
        skills: ['Холодные звонки', 'CRM', 'Презентации'],
        is_remote: false,
        contract_type: 'Полная занятость',
        manager: 'Елена Морозова',
    },
    {
        id: 12,
        name: 'Наталья Федорова',
        email: 'natalya.fedorova@company.ru',
        phone: '+7 (999) 234-56-71',
        department: 'Маркетинг',
        position: 'Content Manager',
        salary: 72000,
        bonus: 8000,
        status: 'Неактивен',
        hired_date: '2020-04-08',
        birth_date: '1992-08-25',
        experience: 5,
        city: 'Самара',
        age: 31,
        projects_count: 11,
        rating: 4.4,
        gender: 'Женский',
        education: 'Высшее',
        skills: ['Копирайтинг', 'SEO', 'WordPress'],
        is_remote: true,
        contract_type: 'Частичная занятость',
        manager: 'Петр Николаев',
    },
];

// Роли колонок для правильного форматирования
const columnRoles = {
    name: 'title',
    email: 'email',
    phone: 'phone',
    department: 'category',
    salary: 'currency',
    bonus: 'currency',
    status: 'status',
    hired_date: 'date',
    birth_date: 'date',
    rating: 'rating',
    age: 'number',
    experience: 'number',
    projects_count: 'number',
    is_remote: 'boolean',
};

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
                    dataSource={employeesData}
                    columnRoles={columnRoles}
                    showExport={true}
                    showSummary={true}
                    searchable={true}
                    sortable={true}
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
