import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from './type/api';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/local/register', { username, email, password });
      localStorage.setItem('jwt', res.data.jwt); // user is logged in right away
      navigate('/tasks');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Registration failed');
    }
  };

  return (
    <div className="container" style={{ maxWidth: 380 }}>
      <form className="form-col" onSubmit={handleRegister}>
        <h2>Register</h2>
        <input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password (min 6 characters)" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">Create account</button>
        {error && <p className="error">{error}</p>}
      <Link
  to="/"
  style={{ textAlign: 'center', fontSize: 14, color: '#4f46e5', textDecoration: 'none' }}
>
  Already have an account? Login
</Link>
      </form>
    </div>
  );
}