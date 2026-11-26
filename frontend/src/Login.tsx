import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/local', { identifier, password });
      localStorage.setItem('jwt', res.data.jwt);
      navigate('/tasks');
    } catch {
      setError('Wrong email or password');
    }
  };

  return (
  <div className="container" style={{ maxWidth: 380 }}>
    <form className="form-col" onSubmit={handleLogin}>
      <h2>Login</h2>
      <input placeholder="Email" value={identifier} onChange={(e) => setIdentifier(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button type="submit">Login</button>
      {error && <p className="error">{error}</p>}
    </form>
  </div>
);
}