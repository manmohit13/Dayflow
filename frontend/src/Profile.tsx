import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from './api';

type Me = { id: number; username: string; email: string; createdAt: string };

export default function Profile() {
    const [me, setMe] = useState<Me | null>(null);
    const [editing, setEditing] = useState(false);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');

    const loadMe = async () => {
        const res = await api.get('/users/me');        // ME
        setMe(res.data);
        setUsername(res.data.username);
        setEmail(res.data.email);
    };

    useEffect(() => { loadMe(); }, []);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMsg('');
        try {
            const body: Record<string, string> = { username, email };
            if (password) body.password = password;       // only send if user typed one
            await api.put(`/users/${me!.id}`, body);      // UPDATE
            setPassword('');
            setEditing(false);
            setMsg('Profile updated');
            loadMe();
        } catch (err: any) {
            setError(err.response?.data?.error?.message || 'Update failed');
        }
    };

    if (!me) return <div className="container">Loading...</div>;

    return (
        <div className="container">
            <div className="top-bar">
                <h2>My Profile</h2>
                <Link to="/tasks">← Back to tasks</Link>
            </div>

            {msg && <p style={{ color: '#16a34a' }}>{msg}</p>}

            {!editing ? (
                <div className="form-col">
                    <p><b>Username:</b> {me.username}</p>
                    <p><b>Email:</b> {me.email}</p>
                    <p><b>Joined:</b> {new Date(me.createdAt).toLocaleDateString()}</p>
                    <button onClick={() => setEditing(true)}>Edit profile</button>
                </div>
            ) : (
                <form className="form-col" onSubmit={handleUpdate}>
                    <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
                    <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password (leave empty to keep)" />
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button type="submit">Save</button>
                        <button type="button" className="ghost" onClick={() => setEditing(false)}>Cancel</button>
                    </div>
                    {error && <p className="error">{error}</p>}
                </form>
            )}
        </div>
    );
}