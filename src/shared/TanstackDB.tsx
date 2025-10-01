// import { createCollection, eq, useLiveQuery } from '@tanstack/react-db';
// import { useState } from 'react';

// // Создание коллекции в памяти
// const todoCollection = createCollection({
//     initialData: [
//         { id: '1', title: 'Купить продукты', completed: false, createdAt: new Date() },
//         { id: '2', title: 'Изучить TanStack DB', completed: true, createdAt: new Date() },
//     ],
//     getKey: (item) => item.id, // Уникальный ключ
// });

// export const TanstackDB: React.FC = () => {
//     const [filter, setFilter] = useState<'all' | 'completed'>('all');

//     // Live Query для реактивного получения данных
//     const { data: todos = [] } = useLiveQuery((q) =>
//         q
//             .from({ todo: todoCollection })
//             .where(({ todo }) => (filter === 'all' ? undefined : eq(todo.completed, filter === 'completed')))
//             .orderBy(({ todo }) => todo.createdAt, 'desc')
//             .select(({ todo }) => todo),
//     );

//     // Мутация для переключения статуса
//     const toggleTodo = (id: string) => {
//         todoCollection.update(id, (draft) => {
//             draft.completed = !draft.completed;
//         });
//     };

//     return (
//         <div>
//             <h1>Список задач</h1>
//             <select onChange={(e) => setFilter(e.target.value as 'all' | 'completed')}>
//                 <option value="all">Все</option>
//                 <option value="completed">Завершённые</option>
//             </select>
//             <ul>
//                 {todos.map((todo) => (
//                     <li key={todo.id} onClick={() => toggleTodo(todo.id)}>
//                         {todo.title} - {todo.completed ? 'Выполнено' : 'В процессе'}
//                     </li>
//                 ))}
//             </ul>
//         </div>
//     );
// };
