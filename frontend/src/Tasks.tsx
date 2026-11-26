import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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
  const [taskError, setTaskError] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [formError, setFormError] = useState('');
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const navigate = useNavigate();

  const load = async () => {
    try {
      const t = await api.get('/tasks/mine');        // READ (custom endpoint)
      setTasks(t.data.data);
      setTaskError('');
    } catch (error: unknown) {
      setTasks([]);
      setTaskError(
        axios.isAxiosError(error) && error.response?.status === 403
          ? 'You do not have permission to view tasks. Enable Task > mine for the Authenticated role in Strapi.'
          : 'Could not load tasks. Check the API connection and try again.'
      );
    }

    try {
      const c = await api.get('/categories');
      setCategories(c.data.data);
      setCategoryError('');
    } catch (error: unknown) {
      setCategories([]);
      setCategoryError(
        axios.isAxiosError(error) && error.response?.status === 403
          ? 'You do not have permission to view categories. Enable Category > find for the Authenticated role in Strapi.'
          : 'Could not load categories. Check the API connection and try again.'
      );
    }
  };

  useEffect(() => { load(); }, []);

  const addTask = async () => {                       // CREATE
    setFormError('');
    try {
      const data: {
        title: string;
        isDone: boolean;
        category?: { connect: string[] };
      } = { title, isDone: false };

      if (categoryId) {
        data.category = { connect: [categoryId] };
      }

      await api.post('/tasks', { data });
      setTitle('');
      await load();
    } catch (error: unknown) {
      const responseMessage = axios.isAxiosError(error)
        ? error.response?.data?.error?.message
        : undefined;

      setFormError(
        typeof responseMessage === 'string'
          ? responseMessage
          : 'Could not add the task. Check the API connection and try again.'
      );
    }
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
    {taskError && <p className="error">{taskError}</p>}
    {categoryError && <p className="error">{categoryError}</p>}
    {formError && <p className="error">{formError}</p>}

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