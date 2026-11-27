import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import api from './type/api';
import { getProfileImageUrl, type UserProfile } from './type/profile';


export default function Profile() {
    const [me, setMe] = useState<UserProfile | null>(null);
    const [editing, setEditing] = useState(false);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');
    const [imageUploading, setImageUploading] = useState(false);
    const navigate = useNavigate();

    const loadMe = useCallback(async () => {
        const res = await api.get<UserProfile>('/users/me', { params: { populate: 'image' } });
        setMe(res.data);
        setUsername(res.data.username);
        setEmail(res.data.email);
    }, []);

    useEffect(() => {
        let cancelled = false;

        const loadProfile = async () => {
            try {
                await loadMe();
            } catch (loadError: unknown) {
                if (cancelled) return;
                if (axios.isAxiosError(loadError) && loadError.response?.status === 401) {
                    localStorage.removeItem('jwt');
                    navigate('/', { replace: true });
                    return;
                }
                setError('Could not load your profile. Please try again.');
            }
        };

        void loadProfile();
        return () => { cancelled = true; };
    }, [loadMe, navigate]);

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

    const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.currentTarget.files?.[0];
        e.currentTarget.value = '';
        if (!file || !me) return;

        setError('');
        setMsg('');
        setImageUploading(true);

        const formData = new FormData();
        formData.append('files', file);
        formData.append('ref', 'plugin::users-permissions.user');
        formData.append('refId', String(me.id));
        formData.append('field', 'image');

        try {
            await api.post('/upload', formData);
            await loadMe();
            setMsg('Profile photo updated');
        } catch (uploadError: unknown) {
            const message = axios.isAxiosError(uploadError)
                ? uploadError.response?.data?.error?.message
                : undefined;
            setError(typeof message === 'string' ? message : 'Could not upload profile photo. Please try again.');
        } finally {
            setImageUploading(false);
        }
    };

    const profileImageUrl = getProfileImageUrl(me?.image);

    if (!me) {
        return (
            <div className="container">
                {error ? <p className="error">{error}</p> : 'Loading...'}
            </div>
        );
    }

    return (
        <div className="container">
            <div className="top-bar">
                <h2>My Profile</h2>
                <Link to="/tasks">← Back to tasks</Link>
            </div>

            <div className="avatar-box">
                {profileImageUrl ? (
                    <img
                        className="avatar avatar-lg"
                        src={profileImageUrl}
                        alt={me.image?.alternativeText || `${me.username}'s profile`}
                    />
                ) : (
                    <div className="avatar avatar-lg avatar-fallback" aria-label="No profile image">
                        {me.username.charAt(0).toUpperCase()}
                    </div>
                )}
                <label className="upload-btn">
                    {imageUploading ? 'Uploading...' : me.image ? 'Change profile photo' : 'Set profile photo'}
                    <input
                        type="file"
                        accept="image/*"
                        disabled={imageUploading}
                        onChange={handleProfileImageChange}
                        hidden
                    />
                </label>
            </div>

            {msg && <p style={{ color: '#16a34a' }}>{msg}</p>}
            {error && <p className="error">{error}</p>}

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
                </form>
            )}
        </div>
    );
}