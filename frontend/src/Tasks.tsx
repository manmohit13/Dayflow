import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './type/api';
import { getProfileImageUrl, type UserProfile } from './type/profile';

type Category = { documentId: string; name: string };
type Task = {
  documentId: string;
  title: string;
  description?: string;
  isDone: boolean;
  category?: Category;
  Image?: UserProfile['image'];
};

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileError, setProfileError] = useState('');

  // add form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [newTaskImage, setNewTaskImage] = useState<File | null>(null);
  const [taskError, setTaskError] = useState('');

  // edit form
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editImage, setEditImage] = useState<File | null>(null);
  const [removeEditImage, setRemoveEditImage] = useState(false);

  const navigate = useNavigate();

  const load = async () => {
    const t = await api.get('/tasks/mine');
    const c = await api.get('/categories');
    setTasks(t.data.data);
    setCategories(c.data.data);
  };

  const uploadTaskImage = async (taskId: string, image: File) => {
    const formData = new FormData();
    formData.append('files', image);
    formData.append('ref', 'api::task.task');
    formData.append('refId', taskId);
    formData.append('field', 'Image');
    await api.post('/upload', formData);
  };

  useEffect(() => {
    load();
    const loadProfile = async () => {
      try {
        const response = await api.get<UserProfile>('/users/me', {
          params: { populate: 'image' },
        });
        setProfile(response.data);
      } catch {
        setProfileError('Could not load profile image.');
      }
    };

    loadProfile();
  }, []);

  // CREATE
  const addTask = async () => {
    if (!title.trim()) return;
    setTaskError('');
    let response;
    try {
      response = await api.post('/tasks', {
        data: { title, description, isDone: false, category: categoryId || null },
      });
    } catch {
      setTaskError('Could not create the task. Please try again.');
      return;
    }

    const imageToUpload = newTaskImage;
    setTitle('');
    setDescription('');
    setCategoryId('');
    setNewTaskImage(null);

    if (imageToUpload) {
      const taskId = (response.data?.data as { documentId?: string } | undefined)?.documentId;
      if (!taskId) {
        setTaskError('Task created, but its image could not be attached.');
      } else {
        try {
          await uploadTaskImage(taskId, imageToUpload);
        } catch {
          setTaskError('Task created, but its image could not be uploaded. Edit the task to try again.');
        }
      }
    }
    load();
  };

  // UPDATE: toggle done / pending
  const toggleDone = async (task: Task) => {
    await api.put(`/tasks/${task.documentId}`, { data: { isDone: !task.isDone } });
    load();
  };

  // START EDITING
  const startEdit = (task: Task) => {
    setEditingId(task.documentId);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditCategory(task.category?.documentId || '');
    setEditImage(null);
    setRemoveEditImage(false);
  };

  // UPDATE: save edit form
  const saveEdit = async () => {
    if (!editTitle.trim() || !editingId) return;
    setTaskError('');
    try {
      await api.put(`/tasks/${editingId}`, {
        data: {
          title: editTitle,
          description: editDescription,
          category: editCategory || null,
          ...(removeEditImage ? { Image: null } : {}),
        },
      });
    } catch {
      setTaskError('Could not save task changes. Please try again.');
      return;
    }

    if (editImage) {
      try {
        await uploadTaskImage(editingId, editImage);
      } catch {
        setTaskError('Task details were saved, but its image could not be uploaded. Please try again.');
        load();
        return;
      }
    }

    setEditingId(null);
    load();
  };

  // DELETE
  const removeTask = async (id: string) => {
    await api.delete(`/tasks/${id}`);
    load();
  };

  const logout = () => {
    localStorage.removeItem('jwt');
    navigate('/');
  };

  const profileImageUrl = getProfileImageUrl(profile?.image);

  return (
    <div className="container">
      <div className="top-bar">
        <h2>My Tasks</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="ghost profile-button" onClick={() => navigate('/profile')}>
            {profileImageUrl ? (
              <img className="avatar" src={profileImageUrl} alt="" />
            ) : (
              <span className="avatar avatar-fallback" aria-hidden="true">
                {profile?.username?.charAt(0).toUpperCase() || 'P'}
              </span>
            )}
            <span>Profile</span>
          </button>
          <button className="ghost" onClick={logout}>
            Logout
          </button>
        </div>
      </div>
      {profileError && <p className="error">{profileError}</p>}

      {/* Add form */}
      <div className="form-col" style={{ marginBottom: 16 }}>
        <div className="row" style={{ marginBottom: 0 }}>
          <input
            placeholder="New task"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">No category</option>
            {categories.map((c) => (
              <option key={c.documentId} value={c.documentId}>
                {c.name}
              </option>
            ))}
          </select>
          <button onClick={addTask}>Add</button>
        </div>
        <input
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        /> 
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          Task image
          <input
            key={newTaskImage ? newTaskImage.name : 'empty'}
            type="file"
            accept="image/*"
            onChange={(e) => setNewTaskImage(e.target.files?.[0] || null)}
          />
        </label>
      </div>
      {taskError && <p className="error">{taskError}</p>}

      {/* Task list */}
      <ul>
        {tasks.length === 0 && <p className="empty">No tasks yet. Add your first one above.</p>}

        {tasks.map((t) =>
          editingId === t.documentId ? (
            <li key={t.documentId} className="edit-item">
              <div className="form-col" style={{ width: '100%' }}>
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Title"
                />
                <input
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Description"
                />
                {t.Image?.url && !removeEditImage && (
                  <img
                    className="task-image"
                    src={getProfileImageUrl(t.Image) || undefined}
                    alt={t.Image.alternativeText || `${t.title} attachment`}
                  />
                )}
                <label>
                  {t.Image && !removeEditImage ? 'Replace task image' : 'Task image'}
                  <input
                    key={editImage ? editImage.name : 'empty'}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      setEditImage(e.target.files?.[0] || null);
                      setRemoveEditImage(false);
                    }}
                  />
                </label>
                {editImage && <span>{editImage.name}</span>}
                {t.Image && !removeEditImage && (
                  <button
                    className="ghost"
                    onClick={() => {
                      setEditImage(null);
                      setRemoveEditImage(true);
                    }}
                  >
                    Remove image
                  </button>
                )}
                {removeEditImage && <span>Image will be removed when you save.</span>}
                <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)}>
                  <option value="">No category</option>
                  {categories.map((c) => (
                    <option key={c.documentId} value={c.documentId}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={saveEdit}>Save</button>
                  <button className="ghost" onClick={() => setEditingId(null)}>
                    Cancel
                  </button>
                </div>
              </div>
            </li>
          ) : (
            <li key={t.documentId}>
              <div className="task-info">
                <span className={`task-title ${t.isDone ? 'done' : ''}`}>{t.title}</span>
                {t.description && <span className="task-desc">{t.description}</span>}
                {t.Image?.url && (
                  <img
                    className="task-image"
                    src={getProfileImageUrl(t.Image) || undefined}
                    alt={t.Image.alternativeText || `${t.title} attachment`}
                  />
                )}
                <div className="meta">
                  {t.category && <span className="tag">{t.category.name}</span>}
                  <span className={`status ${t.isDone ? 'status-done' : 'status-pending'}`}>
                    {t.isDone ? 'Done' : 'Pending'}
                  </span>
                </div>
              </div>

              <div className="actions">
                <button
                  className={t.isDone ? 'ghost' : 'success'}
                  onClick={() => toggleDone(t)}
                >
                  {t.isDone ? 'Mark pending' : 'Mark done'}
                </button>
                <button className="ghost" onClick={() => startEdit(t)}>
                  Edit
                </button>
                <button className="danger" onClick={() => removeTask(t.documentId)}>
                  Delete
                </button>
              </div>
            </li>
          )
        )}
      </ul>
    </div>
  );
}