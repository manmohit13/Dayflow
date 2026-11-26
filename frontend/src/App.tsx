import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import Tasks from './Tasks';
import Profile from './Profile';
import type { JSX } from 'react/jsx-runtime';

function Protected({ children }: { children: JSX.Element }) {
  return localStorage.getItem('jwt') ? children : <Navigate to="/" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/tasks" element={<Protected><Tasks /></Protected>} />
        <Route path="/profile" element={<Protected><Profile /></Protected>} />
      </Routes>
    </BrowserRouter>
  );
}