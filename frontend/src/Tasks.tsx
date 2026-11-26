import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';

type Category = { documentId: string; name: string };
type Task = {
  documentId: string;
  title: string;
  isDone: boolean;
  category?: Category;
};

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const navigate = useNavigate();

  const load = async () => {
    const t = await api.get('/tasks/mine');          // READ (custom endpoint)
    const c = await api.get('/categories');
    setTasks(t.data.data);
    setCategories(c.data.data);
  };

  useEffect(() => { load(); }, []);

  const addTask = async () => {                       // CREATE
    await api.post('/tasks', {
      data: { title, isDone: false, category: categoryId || null },
    });
    setTitle('');
    load();
  };

  const toggleDone = async (task: Task) => {          // UPDATE
    await api.put(`/tasks/${task.documentId}`, { data: { isDone: !task.isDone } });
    load();
  };

  const removeTask = async (id: string) => {          // DELETE
    await api.delete(`/tasks/${id}`);
    load();
  };

  const logout = () => {
    localStorage.removeItem('jwt');
    navigate('/');
  };

 return (
  <div className="container">
    <div className="top-bar">
      <h2>My Tasks</h2>
      <button className="ghost" onClick={logout}>Logout</button>
    </div>

    <div className="row">
      <input placeholder="New task" value={title} onChange={(e) => setTitle(e.target.value)} />
      <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
        <option value="">No category</option>
        {categories.map((c) => (
          <option key={c.documentId} value={c.documentId}>{c.name}</option>
        ))}
      </select>
      <button onClick={addTask}>Add</button>
    </div>

    <ul>
      {tasks.map((t) => (
        <li key={t.documentId}>
          <input type="checkbox" checked={t.isDone} onChange={() => toggleDone(t)} />
          <span className={t.isDone ? 'done' : ''}>{t.title}</span>
          {t.category && <span className="tag" style={{ flex: 'none' }}>{t.category.name}</span>}
          <button className="danger" onClick={() => removeTask(t.documentId)}>Delete</button>
        </li>
      ))}
    </ul>
  </div>
);
}