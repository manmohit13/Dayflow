import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from './type/api';
import { Link } from 'react-router-dom';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/auth/local', { identifier: identifier.trim(), password });
      localStorage.setItem('jwt', res.data.jwt);
      navigate('/tasks');
    } catch (error: unknown) {
      let message = 'Unable to log in. Please try again.';

      if (axios.isAxiosError(error)) {
        if (!error.response) {
          message = 'Cannot reach the server. Check that the backend is running and try again.';
        } else {
          const responseMessage = error.response.data?.error?.message;
          if (typeof responseMessage === 'string') {
            message = responseMessage === 'Invalid identifier or password'
              ? 'Wrong email or password'
              : responseMessage;
          } else if (error.response.status >= 500) {
            message = 'Server error. Please try again later.';
          }
        }
      }

      setError(message);
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
      <Link
  to="/register"
  style={{ textAlign: 'center', fontSize: 14, color: '#4f46e5', textDecoration: 'none' }}
>
  New here? Register
</Link>
    </form>
  </div>
);
}